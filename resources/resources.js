class Resources {
    constructor(lang) {
        let res = {
            en: {
                blacklistAlert: {
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
