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

var ApiArchiveHandler = function() {
    let self = this;

    self.archiveCurrentDay = function (type) {
        let jsonData = {
        }
        return $.ajax({
            url: "/api/v1/archive/archiveCurrentDay",
            // make put for safety reasons :-)
            type: 'POST',
            contentType: "application/json; charset=UTF-8",
            dataType: 'json',
            data: JSON.stringify(jsonData),
        });
    };


}

export let apiArchiveHandler = new ApiArchiveHandler();
