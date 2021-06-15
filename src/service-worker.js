self.addEventListener('install', function() {
    console.log('Install!');
});
self.addEventListener("activate", event => {
    console.log('Activate!');
});
self.addEventListener('fetch', function(event) {
    console.log('Fetch!', event.request);
});

self.addEventListener('push', function(e) {
    var options = {
        body: 'This notification was generated from a push!',
        icon: 'images/example.png',
        vibrate: [100, 50, 100],
        data: {
            dateOfArrival: Date.now(),
            primaryKey: '2'
        },
        actions: [
            {action: 'explore', title: 'Explore this new world',
                icon: 'images/bg-square.jpg'},
            {action: 'close', title: 'Close',
                icon: 'images/bg-square.jpg'},
        ]
    };
    e.waitUntil(
        self.registration.showNotification('Hello world!', options)
    );
});
