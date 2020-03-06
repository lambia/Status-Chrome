import Resources from "../resources/resources.js"

class Terminator {
    constructor(lang) {
        this.res = new Resources(lang);
        this.isEnabled = false;
        this.setListeners();
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
            if (self.isEnabled) {
                chrome.tabs.remove(tab.id);
            }
        });
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
                }, 1000);
            }
        );
        //ToDev: prompt "want to add current site to blacklist?"
    }

    isEnabled() {
        return this.isEnabled;
    }

}

export default Terminator;
