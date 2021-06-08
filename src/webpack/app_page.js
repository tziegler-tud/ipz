import {MDCSnackbar} from "@material/snackbar";

const Handlebars = require("handlebars");
import "./handlebarsHelpers";
import {apiHandler} from "./apiHandlers/apiHandler";
import {StreckePage} from "./strecke/app_streckePage";
import {ManagementModulePage} from "./management/app_managementModulePage";
var $ = require( "jquery" );


var phone = window.matchMedia("only screen and (max-width: 50em)");

/**
 *
 * @constructor
 * @abstract
 */

var Page = function(args){
    // if (this.constructor === Page) {
    //     throw new Error("page.js: Can't instantiate abstract class!");
    // }
    let self = this;
    self.url = "";
    self.test = "test";
    self.active = false;

    self.activate = function(){
        self.active = true;
    }
    self.deactivate = function(){
        self.active = false;
    }
    let abstractHandler = function(resolve, reject) {
        console.warn("page.js: abstract promise handler cannot be called directly.");
        reject();
    }
    // self.initialize = new Promise(abstractHandler);
    return self;
}

Page.prototype.buildHtml = function(url, context){

}

/**
 * @typedef Tab
 * @property {HTMLElement} element Dom Container of the tab. Class transitions are applied to this element.
 * @property {function} activate activates the tab
 * @property {function} deactivate deactivates the tab. this is usually called by the activate function, and you might not want to call this directly.
 */

/**
 * @abstract
 * @returns {Promise<Tab[]>}
 */
Page.prototype.getTabNavigationInterface = function(){
    let self = this;
    /**
     *
     * @type {{tabs: Tab[]}}
     */
    return new Promise((resolve, reject) => {
        if (self.tabs === undefined || self.tabs.length === 0) {
            //try to rebuild
            let tabs = self.initTabs();
            if(tabs.length > 0){
                self.tabs = tabs;
            }
            else reject("Failed to build tabs.")
        }
        let i = {
            tabs: self.tabs,
        }
        resolve(i);
    });
}


Page.prototype.showSnackbar = function(message, options) {
    let self = this;
    let snackbar = self.snackbar;
    let defaultOptions = {
        timeout: 4000,
        closeOnEscape: false,
        actionButton: {
            display: false,
            text: "",
        }
    }
    options = (options === undefined) ? {}: options;
    options = Object.assign(defaultOptions, options);
    if (!snackbar) {
        //try to find snackbar
        let bar = new MDCSnackbar(document.querySelector('.mdc-snackbar'));
        if(bar) {
            self.snackbar = bar;
            snackbar = bar;
        }
        else {
            return false;
        }
    }
    snackbar.close();
    snackbar.labelText = message;
    snackbar.timeoutMs = options.timeout;
    snackbar.closeOnEscape = options.closeOnEscape;
    if(options.actionButton.display) {
        snackbar.root.classList.add("show-action");
        snackbar.actionButtonText = options.actionButton.text;
    }
    else {
        snackbar.root.classList.remove("show-action");
    }
    snackbar.open()
}


Page.prototype.initTabs = function() {
    let self = this;
    let msg = "Failed to initialize tab navigation: ";
    let tabContainer = document.getElementsByClassName("tabs")[0];
    if (tabContainer === undefined) console.error(msg + "tabs class not present.");
    let tabs = document.querySelectorAll(".tabs .tab");
    console.log("Setting up tabs: " + tabs.length + "tabs found.");
    let tabArray = [];

    tabs.forEach(function(el){
        tabArray.push({
            element: el,
            activate: function(){
                self.activateTab(this)
            },
            deactivate: function(){
                self.deactivateTab(this)
            },
            active: false,
            dashboard: false,
        })
    })
    return tabArray;
}

Page.prototype.activateTab = function(tab){
    let self = this;
    //remove active class from all tabs
    self.tabs.forEach(function(tab){
        tab.deactivate();
    })
    //add active class to current element
    tab.element.classList.add("tab--active");
    //find associated dashboard
    tab.active = true;
    if(tab.dashboard) tab.dashboard.refresh();
    return true;
}

Page.prototype.deactivateTab = function(tab){
    let self = this;
    //remove active class from tab
    tab.element.classList.remove("tab--active");
    tab.active = false;
    return true;
}

export {Page};