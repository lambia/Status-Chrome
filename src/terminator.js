import Service from "./service.js"

class Terminator {
    constructor() {
        this.srv = new Service();
        this.app = this.srv.globals();
        this.allowing = null;
        this.suspects = this.createFIFO(100); //ToDo: aumentare?
        this.FOCUS_ON_ALLOWED = true;

        chrome.storage.local.get("history", function(result) {
            //Se non ci sono dati in storage, crea un nuovo array
            if(!result.history || !result.history.length || !result.history.length>0) {
                chrome.storage.local.set({ 'history': this.createFIFO(10) }, function() {});
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
                self.terminate(tab);
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
                        self.terminate(tab);
                    }
                }
            }
        });
        
        //Message from extension's popup
        chrome.runtime.onMessage.addListener(
            function(request, sender, sendResponse) {
                //Popup is loading and asks for initial data
                if (request.event === "popup.out.allow") {
                    self.allowing = request.url;
                    chrome.tabs.create({ url: request.url, active: self.FOCUS_ON_ALLOWED });
                }
            }
        );

    }

    terminate(tab) {
        let self = this;
        let toBeClosed = true;
        let url = null;

        //tab.openerTabId;
        //ToDo: tienine traccia se valorizzato. cosa ne faccio? confronto opener/opened con blacklist?
        
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

        //Se url non ok
        if (toBeClosed) {

            //Chiudi l'oggetto e aggiorna la UI
            chrome.tabs.remove(tab.id); //ToDo: check se tabId exists
            self.srv.increaseBadge();

            //ToDo: aggiungere tab origine, titolo, favicon, orario?
            //ToDo: update lastInsertTime?
            //ToDo: organizzare meglio gli if
            //ToDo: spostare getHostname nella buildUI
            chrome.storage.local.get("history", function(result) {
                result.history.push({
                    title: self.getHostname(url),
                    url: url
                });
                chrome.storage.local.set({ 'history': result.history }, function() {});
            });

        }

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
        //ToDo: unique values ?
        let array = new Array();
    
        array.push = function () {
            if (this.length >= length) {
                this.shift();
            }
            return Array.prototype.push.apply(this, arguments);
        }
    
        return array;
    }

}

export default Terminator;
