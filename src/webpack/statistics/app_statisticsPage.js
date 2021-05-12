import {MDCDrawer} from "@material/drawer";
import Chart from 'chart.js/auto';
import 'chartjs-adapter-date-fns';
// import date-fns locale:
import {de} from 'date-fns/locale';
import { formatDistance, subDays } from 'date-fns'


const Handlebars = require("handlebars");
import "../handlebarsHelpers";

import {apiArchiveHandler} from "../apiArchiveHandler";
import {Page} from "../app_page";
var $ = require( "jquery" );


var phone = window.matchMedia("only screen and (max-width: 50em)");



var StatisticsPage = function(args) {
    let self = Page.apply(this, args);
    self.url = "/webpack/templates/statistics/statistics.hbs";
    self.entries = undefined;
    self.page = undefined;
    self.dataVersion = 0;
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
    self.buildHtml(self.url, context);
}

/**
 *
 * @param url {String}
 * @param context {ContextObject}
 * @returns {*}
 */
StatisticsPage.prototype.buildHtml = function(url, context){
    let self = this;
    return $.get(url, function (templateData) {
        console.log("statistics template found");
        var template = Handlebars.compile(templateData);
        //reset page content
        let pageContainer = $("#page-container");
        pageContainer.empty();
        pageContainer.append(template(context));
        self.page = document.getElementById("statistics-page");
        self.dataTableContainer = document.getElementById("statistics-container");

        apiArchiveHandler.getStatistics("11.05.2021")
            .done(function(result){

                const data = {
                    datasets: [{
                        label: 'CheckinData',
                        backgroundColor: 'rgb(255, 99, 132)',
                        borderColor: 'rgb(255, 99, 132)',
                        data: result.checkinData,
                        // parsing: false,
                    },
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
                            }

                        //     // adapters: {
                        //     //     date: {
                        //     //         locale: de
                        //     //     }
                        //     // }
                        }
                    }
                };

                var myChart = new Chart(
                    document.getElementById('myChart'),
                    config
                );
                console.log("test");
            })
    });
}

export {StatisticsPage};