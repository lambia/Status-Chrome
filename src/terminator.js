import Service from "./service.js"

class Terminator {
    constructor() {
        this.srv = new Service();
        this.app = this.srv.globals();
        this.allowing = null;
        this.suspects = [];
        this.FOCUS_ON_ALLOWED = true;
        let self = this;

        chrome.storage.local.get("history", function(result) {
            //Se non ci sono dati in storage, o in caso di problemi, crea un nuovo array
            if(!result.history || !result.history.length || !result.history.length>0 || !result.history.length<=10) {
                chrome.storage.local.set({ 'history': [] }, function() {});
            }
        });

        this.setListeners();
    }

    /* Chrome listeners */
    setListeners() {
        let self = this;

        //On new opened tab
        chrome.tabs.onCreated.addListener(function (tab) {
            //Se la protezione è attiva e l'oggetto non è vuoto
            if (self.app.isEnabled && tab) {
                //Termina
                self.judge(tab);
            }
        });

        //On updated tab
        chrome.tabs.onUpdated.addListener(function (tabId, changedInfo, tab) {
            //Se la protezione è attiva e l'oggetto non è vuoto
            if (self.app.isEnabled && tab) {
                //Se la finestra era in watch
                if(self.suspects.includes(tabId)==true) {
                    //Se è cambiato l'url
                    if(changedInfo && changedInfo.url) {
                        //Termina
                        self.judge(tab);
                    }
                }
            }
        });

        //On storage change
        chrome.storage.onChanged.addListener(function(changes, namespace) {
            for (var key in changes) {
                if(key=="allowing" && namespace=="local") {
                    if(changes[key].newValue) { //ToDo: semplificare il giro
                        self.allowing = changes[key].newValue;
                        chrome.storage.local.set({ "allowing": null });
                        chrome.tabs.create({ url: changes[key].newValue, active: self.FOCUS_ON_ALLOWED });
                    }
                }
            }
        });

    }

    judge(tab) {
        let self = this;
        let toBeClosed = true;
        let url = null;

        //Controlla se ha un url
        if (tab.pendingUrl) {
            url = tab.pendingUrl;
        } else if (tab.url) {
            url = tab.url;
        }

        //Se la nuova tab ha un url
        if (url) {

            //Se si tratta di un popup appena consentito
            if(url==self.allowing) {
                //ToDo: nella callback dell'open non va bene, ma potrebbe non passare di qui. gli diamo una scadenza?
                self.allowing = null; 
                toBeClosed = false;
            } else {
                //Confronta url con protocolli consentiti
                self.app.browserProtocols.forEach(function (value, index, array) {
                    if (url.indexOf(value) == 0) {
                        toBeClosed = false;
                    }
                });
            }

        } else {
            //Aggiungi al watch dei sospetti
            toBeClosed = false;
            self.suspects.push(tab.id);
        }

        let tabInfo = {
            from: {
                tabId: null,
                title: null,
                url: null,
                hostname: null
            },
            to: {
                tabId: tab.id,
                title: tab.title,
                url: url,
                hostname: self.getHostname(url)
            }
        };

        //Se la c'è una tab chiamante
        if(tab.openerTabId) {
            //ToDo: gestire errore
            chrome.tabs.get(tab.openerTabId, function(result) {
                //Portala nell'oggetto tabInfo
                if(result.url) {
                    tabInfo.from = {
                        tabId: tab.openerTabId,
                        title: result.title,
                        url: result.url,
                        hostname: self.getHostname(result.url)
                    };
                }
                //E procedi col normale flusso di terminazione
                //ToDo: aggiungere regole di validazione origin/destination in base a white/blacklist
                if(toBeClosed) {
                    self.terminate(tabInfo);
                }
            });
        //Altrimenti ignora e segui il normale flusso di terminazione
        } else if (toBeClosed) {
            //ToDo: aggiungere regole di validazione origin/destination in base a white/blacklist
            self.terminate(tabInfo);
        }

    }

    terminate(tabInfo) {
        let self = this;

        //Chiudi l'oggetto
        chrome.tabs.remove(tabInfo.to.tabId); //ToDo: check se tabId exists

        //Aggiorna la UI
        self.srv.increaseBadge();
        chrome.storage.local.get("history", function(result) {
            chrome.storage.local.set({
                'history': self.fifoPush(result.history, tabInfo, 10)
            }, function() {});
        });

        //ToDo: inject "getOrigin.js" per recuperare window.origin invece di openerTabId ?
        //ToDo: aggiungere titolo/favicon e orario?
        //ToDo: update lastInsertTime?
        //ToDo: organizzare meglio gli if
        //ToDo: spostare getHostname nella buildUI
    }

    getHostname(url) {
        // Since it's not a frequent operation, I won't add complexity for tests and readability, but... yes,
        // performance benchmarks revealed that a well written regex (*) would be 50x faster than URL constructor 
        // (*) keep port: url.match(/^https?\:\/\/([^\/?#]+)(?:[\/?#]|$)/i);
        // (*) only host: url.match(/^https?\:\/\/([^\/:?#]+)(?:[\/:?#]|$)/i);

        let hostname = "error";
        if(url && (typeof url) === 'string') {
            hostname = new URL(url).hostname;
            hostname = (hostname.indexOf("www.") == 0) ? hostname.slice(4) : hostname;
        }
        return hostname;
    }

    createFIFO(length) {
        let array = new Array();

        array.push = function () {
            while (this.length >= length) {
                this.shift();
            }
            return Array.prototype.push.apply(this, arguments);
        }
    
        return array;
    }

    fifoPush(fifoArray, newRecord, maxLenght) {
        if(fifoArray && fifoArray.length) {
            while(fifoArray.length >= maxLenght) {
                fifoArray.shift();
            }
        } else {
            fifoArray = [];
        }
        fifoArray.push(newRecord);
        return fifoArray;
    }

}

export default Terminator;
