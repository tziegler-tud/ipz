import {preloader} from "./preloader";
import {Navigation} from "./app_navigation";
import {Sidesheet} from "./app_sidesheet";
import {StatisticsPage} from "./statistics/app_statisticsPage";
import {ManagementModulePage} from "./management/app_managementModulePage";
import {StatisticModulePage} from "./statistics/app_statisticModulePage";
import {transformDateTimeString} from "./helpers";
import "./handlebarsHelpers";
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


let nav = new Navigation(
    {
        pageData: {
            navTitle: "Statistik - ImpfApp Dresden",
            date: transformDateTimeString(Date.now()).date,
            time: transformDateTimeString(Date.now()).time("hh:mm:ss"),
        },
    },
    {
        clock: ".navigation-clock",
        sidesheet: true,
        activeElement: "app-link-statistics",
        open: true,
        topbar: true,
    },
);
let statisticsPage = new StatisticsPage();
let managementDashboardPage = new StatisticModulePage("dashboard");
var pages = [statisticsPage, managementDashboardPage];

managementDashboardPage.show({tabs: true, refresh: true})
    .then(function(){
        sidesheet = new Sidesheet("management", managementDashboardPage, {});
        // bottomTabs =  new Bottom("management", managementTotalPage, {})
    });

nav.initialize
    .then(function(){
        nav.setAction("mdc-top-app-bar-action1", function(e, args){
            // sidesheet.toggle();
        });
        let subpage = nav.addSubpage("statistics", {}, true, "app-link-statistics", true);
        subpage.init
            .then(function(){
                nav.setAction("nav-statistics-subpage--dashboard", function(e, args) {
                    nav.setActiveElement("nav-statistics-subpage--dashboard");
                    pages.forEach(function(page){
                        if (page.active){
                            page.hide();
                        }
                    })
                    managementDashboardPage.show({tabs: true})
                        .then(function(){
                            sidesheet = new Sidesheet("management", managementDashboardPage, {});
                        });
                });
                nav.setAction("nav-statistics-subpage--total", function(e, args) {
                    nav.setActiveElement("nav-statistics-subpage--total");
                    pages.forEach(function(page){
                        if (page.active){
                            page.hide();
                        }
                    })
                    statisticsPage.show({tabs: true, refresh: true})
                        .then(function(){
                            // sidesheet = new Sidesheet("management", managementTotalPage, {});
                        });
                });
            })

    });

