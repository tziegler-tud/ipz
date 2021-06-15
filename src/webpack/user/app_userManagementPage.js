import {MDCSnackbar} from "@material/snackbar";

const Handlebars = require("handlebars");
import "../handlebarsHelpers";
import {apiHandler} from "../apiHandlers/apiHandler";

import {apiStatisticsHandler} from "../apiHandlers/apiStatisticsHandler";
import {Page} from "../app_page";
var $ = require( "jquery" );

import {MDCRipple} from "@material/ripple";
import {MDCSwitch} from '@material/switch';


var phone = window.matchMedia("only screen and (max-width: 50em)");



var UserManagementPage = function(args, context) {
    // Page.call(this, args);
    let self = Page.apply(this, args);
    // let self = this;
    self.url = "/webpack/templates/user.hbs";
    self.entries = undefined;
    self.page = undefined;
    //get current entries
    self.context = (context === undefined) ? {} : context;
    //render html
}

UserManagementPage.prototype = Object.create(Page.prototype);

UserManagementPage.prototype.hide = function(){
    this.active = false;

}

UserManagementPage.prototype.show = function(options){
    let self = this;
    let context = self.context;
    if (context.user === undefined){
        if (window.user !== undefined) context.user = window.user;
        else context.user = {username: "undefined"}
    }
    return self.buildHtml(self.url, context, options);
}

UserManagementPage.prototype.buildHtml = function(url, context, options){
    let defaultOptions = {
        tabs: false,
        snackbar: {
            show: false,
            message: "",
        }
    }
    options = (options === undefined) ? {}: options;
    options = Object.assign(defaultOptions, options);
    let self = this;
    function getData() {
        return new Promise(function(resolve, reject){
            apiHandler.getRolesEnum()
                .then(function(roles) {
                    context.roles = roles;
                    ready(context)
                });
            apiHandler.getAllUser()
                .done(function(users){
                    context.users = users;
                    ready(context)

                })
            function ready(context){
                if(context.users && context.roles) resolve(context);
            }
        })
    }
    return new Promise(function(resolve, reject){
        getData()
            .then(function(data){
                context.users = data.users;
                context.rolesEnum = data.roles;
                $.get(url, function (templateData) {
                    console.log("user template found");
                    var template = Handlebars.compile(templateData);
                    //reset page content
                    let pageContainer = $("#page-container");
                    pageContainer.empty();
                    pageContainer.append(template(context));
                    self.page = document.getElementById("user-page");

                    // const switchControls = document.querySelectorAll(".mdc-switch").map(function(switch){
                    //     new MDCSwitch(switch);
                    // })

                    self.snackbar = new MDCSnackbar(document.querySelector('.mdc-snackbar'));
                    if(options.snackbar.show) {
                        self.showSnackbar(options.snackbar.message);
                    }

                    $(".userlist-entry").each(function(index) {
                        let userid = this.dataset.userid;
                        this.addEventListener("click", function(){
                            window.location = "/user/"+userid
                        })
                    })
                    resolve();
                })
            })
            .catch(err => reject(err))
    })
}

export {UserManagementPage};