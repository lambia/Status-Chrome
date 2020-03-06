class Resources {
    constructor(lang) {
        let res = {
            en: {
                toggleAlert: {
                    enabledTitle: "Protection is enabled",
                    enabledMessage: "Turn off to be able to open windows again.\nchrome://extensions/shortcuts to activate keyboard shortcuts",
                    enabledIcon: "icons/warning.png",
                    disabledTitle: "Protection is disabled",
                    disabledMessage: "Spam is welcome!",
                    disabledIcon: "icons/circle.www.png",
                    blacklistedTitle: "Protection is enabled for a blacklisted site",
                    blacklistedMessage: "The website is: ",
                    blacklistedIcon: "icons/warning.png",
                }
            }
        };
        return res[lang];
    }
}

export default Resources;
