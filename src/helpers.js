
class Helpers {

    printData(data, ontop = true) {
        if (ontop) {
            alert(JSON.stringify(data, null, 4));
        }
        console.log(data);
    }

}

export default Helpers;