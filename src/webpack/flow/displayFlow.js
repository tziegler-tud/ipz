import {preloader} from "../preloader";
import "../pushhandler";
import {Navigation} from "../app_navigation";
import {Sidesheet} from "../app_sidesheet";
import {DisplayPage} from "./app_displayPage";
import {transformDateTimeString} from "../helpers";
import "../handlebarsHelpers";
import {Bottom} from "../bottom/app_bottom";
const Handlebars = require("handlebars");
var $ = require( "jquery" );

var phone = window.matchMedia("only screen and (max-device-width: 800px)");
var tablet = window.matchMedia("only screen and (max-device-width: 1280px)");

$(window).on('load',function() {
    console.log("finished loading, hiding preloader");
    let plr = new preloader();


    let sidesheet, bottomTabs;


    // let nav = new Navigation(
    //     {
    //         user: window.user,
    //         pageData: {
    //             navTitle: "ImpFlow Display",
    //             date: transformDateTimeString(Date.now()).date,
    //             time: transformDateTimeString(Date.now()).time("hh:mm:ss"),
    //         },
    //     },
    //     {
    //         clock: ".navigation-clock",
    //         sidesheet: true,
    //         activeElement: "app-link-management",
    //     },
    // );

    let displayPage = new DisplayPage();

    displayPage.show().then(function(){
        plr.hide();
        // sidesheet = new Sidesheet("checkin", displayPage, {});
    });
    // nav.initialize
    //     .done(function(){
    //         nav.setAction("mdc-top-app-bar-action1", function(e, args){
    //             sidesheet.toggle();
    //         })
    //     });
});
