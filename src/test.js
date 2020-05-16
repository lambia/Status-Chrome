class Test {
    constructor(app) {
        this.app = app;
        this.setListeners();
    }

    /* Chrome listeners */
    setListeners() {
        let self = this;

        //On browserAction click
        chrome.browserAction.onClicked.addListener(function () {
            this.app = !this.app;
        });
    }

}

export default Test;
