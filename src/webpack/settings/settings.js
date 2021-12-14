import {preloader} from "../preloader";
import {Navigation} from "../app_navigation";
import {Sidesheet} from "../app_sidesheet";
import {SettingsPage} from "./app_settingsPage";
import {transformDateTimeString} from "../helpers";
import "../handlebarsHelpers";
import {apiHandler} from "../apiHandlers/apiHandler";
const Handlebars = require("handlebars");
var $ = require( "jquery" );

var phone = window.matchMedia("only screen and (max-device-width: 800px)");
var tablet = window.matchMedia("only screen and (max-device-width: 1280px)");

$(window).on('load',function() {
    console.log("finished loading, hiding preloader");
    // let plr = new preloader();
    // setTimeout(plr.hide,0);
});

let sidesheet;


let nav = new Navigation(
    {
        user: window.user,
        pageData: {
            navTitle: "Einstellungen",
            date: transformDateTimeString(Date.now()).date,
            time: transformDateTimeString(Date.now()).time("hh:mm:ss"),
        },
    },
    {
        clock: ".navigation-clock",
        sidesheet: true,
        activeElement: "app-link-management",
    },
);

let settingsPage = new SettingsPage();
settingsPage.show()
//     .done(function(){
//     sidesheet = new Sidesheet("checkin", managementPage, {});
// });


apiHandler.getRolesEnum()
    .then(function(roles) {
        nav.initialize
            .then(function(){
                nav.setAction("mdc-top-app-bar-action1", function(e, args){
                    sidesheet.toggle();
                })
                let subpage = nav.addSubpage("settings",  {user: window.user, roles: roles}, true, "app-link-settings", true);
                subpage.init
                    .then(function(){})
            });
    })

