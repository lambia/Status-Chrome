class Judge {
    constructor(app) {
        this.app = app;
        this.setListeners();

        //this.override(null);
    }

    /* Chrome listeners */
    setListeners() {
        let self = this;

    }

    //Inject javascript to override window.open and prevent any new window
    //It now works thanks to the returned mock WindowProxy
    //To use for the new release
    //Need to be called for all the tabs (on toggle) and for any tabs that loads new page
    //Also check for browserProtocols/itsok
    override(tab) {
        let self = this;

        chrome.tabs.executeScript(tab, {
            code: `
                    let wopen = window.open;
                    window.open = function() {
                        console.log("Prevented a window", arguments);
                        let ad = wopen.apply(window,arguments);
                        let fake = Object.create(ad);
                        ad.close();
                        return fake;
                    }
                    console.log("Open Prevention Code injected.");
                    `
        })
    }

}

export default Judge;
