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

//https://developer.chrome.com/extensions/tabs#type-Tab
/* *************************************************************************************/



/* Configuration variables *************************************************************/

isActive = false;
whichTab = false;

var alertOn = {
    type:       "basic",
    iconUrl:    "icons/warning.png",
    title:      "Protection: ON",
    message:    "Turn off to be able to open windows again.\n"+
                "Go to: chrome://extensions/shortcuts to activate keyboard shortcuts"
};

var alertOff = {
    type:       "basic",
    iconUrl:    "icons/circle.www.png",
    title:      "Protection: OFF",
    message:    "Spam is welcome!"
};

/* Configuration variables end **********************************************************/



/* Define commands **********************************************************************/

chrome.browserAction.onClicked.addListener(function() {
    toggleMe(); //On browserAction click, or keyboard shortcut, or browser closing
});

chrome.commands.onCommand.addListener(function (command) {
    if (command === "toggle") {
        toggleMe();
    } else if (command === "debug") {
        debugMe();
    } else if (command === "add") {
        //addToList();
    } else if (command === "clean") {
        //cleanList();
    }
});

/* Define commands end ******************************************************************/



/* Array/storage functions **************************************************************/

/*
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

function setDefault() {
    chrome.storage.local.set({array: [
        "openload.co",
        "vcrypt.net",
        "eurostreaming.club",
        "localhost"
    ]}, function() {
        getArray();
        alert("default: "+list);
    });
}

function cleanList() {
    clearArray();
    //redundant, just for now
    alert("Blacklist totally cleaned");
}

function addToList() {
*/
    /*
    chrome.tabs.query({'active': true, 'lastFocusedWindow': true}, function (tabs) {
        var url = tabs[0].url;
    });
    alert(url);
    setArray(url);
    alert(url);
    *//*
    alert("Not yet working");
}
*/
/* Array/storage functions end **********************************************************/



/* Actual functions *********************************************************************/

//Activate/deactivate the protection
function toggleMe(){
    isActive = !isActive;
    isActive ? chrome.browserAction.setIcon({path: "icons/warning.png"}) : chrome.browserAction.setIcon({path: "icons/circle.www.png"});
    chrome.notifications.create(
        "",
        isActive ? alertOn : alertOff,
        function(notificationId) {
            timer = setTimeout(function(){
                chrome.notifications.clear(notificationId);
            }, 1000);
        }
    );
    //ToDo**: prompt "want to add current site to blacklist?"
}

function toggleBlackMode(site){
    isActive = !isActive;
    isActive ? chrome.browserAction.setIcon({path: "icons/warning.png"}) : chrome.browserAction.setIcon({path: "icons/circle.www.png"});
    chrome.notifications.create(
        "",
        isActive ? {
            type:       "basic",
            iconUrl:    "icons/warning.png",
            title:      "Blacklisted site",
            message:    `Blacklist mode activated for ${site}`
        } : alertOff,
        function(notificationId) {
            timer = setTimeout(function(){
                chrome.notifications.clear(notificationId);
            }, 1000);
        }
    );
}


function debugMe() {
    //setArray("prova");
    //getArray();
    //clearArray();
    //setDefault();
    alert("Blacklist set to defaults");
    
    //getArray();
    console.log("default: "+list);
}

/* Actual functions end *****************************************************************/



/* Event handlers ***********************************************************************/

//Prevent the extension from blocking new windows, if the last was closed while the extension still on
chrome.windows.onRemoved.addListener(function(windowid) {
    chrome.windows.getAll(
        {populate : true},
        function (window_list) {
            if(window_list<1 && isActive){
                toggleMe();
            }
        });
});

//Check for blacklist on tab update
chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab){

    if(changeInfo.url) { //Using as buffer to avoid multiple firing for single event

        var domain = tab.url.match(/^[\w-]+:\/{2,}\[?([\w\.:-]+)\]?(?::[0-9]*)?/)[1];
        //http://www.google.com/path/ -> www.google.com

        var host = domain.toLowerCase().match(/[^.]*\.[^.]{2,3}(?:\.[^.]{2,3})?$/);
        //www.google.com -> google.com / www.google.cn.com -> google.cn.com

        //alert( list.indexOf(host));           //don't work, even if host is "google.it". type mismatch or what?
        //alert( list.indexOf("google.it"));    //work
        
        //should do two nested for-lopps instead of using indexof on an array
        if (host && list.indexOf(host)>-1 && !isActive) {
            //alert(tabId+"#"+host+" is in the blascklist @: "+list.indexOf(host));
            //toggleBlackMode(host);
            //alert("X");
        }
    }
});

//On new opened tab
chrome.tabs.onCreated.addListener(function (tab){
    /*
    chrome.tabs.query(
        {
            'active': true,
            //'currentWindow': true	    //"always" work
            'lastFocusedWindow': true	//it's enough
        }, function (tabs) {
            var url = tabs[0].url;
        }
    );
    */

    if(isActive) {
        chrome.tabs.remove(tab.id);
    }
});

/* Event handlers end *******************************************************************/



/* Main ********************************************************************************/

//list = [];
list = [
    "openload.co",
    "vcrypt.net",
    "eurostreaming.club",
    //"localhost",
    //"google.it",
    //"www.google.it"
];
//getArray();

/* Main end ****************************************************************************/