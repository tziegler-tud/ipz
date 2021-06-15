import {MDCSnackbar} from "@material/snackbar";

const Handlebars = require("handlebars");
import "../handlebarsHelpers";
import {MDCBanner} from '@material/banner';
import {apiHandler} from "../apiHandlers/apiHandler";


import {apiStatisticsHandler} from "../apiHandlers/apiStatisticsHandler";
import {Page} from "../app_page";
var $ = require( "jquery" );

import {MDCRipple} from "@material/ripple";
import {MDCSwitch} from '@material/switch';
import {UserManagementPage} from "../user/app_userManagementPage";


var phone = window.matchMedia("only screen and (max-width: 50em)");



var UserPage = function(args, context) {
    let self = Page.apply(this, args);
    self.url = "/webpack/templates/device.hbs";
    self.entries = undefined;
    self.page = undefined;
    //get current entries
    self.context = (context === undefined) ? {} : context;
    self.exploredUser = context.exploredUser;
    //render html
}

UserPage.prototype = Object.create(Page.prototype);

UserPage.prototype.setContext = function(context){
    this.context = context;
}

UserPage.prototype.hide = function(){
    this.active = false;

}

UserPage.prototype.show = function(options){
    let self = this;
    let defaultOptions = {
        snackbar: {
            show: false,
            message: "",
        }
    }

    options = (options === undefined) ? {}: options;
    options = Object.assign(defaultOptions, options);
    self.options = options;
    let context = self.context;
    if (context.user === undefined){
        if (window.user !== undefined) context.user = window.user;
        else context.user = {username: "undefined"}
    }
    return self.buildHtml(self.url, context);
}

UserPage.prototype.buildHtml = function(url, context){
    let self = this;
    self.enableEdit = (window.user.role.name === "Teamleiter" || window.user.role.name === "Admin");
    let options = self.options;
    function getData() {
        return new Promise(function(resolve, reject){
            apiHandler.getRoles()
                .done(function(roles) {
                    context.roles = roles;
                    ready(context)
                });
            apiHandler.getTasks()
                .done(function(tasks){
                    context.tasks = tasks;
                    ready(context)

                })
            function ready(context){
                if(context.tasks && context.roles) resolve(context);
            }
        })
    }
    return new Promise(function(resolve, reject){
            getData()
                .then(function(context){
                    let userModData = {allowedTasks: context.exploredUser.allowedTasks};
                    $.get(url, function (templateData) {
                        console.log("device template found");
                        var template = Handlebars.compile(templateData);
                        //reset page content
                        let pageContainer = $("#page-container");
                        pageContainer.empty();
                        pageContainer.append(template(context));
                        self.page = document.getElementById("device-page");
                        self.dataTableContainer = document.getElementById("device-container");

                        const banner = new MDCBanner(document.querySelector('.mdc-banner'));
                        banner.listen("MDCBanner:closed", function(event){
                            console.log(event.detail);
                        })

                        banner.foundation.handlePrimaryActionClick = function(){
                            //save changes
                            apiHandler.updateUser(self.exploredUser.id, userModData)
                                .done(function(result){
                                    self.showSnackbar("Änderungen gespeichert.");
                                    banner.close();
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
                                });

                        }

                        banner.foundation.handleSecondaryActionClick = function(){
                            //reset page
                            self.show();
                        }



                        const switches = [].map.call(document.querySelectorAll(".mdc-switch"), function(el) {
                            let taskId = el.dataset.taskid;
                            let s = new MDCSwitch(el);
                            s.checked = checkTask(userModData.allowedTasks, taskId);
                            s.disabled = !self.enableEdit;
                            s.listen('change', function(event){
                                userModData.allowedTasks = ensureTask(userModData.allowedTasks, taskId, s.checked)
                                banner.open()
                            })
                        });

                        $(".userkey-entry-edit").each(function(index){
                            this.disabled = !self.enableEdit;
                            this.addEventListener('change', function(event){
                                let key = this.dataset.key;
                                let value = this.value;

                                userModData[key] = value
                                banner.open()
                            })
                        })


                        self.snackbar = new MDCSnackbar(document.querySelector('.mdc-snackbar'));
                        if(options.snackbar.show) {
                            self.showSnackbar(options.snackbar.message);
                        }
                        resolve();
                    })
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
                    reject(error);
                });

    })
}

/**
 * @typedef Task
 * @property {String} name task name
 * @property {String} id unique task identifier
 */

/**
 *
 * updates the given task array regarding the obtained value. All other array elements are left untouched.
 *
 * @param allowedTasksArray {Task[]}
 * @param taskId {String}
 * @param allowed {Boolean} true if the task is to be contained, false if to be removed
 *
 * @returns {Task[]} the updated array
 */

function ensureTask(allowedTasksArray, taskId, allowed) {
    //find if value is in array
    let index = allowedTasksArray.findIndex(task => task.id === taskId);
    if (index === -1) {
        //task not in array. Remove or leave out?
        if(allowed) allowedTasksArray.push(taskId);
        return allowedTasksArray;

    }
    else {
        //task is in array. Remove or keep?
        if(!allowed) allowedTasksArray.splice(index, 1);
        return allowedTasksArray;
    }
}

/**
 * finds out wheter a given task (id) is currently in allowedTasks array
 *
 * @param allowedTasksArray
 * @param taskId
 *
 * @returns {Boolean}
 */
function checkTask(allowedTasksArray, taskId) {
    // let index = allowedTasksArray.indexOf(task => task.id ===taskId);
    let index = allowedTasksArray.findIndex(task => task.id === taskId);
    return (index > -1);
}

export {UserPage};