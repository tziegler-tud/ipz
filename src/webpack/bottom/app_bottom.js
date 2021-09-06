const Handlebars = require("handlebars");
import {transformDateTimeString} from "../helpers";
import {MDCSnackbar} from "@material/snackbar";
import {MDCTabBar} from '@material/tab-bar';
import {MDCTabIndicator} from '@material/tab-indicator';

var $ = require( "jquery" );

var phone = window.matchMedia("only screen and (max-device-width: 400px)");
var tablet = window.matchMedia("only screen and (max-device-width: 1280px)");


/**
 *
 * @param type {String} Type of bottom. Valid types are: ["mangement", "strecke"]
 * @param options {Object}
 * @param activePage {Page}
 * @param context {Object}
 * @returns {Bottom}
 * @constructor
 */
var Bottom = function(type, activePage, options, context){
    let self = this;
    let url;
    self.active = false;
    self.page = activePage;
    var applyArgs = function(options){
        let defaults = {
            containerId: "bottom-container",
        }
        options = (options === undefined) ? {}: options;
        return Object.assign(defaults, options);
    };
    //options
    self.options = applyArgs(options);
    self.container = document.getElementById(self.options.containerId);
    if(!self.container) {
        //try again later
        $(window).on("load", function(){
            self.container = document.getElementById(self.options.containerId);
            self.setContent(type, activePage, options, context);
        })
    }
    else {
        self.setContent(type, activePage, options, context);
    }
    return self;
}

/**
 *
 * @param type {String} Type of bottom bar. Valid types are: ["checkin", "wb1", "strecke"]
 * @param options {Object}
 * @param activePage {Page}
 * @param context {Object}
 */
Bottom.prototype.setContent = function(type, activePage, options, context){
    let self = this;
    let defaultOptions = {
        show: false,
    }
    options = (options === undefined) ? {}: options;
    options = Object.assign(defaultOptions, options);
    let url;
    switch(type){
        case "checkin":
            url = "/webpack/templates/bottom/bottom-checkin.hbs";
            self.createCheckinPage(activePage, options);
            break;
        case "wb1":
            url = "/webpack/templates/bottom/bottom-wb1.hbs";
            self.createWb1Page(activePage, options);
            break;
        case "management":
            url = "/webpack/templates/bottom/bottom-management.hbs";
            self.createManagementPage(activePage, url, options, context);
            break;
        case "management-tracks":
            url = "/webpack/templates/bottom/bottom-management-tracks.hbs";
            self.createManagementPage(activePage, url, options, context);
            break;
        case "strecke":
            url = "/webpack/templates/bottom/bottom-track.hbs";
            self.createTrackPage(activePage, url, options, context);
            break;
        case "apotheke":
            url = "/webpack/templates/bottom/bottom-apotheke.hbs";
            self.createBottom(activePage, url, options, context);
            break;
        default:
            break;
    }
}

/**
 *
 * @param activePage
 * @param options
 */
Bottom.prototype.createCheckinPage = function(activePage, options){

}

/**
 *
 * @param activePage
 * @param options
 */
Bottom.prototype.createWb1Page = function(activePage, options){

}


/**
 *
 * @param activePage {Page}
 * @param url {String}
 * @param options {Object}
 */
Bottom.prototype.createTrackPage = function(activePage, url, options, context){
    let self = this;
    context = (context === undefined) ? {} : context;
    $.get(url, function (data) {
        var template = Handlebars.compile(data);
        self.container.innerHTML = template(context);

        /**
         * bottom nav
         */

        const bottomTabs = new MDCTabBar(document.querySelector('.mdc-tab-bar'));
        const tabIndicator = new MDCTabIndicator(document.querySelector('.mdc-tab-indicator'));

        //find tab navigation interface on page
        activePage.getTabNavigationInterface()
            .then(function(i){
                let tabs = i.tabs;
                let autoIndex = 0;
                /**
                 * @type {Tab[]} tabs
                 */
                tabs.forEach(function(tab){
                    //add index to tabs, if not already present from dom
                    let index = tab.element.dataset.tabid;
                    if (index===undefined){
                        //auto-assign
                        index = "a"+autoIndex
                        autoIndex++;
                        tab.element.dataset.tabid = index;
                    }
                    tab.index = index;
                })

                let mdcTabs = $(".mdc-tab");
                let navsMap = {};
                mdcTabs.each(function(element){
                    let autoIndex = 0;
                    //try to match tabid of mdc tab elements to tab indexes
                    let index = this.dataset.tabid;
                    if (index===undefined){
                        //auto-assign
                        index = "a"+autoIndex
                        autoIndex++;
                        this.dataset.tabid = index;
                    }
                    let mdcIndex = bottomTabs.foundation.adapter.getIndexOfTabById(this.id);
                    navsMap[mdcIndex] = {
                        index: index,
                        element: this,
                    };
                })


                bottomTabs.listen("MDCTabBar:activated", function(event){
                    let detail = event.detail;
                    let index = detail.index;
                    console.log(index + " activated");

                    //find tab by index
                    let tabIndex = navsMap[index].index;
                    let tab = tabs.find(function(tab){
                        return (tab.index === tabIndex);
                    })
                    tab.activate();

                });

            })
            .catch(function(error){
                console.error(error);
            })

    });
}



