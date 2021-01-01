import Service from "./service.js"

class Terminator {
    constructor() {
        this.srv = new Service();
        this.app = this.srv.globals();
        this.allowing = null;
        this.history = this.createFIFO(10);
        this.suspects = this.createFIFO(10); //ToDo: aumentare a 100? 1000?
        this.FOCUS_ON_ALLOWED = true;

        this.setListeners();
    }

    /* Chrome listeners */
    setListeners() {
        let self = this;

        //On new opened tab
        chrome.tabs.onCreated.addListener(function (tab) {
            //Se la protezione è attiva e l'oggetto non è vuoto
            if (self.app.isEnabled && tab) {
                self.terminate(tab);
            }
        });

        //On updated tab
        chrome.tabs.onUpdated.addListener(function (tabId, changedInfo, tab) {
            //Se la protezione è attiva e l'oggetto non è vuoto
            if (self.app.isEnabled && tab) {
                if(self.suspects.includes(tabId)==true) {
                //Se la finestra era in watch
                //Se è cambiato l'url
                //Termina loggando l'url
                    if(changedInfo && changedInfo.url) {
                        self.terminate(tab);
                    }
                    /*
                    else if(tab.url || tab.pendingUrl) {
                        //ToDo: non dovrebbe mai verificarsi questo else (c'è il watch sul change)
                        //anzi, si dovrebbe verificare solo con changedInfo = unloaded
                        //verificare se pendingUrl esiste solo in callback created o anche qui
                        debugger;
                    }
                    */
                }
            }
        });
        
        //Message from extension's popup
        chrome.runtime.onMessage.addListener(
            function(request, sender, sendResponse) {
                if (request.event === "load") {
                    self.sendContent();
                    self.sendStatus( self.app.isEnabled ); //ToDo: move popup stuff to service?
                } else if (request.event === "toggle") {
                    self.srv.toggle();
                    self.sendStatus( self.app.isEnabled ); //ToDo: move popup stuff to service?
                } else if (request.event === "open") {
                    self.openUrl( request.url );
                }
                //   else if (request.event === "allow") {
                //     console.log("Richiesta: ", request.data);
                // } else if (request.event === "deny") {
                //     console.log("Richiesta: ", request.data);
                // } else if (request.event === "blacklist") {
                //     console.log("Richiesta: ", request.data);
                // } else if (request.event === "whitelist") {
                //     console.log("Richiesta: ", request.data);
                // }
            }
        );

    }

    sendContent() {
        let self = this;

        chrome.runtime.sendMessage({
            event: "refresh", 
            data: self.history
        });
    }

    openUrl(url) {
        let self = this;

        self.allowing = url;
        chrome.tabs.create({ url, active: self.FOCUS_ON_ALLOWED });
    }

    sendStatus(status) {
        let self = this;

        chrome.runtime.sendMessage({
            event: "status", 
            data: status
        });
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
        //ToDo: unique values
        let array = new Array();
    
        array.push = function () {
            if (this.length >= length) {
                this.shift();
            }
            return Array.prototype.push.apply(this,arguments);
        }
    
        return array;
    }

    pushToHistory(url) {
        let self = this;

        //ToDo: aggiungere tab origine e titolo
        //ToDo: spostare getHostname nella buildUI
        this.history.push({
            url,
            title: self.getHostname(url)
        });
    }

    terminate(tab) {
        let self = this;
        let itsok = false; //ToDo: rinominare in toBeClosed o similare
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
        //ToDo: permettere l'apertura di bookmark dalla toolbar
        //ToDo: permettere ctrl+click su link
        //ToDo: cosa fare con i link target="_blank" ?
        //ToDo: permettere nuova tab con url dell'homepage
        if (url) {

            if(url==self.allowing) {
                //Se si tratta di un popup appena consentito
                //ToDo: nella callback dell'open non va bene, ma potrebbe non passare di qui. gli diamo una scadenza.
                self.allowing = null; 
                itsok = true;
            } else {
                //Confronta url con protocolli consentiti
                self.app.browserProtocols.forEach(function (value, index, array) {
                    if (url.indexOf(value) == 0) {
                        itsok = true;
                    }
                });
            }

        } else {
            //Aggiungi al watch dei sospetti
            itsok = true;
            self.suspects.push(tab.id);
        }

        //Se url non ok
        if (!itsok) {

            //Chiudi l'oggetto e aggiorna la UI
            chrome.tabs.remove(tab.id); //ToDo: check se tabId exists
            self.srv.increaseBadge();
            
            //ToDo: push titolo, update lastInsertTime. Organizzare meglio gli if
            if(url) {
                self.pushToHistory(url);
                self.sendContent(); //ToDo: spostare fuori dall'if quando si aggiunge il counter anche in html
            } else {
                //ToDo: se non c'è url itsok=true quindi qui non ci arriva
                self.pushToHistory("errore: finestra sconosciuta"); //todo: vedi meglio
                self.sendContent(); //ToDo: spostare fuori dall'if quando si aggiunge il counter anche in html
            }
        }

    }

    //Inject javascript to override window.open and prevent any new window
    //It now works thanks to the returned mock WindowProxy
    //To use for the new release
    //Need to be called for all the tabs (on toggle) and for any tabs that loads a new page
    //Also check for browserProtocols/itsok
    futureToggle() {
        let self = this;

        chrome.tabs.executeScript(null, {
            code: `
                    let wopen = window.open;
                    window.open = function() {
                        console.log("Prevented a window", arguments);
                        let ad = wopen.apply(window,arguments);
                        let fake = Object.create(ad);
                        ad.close();
                        return fake;
                    }
                    console.log("Open Prevention Code injected.");
                    `
        })
    }

}

export default Terminator;
