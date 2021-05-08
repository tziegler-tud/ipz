const Handlebars = require("handlebars");
import "../handlebarsHelpers";
import {Counter} from "../helpers";
import {apiHandler} from "../apiHandler";
import {Page} from "../app_page";
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
        //choosing-item event handlers
        $(".choosing-card__action-section").on("click", function(){
            let type = parseInt(this.dataset.type);
            let counter = getCounter(type, self);
            apiHandler.addTrackEntry(type, self.track)
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
export {StreckePage};