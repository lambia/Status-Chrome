import { text } from "../helpers/resources.js"

class ServiceWorker {
    constructor() {
        console.info(text("appShortName") + " Service Worker Started");

        let self = this;
        this.setListeners();
    }

    inject(tabId) {
        console.log("Inject for: ", tabId);

        chrome.scripting.executeScript({
            files: ["src/workers/fake-window-open.js"],
            injectImmediately: true,
            target: {
                tabId: tabId,
                allFrames: true
            },
            world: "MAIN"
        });
    }


    // /* Chrome listeners */
    setListeners() {
        let self = this;

        //On updated tab
        chrome.tabs.onUpdated.addListener(function (tabId, changedInfo, tab) {
            //Se la protezione è attiva e l'oggetto non è vuoto
            if (tab) {
                //Se è cambiato l'url
                if (changedInfo && changedInfo.url) {
                    //Termina
                    if (!changedInfo.url.startsWith("chrome://")) {
                        // Controllare anche per: tab.pendingUrl, tab.url, tab.status (unloaded,loading,complete) ?
                        self.inject(tabId);
                    }
                }
            }
        });
    }
}

let srv = new ServiceWorker();