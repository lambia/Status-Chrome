import { text } from "../helpers/resources.js"

class ServiceWorker {
    constructor() {
        console.log( text("appShortName") + ".main-worker.started");
        let self = this;
        this.setListeners();
    }

    /* Chrome listeners */
    setListeners() {
        let self = this;
        //On updated tab
        chrome.tabs.onUpdated.addListener(function (tabId, changedInfo, tab) {
            //Se la protezione è attiva e l'oggetto non è vuoto
            if (tab) {
                //Evita errori su indirizzi locali
                //ToDo: controlla anche su pendingURL?
                if (!tab.url.startsWith("chrome://")) {
                    //Per evitare di triggerare ad ogni lifecycle hook, lo facciamo al completamento
                    if (changedInfo.status=="complete") {
                        //Inietta
                        self.inject(tabId);
                    }
                }
            }
        });
    }

    inject(tabId) {
        chrome.scripting.executeScript({
            files: [ "src/workers/fake-window-open.js" ],
            injectImmediately: true,
            target : {
                tabId : tabId,
                allFrames : true
            },
            world: "MAIN"
        });
    }

}

let srv = new ServiceWorker();

