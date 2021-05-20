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
    if(!self.container) {
        //try again later
        $(window).on("load", function(){
            self.container = document.getElementById(self.options.containerId);
            self.intialize(type, activePage, options);
        })
    }
    else {
        self.intialize(type, activePage, options);
    }
    return self;
}

Dashboard.prototype.intialize = function(type, activePage, options){
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
            self.createManagementDashboard(activePage, url, options);
            break;
        case "strecke":
            url = "/webpack/templates/dashboard/dashboard-track.hbs";
            self.createTrackDashboard(activePage, url, options);
            break;
        case "apotheke":
            url = "/webpack/templates/dashboard/dashboard-apotheke.hbs";
            self.createApothekeDashboard(activePage, url, options);
            break;
        default:
            break;
    }
    let context = {};
}

Dashboard.prototype.addComponent = function(componentType) {

}

Dashboard.prototype.createManagementDashboard = function(activePage, url, options) {
    let self = this;
    //build context
    $.get("/api/v1/checkin/counts/", function(checkinCounts){
        $.get("/api/v1/data/track/counts/", function(trackCounts) {
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
                });
            });
        });

    })
}

Dashboard.prototype.createApothekeDashboard = function(activePage, url, options) {
    let self = this;
    //build context
    $.get("/api/v1/checkin/counts/", function(checkinCounts){
        $.get("/api/v1/data/track/counts/", function(trackCounts) {
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
                                    astra: checkinCounts.counters.a +astraSwitched.length - wasAstra.length,
                                }
                            },
                            track: {
                                total: {
                                    all: trackCounts.total,
                                    biontech: trackCounts.counters.b.first + trackCounts.counters.b.second,
                                    moderna: trackCounts.counters.m.first  + trackCounts.counters.m.second,
                                    astra: trackCounts.counters.a.first  + trackCounts.counters.a.second,
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
                    // const dataTable = new MDCDataTable(document.querySelector('.mdc-data-table'));
                });
            });
        });
    });
}

Dashboard.prototype.createTrackDashboard = function(activePage, url, options) {

    let self = this;
    let trackId = activePage.track.id;
    //build context
    $.get("/api/v1/data/track/counts/"+trackId, function(counts){
        $.get("/api/v1/data/track/getSwitched/"+trackId, function(switched) {
            $.get(url, function (data) {
                let context = {
                    header: "Übersicht - Impfstrecke "+ activePage.track.name,
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

                deleteDialog.listen("MDCDialog:closed", function(event){
                    let detail = event.detail;
                    if(detail.action==="delete") {
                        //delete switch entry
                        apiHandler.removeTrackEntryById(self.editMenuId)
                            .done(function(result){
                                self.activePage.refreshDashboard();
                            })
                        self.editMenuId = null;


                    }
                })
                editDialog.listen("MDCDialog:closed", function(event){
                    let detail = event.detail;
                    let originalType = parseInt(list1.listElements[list1.selectedIndex].dataset.type);
                    let newType =  parseInt(list2.listElements[list2.selectedIndex].dataset.type);
                    let secondString = list3.listElements[list3.selectedIndex].dataset.second;
                    let second = (secondString === "true");
                    if(detail.action==="accept") {
                        //update switch entry
                        apiHandler.updateSwitchedEntry(self.editMenuId, originalType, newType, second)
                            .done(function(result){
                                self.activePage.refreshDashboard();
                            });
                        self.editMenuId = null;

                    }
                })

                //switched entry modification dialog
                let selector = ".switch-entry-menu";
                $(".switch-entry-actions").each(function(index){
                    let i = this.dataset.index;
                    let id = this.dataset.id;
                    let menuElement = document.getElementById("switch-entry-menu--" + i);
                    let top = this.offsetTop;
                    let menu = new MDCMenu(menuElement);
                    menuElement.style.transform = "translateY("+top+"px)";
                    let outer = this;

                    $(this).on("click", function(){
                        self.editMenuId = outer.dataset.id;
                        menu.open = true;
                    })

                    menu.listen("MDCMenu:selected", function(e){
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



}

export {Dashboard}