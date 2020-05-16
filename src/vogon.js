//import Resources from "../resources/resources.js"
//Resources non esiste più, usare chrome.i18n
class Vogon {
    constructor(lang) {
        this.res = new Resources(lang);
        this.isEnabled = false;
        this.blacklistedTabs = [];
        this.setListeners();

        this.list = [
            "openload.co",
            "vcrypt.net",
            "streaming",
            "guardaserie",
            "google.it" //per debug
        ];

        //getArray();
    }

    /* Chrome listeners */
    setListeners() {
        let self = this;

        chrome.commands.onCommand.addListener(function (command) {
            if (command === "debug") {
                self.debug();
            } else if (command === "add") {
                //addToList();
            } else if (command === "clean") {
                //cleanList();
            }
        });

        //On new opened tab
        chrome.tabs.onCreated.addListener(function (tab) {

            //this.blacklistedTabs

            //Controlla la tab attiva nella finestra con focus
            chrome.tabs.query(
                {
                    'active': true,
                    //'currentWindow': true	    //"always" work
                    'lastFocusedWindow': true	//it's enough
                }, function (tabs) {
                    //Se non è una tab vuota
                    if (tabs[0].url && tabs[0].url != "") {
                        //E la protezione è attiva
                    }
                }
            );



        });

        //Check for blacklist on tab update
        chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
            if (changeInfo.url) { //Using as buffer to avoid multiple firing for single event
                self.checkUrl(tab.url);
            }

        });
    }

    checkUrl(url) {
        var domain = null;
        var host = null;

        //Remove protocol and path
        domain = url.match(/^[\w-]+:\/{2,}\[?([\w\.:-]+)\]?(?::[0-9]*)?/);

        if (domain && domain.length && domain[0]) {
            domain = domain[1];
            host = domain.toLowerCase().match(/[^.]*\.[^.]{2,3}(?:\.[^.]{2,3})?$/);
            //ToDev: a parte www.domain.ext, proporre all'utente (es. domain.cn.com, www.domain.cn.com, sub.domain.test)
        }

        if (host && host.length && host[0]) {
            host = host[0];

            //should do two nested for-lopps instead of using indexof on an array
            if (this.list.indexOf(host) > -1 && !this.isEnabled) {
                this.toggleBlackMode(host);
            }

        }
    }

    toggleBlackMode(site) {
        this.blacklistedTabs.push(site);

        // this.isEnabled = !this.isEnabled;
        // let isEnabled = this.isEnabled;
        // let res = this.res;

        // chrome.browserAction.setIcon({ path: this.isEnabled ? res.blacklistAlert.blacklistedIcon : res.blacklistAlert.disabledIcon });
    }

    debug() {
        //setArray("prova");
        //getArray();
        //clearArray();
        //setDefault();
        //alert("Blacklist set to defaults");
        //getArray();
        //console.log("default: " + list);
        alert("Debug");
    }

    /******************************************************************** */
    // setArray(who) {
    //     list.push(who);
    //     chrome.storage.local.set({ array: list }, function () {
    //         //Add a notification (?)
    //     });
    // }
    // getArray() {
    //     chrome.storage.local.get({ 'array': [] }, function (result) {
    //         list = result.array;

    //         var listObj = [];
    //         for (var i = 0; i < list.length; i++) {
    //             listObj.push({ hostContains: list[i] });
    //         }

    //         var filter = { url: listObj };
    //         chrome.webNavigation.onBeforeNavigate.addListener(function (details) {
    //             if (!isEnabled) {
    //                 toggleMe();
    //             }
    //         }, filter);

    //     });
    // }

    // clearArray() {
    //     chrome.storage.local.clear();
    // }

    // setDefault() {
    //     chrome.storage.local.set({
    //         array: [
    //             "openload.co",
    //             "vcrypt.net",
    //             "eurostreaming.club",
    //             "localhost"
    //         ]
    //     }, function () {
    //         getArray();
    //         alert("default: " + list);
    //     });
    // }

    // cleanList() {
    //     clearArray();
    //     //redundant, just for now
    //     alert("Blacklist totally cleaned");
    // }

    // addToList() {
    //     chrome.tabs.query({ 'active': true, 'lastFocusedWindow': true }, function (tabs) {
    //         var url = tabs[0].url;
    //     });
    //     alert(url);
    //     setArray(url);
    //     alert(url);
    //     alert("Not yet working");
    // }

}

export default Vogon;