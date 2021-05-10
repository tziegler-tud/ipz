import {MDCList} from "@material/list";
import {MDCTopAppBar} from "@material/top-app-bar";
import {MDCDrawer} from "@material/drawer";
import {MDCRipple} from "@material/ripple";
import {MDCSwitch} from '@material/switch';
import {MDCDataTable} from '@material/data-table';

import {apiHandler} from "../apiHandler";

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
    self.activePage = activePage;
    var applyArgs = function(options){
        let defaults = {
            containerId: "dashboard-container",
        }
        options = (options === undefined) ? {}: options;
        return Object.assign(defaults, activePage, options);
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
                    let context = {
                        header: "Übersicht - Apotheke ",
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
            });
        });

    })



}

export {Dashboard}