var $ = require( "jquery" );

var ApiHandler = function() {
    let self = this;
    self.checkoutDataVersion = 0;
    self.checkin = function (amount, numberArray, callback) {
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
            success: function (result) {
                callback.onSuccess();
            }
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

    self.getCheckoutData = function (version) {
        return $.get({
            url: "/api/v1/checkin/getCheckoutData",
            // make put for safety reasons :-)
            type: 'GET',
            contentType: "application/json; charset=UTF-8",
            success: function (result) {
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
