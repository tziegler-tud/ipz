const Handlebars = require("handlebars");
import "../handlebarsHelpers";
import {Counter, transformDateTimeString} from "../helpers";
import {apiHandler} from "../apiHandler";

import {Page} from "../app_page";
import {Dashboard} from "../dashboard/dashboard";

var $ = require( "jquery" );
import {MDCRipple} from '@material/ripple';
import {MDCSnackbar} from '@material/snackbar';
import {MDCList} from '@material/list';
import {MDCDataTable} from '@material/data-table';
import {MDCBanner} from '@material/banner';
import {MDCTextField} from '@material/textfield';
import {MDCTextFieldIcon} from '@material/textfield/icon';
import {MDCDialog} from '@material/dialog';


var phone = window.matchMedia("only screen and (max-width: 50em)");

/**
 *
 * @returns {StreckePage}
 * @constructor
 */
var StreckePage = function(track, args){
    let self = Page.apply(this, args);
    self.track = track;
    if(track === undefined || track.id === undefined) {
        throw new Error("Failed to initalize track: invalid arguments received");
    }
    self.url = "/webpack/templates/strecke_page.hbs";
    self.snackbar = undefined;
    self.counters = {};
    self.timers = {};
    //get counters
    console.log(self.test);
    return self;
}

StreckePage.prototype.showSnackbar = function(message, options) {
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

StreckePage.prototype.show = function(options){
    let self = this;
    let context = {};

    //render html
    return this.buildHtml(self.url, context, options);
}

StreckePage.prototype.buildHtml = function(url, context, options){
    let self = this;
    let defaultOptions = {
        tabs: false,
        snackbar: {
            show: false,
            message: "",
        }
    }

    options = (options === undefined) ? {}: options;
    options = Object.assign(defaultOptions, options);
    return $.get(url, function (data) {
        console.log("template found");
        var template = Handlebars.compile(data);
        //reset page content
        self.pageContainer = $("#page-container");
        self.pageContainer.empty();
        self.pageContainer.append(template(context));
        const selector = '.mdc-card__primary-action';
        const ripples = [].map.call(document.querySelectorAll(selector), function(el) {
            return new MDCRipple(el);
        });
        const dialog1 = new MDCDialog(document.querySelector('#dialog1'));
        const dialog2 = new MDCDialog(document.querySelector('#dialog2'));
        const list1 = new MDCList(document.querySelector('#dialog1 #dialog-select-list1'));
        const list2 = new MDCList(document.querySelector('#dialog2 #dialog-select-list2'));
        const listItemRipples1 = list1.listElements.map((listItemEl) => new MDCRipple(listItemEl));
        const listItemRipples2 = list2.listElements.map((listItemEl) => new MDCRipple(listItemEl));

        //build dashboard
        self.dashboard = new Dashboard("strecke", self, {containerId: "dashboard-container"});

        //setup tab navigation interface
        if (options.tabs){
            self.tabs = self.initTabs();
            //activate first tab
            if(self.tabs[0] !== undefined) {
                self.tabs[0].activate();
            }
        }


        list1.singleSelection = true;
        list2.singleSelection = true;
        dialog1.listen('MDCDialog:opened', () => {
            list1.layout();
        });
        dialog2.listen('MDCDialog:opened', () => {
            list2.layout();
        });



        //get counters
        apiHandler.getTrackCounts(self.track)
            .done(function(result){
                self.counters = {
                    b: {
                        name: "BioNTech",
                        el: document.getElementById("biontech-counter"),
                        counter: new Counter({start: result.counters.b, min: 0, step: 1}),
                    },
                    m: {
                        name: "Moderna",
                        el: document.getElementById("moderna-counter"),
                        counter: new Counter({start: result.counters.m, min: 0, step: 1}),
                    },
                    a: {
                        name: "Astra",
                        el: document.getElementById("astra-counter"),
                        counter: new Counter({start: result.counters.a, min: 0, step: 1}),
                    }
                };
                self.counters.b.el.innerHTML = self.counters.b.counter.get();
                self.counters.m.el.innerHTML = self.counters.m.counter.get();
                self.counters.a.el.innerHTML = self.counters.a.counter.get();
            })

        //update timers
        self.timers = {
            b: {
                name: "BioNTech",
                el: document.getElementById("biontech-timer"),
                timeString: "",
            },
            m: {
                name: "Moderna",
                el: document.getElementById("moderna-timer"),
                timeString: "",
            },
            a: {
                name: "Astra",
                el: document.getElementById("astra-timer"),
                timeString: "",
            }
        };
        self.updateTimer();


        //choosing-item event handlers
        $(".choosing-card__action-section").on("click", function(){
            let type = parseInt(this.dataset.type);
            let counter = getCounter(type, self);
            var clickAudio = new Audio('/sounds/success.mp3');
            clickAudio.play();
            apiHandler.addTrackEntry(type, self.track)
                .done(function(result){
                    let message = "Eintrag hinzugefügt: " + result.name;
                    if(type !== 0) counter.el.innerHTML = counter.counter.increase();
                    self.showSnackbar(message);
                    updateTimerLocal(type, self);
                    clickAudio.play();
                })
                .fail(function(jqxhr, textstatus, error){
                    let message = "Error " + jqxhr.status +": " + jqxhr.responseText;
                    let options = {
                        timeout: -1,
                        closeOnEscape: true,
                        actionButton: {
                            display: true,
                            text: "Nagut",
                        }
                    }
                    self.showSnackbar(message, options)
                });
        })

        $(".refresh-button").on("click", function(){
            let type = parseInt($(this).closest(".choosing-item").data("type"));

            /**
             * @type {Object} c
             * @property {HTMLElement} el
             * @property {Counter} counter
             * @property {String} name
             */
            let c = getCounter(type, self);
            c.el.innerHTML = '<span class="choosing-card-counter-loader lds-dual-ring"></span>';
            apiHandler.getTrackCounts(self.track)
                .done(function(result){
                    c.el.innerHTML = c.counter.set(getCounter(type, result));
                })
                .fail(function(jqxhr, textstatus, error){
                    let message = "Error " + jqxhr.status +": " + jqxhr.responseText;
                    let options = {
                        timeout: -1,
                        closeOnEscape: true,
                        actionButton: {
                            display: true,
                            text: "Nagut",
                        }
                    }
                    self.showSnackbar(message, options)
                });
        })
        $(".remove-button").on("click", function() {
            let type = parseInt($(this).closest(".choosing-item").data("type"));
            /**
             * @type {Object} c
             * @property {HTMLElement} el
             * @property {Counter} counter
             * @property {String} name
             */
            let c = getCounter(type, self);
            apiHandler.removeTrackEntry(type, self.track)
                .done(function (result) {
                    let message = "Eintrag entfernt: " + result.name;
                    if (type !== 0) c.el.innerHTML = c.counter.decrease();
                    self.updateTimer(type);
                    self.showSnackbar(message);
                })
                .fail(function(jqxhr, textstatus, error){
                    let message = "Error " + jqxhr.status +": " + jqxhr.responseText;
                    let options = {
                        timeout: -1,
                        closeOnEscape: true,
                        actionButton: {
                            display: true,
                            text: "Nagut",
                        }
                    }
                    self.showSnackbar(message, options)
                });
        });
        $(".switch-button").on("click", function() {
            self.dialogChoice = {};
            dialog1.open();
        });
        dialog1.listen("MDCDialog:closed", function(event){
            let detail = event.detail;
            self.dialogChoice = {
                selectedIndex: list1.selectedIndex,
                originalType: parseInt(list1.listElements[list1.selectedIndex].dataset.type),
            }
            console.log(detail.action);
            if(detail.action==="accept") {
                list2.setEnabled(self.dialogChoice.selectedIndex, false);
                dialog2.open();
            }
        })

        dialog2.listen("MDCDialog:closed", function(event){
            let detail = event.detail;
            list2.setEnabled(self.dialogChoice.selectedIndex, true);
            if(detail.action==="accept") {
                let type = parseInt(list2.listElements[list2.selectedIndex].dataset.type);
                self.dialogChoice.newType = type;
                console.log(detail.action);
                let counter = getCounter(type, self);
                apiHandler.addSwitchedTrackEntry(self.dialogChoice.originalType, self.dialogChoice.newType, self.track)
                    .done(function(result){
                        let message = "Eintrag hinzugefügt: " + result.name;
                        if(type !== 0) counter.el.innerHTML = counter.counter.increase();
                        self.showSnackbar(message);
                    })
                    .fail(function(jqxhr, textstatus, error){
                        let message = "Error " + jqxhr.status +": " + jqxhr.responseText;
                        let options = {
                            timeout: -1,
                            closeOnEscape: true,
                            actionButton: {
                                display: true,
                                text: "Nagut",
                            }
                        }
                        self.showSnackbar(message, options)
                    });
            }
        })

        self.snackbar = new MDCSnackbar(document.querySelector('.mdc-snackbar'));
        if(options.snackbar.show) {
            self.showSnackbar(options.snackbar.message);
        }
    });
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
StreckePage.prototype.getTabNavigationInterface = function(){
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

StreckePage.prototype.refreshDashboard = function(){
    let self = this;
    //rebuild dashboard
    self.dashboard = new Dashboard("strecke", self, {containerId: "dashboard-container"});
}

StreckePage.prototype.activateTab = function(element){
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

StreckePage.prototype.deactivateTab = function(element){
    let self = this;
    //remove active class from tab
    element.classList.remove("tab--active");
    return true;
}

StreckePage.prototype.initTabs = function() {
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

function getCounter (type, self) {
    let counter;
    switch(type) {
        case 0:
            counter = undefined
            break;
        case 1:
            counter = self.counters.b;
            break;
        case 2:
            counter = self.counters.m;
            break;
        case 3:
            counter = self.counters.a;
            break;
    }
    return counter;

}

function getChoosingTimer(type, self){
    let timer;
    switch(type) {
        case 0:
            timer = undefined
            break;
        case 1:
            timer = self.timers.b;
            break;
        case 2:
            timer = self.timers.m;
            break;
        case 3:
            timer = self.timers.a;
            break;
    }
    return timer;
}

function updateTimerLocal (type, self) {
    let timer = getChoosingTimer(type, self);
    let time = transformDateTimeString(new Date(), "hh:mm").time("hh:mm");
    timer.el.innerHTML = time;

}

StreckePage.prototype.updateTimer = function (type){
    let self = this;
    //update timers
    apiHandler.getLastTrackItems(self.track)
        .done(function(result){
            if(result.b === null) {
                self.timers.b.timeString = "";
            }
            else {
                self.timers.b.timeString = transformDateTimeString(result.b.timestamp, "hh:mm").time("hh:mm");
            }
            if(result.m === null) {
                self.timers.m.timeString = "";
            }
            else {
                self.timers.m.timeString = transformDateTimeString(result.m.timestamp, "hh:mm").time("hh:mm");
            }
            if(result.a === null) {
                self.timers.a.timeString = "";
            }
            else {
                self.timers.a.timeString = transformDateTimeString(result.a.timestamp, "hh:mm").time("hh:mm");
            }

            self.timers.b.el.innerHTML = self.timers.b.timeString;
            self.timers.m.el.innerHTML = self.timers.m.timeString;
            self.timers.a.el.innerHTML = self.timers.a.timeString;
        })
}
export {StreckePage};