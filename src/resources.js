class Resources {
    constructor() {
        this.res = {
            placeholder: "static-asset",
            browserIcon: {
                on: "icons/on.png",
                off: "icons/off.png",
            }
        };
    }

    getStaticMessage(stringPath) {
        let buffer = this.res;
        var nodes = stringPath.split('.');

        try {
            for (var i = 0, n = nodes.length; i < n; ++i) {
                var currentNode = nodes[i];
                if (currentNode in buffer) {
                    buffer = buffer[currentNode];
                } else {
                    return;
                }
            }
        } catch (error) {
            //A property doesn't exist
            buffer = "";
        }

        return buffer;
    }

    // It works as one-liner but I don't like it for performance and readability
    // I've tested and benchmarked it on JSPerfs
    // getStaticMessage(stringPath) {
    //     let r = stringPath.split(".").reduce((prev, curr) => prev && prev[curr], this.res);
    //     return r || "";
    // }

    translator(what, override = false) {
        if (override) { //Static resource from class property
            //return this.res(what);
            return this.getStaticMessage(what);
        } else { //i18n resource
            return chrome.i18n.getMessage(what);
        }
    }
}

export default Resources;