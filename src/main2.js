
    function replaceWopenIntoContext(context){
        let wopen = context.open;

        context.open = function() {
            console.log("Prevented a window", arguments);
            let ad = wopen.apply(context, arguments);
            let fake = Object.create(ad);
            ad.close();
            return fake;
        }
    }

    function replaceWopenIntoArray(array) {
        if(array) {
            let length = array.length;
            if(length) {
                for (var i = 0; i < array.length; i++) {
                    if(array[i]) {
                        if(array[i].length) {
                            replaceWopenIntoArray(array[i]);
                        }
                        replaceWopenIntoContext(array[i]);
                    }
                }
            }
        }
    }

    replaceWopenIntoContext( window );
    replaceWopenIntoArray( window.frames );

    