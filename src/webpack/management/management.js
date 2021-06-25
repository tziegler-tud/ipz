import {preloader} from "../preloader";
import "../pushhandler";
import {Navigation} from "../app_navigation";
import {Sidesheet} from "../app_sidesheet";
import {ManagementModulePage} from "./app_managementModulePage";
import {transformDateTimeString} from "../helpers";
import "../handlebarsHelpers";
import {Bottom} from "../bottom/app_bottom";
const Handlebars = require("handlebars");
var $ = require( "jquery" );

var phone = window.matchMedia("only screen and (max-device-width: 400px)");
var tablet = window.matchMedia("only screen and (max-device-width: 1280px)");

$(window).on('load',function() {
    console.log("finished loading, hiding preloader");
    let plr = new preloader();
    setTimeout(plr.hide,0);


let sidesheet, bottomTabs;


let nav = new Navigation(
    {
        user: window.user,
        pageData: {
            navTitle: "Management",
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

let pages  = [];
let managementDashboardPage = new ManagementModulePage("dashboard");
let managementTotalPage = new ManagementModulePage("total");
let managementTracksPage = new ManagementModulePage("tracks");
let managementStatisticsPage = new ManagementModulePage("statistics");
let managementDevicesPage = new ManagementModulePage("devices");

pages.push(managementDashboardPage);
pages.push(managementTotalPage);
pages.push(managementTracksPage);
pages.push(managementStatisticsPage);
pages.push(managementDevicesPage);

managementTotalPage.show({tabs: true, refresh: true})
    .done(function(){
        // sidesheet = new Sidesheet("checkin", managementPage, {});
        // bottomTabs =  new Bottom("management", managementTotalPage, {})
    });

nav.initialize
    .then(function(){
        nav.setAction("mdc-top-app-bar-action1", function(e, args){
            // sidesheet.toggle();
        })
        let subpage = nav.addSubpage("management", {user: window.user}, true, "app-link-management", true);
        subpage.init
            .then(function(){
                // nav.setAction("nav-management-subpage--dashboard", function(e, args) {
                //     nav.setActiveElement("nav-management-subpage--dashboard");
                //     pages.forEach(function(page){
                //         if (page.active){
                //             page.hide();
                //         }
                //     })
                //     managementDashboardPage.show({tabs: true})
                //         .done(function(){
                //             // sidesheet = new Sidesheet("checkin", managementPage, {});
                //         });
                // });
                nav.setAction("nav-management-subpage--total", function(e, args) {
                    nav.setActiveElement("nav-management-subpage--total");
                    pages.forEach(function(page){
                        if (page.active){
                            page.hide();
                        }
                    })
                    managementTotalPage.show({tabs: true, refresh: true})
                        .done(function(){
                            // sidesheet = new Sidesheet("checkin", managementPage, {});
                        });
                });
                nav.setAction("nav-management-subpage--tracks", function(e, args) {
                    nav.setActiveElement("nav-management-subpage--tracks");
                    pages.forEach(function(page){
                        if (page.active){
                            page.hide();
                        }
                    })
                    managementTracksPage.show({tabs: true})
                        .then(function(){
                            // sidesheet = new Sidesheet("checkin", managementPage, {});
                            //bottoms are initialized inside Page.show
                            // bottomTabs =  new Bottom("management-tracks", managementTracksPage, {})
                        });
                })
                nav.setAction("nav-management-subpage--statistics", function(e, args) {
                    nav.setActiveElement("nav-management-subpage--statistics");
                    pages.forEach(function(page){
                        if (page.active){
                            page.hide();
                        }
                    })
                    managementStatisticsPage.show({tabs: true})
                        .then(function(){
                            // sidesheet = new Sidesheet("checkin", managementPage, {});
                            // bottomTabs =  new Bottom("management", managementStatisticsPage, {})
                        });
                })
                nav.setAction("nav-management-subpage--devices", function(e, args) {
                    nav.setActiveElement("nav-management-subpage--devices");
                    pages.forEach(function(page){
                        if (page.active){
                            page.hide();
                        }
                    })
                    managementDevicesPage.show({tabs: true, refresh: false})
                        .then(function(){
                        });
                })
            })
    });

});