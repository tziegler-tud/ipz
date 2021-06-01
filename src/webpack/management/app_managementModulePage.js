import {MDCDrawer} from "@material/drawer";

const Handlebars = require("handlebars");
import "../handlebarsHelpers";
import {apiHandler} from "../apiHandlers/apiHandler";
import {Page} from "../app_page";
var $ = require( "jquery" );
import {MDCRipple} from '@material/ripple';
import {MDCSnackbar} from '@material/snackbar';
import {MDCList} from '@material/list';
import {MDCDataTable} from '@material/data-table';
import {MDCBanner} from '@material/banner';
import {MDCTextField} from '@material/textfield';
import {MDCTextFieldIcon} from '@material/textfield/icon';
import {Dashboard} from "../dashboard/dashboard";

import {ManagementPageModule} from "./app_managementPageModule";
import {apiStatisticsHandler} from "../apiHandlers/apiStatisticsHandler";
import Chart from 'chart.js/auto';
import 'chartjs-adapter-date-fns';
// import date-fns locale:
import {de} from 'date-fns/locale';
import { formatDistance, subDays } from 'date-fns'
import {Bottom} from "../app_bottom";
import {MDCDialog} from "@material/dialog";
import {MDCMenu} from "@material/menu";

var phone = window.matchMedia("only screen and (max-width: 50em)");



var ManagementModulePage = function(type, args){
    let self = Page.apply(this, args);
    self.url = "/webpack/templates/management.hbs";
    self.entries = undefined;
    self.page = undefined;
    self.dataVersion = 0;
    self.refreshInterval = undefined;
    self.refreshEnabled = true;
    self.modules = [];
    self.type = type;
    self.dashboards = [];
    self.active = false;
    //get current entries
}

ManagementModulePage.prototype.hide = function(){
    this.active = false;
    clearInterval(this.refreshInterval);
}

ManagementModulePage.prototype.show = function(options){
    let self = this;
    let context = {};
    if(self.active) {
        self.refresh(self,options);
        return;
    }
    //render html
    self.active = true;
    self.refreshInterval = setInterval(self.refresh, 5000, self);
    return this.buildModule(self.type, options);


}

ManagementModulePage.prototype.refresh = function(self, options){

    console.log("refreshing page");
    //check if this page is active
    if (!self.active || !self.refreshEnabled){
        return null;
    }
    self.update(options);

}

ManagementModulePage.prototype.disableRefresh = function(){
    this.refreshEnabled = false;
}

ManagementModulePage.prototype.enableRefresh = function(){
    this.refreshEnabled = true;
}

ManagementModulePage.prototype.update = function(options){
    let self = this;
    //rebuild dashboard
    // self.dashboard = new Dashboard("management", self, {containerId: "dashboard-container"});
    self.refreshActiveTab();


}

/**
 *
 * @param url {String}
 * @param context {Object}
 * @param options {Object}
 * @returns {*}
 */
ManagementModulePage.prototype.buildHtml = function(url, context, options){
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

        self.figures = new Dashboard("modules", self, {containerId: "dashboard-container"});
        self.figures.addComponent("figures-management");

        self.switches = new Dashboard("modules", self, {containerId: "switched-container"});
        self.switches.addComponent("switches");

        self.dashboards.push(self.figures);
        self.dashboards.push(self.switches);

        //setup tab navigation interface
        if (options.tabs){
            self.tabs = self.initTabs();
            //activate first tab
            if(self.tabs[0] !== undefined) {
                self.tabs[0].activate();
            }
        }

        //build dashboard
        // self.dashboard = new Dashboard("management", self, {containerId: "dashboard-container"});
    });
}


