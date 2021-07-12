import {MDCList} from "@material/list";
import {MDCTopAppBar} from "@material/top-app-bar";
import {MDCDrawer} from "@material/drawer";
import {MDCRipple} from "@material/ripple";
import {MDCSwitch} from '@material/switch';
import {MDCDataTable} from '@material/data-table';
import {MDCMenu} from '@material/menu';
import {MDCDialog} from '@material/dialog';


import {apiHandler} from "../apiHandlers/apiHandler";

const Handlebars = require("handlebars");
import "../handlebarsHelpers";
import {transformDateTimeString} from "../helpers";
import {preloader} from "../preloader";
var $ = require( "jquery" );

var phone = window.matchMedia("only screen and (max-device-width: 400px)");
var tablet = window.matchMedia("only screen and (max-device-width: 1280px)");

/**
 *
 * @param type {String} Type of dashboard. Valid types are: ["management", "strecke"]
 * @param options {Object}
 * @param activePage {Page}
 * @returns {Dashboard}
 * @constructor
 */
var Dashboard = function(type, activePage, options){
    let self = this;
    let url;
    self.editMenuId = null;
    self.activePage = activePage;
    var applyArgs = function(options){
        let defaults = {
            containerId: "dashboard-container",
        }
        options = (options === undefined) ? {}: options;
        return Object.assign(defaults, options);
    };
    //options
    self.options = applyArgs(options);
    self.container = document.getElementById(self.options.containerId);
    self.type = type;
    self.init = new Promise(function(resolve, reject){
        if(!self.container) {
            //try again later
            $(window).on("load", function(){
                self.container = document.getElementById(self.options.containerId);
                self.initialize(type, activePage, options)
                    .then(function(result){
                        resolve();
                    })
                    .catch(function(err){
                        reject();
                    })

            })
        }
        else {
            self.initialize(type, activePage, options)
                .then(function(result){
                    resolve();
                })
                .catch(function(err){
                    reject();
                })
        }
    })

    return self;
}

var DashboardComponent = function(componentType, dashboard, index, args, buildFunc) {
    let self = this;
    this.url = "";
    this.dashboard = dashboard;
    this.index = index;
    this.buildFunc = buildFunc;
    switch(componentType){
        case "switches":
            this.url = "/webpack/templates/dashboard/modules/switches.hbs";
            this.mobileUrl = "/webpack/templates/dashboard/modules/mobile/switches.hbs";
            this.dataType = "switches";
            this.args = args;
            break;
        case "switches-view":
            this.url = "/webpack/templates/dashboard/modules/switches-view.hbs";
            this.mobileUrl = "/webpack/templates/dashboard/modules/mobile/switches-view.hbs";
            this.dataType = "switches";
            this.args = args;
            break;
        case "figures-management":
            this.url = "/webpack/templates/dashboard/modules/figures-management.hbs";
            this.mobileUrl = "/webpack/templates/dashboard/modules/mobile/figures-management.hbs";
            this.dataType = "figures-management";
            this.args = args;
            break;
        case "figures-apotheke":
            this.url = "/webpack/templates/dashboard/modules/figures-apotheke.hbs";
            this.mobileUrl = "/webpack/templates/dashboard/modules/mobile/figures-apotheke.hbs";
            this.dataType = "figures-apotheke";
            this.args = args;
            break;
        case "figures-track":
            this.url = "/webpack/templates/dashboard/modules/figures-track.hbs";
            this.mobileUrl = "/webpack/templates/dashboard/modules/mobile/figures-track.hbs";
            this.dataType = "figures-track";
            this.args = args;
            break;
        case "switches-track":
            this.url = "/webpack/templates/dashboard/modules/switches.hbs";
            this.mobileUrl = "/webpack/templates/dashboard/modules/mobile/switches.hbs";
            this.dataType = "switches-track";
            this.args = args;
            break;

        /**
         * management dashboard
         */

        //combines all the latter
        case "management-dash":
            this.url = "/webpack/templates/dashboard/modules/dash/dash.hbs";
            this.mobileUrl = "/webpack/templates/dashboard/modules/dash/dash.hbs";
            this.dataType = "management-dash";
            this.args = args;
            break;

        //seperate modules
        case "management-day":
            this.url = "/webpack/templates/dashboard/modules/dash/day.hbs";
            this.mobileUrl = "/webpack/templates/dashboard/modules/dash/day.hbs";
            this.dataType = "management-day";
            this.args = args;
            break;
        case "management-stats":
            this.url = "/webpack/templates/dashboard/modules/dash/stats.hbs";
            this.mobileUrl = "/webpack/templates/dashboard/modules/dash/stats.hbs";
            this.dataType = "management-stats";
            this.args = args;
            break;
        case "management-graphs":
            this.url = "/webpack/templates/dashboard/modules/dash/graphs.hbs";
            this.mobileUrl = "/webpack/templates/dashboard/modules/dash/graphs.hbs";
            this.dataType = "management-graphs";
            this.args = args;
            break;
        case "management-devices":
            this.url = "/webpack/templates/dashboard/modules/dash/devices.hbs";
            this.mobileUrl = "/webpack/templates/dashboard/modules/dash/devices.hbs";
            this.dataType = "management-graphs";
            this.args = args;
            break;

        case "statistics-dash":
            this.url = "/webpack/templates/dashboard/modules/statistics/dash.hbs";
            this.mobileUrl = "/webpack/templates/dashboard/modules/statistics/dash.hbs";
            this.dataType = "statistics-dash";
            this.args = args;
            break;

        default:
            break;
    }

    this.init = new Promise(function(resolve, reject){
        //get data
        self.getData(args)
            .then(function(data){
                //add module html
                self.buildComponentHtml(dashboard, data, false, args)
                    .done(function(){
                        if(buildFunc !== undefined) buildFunc(self, dashboard.activePage, data);
                        resolve();
                    })
            })
    })

    return this;
}

