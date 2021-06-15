import {MDCBanner} from '@material/banner';
import {apiHandler} from "./apiHandlers/apiHandler";

var vapidPublicKey ="BM-VsybJ1S9bkhK-GLK_LoxozsJdr0PfQCS6dmqVcpe08oSZthKcGw3Pws4D_PI4ahyxoArS6TuWYSZwW1m1nQo";
var convertedPublicKey =urlBase64ToUint8Array(vapidPublicKey);
let user = window.user;

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
                        showPermissionDialog();

                    } else {
                        // We have a subscription, update the database
                        // sub.unsubscribe().then(function(Boolean) {
                        //     //force new subscription
                        //     subscribeUser();
                        //     //update userManager to store subscription
                        //     console.log('Subscription object: ', sub);
                        // });
                        registerPushSubscription(user, sub)
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
                    applicationServerKey: convertedPublicKey,
                };
                reg.pushManager.subscribe(subscribeOptions)
                    .then(function(sub) {
                        console.log('Endpoint URL: ', sub.endpoint);
                        registerPushSubscription(user, sub)
                    })
                    .catch(function(e) {
                        if (Notification.permission === 'denied') {
                            console.warn('Permission for notifications was denied');
                        } else {
                            console.error('Unable to subscribe to push', e);
                        }
                    });
            })
    }
}

function registerPushSubscription(user, subscription) {
    var sub = JSON.parse(JSON.stringify(subscription));

    var token = sub.keys.p256dh;
    var auth = sub.keys.auth;
    var fields = {endpoint:sub.endpoint,token:token,auth:auth};

    let body = {user: user, subscription: fields}

    fetch('/api/v1/user/subscribe/'+user.id, {
        method: 'POST',
        headers: new Headers({'Content-Type': 'application/json'}),
        body: JSON.stringify(body)
    }).then(function(data) {
        console.log("returned from server:");
        console.log(data);
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

function showPermissionDialog(){
    let banner = document.createElement("div");
    banner.className = "permission-banner mdc-banner";
    banner.role = "banner";
    banner.innerHTML = "<div class=\"mdc-banner__content\"\n" +
        "       role=\"status\"\n" +
        "       aria-live=\"assertive\">\n" +
        "    <div class=\"mdc-banner__graphic-text-wrapper\">\n" +
        "      <div class=\"mdc-banner__text\">\n" +
        "        There was a problem processing a transaction on your credit card.\n" +
        "      </div>\n" +
        "    </div>\n" +
        "    <div class=\"mdc-banner__actions\">\n" +
        "      <button type=\"button\" class=\"mdc-button mdc-banner__primary-action\">\n" +
        "        <div class=\"mdc-button__ripple\"></div>\n" +
        "        <div class=\"mdc-button__label\">Fix it</div>\n" +
        "      </button>\n" +
        "    </div>\n" +
        "  </div>"

    document.body.prepend(banner);
    const mdcBanner = new MDCBanner(banner);

    mdcBanner.foundation.handlePrimaryActionClick = function(){
        //show permission dialog
        Notification.requestPermission().then((result) => {
            if (result === 'granted') {
                console.log("permission granted");
                mdcBanner.close();
                subscribeUser();
            }
            if (result === "default") {
                //browser requires permission to be requested in a short event handler.
            }
        });
    }

    mdcBanner.foundation.handleSecondaryActionClick = function(){
        //dont ask again
    }
    mdcBanner.open();
}