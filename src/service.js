import Resources from "./resources.js"

class Service {
    constructor() {
        let self = this;
        this.app = {
            isEnabled: null, //ToDo: rimuovere
            killedCounter: null,
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

        chrome.storage.sync.get("isEnabled", function(result) {

            //ToDo: funziona, ma rifare il giro
            if(result.isEnabled && result.isEnabled==true) {
                self.app.isEnabled = true;
                self.renderStatus(true);
                self.setListeners();
            } else {
                self.setStatus(false);
                self.app.isEnabled = false; //ToDo: andrebbe in callback di setStatus
                self.renderStatus(false);   //ToDo: andrebbe in callback di setStatus
                self.setListeners();   //ToDo: andrebbe in callback di setStatus
            }
            
        });

        chrome.storage.sync.get("killedCounter", function(result) {
            if(result.killedCounter && result.killedCounter>0) {
                self.app.killedCounter = result.killedCounter;
                self.renderBadge(result.killedCounter);
            } else {
                chrome.storage.sync.set({"killedCounter": 0}, function(){
                    self.app.killedCounter = 0;
                    // self.renderBadge(0);
                });
            }
        });


    }

    $t = (what, override) => new Resources().translator(what, override);

    setStatus(value) {
        chrome.storage.sync.set({ 'isEnabled': value }, function() {});
    }

    /* Chrome listeners */
    setListeners() {
        let self = this;
        
        //On storage change
        chrome.storage.onChanged.addListener(function(changes, namespace) {
            for (var key in changes) {
                var storageChange = changes[key];
                if(key=="isEnabled" && namespace=="sync") {
                    self.app.isEnabled = storageChange.newValue;
                    self.renderStatus(storageChange.newValue);
                } else if(key=="killedCounter" && namespace=="sync") {
                    self.app.killedCounter = storageChange.newValue;
                    self.renderBadge(storageChange.newValue);
                }
            }
        });

        //On keyboard shortcut
        chrome.commands.onCommand.addListener(function (command) {
            if (command === "toggle") {
                self.setStatus( !self.app.isEnabled );
            }
        });

        //On browser closing (otherwise user could not open again the browser)
        //ToDo: ora che c'è lo storage il delay lo rende inutile, testare (usando local invece di sync)
        chrome.windows.onRemoved.addListener(function (windowid) {
            chrome.windows.getAll(
                { populate: true },
                function (windowList) {
                    if (windowList < 1 && self.app.isEnabled) {
                        self.app.isEnabled = false;
                    }
                });
        });
    }

    globals() {
        return this.app;
    }

    renderStatus(value) {

        chrome.browserAction.setIcon({
            path: value ? this.$t("browserIcon.on", true) : this.$t("browserIcon.off", true)
        });

        chrome.browserAction.setTitle({
            title: value ? this.$t("uiEnabledTitle") : this.$t("uiDisabledTitle")
        });
    }

    increaseBadge() {
        let self = this;
        //ToDo: self.app.killedCounter serve solo ad evitare il get.then.set (decidere cosa fare)
        chrome.storage.sync.set({"killedCounter": self.app.killedCounter+1}, function(){});
    }

    renderBadge(value) {

        if (value && value>0 && value<1000) {
            chrome.browserAction.setBadgeText({ text: value.toString() });
        } else if (value > 999) {
            chrome.browserAction.setBadgeText({ text: "999+" });
        } else {
            chrome.browserAction.setBadgeText({ text: "" });
        }

    }

    
}

export default Service;