console.log("[POPUPBLOCKER] Main worker started");

setListeners();

function inject(tabId) {
    console.log("Chiamato inject", tabId);

    chrome.scripting.executeScript({
        files: [ "src/fake-window-open.js" ],
        injectImmediately: true,
        target : {
            tabId : tabId,
            allFrames : true
        },
        world: "MAIN"
    });
}

    
// /* Chrome listeners */
function setListeners() {
    //On updated tab
    chrome.tabs.onUpdated.addListener(function (tabId, changedInfo, tab) {
        //Se la protezione è attiva e l'oggetto non è vuoto
        if (tab) {
            //Se è cambiato l'url
            // if(changedInfo && changedInfo.url) {
                //Termina
                inject(tabId);
            // }
        }
    });
}
