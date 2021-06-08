import {preloader} from "../preloader";
import {Navigation} from "../app_navigation";
import {Sidesheet} from "../app_sidesheet";
import {ApothekePage} from "./app_apothekePage";
import {transformDateTimeString} from "../helpers";
import "../handlebarsHelpers";
import {Bottom} from "../bottom/app_bottom";
const Handlebars = require("handlebars");
var $ = require( "jquery" );

var phone = window.matchMedia("only screen and (max-device-width: 400px)");
var tablet = window.matchMedia("only screen and (max-device-width: 1280px)");

$(window).on('load',function() {
    console.log("finished loading, hiding preloader");
    // let plr = new preloader();
    // setTimeout(plr.hide,0);
});

let sidesheet, bottomTabs;


let nav = new Navigation(
    {
        pageData: {
            navTitle: "Apotheke - ImpfApp Dresden",
            date: transformDateTimeString(Date.now()).date,
            time: transformDateTimeString(Date.now()).time("hh:mm:ss"),
        },
    },
    {
        clock: ".navigation-clock",
        sidesheet: true,
        activeElement: "app-link-apotheke",
    },
);

let apothekePage = new ApothekePage();
apothekePage.show({tabs: true})
    .done(function(){
    // sidesheet = new Sidesheet("checkin", managementPage, {});
    // bottomTabs =  new Bottom("management", apothekePage, {})
});

nav.initialize
    .then(function(){
        nav.setAction("mdc-top-app-bar-action1", function(e, args){
            // sidesheet.toggle();
        })
    });

