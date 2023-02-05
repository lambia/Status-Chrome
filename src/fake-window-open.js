var wopen = window.open;

window.open = function() {
    console.log("Prevented a window from iframe", arguments);
    let ad = wopen.apply(window, arguments);
    let fake = Object.create(ad);
    ad.close();
    return fake;
};

console.log("Window Open Overriden");