import {MDCDrawer} from "@material/drawer";

const Handlebars = require("handlebars");
import "../handlebarsHelpers";
import {apiHandler} from "../apiHandlers/apiHandler";
import {apiFlowHandler} from "../apiHandlers/apiFlowHandler";
import {Page} from "../app_page";
var $ = require( "jquery" );
import {MDCRipple} from '@material/ripple';
import {MDCSnackbar} from '@material/snackbar';
import {MDCList} from '@material/list';
import {MDCDataTable} from '@material/data-table';
import {MDCBanner} from '@material/banner';
import {MDCTextField} from '@material/textfield';
import {MDCTextFieldIcon} from '@material/textfield/icon';

var phone = window.matchMedia("only screen and (max-width: 50em)");

var DisplayPage = function(args){
    let self = Page.apply(this, args);
    self.url = "/webpack/templates/flow/display/display.hbs";
    self.entries = undefined;
    self.bannerEntry = undefined;
    self.page = undefined;
    self.dataVersion = 0;
    self.template =  $.get("/webpack/templates/flow/display/display.hbs");

    self.buildContext = function(result, options){

        let defaultOptions = {
            cssConfig: {
                classes: ["A", "B", "C", "D", "E", "F", "G", "H"],
                indexes: [1,2,3,4,5,6,7,8,9,10],
            }
        }
        options = (options === undefined) ? {}: options;
        options = Object.assign(defaultOptions, options);

        let handledata = [];
        result.forEach(function(track, index){
            let trackEntry = {
                label: track.track.name,
                css: {
                    class: options.cssConfig.classes[index],
                    index: options.cssConfig.indexes[index],
                },
                data: track.data,
            }
            handledata.push(trackEntry);
        })
        let context = {
            tracks: handledata,
        }
        return context;
    }

}

DisplayPage.prototype.hide = function(){
    this.active = false;
    clearInterval(this.refeshInterval);
}

DisplayPage.prototype.show = function(options){
    let self = this;
    return new Promise(function(resolve, reject){
        if(self.active) {
            self.refresh(self,options);
            resolve();
        }
        apiFlowHandler.getAllTracks()
            .done(function(result, textStatus, jqXHR){
                let context = self.buildContext(result, options);
                self.entries = context.entries;
                self.initialize = self.buildHtml(context);
                self.active = true;
                //enable refresh
                clearInterval(self.refeshInterval);
                self.refeshInterval = setInterval(self.refresh, 1000, self);
            })
        resolve();
    })

}

DisplayPage.prototype.refresh = function(self, options){

    console.log("refreshing page");
    //check if this page is active
    if (!self.active){
        return null;
    }
    apiFlowHandler.getCheckoutDataVersion("display")
        .done(function(result){
            if(!result){
                console.log("failed to obtain version information. Rebuilding...");
                return self.update(options);
            }
            if(result.version === self.dataVersion){
                //version matches, nothing to update
                console.log("nothing to update");
            }
            else {
                //if version does not match, get fresh server content
                console.log("update found, rebuilding for version: " + result.version);
                self.dataVersion = result.version;
                return self.update(options);

            }
        })
        .fail(function(result){
            console.error(result);
            console.log("failed to obtain version information. Rebuilding...");
            return self.update(options);
        });
}

DisplayPage.prototype.update = function(options){
    let self = this;
    return apiFlowHandler.getAllTracks()
        .done(function(result){
            let context = self.buildContext(result, options);
            self.entries = context.entries;
            self.initialize = self.buildHtml(context);
            self.active = true;
            //enable refresh
            clearInterval(self.refeshInterval);
            self.refeshInterval = setInterval(self.refresh, 1000, self);
        })
}

/**
 *
 * @param url {String}
 * @param context {ContextObject}
 * @returns {*}
 */
DisplayPage.prototype.buildHtml = function(context){
    let self = this;
    self.template.then(function(data){
        var template = Handlebars.compile(data);
        //reset page content
        let pageContainer = $("#page-container");
        pageContainer.empty();
        pageContainer.append(template(context));
        self.page = document.getElementById("display-page");
    });
}

export {DisplayPage};