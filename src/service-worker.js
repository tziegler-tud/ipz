self.addEventListener('install', function() {
    console.log('Install!');
    self.skipWaiting();
});
self.addEventListener("activate", event => {
    console.log('Activate!');
});
self.addEventListener('fetch', function(event) {
    console.log('Fetch!', event.request);
});

self.addEventListener('push', function(event) {
    var body;

    if (event.data) {
        body = event.data.json();
    } else {
        body = 'Push message no payload';
    }

    //body is of form: {message: {body, title}, data: {arbitrary}
    let message = body.message;
    let data = body.data;


    let dataType = data.type; //can be: update, request, message
    let user = data.user; //the user which the request was sent to
    if (data) {
        //parse data and find out what is happening
        //forward to client
        clients.matchAll()
            .then(function(result){
                if(result.length > 0) {
                    for(const client of result) {
                        // Send a message to the client.
                        client.postMessage(data);
                    }
                }
                else {
                    switch (dataType) {
                        case "update":
                            //we expect details and payload
                            if (data.details === "dataChangedOnServer") {

                            }
                            break;
                        case "request":
                            //we expect details and payload
                            if (data.details === "activityreport") {
                                let body = {user: user, task: {name: "inactive"}}
                                // tell server if we want to stay connected
                                fetch('/api/v1/devices/refresh', {
                                    method: 'POST',
                                    headers: new Headers({'Content-Type': 'application/json'}),
                                    body: JSON.stringify(body)
                                })
                            }
                            break;
                    }
                }

            });
    }




    //display notification if message property is set
    if (message) {
        var options = {
            body: message.body,
            icon: 'images/bg-square.jpg',
            vibrate: [100, 50, 100],
            data: {
                dateOfArrival: Date.now(),
                primaryKey: '1'
            },
            actions: [
                {action: 'explore', title: 'Explore this new world'},
                {action: 'close', title: 'Close'},
            ]
        };
        event.waitUntil(
            self.registration.showNotification(message.title, options)
        );
    }


});
