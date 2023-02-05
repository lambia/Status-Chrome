let res = {
    placeholder: "static-asset",
    browserIcon: {
        on: "icons/on.png",
        off: "icons/off.png",
    }
};

function asset(stringPath) {
    //return this.res(what);

    let buffer = res;
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

function text(what) {
    return chrome.i18n.getMessage(what);
}

export { asset, text}
export default text;