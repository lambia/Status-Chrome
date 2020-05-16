class Service {
    constructor() {
        this.app = {
            isEnabled: false,
            killedCounter: 0,
            $t: chrome.i18n.getMessage,
            browserProtocols: [
                "chrome://",
                "brave://",
                "about:" //about:info, about:config
            ]
        };

        this.setListeners();
        this.disable();
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
                    if (windowList < 1 && self.app.isEnabled) {
                        self.toggle(); //ToDev: no popup, no blocco avvio, ma stato persistente
                    }
                });
        });
    }

    globals() {
        return this.app;
    }

    enable() {
        this.app.isEnabled = true;

        chrome.browserAction.setIcon({
            path: "icons/on.png"
        });

        chrome.browserAction.setTitle({
            title: this.app.$t("uiEnabledTitle")
        });
    }

    disable() {
        this.app.isEnabled = false;

        chrome.browserAction.setIcon({
            path: "icons/off.png"
        });

        chrome.browserAction.setTitle({
            title: this.app.$t("uiDisabledTitle")
        });
    }

    //Activate/deactivate the protection
    toggle() {
        //ToDev: integrate vogon and prompt "want to add current site to blacklist?
        this.app.isEnabled ? this.disable() : this.enable();
    }

    increaseBadge() {
        this.app.killedCounter++;
        let badgeText = this.app.killedCounter.toString();
        if (this.app.killedCounter > 9999) { badgeText = "999+"; }

        chrome.browserAction.setBadgeText({ text: badgeText });
    }

}

export default Service;