DashboardComponent.prototype.buildComponentHtml = function(dashboard, context, updateExisting, args){
    let self = this;
    let url = this.url;
    if (phone.matches) url = this.mobileUrl;
    return $.get(url, function (data) {
        let c = {
            componentData: context,
        }
        var template = Handlebars.compile(data);

        if (updateExisting && self.componentContainer !== undefined) {
            self.componentContainer.innerHTML = template(c);
        }
        else {
            let componentContainer = document.createElement("div");
            componentContainer.style.order = self.index;
            componentContainer.classList.add("dashboard-module-wrapper");
            componentContainer.innerHTML = template(c);
            $(dashboard.moduleContainer).append(componentContainer);
            self.componentContainer = componentContainer;
        }
    });
}

DashboardComponent.prototype.refresh = function(){
    //reload component html
    let self = this;
    if (self.refreshEnabled === false) return
    return new Promise(function(resolve, reject){
        self.getData(self.args)
            .then(function(data){
                self.buildComponentHtml(self.dashboard, data, true)
                    .done(function(){
                        let activePage = self.dashboard.activePage;
                        if(self.buildFunc !== undefined) self.buildFunc(self, activePage)
                        resolve();
                    })
            })
    });
}

DashboardComponent.prototype.getData = function(args){
    let dataUrl;
    //get data from server
    switch(this.dataType){
        case "switches":
            return new Promise(function(resolve, reject) {
                $.get("/api/v1/data/track/getSwitched", function (switched) {
                    let data = {
                        switch: {
                            total: { all: switched.length},
                            table: switched,
                        }
                    }
                    resolve(data);
                });
            });
            break;
        case "figures-management":
            dataUrl = "/api/v1/data/track/counts/";
            return new Promise(function(resolve, reject){
                $.get("/api/v1/checkin/counts/", function (checkinCounts) {
                    $.get(dataUrl, function (trackCounts) {
                        let data = {
                            checkin: {
                                total: {
                                    all: checkinCounts.total,
                                    biontech: checkinCounts.counters.b,
                                    moderna: checkinCounts.counters.m,
                                    astra: checkinCounts.counters.a,
                                    johnson: checkinCounts.counters.j,
                                }
                            },
                            track: {
                                total: {
                                    all: trackCounts.total,
                                    biontech: trackCounts.counters.b,
                                    moderna: trackCounts.counters.m,
                                    astra: trackCounts.counters.a,
                                    johnson: trackCounts.counters.j,
                                },

                            }
                        }
                        resolve(data);
                    });
                });
            })
            break;
        case "figures-apotheke":
            return new Promise(function(resolve, reject){
                $.get("/api/v1/checkin/counts/", function (checkinCounts) {
                    $.get("/api/v1/data/track/counts/", function (trackCounts) {
                        $.get("/api/v1/data/track/getSwitched", function (switched) {

                            let vialSize = {
                                biontech: 6,
                                moderna: 10,
                                astra: 10,
                                johnson: 10,
                            }
                            let biontechSwitched = switched.filter(trackDataEntry => trackDataEntry.type === 1);
                            let modernaSwitched = switched.filter(trackDataEntry => trackDataEntry.type === 2);
                            let astraSwitched = switched.filter(trackDataEntry => trackDataEntry.type === 3);
                            let johnsonSwitched = switched.filter(trackDataEntry => trackDataEntry.type === 4);

                            let wasBiontech = switched.filter(trackDataEntry => trackDataEntry.switch.originalType === 1);
                            let wasModerna = switched.filter(trackDataEntry => trackDataEntry.switch.originalType === 2);
                            let wasAstra = switched.filter(trackDataEntry => trackDataEntry.switch.originalType === 3);
                            let wasJohnson = switched.filter(trackDataEntry => trackDataEntry.switch.originalType === 4);

                            let adjustedBiontech = checkinCounts.counters.b + biontechSwitched.length - wasBiontech.length;
                            let adjustedModerna = checkinCounts.counters.m + modernaSwitched.length - wasModerna.length;
                            let adjustedAstra = checkinCounts.counters.a + astraSwitched.length - wasAstra.length;
                            let adjustedJohnson = checkinCounts.counters.j + johnsonSwitched.length - wasJohnson.length;

                            let data = {
                                checkin: {
                                    total: {
                                        all: checkinCounts.total,
                                        biontech: adjustedBiontech,
                                        moderna: adjustedModerna,
                                        astra: adjustedAstra,
                                        johnson: adjustedJohnson,
                                    },
                                    vials: {
                                        biontech: Math.ceil((adjustedBiontech) / vialSize.biontech),
                                        moderna: Math.ceil((adjustedModerna) / vialSize.moderna),
                                        astra: Math.ceil((adjustedAstra) / vialSize.astra),
                                        johnson: Math.ceil((adjustedAstra) / vialSize.johnson),
                                    },
                                },
                                track: {
                                    total: {
                                        all: trackCounts.total,
                                        biontech: trackCounts.counters.b.first + trackCounts.counters.b.second,
                                        moderna: trackCounts.counters.m.first + trackCounts.counters.m.second,
                                        astra: trackCounts.counters.a.first + trackCounts.counters.a.second,
                                        johnson: trackCounts.counters.j.first + trackCounts.counters.j.second,
                                    },
                                    vials: {
                                        biontech: Math.ceil((trackCounts.counters.b.first + trackCounts.counters.b.second) / vialSize.biontech),
                                        moderna: Math.ceil((trackCounts.counters.m.first + trackCounts.counters.m.second) / vialSize.moderna),
                                        astra: Math.ceil((trackCounts.counters.a.first + trackCounts.counters.a.second) / vialSize.astra),
                                        johnson: Math.ceil((trackCounts.counters.j.first + trackCounts.counters.j.second) / vialSize.johnson),
                                    },
                                    switch: {
                                        total: {
                                            all: switched.length,
                                            biontech: biontechSwitched.length,
                                            moderna: modernaSwitched.length,
                                            astra: astraSwitched.length,
                                            johnson: johnsonSwitched.length,
                                        },
                                        table: switched,
                                    }
                                },
                            }
                            resolve(data);
                        });
                    });
                });
            })
            break;
        case "figures-track":
            return new Promise(function(resolve, reject){
                if (args.track === undefined || args.track.id === undefined) {
                    let err = new Error("Failed to build track dashboard: track object missing in args.")
                    reject(err);
                }
                dataUrl = "/api/v1/data/track/counts/"+args.track.id;
                let switchUrl = "/api/v1/data/track/getSwitched/"+args.track.id;
                $.get(dataUrl, function (trackCounts) {
                    $.get(switchUrl, function(switched){
                        let biontechSwitched = switched.filter(trackDataEntry => trackDataEntry.type === 1);
                        let modernaSwitched = switched.filter(trackDataEntry => trackDataEntry.type === 2);
                        let astraSwitched = switched.filter(trackDataEntry => trackDataEntry.type === 3);
                        let johnsonSwitched = switched.filter(trackDataEntry => trackDataEntry.type === 4);
                        let data = {
                            track: {
                                total: {
                                    all: trackCounts.total,
                                    biontech: trackCounts.counters.b,
                                    moderna: trackCounts.counters.m,
                                    astra: trackCounts.counters.a,
                                    johnson: trackCounts.counters.j,
                                }
                            },
                            switch: {
                                total: {
                                    all: switched.length,
                                    biontech: biontechSwitched.length,
                                    moderna: modernaSwitched.length,
                                    astra: astraSwitched.length,
                                    johnson: johnsonSwitched.length,
                                },
                                table: switched,
                            }
                        }
                        resolve(data);
                    })
                });
            })
            break;
        case "switches-track":
            return new Promise(function(resolve, reject){
                if (args.track === undefined || args.track.id === undefined) {
                    let err = new Error("Failed to build track dashboard: track object missing in args.")
                    reject(err);
                }
                dataUrl = "/api/v1/data/track/getSwitched/"+args.track.id;
                $.get(dataUrl, function(switched){
                    let biontechSwitched = switched.filter(trackDataEntry => trackDataEntry.type === 1);
                    let modernaSwitched = switched.filter(trackDataEntry => trackDataEntry.type === 2);
                    let astraSwitched = switched.filter(trackDataEntry => trackDataEntry.type === 3);
                    let johnsonSwitched = switched.filter(trackDataEntry => trackDataEntry.type === 4);
                    let data = {
                        switch: {
                            total: {
                                all: switched.length,
                                biontech: biontechSwitched.length,
                                moderna: modernaSwitched.length,
                                astra: astraSwitched.length,
                                johnson: johnsonSwitched.length,
                            },
                            table: switched,
                        }
                    }
                    resolve(data);
                })
            });
            break;

        case "management-dash":
            dataUrl = "/api/v1/statistics/current";
            let dataUrl2 = "/api/v1/statistics/week";
            let dataUrl3 = "/api/v1/statistics/month";
            return new Promise(function(resolve, reject){
                $.get(dataUrl, function (stats) {
                    let data = {
                        date: Date.now(),
                        day: stats,
                    }
                    $.get(dataUrl2, function(week) {
                        data.week = week;
                        $.get(dataUrl3, function(month) {
                            data.month = month;
                            resolve(data);
                        });
                    });
                });
            })
            break;

        case "management-day":
            dataUrl = "/api/v1/statistics/current";
            return new Promise(function(resolve, reject){
                $.get(dataUrl, function (stats) {
                    let data = {
                        date: Date.now(),
                        day: stats,
                    }
                    resolve(data);
                });
            })
            break;
        case "management-stats":
            dataUrl = "/api/v1/statistics/current";
            return new Promise(function(resolve, reject){
                $.get(dataUrl, function (stats) {
                    let data = {
                        date: Date.now(),
                        day: stats,
                    }
                    resolve(data);
                });
            })
            break;
        case "management-devices":
            dataUrl = "/api/v1/statistics/current";
            return new Promise(function(resolve, reject){
                $.get(dataUrl, function (stats) {
                    let data = {
                        date: Date.now(),
                        day: stats,
                    }
                    resolve(data);
                });
            })
            break;
        case "management-graphs":
            dataUrl = "/api/v1/statistics/current";
            return new Promise(function(resolve, reject){
                $.get(dataUrl, function (stats) {
                    let data = {
                        date: Date.now(),
                        day: stats,
                    }
                    resolve(data);
                });
            })
            break;

        case "statistics-dash":
            return new Promise(function(resolve, reject){
                let defaults = {
                    daysBack1: 6,
                    daysAhead1: 0,
                    daysBack2: 30,
                    daysAhead2: 0,
                    startDate: "current",
                }
                let jsonDataWeek = {
                    "daysBack": args.daysBack1,
                    "daysAhead": args.daysAhead1,
                    "startDate": args.startDate,
                };
              let jsonDataMonth = {
                    "daysBack": args.daysBack2,
                    "daysAhead": args.daysAhead2,
                    "startDate": args.startDate,
                }
                let jsonDataDay = {
                    "date": args.startDate,
                }
                $.ajax({
                    url: "/api/v1/statistics/getDayStats",
                    // make put for safety reasons :-)
                    type: 'POST',
                    contentType: "application/json; charset=UTF-8",
                    dataType: 'json',
                    data: JSON.stringify(jsonDataDay),
                },{})
                    .done(function(stats) {
                        let data = {
                            date: stats.date,
                            day: stats,
                        }
                        $.ajax({
                                url: "/api/v1/statistics/getStats",
                                // make put for safety reasons :-)
                                type: 'POST',
                                contentType: "application/json; charset=UTF-8",
                                dataType: 'json',
                                data: JSON.stringify(jsonDataWeek),
                            })
                            .done(function(week){
                                data.week = week;
                                $.ajax({
                                    url: "/api/v1/statistics/getStats",
                                    // make put for safety reasons :-)
                                    type: 'POST',
                                    contentType: "application/json; charset=UTF-8",
                                    dataType: 'json',
                                    data: JSON.stringify(jsonDataMonth),
                                })
                                    .done(function(month){
                                        data.month = month;
                                        resolve(data);
                                });
                            })
                });
            })
            break;

        default:
            return new Promise(function(resolve, reject){
                let data = {}
                resolve(data);
            });
            break;
    }

}

