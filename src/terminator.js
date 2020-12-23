import Service from "./service.js"

class Terminator {
    constructor() {
        this.srv = new Service();
        this.app = this.srv.globals();
        this.history = this.createFIFO(10);
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
        let itsok = false;
        let url = "";

        //Controlla se ha un url
        if (tab.pendingUrl) {
            url = tab.pendingUrl;
        } else if (tab.url) {
            url = tab.url;
        }

        //Se la nuova tab ha un url (toDo: abilitare gli url fissi, eg. bookmark)
        if (url) {

            //Confronta url con protocolli consentiti
            self.app.browserProtocols.forEach(function (value, index, array) {
                if (url.indexOf(value) == 0) {
                    itsok = true;
                }
            });
        }

        //Se url non ok o vuoto, e se non si tratta di un url appena consentito
        if (!itsok) {
        // if (!itsok && url!=self.allowing) {

            //Chiudi l'oggetto e aggiorna la UI
            chrome.tabs.remove(tab.id);
            self.srv.increaseBadge();
            
            //ToDo: push titolo, update lastInsertTime. Organizzare meglio gli if
            if(url) {
                self.pushToHistory(url);
                self.sendContent(); //ToDo: spostare fuori dall'if se si aggiunge il counter in html
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
