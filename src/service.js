import Resources from "./resources.js"

class Service {
    constructor() {
        this.app = {
            isEnabled: false,
            killedCounter: 0,
            browserProtocols: [
                "chrome://",
                "chrome-extension://",
                "edge://",
                "brave://",
                "about:",
                "http://localhost",
                "https://localhost"
            ]
        };

        chrome.browserAction.setBadgeBackgroundColor({ color: [90, 90, 90, 255] });

        this.setListeners();
        this.disable();
    }

    $t = (what, override) => new Resources().translator(what, override);

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
            path: this.$t("browserIcon.on", true)
        });

        chrome.browserAction.setTitle({
            title: this.$t("uiEnabledTitle")
        });
    }

    disable() {
        this.app.isEnabled = false;

        chrome.browserAction.setIcon({
            path: this.$t("browserIcon.off", true)
        });

        chrome.browserAction.setTitle({
            title: this.$t("uiDisabledTitle")
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
        if (this.app.killedCounter > 999) { badgeText = "999+"; }

        chrome.browserAction.setBadgeText({ text: badgeText });
    }
    
}

export default Service;