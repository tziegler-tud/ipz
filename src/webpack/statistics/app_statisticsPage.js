import {MDCDrawer} from "@material/drawer";
import Chart from 'chart.js/auto';
import 'chartjs-adapter-date-fns';
// import date-fns locale:
import {de} from 'date-fns/locale';
import { formatDistance, subDays } from 'date-fns'


const Handlebars = require("handlebars");
import "../handlebarsHelpers";

import {apiArchiveHandler} from "../apiHandlers/apiArchiveHandler";
import {apiStatisticsHandler} from "../apiHandlers/apiStatisticsHandler";
import {Page} from "../app_page";
var $ = require( "jquery" );


var phone = window.matchMedia("only screen and (max-device-width: 800px)");
var tablet = window.matchMedia("only screen and (max-device-width: 1280px)");



var StatisticsPage = function(args) {
    let self = Page.apply(this, args);
    self.url = "/webpack/templates/statistics/statistics-container.hbs";
    self.entries = undefined;
    self.page = undefined;
    self.dataVersion = 0;
    self.chart = null;
    self.listElements;
    //get current entries
    let context = {};
    //render html
}


StatisticsPage.prototype.hide = function(){
    this.active = false;

}

StatisticsPage.prototype.show = function(options){
    let self = this;
    let context = {}
    return self.buildHtml(self.url, context);
}

StatisticsPage.prototype.buildHtml = function(url, context){
    let self = this;
    return new Promise(function(resolve, reject){
        //get statistics overview
        apiStatisticsHandler.getOverview()
            .done(function(result){
                //render page
                context.days = result;
                $.get(url, function (templateData) {
                    console.log("statistics template found");
                    var template = Handlebars.compile(templateData);
                    //reset page content
                    let pageContainer = $("#page-container");
                    pageContainer.empty();
                    pageContainer.append(template(context));
                    self.page = document.getElementById("statistics-page");
                    self.dataTableContainer = document.getElementById("statistics-container");

                    //setup list elements
                    self.listElements = $(".statistics-clickable-list-item");
                    //display first result
                    self.displayData("current");
                    self.activateListElement(self.listElements[0])

                    //hook click handlers to list items

                    self.listElements.on("click", function(){
                        if(this.classList.contains("active")) return;
                        let date = this.dataset.date;
                        if (date === undefined) return false;
                        self.displayData(date);
                        self.activateListElement(this);
                    })
                    resolve();
            })


    })



    });
}

StatisticsPage.prototype.displayData = function(date){
    let self = this;
    if (self.chart !== null) self.chart.destroy();

    apiStatisticsHandler.getStatistics(date)
        .done(function(result){

            const data = {
                datasets: [
                    {
                        label: 'TrackData',
                        backgroundColor: 'rgb(10,81,220)',
                        borderColor: 'rgb(10,81,220)',
                        data: result.trackData,
                        // parsing: false,
                    }]
            };

            const config = {
                type: 'line',
                data,
                options: {
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
            console.log("test");
        })
}

StatisticsPage.prototype.activateListElement = function(element) {
    let self = this;
    //detect if list elements were initialized
    if (self.listElements === undefined) {
        //setup
        self.listElements = $(".statistics-clickable-list-item");

    }
    self.listElements.each(function(){
        this.classList.remove("active");
    })
    element.classList.add("active");
}

export {StatisticsPage};