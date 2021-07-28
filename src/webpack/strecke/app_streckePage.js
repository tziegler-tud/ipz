const Handlebars = require("handlebars");
import "../handlebarsHelpers";
import {Counter, transformDateTimeString} from "../helpers";
import {apiHandler} from "../apiHandlers/apiHandler";

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


var phone = window.matchMedia("only screen and (max-device-width: 800px)");
var tablet = window.matchMedia("only screen and (max-device-width: 1280px)");

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
    self.mutex = false;
    self.soundEnabled = true;


    self.soundboard = {
        sound: null,
        init: function (bool) {
            self.soundboard.sound = new Audio();
            self.soundEnabled = bool;
        },
        play: function (soundType) {
            if (!self.soundEnabled){
                return new Promise(function(resolve, reject){
                    resolve();
                })
            }
            let src;
            switch (soundType) {
                case "click":
                    src = "/sounds/click.ogg";
                    break;
                case "success":
                    src = "/sounds/success.mp3";
                    break;
                case "fail":
                    break;
                default:
                    src = "/sounds/click.ogg";
                    break;

            }
            self.soundboard.sound.src = src;
            return self.soundboard.sound.play();
        }
    };

    self.soundboard.init(true);

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
        const dialog3 = new MDCDialog(document.querySelector('#dialog3'));
        const dialogRemove = new MDCDialog(document.querySelector('#dialog-remove'));
        const list1 = new MDCList(document.querySelector('#dialog1 #dialog-select-list1'));
        const list2 = new MDCList(document.querySelector('#dialog2 #dialog-select-list2'));
        const list3 = new MDCList(document.querySelector('#dialog3 #dialog-select-list3'));
        const listRemove = new MDCList(document.querySelector('#dialog-remove #dialog-select-remove'));
        const listItemRipples1 = list1.listElements.map((listItemEl) => new MDCRipple(listItemEl));
        const listItemRipples2 = list2.listElements.map((listItemEl) => new MDCRipple(listItemEl));
        const listItemRipples3 = list3.listElements.map((listItemEl) => new MDCRipple(listItemEl));
        const listItemRipplesRemove = listRemove.listElements.map((listItemEl) => new MDCRipple(listItemEl));

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
        list3.singleSelection = true;
        listRemove.singleSelection = true;
        dialog1.listen('MDCDialog:opened', () => {
            list1.layout();
        });
        dialog2.listen('MDCDialog:opened', () => {
            list2.layout();
        });
        dialog3.listen('MDCDialog:opened', () => {
            list3.layout();
        });



        //get counters
        apiHandler.getTrackCounts(self.track)
            .done(function(result){
                self.counters = {
                    b: {
                        name: "BioNTech",
                        first: {
                            el: document.getElementById("biontech-counter--first"),
                            counter: new Counter({start: result.counters.b.first, min: 0, step: 1}),
                        },
                        second: {
                            el: document.getElementById("biontech-counter--second"),
                            counter: new Counter({start: result.counters.b.second, min: 0, step: 1}),
                        },
                    },
                    m: {
                        name: "Moderna",
                        first: {
                            el: document.getElementById("moderna-counter--first"),
                            counter: new Counter({start: result.counters.m.first, min: 0, step: 1}),
                        },
                        second: {
                            el: document.getElementById("moderna-counter--second"),
                            counter: new Counter({start: result.counters.m.second, min: 0, step: 1}),
                        },
                    },
                    a: {
                        name: "Astra",
                        first: {
                            el: document.getElementById("astra-counter--first"),
                            counter: new Counter({start: result.counters.a.first, min: 0, step: 1}),
                        },
                        second: {
                            el: document.getElementById("astra-counter--second"),
                            counter: new Counter({start: result.counters.a.second, min: 0, step: 1}),
                        },
                    },
                    j: {
                        name: "Johnson",
                        first: {
                            el: document.getElementById("johnson-counter--first"),
                            counter: new Counter({start: result.counters.j.first, min: 0, step: 1}),
                        },
                        second: {
                            el: document.getElementById("johnson-counter--second"),
                            counter: new Counter({start: result.counters.j.second, min: 0, step: 1}),
                        },

                    }
                };
                self.counters.b.first.el.innerHTML = self.counters.b.first.counter.get();
                self.counters.b.second.el.innerHTML = self.counters.b.second.counter.get();
                self.counters.m.first.el.innerHTML = self.counters.m.first.counter.get();
                self.counters.m.second.el.innerHTML = self.counters.m.second.counter.get();
                self.counters.a.first.el.innerHTML = self.counters.a.first.counter.get();
                self.counters.a.second.el.innerHTML = self.counters.a.second.counter.get();
                self.counters.j.first.el.innerHTML = self.counters.j.first.counter.get();
                self.counters.j.second.el.innerHTML = self.counters.j.second.counter.get();


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
            },
            j: {
                name: "Johnson",
                el: document.getElementById("johnson-timer"),
                timeString: "",
            }
        };
        self.updateTimer();


        //choosing-item event handlers
        $(".choosing-card__action-section").on("click", function(e){
            if(self.mutex) return false;
            self.mutex = true;
            let type = parseInt(this.dataset.type);
            let secondString = this.dataset.second;
            let second = (secondString === "true");
            let secondNumber = (second) ? 2 : 1;
            // //j2 is disabled
            // if (type === 4 && second) {
            //     self.mutex = false;
            //     return false;
            // }
            let counter = getCounter(type, self, second);
            counter.el.classList.add("processing");

            // self.soundboard.play("click");
            apiHandler.addTrackEntry(type, self.track, second)
                .done(function(result){
                    let message = "Eintrag hinzugefügt: " + result.name + "(" + secondNumber + ")";
                    if(type !== 0) counter.el.innerHTML = counter.counter.increase();
                    counter.el.classList.remove("processing");
                    self.showSnackbar(message);
                    updateTimerLocal(type, self);
                    self.soundboard.play("success")
                        .then(function(){
                            self.mutex = false
                        })
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
                    self.showSnackbar(message, options);
                    self.mutex = false;
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
            let c1 = getCounter(type, self, false);
            let c2 = getCounter(type, self, true);
            c1.el.innerHTML = '<span class="choosing-card-counter-loader lds-dual-ring"></span>';
            c2.el.innerHTML = '<span class="choosing-card-counter-loader lds-dual-ring"></span>';
            apiHandler.getTrackCounts(self.track)
                .done(function(result){
                    c1.el.innerHTML = c1.counter.set(getCounter(type, result, false));
                    c2.el.innerHTML = c2.counter.set(getCounter(type, result, true));
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
            if(self.mutex) return false;
            self.mutex = true;
            let type = parseInt($(this).closest(".choosing-item").data("type"));
            dialogRemove.open();

            let removeFunc = function(event){
                console.log("closed");
                let detail = event.detail;
                if(detail.action==="accept") {
                    if(listRemove.selectedIndex === -1) listRemove.selectedIndex = 0;
                    let second = (listRemove.listElements[listRemove.selectedIndex].dataset.second === "true");
                    /**
                     * @type {Object} c
                     * @property {HTMLElement} el
                     * @property {Counter} counter
                     * @property {String} name
                     */
                    let c = getCounter(type, self, second);
                    if (c.counter.get() === 0) {
                        self.mutex = false;
                        return false;
                    }
                    apiHandler.removeTrackEntry(type, self.track, second)
                        .done(function (result) {
                            let message = "Eintrag entfernt: " + result.name;
                            if (type !== 0) c.el.innerHTML = c.counter.decrease();
                            self.updateTimer();
                            self.soundboard.play("success")
                            self.showSnackbar(message);
                            self.mutex = false;
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
                            self.showSnackbar(message, options);
                            self.mutex = false;
                        });
                    self.mutex = false;

                }
                self.mutex = false;
                dialogRemove.unlisten("MDCDialog:closed", removeFunc);
            }

            dialogRemove.listen("MDCDialog:closed", removeFunc);

        })
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
                self.dialogChoice.selectedIndex2 = list2.selectedIndex;
                self.dialogChoice.newType = parseInt(list2.listElements[list2.selectedIndex].dataset.type);
                dialog3.open();
            }
        })

        dialog3.listen("MDCDialog:closed", function(event){
            let detail = event.detail;
            if(detail.action==="accept") {
                let secondString = list3.listElements[list3.selectedIndex].dataset.second;
                let second = (secondString === "true");
                console.log(detail.action);
                let counter = getCounter(self.dialogChoice.newType, self, second);
                apiHandler.addSwitchedTrackEntry(self.dialogChoice.originalType, self.dialogChoice.newType, self.track, second)
                    .done(function(result){
                        let message = "Eintrag hinzugefügt: " + result.name;
                        if(self.dialogChoice.newType !== 0) counter.el.innerHTML = counter.counter.increase();
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

StreckePage.prototype.refreshCounters = function(){
    let self = this;
    if(self.counters.b === undefined) return false;
    apiHandler.getTrackCounts(self.track)
        .done(function(result){
            self.counters.b.first.counter.set(result.counters.b.first);
            self.counters.b.second.counter.set(result.counters.b.second);
            self.counters.m.first.counter.set(result.counters.m.first);
            self.counters.m.second.counter.set(result.counters.m.second);
            self.counters.a.first.counter.set(result.counters.a.first);
            self.counters.a.second.counter.set(result.counters.a.second);
            self.counters.j.first.counter.set(result.counters.j.first);
            self.counters.j.second.counter.set(result.counters.j.second);

            self.counters.b.first.el.innerHTML = self.counters.b.first.counter.get();
            self.counters.b.second.el.innerHTML = self.counters.b.second.counter.get();
            self.counters.m.first.el.innerHTML = self.counters.m.first.counter.get();
            self.counters.m.second.el.innerHTML = self.counters.m.second.counter.get();
            self.counters.a.first.el.innerHTML = self.counters.a.first.counter.get();
            self.counters.a.second.el.innerHTML = self.counters.a.second.counter.get();
            self.counters.j.first.el.innerHTML = self.counters.j.first.counter.get();
            self.counters.j.second.el.innerHTML = self.counters.j.second.counter.get();
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

StreckePage.prototype.activateTab = function(element){
    let self = this;
    //remove active class from all tabs
    self.tabs.forEach(function(tab){
        tab.deactivate();
    })
    //add active class to current element
    element.classList.add("tab--active");
    self.refreshDashboard();
    self.refreshCounters();
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


StreckePage.prototype.setSound = function(bool){
    this.soundEnabled = bool;
    return this.soundEnabled;
}


function getCounter (type, self, second) {
    if (second === undefined) {
        second = false;
    }
    let counter;
    switch(type) {
        case 0:
            counter = undefined
            break;
        case 1:
            counter = (second) ? self.counters.b.second : self.counters.b.first;
            break;
        case 2:
            counter =  (second) ? self.counters.m.second : self.counters.m.first;
            break;
        case 3:
            counter =  (second) ? self.counters.a.second : self.counters.a.first;
            break;
        case 4:
            counter =  (second) ? self.counters.j.second : self.counters.j.first;
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
        case 4:
            timer = self.timers.j;
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
            if(result.j === null) {
                self.timers.j.timeString = "";
            }
            else {
                self.timers.j.timeString = transformDateTimeString(result.j.timestamp, "hh:mm").time("hh:mm");
            }

            self.timers.b.el.innerHTML = self.timers.b.timeString;
            self.timers.m.el.innerHTML = self.timers.m.timeString;
            self.timers.a.el.innerHTML = self.timers.a.timeString;
            self.timers.j.el.innerHTML = self.timers.j.timeString;
        })
}
export {StreckePage};