import Resources from "../resources/resources.js"

class Terminator {
    constructor(lang) {
        this.isEnabled = false;
        this.killedCounter = 0;
        chrome.browserAction.setBadgeBackgroundColor({ color: [64, 64, 255, 255] });
        this.res = new Resources(lang);
        this.browserProtocols = [
            "chrome://",
            "brave://",
            "about:" //about:info, about:config
        ];

        this.setListeners();
    }

    /* Chrome listeners */
    setListeners() {
        let self = this;

        //On browserAction click
        chrome.browserAction.onClicked.addListener(function () {
            self.toggle();
            //self.futureToggle();
        });

        //On keyboard shortcut
        chrome.commands.onCommand.addListener(function (command) {
            if (command === "toggle") {
                self.toggle();
            }
        });

        //On browser closing (otherwise user could not open again the browser)
        chrome.windows.onRemoved.addListener(function (windowid) {
            chrome.windows.getAll(
                { populate: true },
                function (windowList) {
                    if (windowList < 1 && self.isEnabled) {
                        self.toggle(); //ToDev: no popup, no blocco avvio, ma stato persistente
                    }
                });
        });

        //On new opened tab
        chrome.tabs.onCreated.addListener(function (tab) {
            //Se la protezione è attiva e l'oggetto non è vuoto
            if (self.isEnabled && tab) {
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
            self.browserProtocols.forEach(function (value, index, array) {
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

    increaseBadge() {
        this.killedCounter++;
        let badgeText = this.killedCounter.toString();
        if (this.killedCounter > 9999) { badgeText = "999+"; }

        chrome.browserAction.setBadgeText({ text: badgeText });
    }

    //Inject javascript to override window.open and prevent any new window
    //It now works thanks to the returned mock WindowProxy
    //To use for the new release
    //Need to be called for all the tabs (on toggle) and for any tabs that loads new page
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

    //Activate/deactivate the protection
    toggle() {
        this.isEnabled = !this.isEnabled;
        let isEnabled = this.isEnabled;
        let res = this.res;

        chrome.browserAction.setIcon({
            path: isEnabled ? res.browserAction.enabledIcon : res.browserAction.disabledIcon
        });

        chrome.browserAction.setTitle({
            title: isEnabled ? res.browserAction.enabledTitle : res.browserAction.disabledTitle
        });

        //ToDev: prompt "want to add current site to blacklist?"
    }

    isEnabled() {
        return this.isEnabled;
    }

}

export default Terminator;
