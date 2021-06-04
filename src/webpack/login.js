import {MDCTextField} from '@material/textfield';
import {preloader} from "./preloader";

document.addEventListener("DOMContentLoaded", function(event) {
    console.log("js active, removing noscript fallback");
    document.body.classList.remove("no-js");

    const textField = new MDCTextField(document.querySelector('#mdcTextField1'));
    const textField2 = new MDCTextField(document.querySelector('#mdcTextField2'));




});

window.onload = function() {
    console.log("finished loading, hiding preloader");
    let plr = new preloader();
    setTimeout(plr.hide,0);

};

if ('serviceWorker' in navigator) {
    window.addEventListener('load', function() {
        navigator.serviceWorker.register('/service-worker.js')
            .then(function(registration) {
                // Registration was successful
                console.log('Registered!');
            }, function(err) {
                // registration failed :(
                console.log('ServiceWorker registration failed: ', err);
            }).catch(function(err) {
            console.log(err);
        });
    });
} else {
    console.log('service worker is not supported');
}