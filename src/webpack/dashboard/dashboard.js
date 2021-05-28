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
import {transformDateTimeString} from "../helpers";
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

var DashboardComponent = function(componentType, dashboard, index, args) {
    let self = this;
    this.url = "";
    this.dashboard = dashboard;
    this.index = index;
    switch(componentType){
        case "switches":
            this.url = "/webpack/templates/dashboard/modules/switches.hbs";
            this.dataType = "switches";
            this.args = args;
            break;
        case "figures-management":
            this.url = "/webpack/templates/dashboard/modules/figures-management.hbs";
            this.dataType = "figures-management";
            this.args = args;
            break;
        case "figures-apotheke":
            this.url = "/webpack/templates/dashboard/modules/figures-apotheke.hbs";
            this.dataType = "figures-apotheke";
            this.args = args;
            break;
        case "figures-track":
            this.url = "/webpack/templates/dashboard/modules/figures-track.hbs";
            this.dataType = "figures-track";
            this.args = args;
            break;
        case "switches-track":
            this.url = "/webpack/templates/dashboard/modules/switches.hbs";
            this.dataType = "switches-track";
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
                        resolve();
                    })
            })
    })

    return this;
}

DashboardComponent.prototype.buildComponentHtml = function(dashboard, context, updateExisting, args){
    let self = this;
    return $.get(this.url, function (data) {
        let c = {
            // header: options.header,
            data: context,
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
    return new Promise(function(resolve, reject){
        self.getData(self.args)
            .then(function(data){
                self.buildComponentHtml(self.dashboard, data, true)
                    .done(function(){
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
                            total: switched.length,
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
                                }
                            },
                            track: {
                                total: {
                                    all: trackCounts.total,
                                    biontech: trackCounts.counters.b,
                                    moderna: trackCounts.counters.m,
                                    astra: trackCounts.counters.a,
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
                            }
                            let biontechSwitched = switched.filter(trackDataEntry => trackDataEntry.type === 1);
                            let modernaSwitched = switched.filter(trackDataEntry => trackDataEntry.type === 2);
                            let astraSwitched = switched.filter(trackDataEntry => trackDataEntry.type === 3);

                            let wasBiontech = switched.filter(trackDataEntry => trackDataEntry.switch.originalType === 1);
                            let wasModerna = switched.filter(trackDataEntry => trackDataEntry.switch.originalType === 2);
                            let wasAstra = switched.filter(trackDataEntry => trackDataEntry.switch.originalType === 3);

                            let adjustedBiontech = checkinCounts.counters.b + biontechSwitched.length - wasBiontech.length;
                            let adjustedModerna = checkinCounts.counters.m + modernaSwitched.length - wasModerna.length;
                            let adjustedAstra = checkinCounts.counters.a + astraSwitched.length - wasAstra.length;

                            let data = {
                                checkin: {
                                    total: {
                                        all: checkinCounts.total,
                                        biontech: adjustedBiontech,
                                        moderna: adjustedModerna,
                                        astra: adjustedAstra,
                                    },
                                    vials: {
                                        biontech: Math.ceil((adjustedBiontech) / vialSize.biontech),
                                        moderna: Math.ceil((adjustedModerna) / vialSize.moderna),
                                        astra: Math.ceil((adjustedAstra) / vialSize.astra),
                                    },
                                },
                                track: {
                                    total: {
                                        all: trackCounts.total,
                                        biontech: trackCounts.counters.b.first + trackCounts.counters.b.second,
                                        moderna: trackCounts.counters.m.first + trackCounts.counters.m.second,
                                        astra: trackCounts.counters.a.first + trackCounts.counters.a.second,
                                    },
                                    vials: {
                                        biontech: Math.ceil((trackCounts.counters.b.first + trackCounts.counters.b.second) / vialSize.biontech),
                                        moderna: Math.ceil((trackCounts.counters.m.first + trackCounts.counters.m.second) / vialSize.moderna),
                                        astra: Math.ceil((trackCounts.counters.a.first + trackCounts.counters.a.second) / vialSize.astra),
                                    },
                                    switch: {
                                        total: {
                                            all: switched.length,
                                            biontech: biontechSwitched.length,
                                            moderna: modernaSwitched.length,
                                            astra: astraSwitched.length,
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
                        let data = {
                            track: {
                                total: {
                                    all: trackCounts.total,
                                    biontech: trackCounts.counters.b,
                                    moderna: trackCounts.counters.m,
                                    astra: trackCounts.counters.a,
                                }
                            },
                            switch: {
                                total: {
                                    all: switched.length,
                                    biontech: biontechSwitched.length,
                                    moderna: modernaSwitched.length,
                                    astra: astraSwitched.length,
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
                    let data = {
                        switch: {
                            total: {
                                all: switched.length,
                                biontech: biontechSwitched.length,
                                moderna: modernaSwitched.length,
                                astra: astraSwitched.length,
                            },
                            table: switched,
                        }
                    }
                    resolve(data);
                })
            });
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
    switch(type){
        case "management":
            url = "/webpack/templates/dashboard/dashboard-management.hbs";
            return self.createManagementDashboard(activePage, url, options);
            break;
        case "strecke":
            url = "/webpack/templates/dashboard/dashboard-track.hbs";
            return self.createTrackDashboard(activePage, url, options);
            break;
        case "apotheke":
            url = "/webpack/templates/dashboard/dashboard-apotheke.hbs";
            return self.createApothekeDashboard(activePage, url, options);
            break;
        case "modules":
            url = "/webpack/templates/dashboard/dashboard-container.hbs";
            return self.createModularDashboard(activePage, url, options);
            break;
        default:
            break;
    }
    let context = {};
}

Dashboard.prototype.addComponent = function(componentType, args) {
    let self = this;
    if (!self.isModular) {
        console.error("failed to add dashboard component: Dashboard is not modular.");
        return false;
    }
    let index = self.moduleCounter;
    self.moduleCounter++;
    return new Promise(function(resolve, reject) {
        self.init
            .then(function () {
                let component = new DashboardComponent(componentType, self, index, args);
                self.modules.push(component);
                resolve(component);
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
                                    }
                                },
                                track: {
                                    total: {
                                        all: trackCounts.total,
                                        biontech: trackCounts.counters.b,
                                        moderna: trackCounts.counters.m,
                                        astra: trackCounts.counters.a,
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

                        let wasBiontech = switched.filter(trackDataEntry => trackDataEntry.switch.originalType === 1);
                        let wasModerna = switched.filter(trackDataEntry => trackDataEntry.switch.originalType === 2);
                        let wasAstra = switched.filter(trackDataEntry => trackDataEntry.switch.originalType === 3);

                        let context = {
                            header: "Übersicht - Apotheke ",
                            data: {
                                checkin: {
                                    total: {
                                        all: checkinCounts.total,
                                        biontech: checkinCounts.counters.b + biontechSwitched.length - wasBiontech.length,
                                        moderna: checkinCounts.counters.m + modernaSwitched.length - wasModerna.length,
                                        astra: checkinCounts.counters.a + astraSwitched.length - wasAstra.length,
                                    }
                                },
                                track: {
                                    total: {
                                        all: trackCounts.total,
                                        biontech: trackCounts.counters.b.first + trackCounts.counters.b.second,
                                        moderna: trackCounts.counters.m.first + trackCounts.counters.m.second,
                                        astra: trackCounts.counters.a.first + trackCounts.counters.a.second,
                                    },
                                    switch: {
                                        total: {
                                            all: switched.length,
                                            biontech: biontechSwitched.length,
                                            moderna: modernaSwitched.length,
                                            astra: astraSwitched.length,
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
                    editDialog.listen("MDCDialog:closed", function (event) {
                        let detail = event.detail;
                        let originalType = parseInt(list1.listElements[list1.selectedIndex].dataset.type);
                        let newType = parseInt(list2.listElements[list2.selectedIndex].dataset.type);
                        let secondString = list3.listElements[list3.selectedIndex].dataset.second;
                        let second = (secondString === "true");
                        if (detail.action === "accept") {
                            //update switch entry
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