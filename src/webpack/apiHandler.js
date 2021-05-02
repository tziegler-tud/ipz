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
/**
 * @typedef {Object} CheckinDataSchemeObject
 * @property {Integer} amount
 * @property {Integer[]} data
 * @property {CheckinDataSchemeObjectStatus} currentStatus
 * @property {CheckinDataSchemeObjectStatus[]} statusHistory
 */

var $ = require( "jquery" );

var ApiHandler = function() {
    let self = this;
    self.checkoutDataVersion = 0;



    /**
     * @callback onSuccess
     * @param {CheckinDataSchemeObject} result server response object, most likely a json containing the processed data
     */

    /**
     * @callback onFail
     * @param {Object} result server response object, most likely an error object
     */

    /**
     * Callback object for apiHandler functions
     * @typedef {Object} ApiHandlerCallback
     * @property {onSuccess} onSuccess function to be called if api call is successfull
     * @property {onFail} onFail function to be called if api call fails
     */

    /**
     * Callback object for apiHandler functions
     * @typedef {Object} Checkin-ApiHandlerCallback
     * @property {onSuccess} onSuccess function to be called if the number was added successfully
     * @property {onFail} onFail function to be called if api call fails
     */

    /**
     *
     * @typedef {Object} jquery-jqXHR-checkin
     * @property {function(function(CheckinDataSchemeObject, String, jquery-jqXHR-checkoutdata))} done
     * @property {function(function(Error))} fail
     * @property {function(function())} always
     * @property {function(function())} then
     */

    /**
     *
     * @param type {Integer} type 0=null, 1=B, 2=M, 3=A
     *
     * @return {jquery-jqXHR-checkin}
     */
    self.checkin = function (type) {
        let jsonData = {
            type: type,
            currentStatus: {
                stauts: 0,
                text: "WB2",
                timestamp: Date.now(),
            },
        }
        return $.ajax({
            url: "/api/v1/checkin/add",
            // make put for safety reasons :-)
            type: 'POST',
            contentType: "application/json; charset=UTF-8",
            dataType: 'json',
            data: JSON.stringify(jsonData),
        });
    };

    self.getCheckoutDataVersion = function(){
        return $.get({
            url: "/api/v1/checkout/getDataVersion",
            // get version to first to see if anything has changed
            type: 'GET',
            contentType: "application/json; charset=UTF-8",
            success: function (result) {
            }
        });
    }

    /**
     *
     * @typedef {Object} jquery-jqXHR-checkoutdata
     * @property {function(function(CheckinDataSchemeObject[], String, jquery-jqXHR-checkoutdata))} done
     * @property {function(function(Error))} fail
     * @property {function(function())} always
     * @property {function(function())} then
     */


    /**
     * Gets the current set of entries with status=0 ("WB1"). These are the elements that are due to be checked out of WB1.
     *
     * @returns {jquery-jqXHR-checkoutdata} jqXHR object return by jquery ajax call. Serves as a promise-like object, providing done, fail, always, then resolvers.
     *
     */
    self.getCheckoutData = function (options) {
        let self = this;
        let defaultOptions = {
            sort: "default",
            direction: 1,
        }
        options = (options === undefined) ? {}: options;
        options = Object.assign(defaultOptions, options);

        let jsonData = {
            sort: options.sort,
            direction: options.direction,
        }

        return $.get({
            url: "/api/v1/checkout/get",
            // make put for safety reasons :-)
            type: 'POST',
            contentType: "application/json; charset=UTF-8",
            dataType: 'json',
            data: JSON.stringify(jsonData),
        });
    }

    /**
     *
     * @typedef {Object} jquery-jqXHR-counter
     * @property {function(function({}, String, jquery-jqXHR-counter))} done
     * @property {function(function(Error))} fail
     * @property {function(function())} always
     * @property {function(function())} then
     */


    /**
     * Gets the current set of entries with status=0 ("WB1"). These are the elements that are due to be checked out of WB1.
     *
     * @returns {jquery-jqXHR-counter} jqXHR object return by jquery ajax call. Serves as a promise-like object, providing done, fail, always, then resolvers.
     *
     */
    self.getCheckinCounts = function (options) {
        let self = this;
        let defaultOptions = {

        }
        options = (options === undefined) ? {}: options;
        options = Object.assign(defaultOptions, options);

        return $.get({
            url: "/api/v1/checkin/counts",
            // make put for safety reasons :-)
            type: 'GET',
            contentType: "application/json; charset=UTF-8",
        });
    }

    self.setCheckoutSorting = function(params, options) {
        let self = this;
        let defaultParams = {
            sort: "default",
            direction: 1,
        }
        params = (params === undefined) ? {} : params;
        params = Object.assign(defaultParams, params);

        let jsonData = {
            property: params.sort,
            direction: params.direction,
        }

        return $.post({
            url: "/api/v1/checkout/setSorting",
            // make put for safety reasons :-)
            type: 'POST',
            contentType: "application/json; charset=UTF-8",
            dataType: 'json',
            data: JSON.stringify(jsonData),
        });
    }
    self.getCheckoutSorting = function() {
        let self = this;
        return $.get({
            url: "/api/v1/checkout/getSorting",
            contentType: "application/json; charset=UTF-8",
        });
    };


    /**
     *
     * @typedef {Object} jquery-jqXHR-checkoutentry
     * @property {function(function(CheckinDataSchemeObject, String, jquery-jqXHR-checkoutdata))} done
     * @property {function(function(Error))} fail
     * @property {function(function())} always
     * @property {function(function())} then
     */


    /**
     * Gets the current set of entries with status=0 ("WB1"). These are the elements that are due to be checked out of WB1.
     *
     * @param {String} id
     * @returns {jquery-jqXHR-checkoutentry} jqXHR object return by jquery ajax call. Serves as a promise-like object, providing done, fail, always, then resolvers.
     *
     */
    self.getCheckoutEntry = function (id) {
        let jsonData = {
            id: id,
        }
        return $.get({
            url: "/api/v1/checkout/getEntry",
            // make put for safety reasons :-)
            type: 'POST',
            contentType: "application/json; charset=UTF-8",
            dataType: 'json',
            data: JSON.stringify(jsonData),
            success: function (result) {
            }
        });
    }


    /**
     *
     * @typedef {Object} jquery-jqXHR-co
     * @property {function(function(CheckinDataSchemeObject, String, jquery-jqXHR-checkoutdata))} done
     * @property {function(function(Error))} fail
     * @property {function(function())} always
     * @property {function(function())} then
     */


    /**
     * Gets the current set of entries with status=0 ("WB1"). These are the elements that are due to be checked out of WB1.
     *
     * @returns {jquery-jqXHR-co} jqXHR object return by jquery ajax call. Serves as a promise-like object, providing done, fail, always, then resolvers.
     *
     */
    self.checkout = function (entry) {
        let jsonData = {
            entry: entry,
        }
        return $.ajax({
            url: "/api/v1/checkout/checkout",
            // make put for safety reasons :-)
            type: 'POST',
            contentType: "application/json; charset=UTF-8",
            dataType: 'json',
            data: JSON.stringify(jsonData),
        });
    };
}

export let apiHandler = new ApiHandler();
