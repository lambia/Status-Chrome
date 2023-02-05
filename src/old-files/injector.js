import Service from "./service.js"

class Injector {
    constructor() {
        let self = this;
        self.srv = new Service();
        self.app = self.srv.globals();
        
        self.setListeners();
    }

    //Inject javascript to override window.open and prevent any new window
    //Need to be called for all the tabs (on toggle) and for any tabs that loads a new page
    //Also check for browserProtocols/toBeClosed
    async inject() {
        let self = this;

        // chrome.tabs.query({currentWindow: true, active: true}, tabs => {
        //     if(tabs && tabs[0] && tabs[0].id) {
        //         let tabId = tabs[0].id;

        //         chrome.tabs.executeScript(tabId, {
        //             code: ``
        //         });
        //     }
        // });


        chrome.tabs.executeScript(null, {
            code: `
                let wopen = window.open;
                test = function(){ console.log("Test1 ok"); };
                window.test = function(){ console.log("Test2 ok"); };
                window.open = function() {
                    console.log("Prevented a window: ", arguments);
                    let ad = wopen.apply(window,arguments);
                    let fake = Object.create(ad);
                    ad.close();
                    return fake;
                }
                console.log("Open Prevention Code injected.");
                    `,
            allFrames: true,
            world: "MAIN",
            frameId: 0,
        });

        // alert("Open Prevention Code injected.");
    }

    
    /* Chrome listeners */
    setListeners() {
        let self = this;
        
        //On storage change
        chrome.storage.onChanged.addListener(function(changes, namespace) {
            for (var key in changes) {
                var storageChange = changes[key];
                if(key=="$isEnabled" && namespace=="sync") {
                    self.app.isEnabled = storageChange.newValue;
                    self.inject();
                }
            }
        });

        
        //On updated tab
        chrome.tabs.onUpdated.addListener(function (tabId, changedInfo, tab) {
            //Se la protezione è attiva e l'oggetto non è vuoto
            if (self.app.isEnabled && tab) {
                //Se è cambiato l'url
                if(changedInfo && changedInfo.url) {
                    //Termina
                    self.inject();
                }
            }
        });

    }

}

export default Injector;