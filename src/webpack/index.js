import {preloader} from "./preloader";
import {Navigation} from "./app_navigation";
import {CheckinPage, CheckoutPage} from "./app_pages";
import {transformDateTimeString} from "./helpers";
import "./handlebarsHelpers";
const Handlebars = require("handlebars");
var $ = require( "jquery" );

$(window).on('load',function() {
    console.log("finished loading, hiding preloader");
    let plr = new preloader();
    setTimeout(plr.hide,0);

});






let nav = new Navigation(
    {
        pageData: {
            navTitle: "Impfzentrum Dresden - Digitale Wartenummern",
            date: transformDateTimeString(Date.now()).date,
            time: transformDateTimeString(Date.now()).time("hh:mm:ss"),
        },
    },
    {
        clock: ".navigation-clock",
        nav1: {
            onclick: function(){
            }
        },
        nav2: {
            onclick: function(){
                checkoutPage.hide();
                checkinPage.show();
            }
        },
        nav3: {
            onclick: function(){
                checkoutPage.show();
            }
        }
    },
);

let checkinPage = new CheckinPage();
let checkoutPage = new CheckoutPage();
checkinPage.show();
