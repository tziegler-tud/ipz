import {MDCDrawer} from "@material/drawer";

const Handlebars = require("handlebars");
import "../handlebarsHelpers";
import {apiHandler} from "../apiHandlers/apiHandler";
import {Page} from "../app_page";
var $ = require( "jquery" );
import {MDCRipple} from '@material/ripple';
import {MDCSnackbar} from '@material/snackbar';
import {Dashboard} from "../dashboard/dashboard";
import {Bottom} from "../bottom/app_bottom";

var phone = window.matchMedia("only screen and (max-width: 50em)");



var ApothekePage = function(args){
    let self = Page.apply(this, args);
    self.url = "/webpack/templates/apotheke.hbs";
    self.entries = undefined;
    self.page = undefined;
    self.dataVersion = 0;
    self.refreshInterval = undefined;
    self.dashboards = [];
    //get current entries
    //render html

}

ApothekePage.prototype.hide = function(){
    this.active = false;
    clearInterval(this.refeshInterval);
}

ApothekePage.prototype.show = function(options){
    let self = this;
    let context = {};
    if(self.active) {
        self.refresh(self,options);
        return;
    }
    //render html
    self.active = true;
    self.refreshInterval = setInterval(self.refresh, 5000, self);
    return this.buildHtml(self.url, context, options);


}

ApothekePage.prototype.refresh = function(self, options){

    console.log("refreshing page");
    //check if this page is active
    if (!self.active){
        return null;
    }
    self.update(options);

}

ApothekePage.prototype.update = function(options){
    let self = this;
    //rebuild dashboard
    self.refreshDashboard();


}

/**
 *
 * @param url {String}
 * @param context {Object}
 * @param options {Object}
 * @returns {*}
 */
ApothekePage.prototype.buildHtml = function(url, context, options){
    let self = this;
    return $.get(url, function (data) {
        console.log("template found");
        var template = Handlebars.compile(data);
        //reset page content
        let pageContainer = $("#page-container");
        pageContainer.empty();
        pageContainer.append(template(context));
        self.page = document.getElementById("management-page");
        self.snackbar = new MDCSnackbar(document.querySelector('.mdc-snackbar'));

        //setup tab navigation interface
        if (options.tabs){
            self.tabs = self.initTabs();
            //activate first tab
            if(self.tabs[0] !== undefined) {
                self.tabs[0].activate();
            }
        }

        //build dashboard
        // self.dashboard = new Dashboard("apotheke", self, {containerId: "dashboard-container"});
        self.figures = new Dashboard("modules", self, {containerId: "dashboard-container"});
        self.figures.addComponent("figures-apotheke");

        self.switches = new Dashboard("modules", self, {containerId: "switched-container"});
        self.switches.addComponent("switches-view", {});

        self.dashboards.push(self.figures);
        self.dashboards.push(self.switches);

        //setup tab navigation interface
        if (options.tabs) {
            self.tabs = self.initTabs();
            //activate first tab
            if (self.tabs[0] !== undefined) {
                self.tabs[0].activate();
            }
        }
        let bottomTabs =  new Bottom("management", self, {}, {});
        self.tabs[0].dashboard = self.figures;
        self.tabs[1].dashboard = self.switches;
    });
}



ApothekePage.prototype.showSnackbar = function(message, options) {
    let self = this;
    let snackbar = self.snackbar;
    let defaultOptions = {
        timeout: 5000,
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
        }
        else {
            return false;
        }
    }
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


/**
 * @typedef Tab
 * @property {HTMLElement} element Dom Container of the tab. Class transitions are applied to this element.
 * @property {function} activate activates the tab
 * @property {function} deactivate deactivates the tab. this is usually called by the activate function, and you might not want to call this directly.
 */

/**
 *
 * returns this pages tab interface as a promise
 *
 * @returns {Promise<{tabs: Tab[]}>}
 */
ApothekePage.prototype.getTabNavigationInterface = function(){
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

ApothekePage.prototype.refreshDashboard = function(){
    let self = this;
    //rebuild dashboard
    self.dashboards.forEach(function(dashboard) {
        dashboard.refresh();
    });
}

ApothekePage.prototype.activateTab = function(element){
    let self = this;
    //remove active class from all tabs
    self.tabs.forEach(function(tab){
        tab.deactivate();
    })
    //add active class to current element
    element.classList.add("tab--active");
    self.refreshDashboard();
    return true;
}

ApothekePage.prototype.deactivateTab = function(element){
    let self = this;
    //remove active class from tab
    element.classList.remove("tab--active");
    return true;
}

ApothekePage.prototype.initTabs = function() {
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
                self.activateTab(el)
            },
            deactivate: function(){
                self.deactivateTab(el)
            }
        })
    })
    return tabArray;
}



export {ApothekePage};