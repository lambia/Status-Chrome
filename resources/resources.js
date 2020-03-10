class Resources {
    constructor(lang) {
        let res = {
            en: {
                toggleAlert: {
                    enabledTitle: "Protection is enabled",
                    enabledMessage: "Turn off to be able to open windows again.\nchrome://extensions/shortcuts to activate keyboard shortcuts",
                    enabledIcon: "icons/enabled.png",
                    disabledTitle: "Protection is disabled",
                    disabledMessage: "Spam is welcome!",
                    disabledIcon: "icons/disabled.png",
                    blacklistedTitle: "Protection is enabled for a blacklisted site",
                    blacklistedMessage: "The website is: ",
                    blacklistedIcon: "icons/enabled.png",
                },
                browserAction: {
                    enabledTitle: "Click to disable protection",
                    disabledTitle: "Click to enable protection",
                    enabledIcon: "icons/enabled.png",
                    disabledIcon: "icons/disabled.png",
                }
            },
        };
        return res[lang];
    }
}

export default Resources;
