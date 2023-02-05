//ToDo: localizzare tutto

var prefix = "[Blocco Popup] ";

//Per evitare di triggerare più volte, controlliamo di non averlo già fatto.
//Una semplice variabile non va bene, sostituire con metodo non bypassabile (todo)
if (__wopen_is_overidden!==true ) {
    var wopen = window.open;

    window.getHostname = function(url) {
        // Since it's not a frequent operation, I won't add complexity for tests and readability, but... yes,
        // performance benchmarks revealed that a well written regex (*) would be 50x faster than URL constructor 
        // (*) keep port: url.match(/^https?\:\/\/([^\/?#]+)(?:[\/?#]|$)/i);
        // (*) only host: url.match(/^https?\:\/\/([^\/:?#]+)(?:[\/:?#]|$)/i);

        let hostname = "error";
        if(url && (typeof url) === 'string') {
            hostname = new URL(url).hostname;
            hostname = (hostname.indexOf("www.") == 0) ? hostname.slice(4) : hostname;
        }
        return hostname;
    }
    
    window.open = function () {
        console.log(prefix + "window.open.prevented", arguments);
        let ad = wopen.apply(window, arguments);
        let fake = Object.create(ad);
        ad.close();
        
        var wrapper = document.createElement('div');
        wrapper.id = "wrapper";
        wrapper.style.zIndex = 9999999;
        wrapper.style.position = "fixed";
        wrapper.style.width = "50vw";
        wrapper.style.background = "#222";
        wrapper.style.border = "solid 1px #ddd";
        wrapper.style.left = "25vw";
        wrapper.style.bottom = "2rem";
        wrapper.style.borderRadius = "0.5rem";
        wrapper.style.padding = "0.5rem";
        wrapper.style.color = "#ddd";
        wrapper.style.textAlign = "center";

        //Recuperare anche hostname della tab (necessaria integrazione con API chrome o con worker)
        var msg = document.createElement('span');
        //oppure prendi direttamente window.location.hostname
        msg.innerText = "["+ window.getHostname(window.location.href) + "] ha richiesto di aprire un popup verso [" + window.getHostname(arguments[0]) + "]";
        msg.style.display = "block";
        msg.style.padding = "0.25em";
        wrapper.appendChild(msg);

        var actions = [
            "Rifiuta sempre destinazione",
            "Rifiuta sempre sorgente",
            "br",
            "Consenti sempre destinazione",
            "Consenti sempre sorgente",
            "Consenti questa volta",
        ];

        for (let i = 0; i < actions.length; i++) {
            const actionText = actions[i];

            if(actionText=="br") {
                var br = document.createElement('br');
                wrapper.appendChild(br);
            } else {
                var linkEl = document.createElement('a');
                linkEl.innerText = actionText;
                linkEl.style.padding = "0.5em";
                linkEl.style.cursor = "pointer";
                wrapper.appendChild(linkEl);
            }
        }
        
        document.body.appendChild(wrapper);
        
        return fake;
    };

    var __wopen_is_overidden = true;
    console.log(prefix + "window.open.override.done");

} else {
    console.log(prefix + "window.open.override.already");
}