ManagementModulePage.prototype.buildModule = function(moduleType, options){
    let self = this;
    let module;

    let buildArgs = {
        self: self,
        containerSelector: "#page-container",
    }
    switch(moduleType) {
        case "dashboard":
            module = new ManagementPageModule(self, moduleType, buildDashboard, buildArgs);
            break;
        case "total":
            module = new ManagementPageModule(self, moduleType, buildTotal, buildArgs);
            break;
        case "tracks":
            module = new ManagementPageModule(self, moduleType, buildTracks, buildArgs);
            break;
        case "statistics":
            module = new ManagementPageModule(self, moduleType, buildStatistics, buildArgs);
        default:
            break;
    }

    return module.buildModule(buildArgs)


    function buildDashboard(buildArgs, self) {
        let url = "/webpack/templates/management/total.hbs";
        let context = {};
        return $.get(url, function (data) {
            console.log("template found");
            var template = Handlebars.compile(data);
            //reset page content
            let container = $(buildArgs.containerSelector);
            container.empty();
            container.append(template(context));
            self.page = document.getElementById("management-page");
            self.snackbar = new MDCSnackbar(document.querySelector('.mdc-snackbar'));

            //setup tab navigation interface
            if (options.tabs) {
                self.tabs = self.initTabs();
                //activate first tab
                if (self.tabs[0] !== undefined) {
                    self.tabs[0].activate();
                }
            }
            let bottomTabs =  new Bottom("management", self, {}, {});
        });
    }

    /**
     *
     * @param buildArgs
     * @param self {ManagementModulePage}
     * @returns {*}
     */
    function buildTotal(buildArgs, self){
        let url = "/webpack/templates/management/total.hbs";
        let context = {};
        return $.get(url, function (data) {
            console.log("template found");
            var template = Handlebars.compile(data);
            //reset page content
            let container = $(buildArgs.containerSelector);
            container.empty();
            container.append(template(context));
            self.page = document.getElementById("management-page");
            self.snackbar = new MDCSnackbar(document.querySelector('.mdc-snackbar'));

            self.figures = new Dashboard("modules", self, {containerId: "dashboard-container"});
            self.figures.addComponent("figures-management");

            self.switches = new Dashboard("modules", self, {containerId: "switched-container"});
            self.switches.addComponent("switches");

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
        });
    }

    /**
     *
     * @param buildArgs
     * @param self {ManagementModulePage}
     * @returns {Promise<unknown>}
     */
    function buildTracks(buildArgs, self){
        let url = "/webpack/templates/management/tracks.hbs";
        let context = {};

        return new Promise(function(resolve, reject){
            $.get("/api/v1/track", function(trackData){
                $.get(url, function (data) {
                    console.log("template found");
                    var template = Handlebars.compile(data);
                    let container = $(buildArgs.containerSelector);
                    let context = {
                        tracks: trackData,
                    }
                    container.empty();
                    container.append(template(context));

                    //build track dashboards


                    //setup tab navigation interface
                    if (options.tabs) {
                        self.tabs = self.initTabs();
                        //activate first tab
                        if (self.tabs[0] !== undefined) {
                            self.tabs[0].activate();
                        }
                    }
                    let bottomTabs =  new Bottom("management-tracks", self, {}, context);

                    trackData.forEach(function(track, index){
                        let containerId = "track-container--"+track.id;
                        let container = document.getElementById(containerId);
                        let tabElement = $(container).parents(".tab").first();


                        let trackDashboard = new Dashboard("modules", self, {containerId: containerId});
                        trackDashboard.addComponent("figures-track", {track: track});
                        trackDashboard.addComponent("switches-track", {track: track}, buildSwitch)

                        self.dashboards.push(trackDashboard);
                        //hook to tab
                        self.tabs[index].dashboard = trackDashboard;

                        function buildSwitch(component){
                            //switch dashboard setup
                            let componentContainer = component.componentContainer;
                            const dataTable = new MDCDataTable(componentContainer.querySelector('#mdc-data-table'));
                            const deleteDialog = new MDCDialog(componentContainer.querySelector('#switch-delete-dialog'));
                            const editDialog = new MDCDialog(componentContainer.querySelector('#switch-edit-dialog'));
                            const alertDialog = new MDCDialog(componentContainer.querySelector('#track-alert-dialog'));
                            const list1 = new MDCList(componentContainer.querySelector('#switch-edit-dialog #dialog-select-list1'));
                            const list2 = new MDCList(componentContainer.querySelector('#switch-edit-dialog #dialog-select-list2'));
                            const list3 = new MDCList(componentContainer.querySelector('#switch-edit-dialog #dialog-select-list3'));
                            const listItemRipples1 = list1.listElements.map((listItemEl) => new MDCRipple(listItemEl));
                            const listItemRipples2 = list2.listElements.map((listItemEl) => new MDCRipple(listItemEl));
                            const listItemRipples3 = list3.listElements.map((listItemEl) => new MDCRipple(listItemEl));

                            list1.singleSelection = true;
                            list2.singleSelection = true;
                            list3.singleSelection = true;

                            alertDialog.listen("MDCDialog:opened", function (event) {
                                self.disableRefresh();
                            });
                            alertDialog.listen("MDCDialog:closed", function (event) {
                                self.refreshDashboard();
                                self.enableRefresh();
                            });

                            deleteDialog.listen("MDCDialog:closed", function (event) {
                                self.enableRefresh();
                                let detail = event.detail;
                                if (detail.action === "delete") {
                                    //delete switch entry
                                    apiHandler.removeTrackEntryById(self.editMenuId)
                                        .done(function (result) {
                                            alertDialog.open();
                                        })
                                    self.editMenuId = null;


                                }
                            })
                            editDialog.listen("MDCDialog:closed", function (event) {
                                self.enableRefresh();
                                let detail = event.detail;
                                let originalType = parseInt(list1.listElements[list1.selectedIndex].dataset.type);
                                let newType = parseInt(list2.listElements[list2.selectedIndex].dataset.type);
                                let secondString = list3.listElements[list3.selectedIndex].dataset.second;
                                let second = (secondString === "true");
                                if (detail.action === "accept") {
                                    //update switch entry
                                    apiHandler.updateSwitchedEntry(self.editMenuId, originalType, newType, second)
                                        .done(function (result) {
                                            alertDialog.open();
                                        });
                                    self.editMenuId = null;

                                }
                            })

                            //switched entry modification dialog
                            let selector = ".switch-entry-menu";
                            $(componentContainer).find(".switch-entry-actions").each(function (index) {
                                let i = this.dataset.index;
                                let id = this.dataset.id;
                                let menuElement = componentContainer.querySelector("#switch-entry-menu--" + i);
                                let top = this.offsetTop;
                                let menu = new MDCMenu(menuElement);
                                menuElement.style.transform = "translateY(" + top + "px)";
                                let outer = this;

                                $(this).on("click", function () {
                                    self.disableRefresh();
                                    self.editMenuId = outer.dataset.id;
                                    menu.open = true;
                                })

                                menu.listen("MDCMenu:selected", function (e) {
                                    let detail = e.detail;
                                    let item = detail.item;
                                    //edit clicked
                                    if (item.dataset.action === "edit") {
                                        editDialog.open();
                                    } else {
                                        if (item.dataset.action === "delete") {
                                            deleteDialog.open();
                                        } else {
                                            self.enableRefresh();
                                        }
                                    }

                                })

                            })
                        }


                    });

                    resolve();
                });
            });

        });
    }

    function buildStatistics(buildArgs, self){
        let url = "/webpack/templates/management/statistics.hbs";
        let context = {};
        return $.get(url, function (data) {
            console.log("template found");
            var template = Handlebars.compile(data);
            let container = $(buildArgs.containerSelector);
            container.empty();
            container.append(template(context));

            //setup tab navigation interface
            if (options.tabs) {
                self.tabs = self.initTabs();
                //activate first tab
                if (self.tabs[0] !== undefined) {
                    self.tabs[0].activate();
                }
            }

            apiStatisticsHandler.getStatistics("current")
                .done(function(result){

                    const data = {
                        datasets: [{
                            label: 'Checkin - WBII',
                            backgroundColor: 'rgb(255, 99, 132)',
                            borderColor: 'rgb(255, 99, 132)',
                            data: result.checkinData,
                            // parsing: false,
                        },
                            {
                                label: 'Durchgeführte Impfungen',
                                backgroundColor: 'rgb(10,81,220)',
                                borderColor: 'rgb(10,81,220)',
                                data: result.trackData,
                                // parsing: false,
                            }]
                    };

                    const config = {
                        type: 'line',
                        data,
                        options: {
                            parsing: false,
                            scales: {
                                x: {
                                    type: 'time',
                                    time: {
                                        displayFormats: {
                                            millisecond: 'hh:mm'
                                        },

                                    },
                                    // ticks: {
                                    //     callback: function(value) {
                                    //         return new Date(value).toLocaleDateString('de-DE', {month:'short', year:'numeric'});
                                    //     },
                                    // },
                                }

                                //     // adapters: {
                                //     //     date: {
                                //     //         locale: de
                                //     //     }
                                //     // }
                            }
                        }
                    };

                    self.chart = new Chart(
                        document.getElementById('myChart'),
                        config
                    );
                    console.log("test");
                })

        });
    }
}



ManagementModulePage.prototype.showSnackbar = function(message, options) {
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
ManagementModulePage.prototype.getTabNavigationInterface = function(){
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



ManagementModulePage.prototype.refreshActiveTab = function(){
    let self = this;
    self.tabs.forEach(function(tab){
        if (tab.active && tab.dashboard) {
            tab.dashboard.refresh();
        }
    })
}

ManagementModulePage.prototype.refreshDashboard = function(){
    let self = this;
    //rebuild dashboard
    // self.dashboard = new Dashboard("management", self, {containerId: "dashboard-container"});
    self.dashboards.forEach(function(dashboard) {
        dashboard.refresh();
    });
}

ManagementModulePage.prototype.activateTab = function(tab){
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

ManagementModulePage.prototype.deactivateTab = function(tab){
    let self = this;
    //remove active class from tab
    tab.element.classList.remove("tab--active");
    tab.active = false;
    return true;
}

ManagementModulePage.prototype.initTabs = function() {
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



export {ManagementModulePage};