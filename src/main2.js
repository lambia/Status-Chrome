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

                        console.log("MAIN 2 !");
                    }
                }
            }
        }
    }
});