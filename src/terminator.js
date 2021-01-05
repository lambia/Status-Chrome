import Service from "./service.js"

class Terminator {
    constructor() {
        this.srv = new Service();
        this.app = this.srv.globals();
        this.allowing = null;
        this.suspects = [];
        this.FOCUS_ON_ALLOWED = true;
        let self = this;

        chrome.storage.sync.get("$history", function(result) {
            //Se non ci sono dati in storage, o in caso di problemi, crea un nuovo array
            if(!result.$history || !result.$history.length || result.$history.length<1 || result.$history.length>10) {
                chrome.storage.sync.set({ '$history': [] }, function() {});
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
                if(key=="$allowing" && namespace=="local") {
                    if(changes[key].newValue) { //ToDo: semplificare il giro
                        self.allowing = changes[key].newValue;
                        chrome.storage.local.set({ "$allowing": null });
                        chrome.tabs.create({ url: changes[key].newValue, active: self.FOCUS_ON_ALLOWED });
                    }
                }
            }
        });

    }

    judge(tab) {
        let self = this;
        let toBeClosed = true;
        let url = tab.pendingUrl || tab.url || null;

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

        //Se la tab va chiusa
        if(toBeClosed) {
            
            let tabInfo = {
                to: {
                    tabId: tab.id,
                    title: tab.title,
                    url: url,
                    hostname: self.getHostname(url)
                }
            };

            //Se c'è un chiamante
            if(tab.openerTabId) {
                //Recuperane le informazioni
                chrome.tabs.get(tab.openerTabId, function(result) {
                    //Copia le informazioni in tabInfo
                    if(result.url) {
                        tabInfo.from = {
                            tabId: result.id,
                            title: result.title,
                            url: result.pendingUrl || result.url,
                            hostname: self.getHostname(result.pendingUrl || result.url,)
                        };
                    }
                    //Procedi col normale flusso di terminazione
                    //ToDo: aggiungere regole di validazione origin/destination in base a white/blacklist
                    self.terminate(tabInfo);
                });
            } else {
                //ToDo: aggiungere regole di validazione origin/destination in base a white/blacklist
                self.terminate(tabInfo);
            }
        }

    }

    terminate(tabInfo) {
        let self = this;

        //Chiudi l'oggetto
        chrome.tabs.remove(tabInfo.to.tabId); //ToDo: check se tabId exists

        //Aggiorna la UI
        self.srv.increaseBadge();
        chrome.storage.sync.get("$history", function(result) {
            chrome.storage.sync.set({
                '$history': self.fifoPush(result.$history, tabInfo, 10)
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
