/*
TODO:
ctrl+tab o click utente apre
isActive in whichTab, to lock it on one just one tab
test the bottom code for js injection
todo: shortcut per toggle
bugfix: icona quando ctrl-tabbi
*/

isActive = false;
whichTab = false;

//On browserAction click..
chrome.browserAction.onClicked.addListener(function(tab) {
    isActive = !isActive;
    isActive ? chrome.browserAction.setIcon({path: "icons/warning.png", tabId:tab.id}) : chrome.browserAction.setIcon({path: "icons/circle.www.png", tabId:tab.id});
    isActive ? alert("Window opening is now blocked!") : alert("Back to normal life.");
});

//On new opened tab
chrome.tabs.onCreated.addListener(function (tab){
    if(isActive) {
        chrome.tabs.remove(tab.id);
    }
});