self.addEventListener('push', function (event) {
    if (!event.data) return;

    const payload = JSON.parse(event.data.text());
    // https://developer.mozilla.org/en-US/docs/Web/API/ServiceWorkerRegistration/showNotification
    // https://developer.mozilla.org/en-US/docs/Web/API/ServiceWorkerRegistration/showNotification
    event.waitUntil(
        (async () => {
            console.log("wait until called");
            self.registration.showNotification(payload.title, payload.options);
        })()
    );
});

// https://developers.google.com/web/updates/2015/05/notifying-you-of-changes-to-notifications
self.addEventListener('notificationclick', function(event) {
    console.log('On notification click: ', event);
});
