self.addEventListener('push', function (event) {
    const payload = event.data ? event.data.text() : 'no payload';
    console.log("NOTIFICATION RECEIVED", payload);
    console.log(event, self);

    // https://developer.mozilla.org/en-US/docs/Web/API/ServiceWorkerRegistration/showNotification

    var title = 'Yay a message. '+new Date().getTime();
    var body = 'We have received a push message.';
    var icon = 'https://static.wixstatic.com/media/41051b_183481e6623f473b970422a66c59e064~mv2.png';
    // it should be unique to display all the notifications
    var tag = 'simple-push-demo-notification-tag_'+new Date().getTime();
    var data = {
        doge: {
            wow: 'such amaze notification data'
        }
    };

    // https://developer.mozilla.org/en-US/docs/Web/API/ServiceWorkerRegistration/showNotification

    event.waitUntil(
        (async () => {
            console.log("wait until called");
            self.registration.showNotification(title, {
                body: body,
                icon: icon,
                tag: tag,
                data: data,
                vibrate: [300, 100, 400],
            });
        })()
    );
});

// https://developers.google.com/web/updates/2015/05/notifying-you-of-changes-to-notifications
self.addEventListener('notificationclick', function(event) {
    console.log('On notification click: ', event);
});