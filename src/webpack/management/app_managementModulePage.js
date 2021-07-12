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
import {Bottom} from "../bottom/app_bottom";
import {MDCDialog} from "@material/dialog";
import {MDCMenu} from "@material/menu";
import {transformDateTimeString} from "../helpers";

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
    let defaults = {
        refresh: true,
        tabs: true,
    }
    options = (options === undefined) ? {}: options;
    options = Object.assign(defaults, options);
    self.options = options

    //render html
    self.active = true;
    if (options.refresh) self.refreshInterval = setInterval(self.refresh, 5000, self, options);
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
    if(options.tabs) self.refreshActiveTab();


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
            break;
        case "devices":
            module = new ManagementPageModule(self, moduleType, buildDevices, buildArgs);
            break;
        default:
            break;
    }

    return module.buildModule(buildArgs)


    function buildDashboard(buildArgs, self) {
        let url = "/webpack/templates/management/dashboard.hbs";
        let context = {};
        return new Promise(function(resolve, reject){
            $.get(url, function (data) {
                console.log("template found");
                var template = Handlebars.compile(data);
                //reset page content
                let container = $(buildArgs.containerSelector);
                container.empty();
                container.append(template(context));
                self.page = document.getElementById("management-page");
                self.snackbar = new MDCSnackbar(document.querySelector('.mdc-snackbar'));

                self.dash = new Dashboard("modules", self, {containerId: "dashboard-container"});
                self.dash.addComponent("management-dash", {}, buildGraphs);

                self.dashboards.push(self.dash);


                function buildGraphs(dashboard, page, data) {

                    let avgDataset = data.day.stats.average.perHour;
                    let totalData = data.day.stats.total;
                    let totalDataset = [totalData.b.first, totalData.b.second, totalData.m.first, totalData.m.second, totalData.a.first, totalData.a.second, totalData.j.first];

                    let weekDatasets = data.week.datasets; //datasets are build per type
                    let weekLabels = data.week.labels; //labels are the dates properties

                    let monthDatasets = data.month.datasets; //datasets are build per type
                    let monthLabels = data.month.labels; //labels are the dates properties

                    const footer = (tooltipItems) => {
                        let sum = 0;

                        tooltipItems.forEach(function(tooltipItem) {
                            sum += tooltipItem.parsed.y;
                        });
                        return 'Gesamt: ' + sum;
                    };

                    const averageGraphData = {
                        datasets: [{
                            label: 'Gesamt',
                            backgroundColor: 'rgb(255, 99, 132)',
                            borderColor: 'rgb(255, 99, 132)',
                            data: avgDataset,
                            tension: 0.4,
                            // parsing: false,
                        }]
                    };

                    let colors = ["#b19338", "#99BCE2FF", "#AF99E2FF", "#E299D0FF"]
                    data.day.stats.average.byTracks.forEach(function(trackAverages, index){
                        let label = trackAverages.track.name;
                        let data = trackAverages.averages;
                        averageGraphData.datasets.push(
                            {
                                label: 'Impfstrecke ' + label,
                                backgroundColor: colors[index],
                                borderColor: colors[index],
                                data: data,
                                tension: 0.4,
                                pointRadius: 0,
                                // parsing: false,
                            })
                    })

                    const averageConfig = {
                        type: 'line',
                        data: averageGraphData,
                        options: {
                            responsive: true,
                            maintainAspectRatio: false,
                            // stepped: true,
                            pointRadius: 2,
                            parsing: false,
                            scales: {
                                x: {
                                    type: 'time',
                                    time: {
                                        displayFormats: {
                                            millisecond: 'hh:mm'
                                        },

                                    },
                                    ticks: {
                                        source: "data",
                                    },
                                }

                                //     // adapters: {
                                //     //     date: {
                                //     //         locale: de
                                //     //     }
                                //     // }
                            }
                        }
                    };

                    self.averageChart = new Chart(
                        document.getElementById('averageChart'),
                        averageConfig
                    );



                    /*
                    total
                     */
                    const totalGraphData = {
                        labels: [
                            'Biontech Erst',
                            'Biontech Zweit',
                            'Moderna Erst',
                            'Moderna Zweit',
                            'Astra Erst',
                            'Astra Zweit',
                            "Johnson Erst",
                        ],
                        datasets: [{
                            label: 'My First Dataset',
                            data: totalDataset,
                            backgroundColor: [
                                '#7BFF56FF',
                                '#50BB31FF',
                                '#FF6384FF',
                                '#EE4266FF',
                                '#36A2EBFF',
                                '#277DB8FF',
                                '#f3b771',
                            ],
                            hoverOffset: 4
                        }]
                    };
                    const totalConfig = {
                        type: 'doughnut',
                        data: totalGraphData,
                        options: {
                            maintainAspectRatio: false,
                            responsive: true,
                            plugins: {
                                legend: {
                                    position: legendPosition(),
                                    onHover: handleHover,
                                    onLeave: handleLeave
                                },
                                title: {
                                    display: false,
                                    text: 'Impfungen ' + transformDateTimeString(Date.now()).date,
                                }
                            }
                        },
                    };

                    function legendPosition(){
                        return (phone.matches) ? "top" : "right";
                    }

                    self.totalChart = new Chart(
                        document.getElementById('totalChart'),
                        totalConfig
                    );


                    /*
                    week
                     */
                    const weekData = {
                        labels: weekLabels,
                        datasets: datasetsFromTypes(weekDatasets)
                    };
                    const weekConfig = {
                        type: 'bar',
                        data: weekData,
                        options: {
                            maintainAspectRatio: false,
                            plugins: {
                                title: {
                                    display: true,
                                    text: "Impfungen " + weekLabels[0] + " - " + weekLabels[weekLabels.length-1],
                                },
                                tooltip: {
                                    callbacks: {
                                        footer: footer,
                                    }
                                }
                            },
                            responsive: true,
                            scales: {
                                x: {
                                    stacked: true,
                                },
                                y: {
                                    stacked: true
                                }
                            }
                        }
                    };
                    self.weekChart = new Chart(
                        document.getElementById('weekChart'),
                        weekConfig
                    );

                    /*
                    week
                     */
                    const monthData = {
                        labels: monthLabels,
                        datasets: datasetsFromTypes(monthDatasets)
                    };
                    const monthConfig = {
                        type: 'bar',
                        data: monthData,
                        options: {
                            maintainAspectRatio: false,
                            plugins: {
                                title: {
                                    display: true,
                                    text: "Impfungen " + monthLabels[0] + " - " + monthLabels[monthLabels.length-1],
                                },
                                tooltip: {
                                    callbacks: {
                                        footer: footer,
                                    }
                                }
                            },
                            responsive: true,
                            scales: {
                                x: {
                                    stacked: true,
                                },
                                y: {
                                    stacked: true
                                }
                            }
                        }
                    };
                    self.monthChart = new Chart(
                        document.getElementById('monthChart'),
                        monthConfig
                    );

                    self.charts = [self.averageChart, self.totalChart, self.weekChart, self.monthChart];

                    $(window).on("resize", function(){
                        self.charts.forEach(function(chart){
                            chart.update();
                        })
                    })


                    function datasetsFromTypes(data){
                        return [
                            {
                                label: 'BionTech Erst',
                                data: data.b.first,
                                backgroundColor: '#7BFF56FF',
                            },
                            {
                                label: 'BionTech Zweit',
                                data: data.b.second,
                                backgroundColor: '#50BB31FF',
                            },
                            {
                                label: 'Moderna Erst',
                                data: data.m.first,
                                backgroundColor: '#FF6384FF',
                            },
                            {
                                label: 'Moderna Zweit',
                                data: data.m.second,
                                backgroundColor: '#EE4266FF',
                            },
                            {
                                label: 'Astra Erst',
                                data: data.a.first,
                                backgroundColor: '#36A2EBFF',
                            },
                            {
                                label: 'Astra Zweit',
                                data: data.a.second,
                                backgroundColor: '#277DB8FF',
                            },
                            {
                                label: 'Johnson Erst',
                                data: data.j.first,
                                backgroundColor: '#f3b771',
                            },
                        ]
                    }


                }
                //setup tab navigation interface
                if (options.tabs) {
                    self.tabs = self.initTabs();
                    //activate first tab
                    if (self.tabs[0] !== undefined) {
                        self.tabs[0].activate();
                    }
                }



                // let bottomTabs =  new Bottom("management", self, {}, {});
                self.tabs[0].dashboard = self.figures;

                resolve();
            });
        })
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
        return new Promise(function(resolve, reject) {
            $.get(url, function (data) {
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
                self.switches.addComponent("switches", {}, buildSwitch);

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
                let bottomTabs = new Bottom("management", self, {}, {});
                self.tabs[0].dashboard = self.figures;
                self.tabs[1].dashboard = self.switches;

                resolve();
            });
        })
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
        return new Promise(function(resolve, reject){
            $.get(url, function (data) {
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
                                tension: 0.4,
                                // parsing: false,
                            },
                                {
                                    label: 'Durchgeführte Impfungen',
                                    backgroundColor: 'rgb(10,81,220)',
                                    borderColor: 'rgb(10,81,220)',
                                    data: result.trackData,
                                    tension: 0.4,
                                    // parsing: false,
                                }]
                        };

                        const config = {
                            type: 'line',
                            data,
                            options: {
                                pointRadius: 0,
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
                        resolve();
                    })
            });
        });
    }

    function buildDevices(buildArgs, self){
        let url = "/webpack/templates/management/devices.hbs";
        let context = {};
        function getData() {
            let data = {};
            return new Promise(function(resolve, reject){
                apiHandler.getRolesEnum()
                    .then(function(roles) {
                        data.roles = roles;
                        ready(data)
                    })
                    .catch(err => reject(err));
                $.get("/api/v1/devices")
                    .done(function(devices){
                        data.devices = devices;
                        ready(data)
                    })
                    .catch(err => reject(err))
                function ready(data){
                    if(data.devices && data.roles) resolve(data);
                }
            })
        }
        return new Promise(function(resolve, reject){
            getData()
                .then(function(data){
                    context.user = window.user;
                    context.roles = data.roles;
                    let devices = {};
                    //get tablet devices
                    devices.tablets = data.devices.filter(userObj => userObj.user.role.id === data.roles["DRK-Tablet"].id);
                    devices.tablets.sort(function(a,b){
                        return b.active - a.active;
                    })
                    //throw out tablets
                    devices.other = data.devices.filter(userObj => userObj.user.role.id !== data.roles["DRK-Tablet"].id)
                    devices.other.sort(function(a,b){
                        return b.active - a.active;
                    })

                    context.devices = devices;

                    $.get(url, function (data) {
                        console.log("template found");
                        var template = Handlebars.compile(data);
                        let container = $(buildArgs.containerSelector);
                        container.empty();
                        container.append(template(context));

                        $(".test-notify").on("click", function(event){
                            let id = this.dataset.userid;
                            apiHandler.sendNotification(id, "Hello there!");
                        })

                        //setup tab navigation interface
                        if (options.tabs) {
                            self.tabs = self.initTabs();
                            //activate first tab
                            if (self.tabs[0] !== undefined) {
                                self.tabs[0].activate();
                            }
                        }
                        resolve();
                    });
                })
                .catch(function(jqxhr, textstatus, error){
                    let message = "Error " + jqxhr.status +": " + jqxhr.responseText;
                    let options = {
                        timeout: -1,
                        closeOnEscape: true,
                        actionButton: {
                            display: true,
                            text: "Nagut",
                        }
                    }
                    self.showSnackbar(message, options);
                });
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
            snackbar = bar;
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


function buildSwitch(component, activePage){
    let self  = activePage;
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

    editDialog.listen("MDCDialog:opening", function (event) {
        apiHandler.getTrackEntry(self.editMenuId)
            .done(function(entry){
                if(entry.isSwitched) {
                    list1.selectedIndex = entry.switch.originalType - 1;
                    list2.selectedIndex = entry.switch.newType - 1;
                    if(entry.switch.newType === 4) {
                        list3.selectedIndex = 0;
                        list3.setEnabled(1, false);
                    }
                    else list3.selectedIndex = entry.second ? 1 : 0;
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



// Append '4d' to the colors (alpha channel), except for the hovered index
function handleHover(evt, item, legend) {
    legend.chart.data.datasets[0].backgroundColor.forEach((color, index, colors) => {
        colors[index] = index === item.index || color.length === 9 ? color : color + '4D';
    });
    legend.chart.update();
}

// Removes the alpha channel from background colors
function handleLeave(evt, item, legend) {
    legend.chart.data.datasets[0].backgroundColor.forEach((color, index, colors) => {
        colors[index] = color.length === 9 ? color.slice(0, -2) : color;
    });
    legend.chart.update();
}


export {ManagementModulePage};