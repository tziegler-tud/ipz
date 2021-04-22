var transformDateTimeString = function(dateString, format) {
    format = (format === undefined || typeof(format !== "String")) ? "text" : format;
    var myDate = new Date(dateString);
    var month = (myDate.getMonth()+ 1).toString().length < 2 ? "0"+(myDate.getMonth()+ 1).toString() : (myDate.getMonth()+ 1).toString();
    var day = myDate.getDate().toString().length < 2 ? "0"+myDate.getDate().toString() : myDate.getDate().toString();

    var hours = myDate.getHours().toString().length < 2 ? "0"+myDate.getHours().toString() : myDate.getHours().toString();
    var minutes = myDate.getMinutes().toString().length < 2 ? "0"+myDate.getMinutes().toString() : myDate.getMinutes().toString();
    var seconds = myDate.getSeconds().toString().length < 2 ? "0"+myDate.getSeconds().toString() : myDate.getSeconds().toString();

    var date =  day + "." + month + "." + myDate.getFullYear()
    var time =  hours + ":" + minutes;
    var dateTime =  date + " " + time;
    return {
        dateTime: dateTime,
        date: date,
        time: function (format) {
            switch(format) {
                case "hh:mm:ss":
                    return hours + ":" + minutes + ":" + seconds;
                case "hh:mm":
                    return time
            }
        },
    };
}



export {transformDateTimeString}