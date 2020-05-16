class Terminator {
    constructor(app) {
        this.app = app;
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
    }

    terminate(tab) {
        let self = this;
        let itsok = false;
        let urlType = null;

        //Controlla se ha un url
        if (tab.pendingUrl) {
            urlType = "pendingUrl";
        } else if (tab.url) {
            urlType = "url";
        }

        //Controlla se l'url è tra i protocolli consentiti
        if (urlType) {
            self.app.browserProtocols.forEach(function (value, index, array) {
                if (tab[urlType].indexOf(value) == 0) {
                    itsok = true;
                }
            });
        }

        //Se ha un url non ok, o se non ha url
        if (!itsok) {
            //Chiudi l'oggetto
            chrome.tabs.remove(tab.id);
            self.increaseBadge();
        }

    }

    //Inject javascript to override window.open and prevent any new window
    //It now works thanks to the returned mock WindowProxy
    //To use for the new release
    //Need to be called for all the tabs (on toggle) and for any tabs that loads new page
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
