import {preloader} from "../preloader";
import {Navigation} from "../app_navigation";
import {Sidesheet} from "../app_sidesheet";
import {UserPage} from "./app_userPage";
import {apiHandler} from "../apiHandlers/apiHandler"
import {transformDateTimeString} from "../helpers";
import "../handlebarsHelpers";
const Handlebars = require("handlebars");
var $ = require( "jquery" );

var phone = window.matchMedia("only screen and (max-device-width: 400px)");
var tablet = window.matchMedia("only screen and (max-device-width: 1280px)");

$(window).on('load',function() {
    console.log("finished loading, hiding preloader");
    // let plr = new preloader();
    // setTimeout(plr.hide,0);
});

let sidesheet;

let activeId = (window.currentUser) ? "app-link-device" : "app-link-usermanagement"

let nav = new Navigation(
    {
        pageData: {
            navTitle: "Mein Gerät - ImpfApp Dresden",
            date: transformDateTimeString(Date.now()).date,
            time: transformDateTimeString(Date.now()).time("hh:mm:ss"),
        },
    },
    {
        clock: ".navigation-clock",
        sidesheet: true,
        activeElement: activeId,
        open: true,
        topbar: true,
    },
);

let context = {user: window.user, exploredUser: window.exploredUser};
let devicePage = new UserPage({}, context);

let options = (window.exploredUser !== undefined) ? {} : {snackbar: {
            show: true,
            message: "Error: Failed to retrieve user data.",
            actionButton: {
                display: true,
                text: "Nagut",
            }
        }}
devicePage.show(options)
    .then(function(){
        // sidesheet = new Sidesheet("checkin", managementPage, {});
    });


nav.initialize
    .then(function(){
        nav.setAction("mdc-top-app-bar-action1", function(e, args){
            // sidesheet.toggle();
            Notification.requestPermission().then((result) => {
                if (result === 'granted') {
                    console.log("permission granted")
                    randomNotification();

                }
            });
        });
    });




function randomNotification() {
    const notifTitle = window.user.username;
    const notifBody = "current user is: " + window.user.name;
    const notifImg = "/images/bg-square.jpg";
    const options = {
        body: notifBody,
        icon: notifImg,
    };
    // new Notification(notifTitle, options);
    navigator.serviceWorker.ready.then(function(registration) {
        registration.showNotification(notifTitle, {
            body: notifBody,
            icon: notifImg,
            vibrate: [200, 100, 200, 100, 200, 100, 200],
            tag: 'my-tag'
        });
    });
    // setTimeout(randomNotification, 30000);
}