/**
 * initializes dashboard html. Returns a promise that is resolved when all dom elements are present.
 *
 * @param type
 * @param activePage
 * @param options
 * @returns {Promise<>}
 */
Dashboard.prototype.initialize = function(type, activePage, options){
    let self = this;
    let defaultOptions = {
        show: false,
    }
    options = (options === undefined) ? {}: options;
    options = Object.assign(defaultOptions, options);
    let url;
    let mobileUrl;
    switch(type){
        case "management":
            mobileUrl = "/webpack/templates/dashboard/mobile/dashboard-management.hbs";
            url = "/webpack/templates/dashboard/dashboard-management.hbs";
            return self.createManagementDashboard(activePage, url, options);
            break;
        case "strecke":
            mobileUrl = "/webpack/templates/dashboard/mobile/dashboard-track.hbs";
            url = "/webpack/templates/dashboard/dashboard-track.hbs";
            return self.createTrackDashboard(activePage, url, options);
            break;
        case "apotheke":
            mobileUrl = "/webpack/templates/dashboard/mobile/dashboard-apotheke.hbs";
            url = "/webpack/templates/dashboard/dashboard-apotheke.hbs";
            return self.createApothekeDashboard(activePage, url, options);
            break;
        case "modules":
            mobileUrl = "/webpack/templates/dashboard/dashboard-container.hbs";
            url = "/webpack/templates/dashboard/dashboard-container.hbs";
            return self.createModularDashboard(activePage, url, options);
            break;
        default:
            break;
    }
    let context = {};
}

