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
     * @param amount {Integer} amount of numbers to be added.
     * @param numberArray {[Integer]} Array containing the numbers to be added
     * @param callback {Checkin-ApiHandlerCallback} Callback object
     */
    self.checkin = function (amount, numberArray, callback) {
        if (callback === undefined) {
            callback = {
                onSuccess: function (result) {
                    console.log("data send successfully")
                },
                onFail: function () {
                    console.error("failed to send data")
                }
            }
        }
        let jsonData = {
            amount: amount,
            data: numberArray,
            currentStatus: {
                stauts: 0,
                text: "WB1",
                timestamp: Date.now(),
            },
        }
        $.ajax({
            url: "/api/v1/checkin/add",
            // make put for safety reasons :-)
            type: 'POST',
            contentType: "application/json; charset=UTF-8",
            dataType: 'json',
            data: JSON.stringify(jsonData),
            success: callback.onSuccess,
        });
    };

    self.getCheckoutDataVersion = function(){
        return $.get({
            url: "/api/v1/checkin/getCheckoutDataVersion",
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
    self.getCheckoutData = function () {
        return $.get({
            url: "/api/v1/checkin/getCheckoutData",
            // make put for safety reasons :-)
            type: 'GET',
            contentType: "application/json; charset=UTF-8",
            success: function (result) {
            }
        });
    }

    self.getCheckoutEntry = function (id) {
        let jsonData = {
            id: id,
        }
        return $.get({
            url: "/api/v1/checkin/getCheckoutData",
            // make put for safety reasons :-)
            type: 'POST',
            contentType: "application/json; charset=UTF-8",
            dataType: 'json',
            data: JSON.stringify(jsonData),
            success: function (result) {
            }
        });
    }

    self.redraw = function (id, callback) {
        if (callback === undefined) {
            callback = {
                onSuccess: function () {
                    console.log("data send successfully")
                },
                onFail: function () {
                    console.error("failed to send data")
                }
            }
        }
        let jsonData = {
            id: id,
            minutes: 5, //reschedule for 5 minutes from now
        }
        return $.post({
            url: "/api/v1/checkin/redraw",
            // make put for safety reasons :-)
            type: 'POST',
            contentType: "application/json; charset=UTF-8",
            dataType: 'json',
            data: JSON.stringify(jsonData),
            success: function (result) {
                callback.onSuccess()
            }
        });
    }

    self.checkout = function (entry, callback) {
        if (callback === undefined) {
            callback = {
                onSuccess: function () {
                    console.log("data send successfully")
                },
                onFail: function () {
                    console.error("failed to send data")
                }
            }
        }
        let jsonData = {
            entry: entry,
        }
        $.ajax({
            url: "/api/v1/checkin/checkout",
            // make put for safety reasons :-)
            type: 'POST',
            contentType: "application/json; charset=UTF-8",
            dataType: 'json',
            data: JSON.stringify(jsonData),
            success: function (result) {
                callback.onSuccess(result);
            }
        });
    };
}

export let apiHandler = new ApiHandler();
