// import Terminator from "./terminator.js"
// var terminator = new Terminator();

// import Injector from "./injector.js"
// var injector = new Injector();

//import Service from "./service.js"
//var service = new Service();
//var globals = service.globals();
//... new Injector(globals)

//All'action agire su tab attiva?
chrome.tabs.onUpdated.addListener(function (tabId, changedInfo, tab) {
    //Se la protezione è attiva e l'oggetto non è vuoto
    if (tab) {
        //Se è cambiato l'url
        if (changedInfo) {
            //ToDo: beccare anche changedInfo.status
            if (changedInfo.url) {
                //ToDo: Prenderlo da protocolli consentiti
                if(!changedInfo.url.startsWith("chrome://") && !changedInfo.url.startsWith("brave://")) {

                    // const tabId = getCurrentTabId();
                    if (tabId && tabId >= 0) {

                        chrome.tabs.get(tabId, result=>{
                            console.log("Tab presa: ", result);
                        });
                        
                        chrome.webNavigation.getAllFrames({
                            tabId: tab.id,
                        }, frames=> {
                            injectInFrames(tab.id, frames);
                        });
                        
                        injectInAllFrames(tab.id);

                    }
                }
            }
        }
    }
});

function injectInAllFrames(tabId) {
    chrome.scripting.executeScript({
        target: { tabId: tabId, allFrames: true },
        function: popupCondom,
        world: 'MAIN'
    });
}
function injectInFrames(tabId, frameIds) {
    
    console.log("frameIds: ", frameIds);
    let frameIdList = frameIds.map(r=>r.frameId);
    console.log("FrameIDS: ", frameIdList);

    chrome.scripting.executeScript({
        target: { tabId: tabId, frameIds: frameIdList },
        function: popupCondom,
        world: 'MAIN'
    });
}

// async function getCurrentTabId() {
//     let queryOptions = { active: true, lastFocusedWindow: true };
//     // `tab` will either be a `tabs.Tab` instance or `undefined`.
//     let tab = await chrome.tabs.query(queryOptions);
//     return (tab && tab.id) ? tab.id : -1;
// }

function popupCondom() {
    if(!window.metafunzionepertestareliniezione) {
        
        window.metafunzionepertestareliniezione = function(){ console.log("Codice già iniettato"); };
        
        let colore = Math.floor(Math.random()*16777215).toString(16)
        document.body.style.backgroundColor = colore;
        document.body.prepend(colore);
        
        let wopen = window.open;
        window.open = function() {
            console.log("Prevented a window: ", arguments);
            let ad = wopen.apply(window,arguments);
            let fake = Object.create(ad);
            ad.close();
            return fake;
        }

        alert("INJECTED");
        console.log("Open Prevention Code injected.");
    }
}
