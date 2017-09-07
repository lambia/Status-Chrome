/*
TODO:
ctrl+tab o click utente apre
isActive in whichTab, to lock it on one just one tab
test the bottom code for js injection
todo: shortcut per toggle
bugfix: icona quando ctrl-tabbi
*/

//chrome.tabs.executeScript(null, {file: "testScript.js"});
//chrome.tabs.executeScript(null, {code:"var x = 10; x"}, function(results){console.log(results);} );
isActive = false;
whichTab = false;

//On browserAction click..
chrome.browserAction.onClicked.addListener(function(tab) {
    isActive = !isActive;
    whichTab = 
    isActive ? chrome.browserAction.setIcon({path: "icons/warning.png", tabId:tab.id}) : chrome.browserAction.setIcon({path: "icons/circle.www.png", tabId:tab.id});
    isActive ? alert("Window opening is now blocked!") : alert("Back to normal life.");
});

//On new opened tab
chrome.tabs.onCreated.addListener(function (tab){
    if(isActive) {
        chrome.tabs.remove(tab.id);
    }
    
    /*
    //On completed page load
    chrome.tabs.onUpdated.addListener( function (tabId, changeInfo, tab) {
        if (changeInfo.status == 'complete' ){ //&& tab.active
            //Exectute this simple javascript
            chrome.tabs.executeScript(null, {code: ""}, function(results){
                //Override window.open method
                window.open = function (url, windowName, windowFeatures) {
                    document.getElementsByTagName("BODY")[0].style.display = "none";
                    alert("oh no!");
                    console.log("Not opening a window through window.open()");
                };
                
                //$("a").click(function(e) {
                //  e.preventDefault();
                //  console.log("Not opening a window through <a> triggering");
                //  return false;
                //});

                //Debug
                //alert("YO!");
            });
        }
    });
    */
});

/*
function doInCurrentTab(tabCallback) {
    chrome.tabs.query(
        { currentWindow: true, active: true },
        function (tabArray) { tabCallback(tabArray[0]); }
    );
}

var activeTabId;
doInCurrentTab( function(tab){ activeTabId = tab.id } );
*/