Dashboard.prototype.addComponent = function(componentType, args, buildFunc) {
    let self = this;
    if (!self.isModular) {
        console.error("failed to add dashboard component: Dashboard is not modular.");
        return false;
    }
    let index = self.moduleCounter;
    self.moduleCounter++;
    return new Promise(function(resolve, reject) {
        let plr = new preloader();
        plr.show();
        self.init
            .then(function () {
                let component = new DashboardComponent(componentType, self, index, args, buildFunc);
                component.init.then(function(){
                    self.modules.push(component);
                    setTimeout(plr.hide,0);
                    resolve(component);
                });
            })
            .catch(function(err){
                console.error(err);
                setTimeout(plr.hide,0);
            })
    });
}

Dashboard.prototype.refresh = function(){
    if (!this.isModular) {
        console.error("failed to refresh Dashboard: Dashboard is not modular.");
        return false;
    }
    this.modules.forEach(function(component){
        component.refresh();
    })

}

/**
 * creates a modular dashboard container. Returns a promise that is resolved when html is loaded.
 * @param activePage
 * @param url
 * @param options
 * @returns {Promise<>}
 */
Dashboard.prototype.createModularDashboard = function(activePage, url, options) {
    let self = this;
    self.isModular = true;
    self.modules = [];
    self.moduleCounter = 0;


    return new Promise (function(resolve, reject){
        $.get(url, function (data) {
            let context = {
                // header: options.header,
            }
            var template = Handlebars.compile(data);
            self.container.innerHTML = template(context);
            self.moduleContainer = self.container.getElementsByClassName("dashboard-module-container")[0];
            resolve();
        });
    })


}

