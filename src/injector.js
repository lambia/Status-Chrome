class Injector {
    constructor(app) {
        this.app = app;
        this.setListeners();
    }

    /* Chrome listeners */
    setListeners() {
        let self = this;

        //On browserAction click
        chrome.browserAction.onClicked.addListener(function () {
            alert(this.app);
        });
    }

}

export default Injector;
