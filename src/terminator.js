import Resources from "../resources/resources.js"

class Terminator {
    constructor(lang) {
        this.res = new Resources(lang);
        this.isEnabled = false;
        this.setListeners();
        this.killedCounter = -1;
        this.increaseBadge();

        this.browserProtocols = [
            "chrome://",
            "brave://",
            "about:" //about:info, about:config
        ];
    }

    /* Chrome listeners */
    setListeners() {
        let self = this;

        //On browserAction click
        chrome.browserAction.onClicked.addListener(function () {
            self.toggle();
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
            self.terminate(tab);
        });
    }

    terminate(tab) {
        let self = this;

        //Se la protezione è attiva e l'oggetto non è vuoto
        if (self.isEnabled && tab) {
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
    }

    increaseBadge() {
        this.killedCounter++;
        let badgeText = this.killedCounter.toString();
        if (this.killedCounter > 9999) { badgeText = "999+"; }

        chrome.browserAction.setBadgeBackgroundColor({ color: [64, 64, 255, 255] });
        chrome.browserAction.setBadgeText({ text: badgeText });
    }

    //Activate/deactivate the protection
    toggle() {
        this.isEnabled = !this.isEnabled;
        let isEnabled = this.isEnabled;
        let res = this.res;

        chrome.browserAction.setIcon({
            path: isEnabled ? res.toggleAlert.enabledIcon : res.toggleAlert.disabledIcon
        });

        chrome.notifications.create(
            "",
            {
                type: "basic",
                iconUrl: isEnabled ? res.toggleAlert.enabledIcon : res.toggleAlert.disabledIcon,
                title: isEnabled ? res.toggleAlert.enabledTitle : res.toggleAlert.disabledTitle,
                message: isEnabled ? res.toggleAlert.enabledMessage : res.toggleAlert.disabledMessage
            },
            function (notificationId) { //ToDev: portare in helpers
                setTimeout(function () {
                    chrome.notifications.clear(notificationId);
                }, 1350);
            }
        );
        //ToDev: prompt "want to add current site to blacklist?"
    }

    printData(data, ontop = true) {
        if (ontop) {
            alert(JSON.stringify(data, null, 4));
        }
        console.log(data);
    }

    isEnabled() {
        return this.isEnabled;
    }

}

export default Terminator;
