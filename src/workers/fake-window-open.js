var wopen = window.open;

window.open = function () {
    console.log("Prevented a window from iframe", arguments);
    let ad = wopen.apply(window, arguments);
    let fake = Object.create(ad);
    ad.close();

    // var wrapper = document.createElement('div');
    // wrapper.id = "wrapper";
    // wrapper.style.zIndex = 9999999;
    // wrapper.style.position = "fixed";
    // wrapper.style.width = "50vw";
    // wrapper.style.background = "#222";
    // wrapper.style.border = "solid 1px #ddd";
    // wrapper.style.left = "25vw";
    // wrapper.style.bottom = "2rem";
    // wrapper.style.borderRadius = "0.5rem";
    // wrapper.style.padding = "0.5rem";
    // wrapper.style.color = "#ddd";
    // wrapper.style.textAlign = "center";
    // wrapper.textContent = "Il sito ha richiesto di aprire un popup.<br>" +
    //     "<a>Consenti questa volta</a>" +
    //     "<a>Consenti sempre questa destinazione</a>" +
    //     "<a>Consenti sempre da questa sorgente</a>" +
    //     "<a>Rifiuta sempre</a>";
    // document.body.appendChild(wrapper);

    return fake;
};

console.log("Window Open Overriden");
