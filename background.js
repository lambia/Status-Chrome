/*
TODO:
Check if the tab is in blacklist
Save new rules for blacklist
test the background.dev.js code for js injection in page
mute and wait for DOMContentLoaded before closing it
check mobile
Create an icon
ctrl+tab o click utente apre (come distinguere?)
isActive in whichTab, to lock it on one just one tab
fallback for shortcut already assigned (alert, new one)
fallback for notifications (if !permissions or !compatibility, go with alert)
notification onclick -> clear(id)
users can submits blacklisted website
chrome.tabs.executeScript(tab.id, {"file": "findtarget.js"});
*/

/*
CHANGELOG:
Now working in Chrome Canary too
Icon in manifest works now, even if scaled up
Shortcut to toggle protection (ALT + SHIFT + S)
Removed trash code (comments, dev stuff, old test)
Bugfix: the icon changed just on the active tab
Added notification toast instead of alert
Bugfix: turn off the protection automatically on browser exiting
*/

isActive = false;
whichTab = false;

var alertOn = { type: "basic", iconUrl: "icons/warning.png", title: "Protection is ON",
    message: "Opening new windows will now be prevented. \nPress ALT+SHIFT+B to add this website to the 'blacklist'" };
var alertOff = { type: "basic", iconUrl: "icons/circle.www.png", title: "Protection is OFF",
    message: "Spam is welcome!" };

//Activate/deactivate the protection
function toggleMe(){
    isActive = !isActive;
    isActive ? chrome.browserAction.setIcon({path: "icons/warning.png"}) : chrome.browserAction.setIcon({path: "icons/circle.www.png"});
    chrome.notifications.create("", isActive ? alertOn : alertOff, function(id) {
        timer = setTimeout(function(){ chrome.notifications.clear(id); }, isActive ? 2000 : 700);
    });
    //ToDo**: prompt "want to add current site to blacklist?"
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
chrome.commands.onCommand.addListener(function (command) {
    if (command === "debug") {
        debugMe();
    }
});
chrome.commands.onCommand.addListener(function (command) {
    if (command === "add") {
        addToList();
    }
});
chrome.commands.onCommand.addListener(function (command) {
    if (command === "clean") {
        cleanList();
    }
});

//Prevent the extension from blocking new windows, if the last was closed while the extension still on
chrome.windows.onRemoved.addListener(function(windowid) {
    chrome.windows.getAll({populate : true}, function (window_list) {
        if(window_list<1 && isActive){
            toggleMe();
        }
    });
});

//Check for blacklist on tab update
//.indexOf() seems to not work in chrome (?!) even if a simple -> [1,2].toLowerCase().indexOf(1)
chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab){
    if(changeInfo.url) { //Using as buffer to avoid multiple firing for single event
        //alert(tab.url.hostname); //Doesn't work
        var domain = tab.url.match(/^[\w-]+:\/{2,}\[?([\w\.:-]+)\]?(?::[0-9]*)?/)[1]; //http://www.google.com/path/ -> www.google.com
        var host = domain.toLowerCase().match(/[^.]*\.[^.]{2,3}(?:\.[^.]{2,3})?$/); //www.google.com -> google.com / www.google.cn.com -> google.cn.com
        
        if (host && list.indexOf(host)>-1 && !isActive) {
            alert(tabId+"#"+host+" is in thess blascklist @: "+list.indexOf(host));
            toggleMe();
        }
    }
});

//On new opened tab
chrome.tabs.onCreated.addListener(function (tabId, changeInfo, tab){
    //currentWindow "always" work, but lastFocusedWindow should be enough for this scenario
    /*
    chrome.tabs.query({'active': true, 'lastFocusedWindow': true}, function (tabs) {
        var url = tabs[0].url;
    });*/

    if(isActive) {
        chrome.tabs.remove(tab.id);
    }
});

function setArray(who){
    list.push(who);
    chrome.storage.local.set({array: list}, function() {
        //Add a notification (?)
    });
}
function getArray(){
    chrome.storage.local.get({'array': []}, function (result) {
        list = result.array;

        var listObj = [];
        for (var i = 0; i < list.length; i++) {
            listObj.push( { hostContains: list[i] } );
        }

        var filter = {url: listObj};
        chrome.webNavigation.onBeforeNavigate.addListener(function(details) {
            if(!isActive) {
                toggleMe();
            }
        }, filter);

    });
}
function clearArray(){
    chrome.storage.local.clear();
}

function debugMe() {
    //setArray("prova");
    //getArray();
    //clearArray();
    setDefault();
    alert("Blacklist set to defaults");
}

function cleanList() {
    clearArray();
    //redundant, just for now
    alert("Blacklist totally cleaned");
}

function addToList() {
    /*
    chrome.tabs.query({'active': true, 'lastFocusedWindow': true}, function (tabs) {
        var url = tabs[0].url;
    });
    alert(url);
    setArray(url);
    alert(url);
    */
    alert("Not yet working");
}

function setDefault() {
    chrome.storage.local.set({array: [
        "openload.co",
        "vcrypt.net",
        "eurostreaming.club"
    ]}, function() {
        getArray();
        alert("default: "+list);
    });
}

list = [];
getArray();