import {StreckePage} from "./strecke/app_streckePage";

const Handlebars = require("handlebars");
import "./handlebarsHelpers";
import {Counter, transformDateTimeString} from "./helpers";
import {apiHandler} from "./apiHandlers/apiHandler";
import {Page} from "./app_page";
var $ = require( "jquery" );
import {MDCRipple} from '@material/ripple';
import {MDCSnackbar} from '@material/snackbar';
import {MDCList} from '@material/list';
import {MDCDataTable} from '@material/data-table';
import {MDCBanner} from '@material/banner';
import {MDCTextField} from '@material/textfield';
import {MDCTextFieldIcon} from '@material/textfield/icon';

var phone = window.matchMedia("only screen and (max-width: 50em)");

/**
 *
 * @returns {CheckinPage}
 * @constructor
 */
var CheckinPage = function(args){
    let self = Page.apply(this, args);
    self.url = "/webpack/templates/checkin_page.hbs";
    self.inputAmount = 1;
    self.primaryInputElement = null;
    self.primaryInputContainer = null;
    self.snackbar = undefined;
    self.counters = {};
    self.timers = {};
    self.soundEnabled = true;
    self.mutex = false;

    self.soundboard = {
        sound: null,
        init: function (enabled) {
            self.soundboard.sound = new Audio();
            self.soundEnabled = enabled;
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

CheckinPage.prototype.showSnackbar = function(message, options) {
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

CheckinPage.prototype.show = function(options){
    let self = this;
    let context = {};

    //render html
    return this.buildHtml(self.url, context, options);
}

CheckinPage.prototype.buildHtml = function(url, context, options){
    let self = this;
    let defaultOptions = {
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
        self.primaryInputContainer = document.getElementById("numberinput-container--primary");
        const selector = '.mdc-card__primary-action';
        const ripples = [].map.call(document.querySelectorAll(selector), function(el) {
            return new MDCRipple(el);
        });

        //get counters
        apiHandler.getCheckinCounts()
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
            if(self.mutex) return false;
            self.mutex = true;
            let type = parseInt(this.dataset.type);
            let counter = getCounter(type, self);
            counter.el.classList.add("processing");
            apiHandler.checkin(type)
                .done(function(result){
                    let message = "Eintrag hinzugefügt: " + result.name;
                    if(type !== 0) counter.el.innerHTML = counter.counter.increase();
                    counter.el.classList.remove("processing");
                    updateTimerLocal(type, self);
                    self.showSnackbar(message);
                    self.soundboard.play("success");
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
                    counter.el.classList.remove("processing");
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
            let c = getCounter(type, self);
            c.el.innerHTML = '<span class="choosing-card-counter-loader lds-dual-ring"></span>';
            apiHandler.getCheckinCounts(type)
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
            if(self.mutex) return false;
            self.mutex = true;
            let type = parseInt($(this).closest(".choosing-item").data("type"));
            /**
             * @type {Object} c
             * @property {HTMLElement} el
             * @property {Counter} counter
             * @property {String} name
             */
            let c = getCounter(type, self);
            if (c.counter.get() === 0) {
                self.mutex = false;
                return false;
            }
            apiHandler.removeCheckinEntry(type)
                .done(function (result) {
                    let message = "Eintrag entfernt: " + result.name;
                    if (type !== 0) c.el.innerHTML = c.counter.decrease();
                    self.updateTimer(type);
                    self.showSnackbar(message);
                    self.soundboard.play("success");
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
        });

        self.snackbar = new MDCSnackbar(document.querySelector('.mdc-snackbar'));
        if(options.snackbar.show) {
            self.showSnackbar(options.snackbar.message);
        }

    });
}

CheckinPage.prototype.setSound = function(bool){
    this.soundEnabled = bool;
    return this.soundEnabled;
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

CheckinPage.prototype.updateTimer = function (type){
    let self = this;
    //update timers
    apiHandler.getLastCheckinItems()
        .done(function(result){
            if(result.b === null) {
                self.timers.b.timeString = "";
            }
            else {
                self.timers.b.timeString = transformDateTimeString(result.b.currentStatus.timestamp, "hh:mm").time("hh:mm");
            }
            if(result.m === null) {
                self.timers.m.timeString = "";
            }
            else {
                self.timers.m.timeString = transformDateTimeString(result.m.currentStatus.timestamp, "hh:mm").time("hh:mm");
            }
            if(result.a === null) {
                self.timers.a.timeString = "";
            }
            else {
                self.timers.a.timeString = transformDateTimeString(result.a.currentStatus.timestamp, "hh:mm").time("hh:mm");
            }

            self.timers.b.el.innerHTML = self.timers.b.timeString;
            self.timers.m.el.innerHTML = self.timers.m.timeString;
            self.timers.a.el.innerHTML = self.timers.a.timeString;
        })
}
export {CheckinPage};