/*
TODO:
ctrl+tab o click utente apre (come distinguere?)
isActive in whichTab, to lock it on one just one tab
fallback for shortcut already assigned (alert, new one)
fallback for notifications (if !permissions or !compatibility, go with alert)
notification onclick -> clear(id)
test the background.dev.js code for js injection in page
mute and wait for complete load of the tab before closing it
FIX PROBLEM WITH CHROME CANARY!!!
check mobile
*/

/*
CHANGELOG:
Shortcut to toggle protection (ALT + SHIFT + S)
Removed trash code (comments, dev stuff, old test)
Bugfix: the icon changed just on the active tab
Added notification toast instead of alert
Bugfix: turn off the protection automatically on browser exiting
*/

isActive = false;
whichTab = false;

var alertOn = { type: "basic", iconUrl: "icons/warning.png", title: "Protection is ON",
    message: "Opening new windows will now be prevented. \nYou can't as well: script too raw to distinguish." };
var alertOff = { type: "basic", iconUrl: "icons/circle.www.png", title: "Protection is OFF",
    message: "Spam is welcome!" };

//Activate/deactivate the protection
function toggleMe(){
    isActive = !isActive;
    isActive ? chrome.browserAction.setIcon({path: "icons/warning.png"}) : chrome.browserAction.setIcon({path: "icons/circle.www.png"});
    chrome.notifications.create("", isActive ? alertOn : alertOff, function(id) {
        timer = setTimeout(function(){ chrome.notifications.clear(id); }, isActive ? 2000 : 700);
    });
}

//On browserAction click, or keyboard shortcut, or browser closing
chrome.browserAction.onClicked.addListener(function() {
    toggleMe();
});
chrome.commands.onCommand.addListener(function (command) {
    if (command === "toggle") {
        toggleMe();
    }
});
//Prevent the extension from blocking new windows, if the last was closed while the extension still on
chrome.windows.onRemoved.addListener(function(windowid) {
    chrome.windows.getAll({populate : true}, function (window_list) {
        if(window_list<1){
            toggleMe();
        }
    });
});

//On new opened tab
chrome.tabs.onCreated.addListener(function (tab){
    if(isActive) {
        chrome.tabs.remove(tab.id);
    }
});
