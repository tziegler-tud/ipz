import {MDCTextField} from '@material/textfield';
import {preloader} from "./preloader";

document.addEventListener("DOMContentLoaded", function(event) {
    console.log("js active, removing noscript fallback");
    document.body.classList.remove("no-js");

    const textField = new MDCTextField(document.querySelector('#mdcTextField1'));
    const textField2 = new MDCTextField(document.querySelector('#mdcTextField2'));
    const textField3 = new MDCTextField(document.querySelector('#mdcTextField3'));

});

window.onload = function() {
    console.log("finished loading, hiding preloader");
    let plr = new preloader();
    setTimeout(plr.hide,0);
};