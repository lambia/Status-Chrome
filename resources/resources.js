class Resources {
    constructor(lang) {
        let res = {
            en: {
                blacklistAlert: {
                    blacklistedTitle: "Protection is enabled for a blacklisted site",
                    blacklistedMessage: "The website is: ",
                    blacklistedIcon: "icons/on.png",
                },
                browserAction: {
                    enabledTitle: "Click to disable protection",
                    disabledTitle: "Click to enable protection",
                    enabledIcon: "icons/on.png",
                    disabledIcon: "icons/off.png",
                }
            },
        };
        return res[lang];
    }
}

export default Resources;