/**
 *
 * @param activePage {Page}
 * @param url {String}
 * @param options {Object}
 * @param context {Object}
 */
Bottom.prototype.createManagementPage = function(activePage, url, options, context){
    let self = this;
    context = (context === undefined) ? {} : context;
    $.get(url, function (data) {
        var template = Handlebars.compile(data);
        self.container.innerHTML = template(context);

        /**
         * bottom nav
         */

        const bottomTabs = new MDCTabBar(document.querySelector('.mdc-tab-bar'));
        const tabIndicator = new MDCTabIndicator(document.querySelector('.mdc-tab-indicator'));

        //find tab navigation interface on page
        activePage.getTabNavigationInterface()
            .then(function(i){
                let tabs = i.tabs;
                let autoIndex = 0;
                /**
                 * @type {Tab[]} tabs
                 */
                tabs.forEach(function(tab){
                    //add index to tabs, if not already present from dom
                    let index = tab.element.dataset.tabid;
                    if (index===undefined){
                        //auto-assign
                        index = "a"+autoIndex
                        autoIndex++;
                        tab.element.dataset.tabid = index;
                    }
                    tab.index = index;
                })

                let mdcTabs = $(".mdc-tab");
                let navsMap = {};
                mdcTabs.each(function(element){
                    let autoIndex = 0;
                    //try to match tabid of mdc tab elements to tab indexes
                    let index = this.dataset.tabid;
                    if (index===undefined){
                        //auto-assign
                        index = "a"+autoIndex
                        autoIndex++;
                        this.dataset.tabid = index;
                    }
                    let mdcIndex = bottomTabs.foundation.adapter.getIndexOfTabById(this.id);
                    navsMap[mdcIndex] = {
                        index: index,
                        element: this,
                    };
                })


                bottomTabs.listen("MDCTabBar:activated", function(event){
                    let detail = event.detail;
                    let index = detail.index;
                    console.log(index + " activated");

                    //find tab by index
                    let tabIndex = navsMap[index].index;
                    let tab = tabs.find(function(tab){
                        return (tab.index === tabIndex);
                    })
                    tab.activate();

                });

            })
            .catch(function(error){
                console.error(error);
            })

    });
}


/**
 *
 * @param activePage {Page}
 * @param url {String}
 * @param options {Object}
 * @param context {Object}
 */
Bottom.prototype.createBottom = function(activePage, url, options, context){
    let self = this;
    context = (context === undefined) ? {} : context;
    $.get(url, function (data) {
        var template = Handlebars.compile(data);
        self.container.innerHTML = template(context);

        /**
         * bottom nav
         */
        const bottomTabs = new MDCTabBar(document.querySelector('.mdc-tab-bar'));
        const tabIndicator = new MDCTabIndicator(document.querySelector('.mdc-tab-indicator'));

        //find tab navigation interface on page
        activePage.getTabNavigationInterface()
            .then(function(i){
                let tabs = i.tabs;
                let autoIndex = 0;
                /**
                 * @type {Tab[]} tabs
                 */
                tabs.forEach(function(tab){
                    //add index to tabs, if not already present from dom
                    let index = tab.element.dataset.tabid;
                    if (index===undefined){
                        //auto-assign
                        index = "a"+autoIndex
                        autoIndex++;
                        tab.element.dataset.tabid = index;
                    }
                    tab.index = index;
                })

                let mdcTabs = $(".mdc-tab");
                let navsMap = {};
                mdcTabs.each(function(element){
                    let autoIndex = 0;
                    //try to match tabid of mdc tab elements to tab indexes
                    let index = this.dataset.tabid;
                    if (index===undefined){
                        //auto-assign
                        index = "a"+autoIndex
                        autoIndex++;
                        this.dataset.tabid = index;
                    }
                    let mdcIndex = bottomTabs.foundation.adapter.getIndexOfTabById(this.id);
                    navsMap[mdcIndex] = {
                        index: index,
                        element: this,
                    };
                })


                bottomTabs.listen("MDCTabBar:activated", function(event){
                    let detail = event.detail;
                    let index = detail.index;
                    console.log(index + " activated");

                    //find tab by index
                    let tabIndex = navsMap[index].index;
                    let tab = tabs.find(function(tab){
                        return (tab.index === tabIndex);
                    })
                    tab.activate();

                });

            })
            .catch(function(error){
                console.error(error);
            })

    });
}




export {Bottom}