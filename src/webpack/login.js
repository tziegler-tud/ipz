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

var vapidPublicKey =urlBase64ToUint8Array("BM-VsybJ1S9bkhK-GLK_LoxozsJdr0PfQCS6dmqVcpe08oSZthKcGw3Pws4D_PI4ahyxoArS6TuWYSZwW1m1nQo");


if ('serviceWorker' in navigator) {
    window.addEventListener('load', function() {
        navigator.serviceWorker.register('/service-worker.js')
            .then(function(registration) {
                // Registration was successful
                console.log('Registered!');

                registration.pushManager.getSubscription().then(function(sub) {
                    if (sub === null) {
                        // Update UI to ask user to register for Push
                        console.log('Not subscribed to push service!');
                        Notification.requestPermission().then((result) => {
                            if (result === 'granted') {
                                console.log("permission granted");
                                subscribeUser();
                            }
                        });
                    } else {
                        // We have a subscription, update the database
                        console.log('Subscription object: ', sub);
                    }
                });


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

function subscribeUser() {
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.ready
            .then(function(reg) {
                const subscribeOptions = {
                    userVisibleOnly: true,
                    applicationServerKey: urlBase64ToUint8Array(
                        'BJlEoQeG_Z5umiIhGawf4scU-qF6xprAYbeN18g7dg7Wr89gwcff-Ns47Tw3u307r9eCBm8KAYWDe-SExffdSF0'
                    )
                };
                reg.pushManager.subscribe(subscribeOptions).then(function(sub) {
                    console.log('Endpoint URL: ', sub.endpoint);
                }).catch(function(e) {
                    if (Notification.permission === 'denied') {
                        console.warn('Permission for notifications was denied');
                    } else {
                        console.error('Unable to subscribe to push', e);
                    }
                });
            })
            .then(function(pushSubscription) {
                PostSubscriptionDetails(pushSubscription);
            });
    }
}

function PostSubscriptionDetails(Subscription) {

    var sub = JSON.parse(JSON.stringify(Subscription));

    var token = sub.keys.p256dh;
    var auth = sub.keys.auth;
    var fields = {endpoint:sub.endpoint,token:token,auth:auth};

    fetch('/push/register', {
        method: 'POST',
        headers: new Headers({'Content-Type': 'application/json'}),
        body: JSON.stringify(fields)
    }).then(function(data) {
        console.log("returned from server:");
        console.log(data);
        document.getElementById("welcomemsg").innerHTML = "READY for Notifications!";
        // Todo. Save anything you needed when you "regsitered" with the server and told him how to notify you.
    });

}

function urlBase64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
        .replace(/\-/g, '+')
        .replace(/_/g, '/')
    ;
    const rawData = window.atob(base64);
    return Uint8Array.from([...rawData].map((char) => char.charCodeAt(0)));
}