Dashboard.prototype.createManagementDashboard = function(activePage, url, options) {
    let self = this;
    //build context
    return new Promise(function(resolve, reject) {
        $.get("/api/v1/checkin/counts/", function (checkinCounts) {
            $.get("/api/v1/data/track/counts/", function (trackCounts) {
                $.get("/api/v1/data/track/getSwitched", function (switched) {

                    $.get(url, function (data) {
                        let context = {
                            header: "Übersicht - Impfstrecken ",
                            data: {
                                checkin: {
                                    total: {
                                        all: checkinCounts.total,
                                        biontech: checkinCounts.counters.b,
                                        moderna: checkinCounts.counters.m,
                                        astra: checkinCounts.counters.a,
                                        johnson: checkinCounts.counters.j,
                                    }
                                },
                                track: {
                                    total: {
                                        all: trackCounts.total,
                                        biontech: trackCounts.counters.b,
                                        moderna: trackCounts.counters.m,
                                        astra: trackCounts.counters.a,
                                        johnson: trackCounts.counters.j,
                                    },
                                    switch: {
                                        total: switched.length,
                                        table: switched,
                                    }
                                },

                            }
                        }
                        var template = Handlebars.compile(data);
                        self.container.innerHTML = template(context);
                        const dataTable = new MDCDataTable(document.querySelector('.mdc-data-table'));
                        const deleteDialog = new MDCDialog(document.querySelector('#switch-delete-dialog'));
                        const editDialog = new MDCDialog(document.querySelector('#switch-edit-dialog'));
                        const alertDialog = new MDCDialog(document.querySelector('#track-alert-dialog'));
                        const list1 = new MDCList(document.querySelector('#switch-edit-dialog #dialog-select-list1'));
                        const list2 = new MDCList(document.querySelector('#switch-edit-dialog #dialog-select-list2'));
                        const list3 = new MDCList(document.querySelector('#switch-edit-dialog #dialog-select-list3'));
                        const listItemRipples1 = list1.listElements.map((listItemEl) => new MDCRipple(listItemEl));
                        const listItemRipples2 = list2.listElements.map((listItemEl) => new MDCRipple(listItemEl));
                        const listItemRipples3 = list3.listElements.map((listItemEl) => new MDCRipple(listItemEl));

                        list1.singleSelection = true;
                        list2.singleSelection = true;
                        list3.singleSelection = true;

                        resolve();

                        alertDialog.listen("MDCDialog:opened", function (event) {
                            self.activePage.disableRefresh();
                        });
                        alertDialog.listen("MDCDialog:closed", function (event) {
                            self.activePage.refreshDashboard();
                            self.activePage.enableRefresh();
                        });

                        deleteDialog.listen("MDCDialog:closed", function (event) {
                            self.activePage.enableRefresh();
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
                        editDialog.listen("MDCDialog:opening", function (event) {
                            apiHandler.getTrackEntry(self.editMenuId)
                                .done(function(entry){
                                    if(entry.isSwitched) {
                                        list1.selectedIndex = entry.switch.originalType - 1;
                                        list2.selectedIndex = entry.switch.newType - 1;
                                        list3.selectedIndex = entry.second ? 1 : 0;
                                    }

                                })

                        });
                        list1.listen("MDCList:action", function(event){
                            let index = event.detail.index;
                            list1.listElements.forEach(function(element, index){
                                list2.setEnabled(index, true);
                            })
                            list2.setEnabled(index, false);

                        })

                        list2.listen("MDCList:action", function(event){
                            let index = event.detail.index;
                            let newType = parseInt(list2.listElements[index].dataset.type);
                            if(newType === 4) {
                                list3.setEnabled(1, false);
                            }
                            else {
                                list3.setEnabled(1, true);
                            }
                        })
                        editDialog.listen("MDCDialog:closed", function (event) {
                            self.activePage.enableRefresh();
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
                        $(".switch-entry-actions").each(function (index) {
                            let i = this.dataset.index;
                            let id = this.dataset.id;
                            let menuElement = document.getElementById("switch-entry-menu--" + i);
                            let top = this.offsetTop;
                            let menu = new MDCMenu(menuElement);
                            menuElement.style.transform = "translateY(" + top + "px)";
                            let outer = this;

                            $(this).on("click", function () {
                                self.activePage.disableRefresh();
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
                                        self.activePage.enableRefresh();
                                    }
                                }
                            })
                        })
                    });
                });
            });

        })
    });
}

Dashboard.prototype.createApothekeDashboard = function(activePage, url, options) {
    let self = this;
    //build context
    return new Promise(function(resolve, reject) {
        $.get("/api/v1/checkin/counts/", function (checkinCounts) {
            $.get("/api/v1/data/track/counts/", function (trackCounts) {
                $.get("/api/v1/data/track/getSwitched", function (switched) {
                    $.get(url, function (data) {

                        let biontechSwitched = switched.filter(trackDataEntry => trackDataEntry.type === 1);
                        let modernaSwitched = switched.filter(trackDataEntry => trackDataEntry.type === 2);
                        let astraSwitched = switched.filter(trackDataEntry => trackDataEntry.type === 3);
                        let johnsonSwitched = switched.filter(trackDataEntry => trackDataEntry.type === 4);

                        let wasBiontech = switched.filter(trackDataEntry => trackDataEntry.switch.originalType === 1);
                        let wasModerna = switched.filter(trackDataEntry => trackDataEntry.switch.originalType === 2);
                        let wasAstra = switched.filter(trackDataEntry => trackDataEntry.switch.originalType === 3);
                        let wasJohnson = switched.filter(trackDataEntry => trackDataEntry.switch.originalType === 4);

                        let context = {
                            header: "Übersicht - Apotheke ",
                            data: {
                                checkin: {
                                    total: {
                                        all: checkinCounts.total,
                                        biontech: checkinCounts.counters.b + biontechSwitched.length - wasBiontech.length,
                                        moderna: checkinCounts.counters.m + modernaSwitched.length - wasModerna.length,
                                        astra: checkinCounts.counters.a + astraSwitched.length - wasAstra.length,
                                        johnson: checkinCounts.counters.j + johnsonSwitched.length - wasJohnson.length,
                                    }
                                },
                                track: {
                                    total: {
                                        all: trackCounts.total,
                                        biontech: trackCounts.counters.b.first + trackCounts.counters.b.second,
                                        moderna: trackCounts.counters.m.first + trackCounts.counters.m.second,
                                        astra: trackCounts.counters.a.first + trackCounts.counters.a.second,
                                        johnson: trackCounts.counters.j.first + trackCounts.counters.j.second,
                                    },
                                    switch: {
                                        total: {
                                            all: switched.length,
                                            biontech: biontechSwitched.length,
                                            moderna: modernaSwitched.length,
                                            astra: astraSwitched.length,
                                            johnson: johnsonSwitched.length,
                                        },
                                        table: switched,
                                    }
                                },
                            }
                        }
                        var template = Handlebars.compile(data);
                        self.container.innerHTML = template(context);
                        resolve();
                        // const dataTable = new MDCDataTable(document.querySelector('.mdc-data-table'));
                    });
                });
            });
        });
    });
}

Dashboard.prototype.createTrackDashboard = function(activePage, url, options) {

    let self = this;
    let trackId = activePage.track.id;
    //build context
    return new Promise(function(resolve, reject) {
        $.get("/api/v1/data/track/counts/" + trackId, function (counts) {
            $.get("/api/v1/data/track/getSwitched/" + trackId, function (switched) {
                $.get(url, function (data) {
                    let context = {
                        header: "Übersicht - Impfstrecke " + activePage.track.name,
                        data: {
                            total: {
                                all: counts.total,
                                biontech: counts.counters.b,
                                moderna: counts.counters.m,
                                astra: counts.counters.a,
                                johnson: counts.counters.j,
                            },
                            switch: {
                                total: switched.length,
                                table: switched,
                            }
                        }
                    }
                    var template = Handlebars.compile(data);
                    self.container.innerHTML = template(context);
                    const dataTable = new MDCDataTable(document.querySelector('.mdc-data-table'));
                    const deleteDialog = new MDCDialog(document.querySelector('#switch-delete-dialog'));
                    const editDialog = new MDCDialog(document.querySelector('#switch-edit-dialog'));
                    const list1 = new MDCList(document.querySelector('#switch-edit-dialog #dialog-select-list1'));
                    const list2 = new MDCList(document.querySelector('#switch-edit-dialog #dialog-select-list2'));
                    const list3 = new MDCList(document.querySelector('#switch-edit-dialog #dialog-select-list3'));
                    const listItemRipples1 = list1.listElements.map((listItemEl) => new MDCRipple(listItemEl));
                    const listItemRipples2 = list2.listElements.map((listItemEl) => new MDCRipple(listItemEl));
                    const listItemRipples3 = list3.listElements.map((listItemEl) => new MDCRipple(listItemEl));

                    list1.singleSelection = true;
                    list2.singleSelection = true;
                    list3.singleSelection = true;

                    resolve();

                    deleteDialog.listen("MDCDialog:closed", function (event) {
                        let detail = event.detail;
                        if (detail.action === "delete") {
                            //delete switch entry
                            apiHandler.removeTrackEntryById(self.editMenuId)
                                .done(function (result) {
                                    self.activePage.refreshDashboard();
                                })
                            self.editMenuId = null;


                        }
                    })

                    editDialog.listen("MDCDialog:opening", function (event) {
                        apiHandler.getTrackEntry(self.editMenuId)
                            .done(function(entry){
                                if(entry.isSwitched) {
                                    list1.selectedIndex = entry.switch.originalType - 1;
                                    list2.selectedIndex = entry.switch.newType - 1;
                                    list3.selectedIndex = entry.second ? 1 : 0;
                                }

                            })

                    });
                    list1.listen("MDCList:action", function(event){
                        let index = event.detail.index;
                        list1.listElements.forEach(function(element, index){
                            list2.setEnabled(index, true);
                        })
                        list2.setEnabled(index, false);

                    })

                    list2.listen("MDCList:action", function(event){
                        let index = event.detail.index;
                        let newType = parseInt(list2.listElements[index].dataset.type);
                        if(newType === 4) {
                            list3.setEnabled(1, false);
                        }
                        else {
                            list3.setEnabled(1, true);
                        }
                    })
                    editDialog.listen("MDCDialog:closed", function (event) {
                        let detail = event.detail;
                        let originalType = parseInt(list1.listElements[list1.selectedIndex].dataset.type);
                        let newType = parseInt(list2.listElements[list2.selectedIndex].dataset.type);
                        let secondString = list3.listElements[list3.selectedIndex].dataset.second;
                        let second = (secondString === "true");
                        if (detail.action === "accept") {
                            //update switch entry
                            list3.setEnabled(1, true);
                            apiHandler.updateSwitchedEntry(self.editMenuId, originalType, newType, second)
                                .done(function (result) {
                                    self.activePage.refreshDashboard();
                                });
                            self.editMenuId = null;

                        }
                    })



                    //switched entry modification dialog
                    let selector = ".switch-entry-menu";
                    $(".switch-entry-actions").each(function (index) {
                        let i = this.dataset.index;
                        let id = this.dataset.id;
                        let menuElement = document.getElementById("switch-entry-menu--" + i);
                        let top = this.offsetTop;
                        let menu = new MDCMenu(menuElement);
                        menuElement.style.transform = "translateY(" + top + "px)";
                        let outer = this;

                        $(this).on("click", function () {
                            self.editMenuId = outer.dataset.id;
                            menu.open = true;
                        })

                        menu.listen("MDCMenu:selected", function (e) {
                            let detail = e.detail;
                            let item = detail.item;
                            //edit clicked
                            if (item.dataset.action === "edit") {
                                editDialog.open();
                            }
                            if (item.dataset.action === "delete") {
                                deleteDialog.open();
                            }

                        })

                    })

                });
            });

        })
    })



}

export {Dashboard}