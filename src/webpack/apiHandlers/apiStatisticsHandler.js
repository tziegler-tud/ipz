/**
 * @typedef {Object} jquery-jqXHR
 * @property {function(function)} done
 */

/**
 * @typedef {Object} CheckinDataSchemeObjectStatus
 * @property {Integer} status
 * @property {String} text
 * @property {Date} timestamp
 */
import {transformDateTimeString} from "../helpers";

/**
 * @typedef {Object} CheckinDataSchemeObject
 * @property {Integer} type
 * @property {String} name
 * @property {CheckinDataSchemeObjectStatus} currentStatus
 * @property {CheckinDataSchemeObjectStatus[]} statusHistory
 */

var $ = require( "jquery" );

var ApiStatisticsHandler = function() {
    let self = this;

    self.getStatistics = function (date) {
        if (date === undefined) {
            date = transformDateTimeString(Date.now()).date;
        }
        let jsonData = {
            date: date,
        }
        return $.ajax({
            url: "/api/v1/statistics",
            // make put for safety reasons :-)
            type: 'POST',
            contentType: "application/json; charset=UTF-8",
            dataType: 'json',
            data: JSON.stringify(jsonData),
        });
    };

    self.getOverview = function(){
        return $.ajax({
            url: "/api/v1/statistics/overview",
            // make put for safety reasons :-)
            type: 'GET',
            contentType: "application/json; charset=UTF-8",
        });
    }


}

export let apiStatisticsHandler = new ApiStatisticsHandler();
