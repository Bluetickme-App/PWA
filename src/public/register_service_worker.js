/**
 * urlBase64ToUint8Array
 *
 * @param {string} base64String a public vapid key
 */
function urlBase64ToUint8Array(base64String) {
    var padding = '='.repeat((4 - base64String.length % 4) % 4);
    var base64 = (base64String + padding)
        .replace(/\-/g, '+')
        .replace(/_/g, '/');

    var rawData = window.atob(base64);
    var outputArray = new Uint8Array(rawData.length);

    for (var i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
}

const url = new URL(window.location);
const userId = url.searchParams.get('uid');
const redirectUrl = url.searchParams.get('redirectUrl');

if ('serviceWorker' in navigator && userId !== '') {
    function setCookie(name, value) {
        document.cookie = `${name}=${value}; domain=.bluetickme.com; expires=Fri, 31 Dec 2100 23:59:59 GMT`;
    }

    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/service_worker.js').then(registration => {
            registration.onupdatefound = () => {
                registration.update().then(() => {
                    // window.location.reload();
                });

                const installingWorker = registration.installing;
                installingWorker.onstatechange = () => {
                    if (installingWorker.state === 'installed' && navigator.serviceWorker.controller) {
                        // Preferably, display a message asking the user to reload...
                        registration.update().then(() => {});
                    }
                };
            };
        });

        navigator.serviceWorker.ready
            .then(function (registration) {

                return registration.pushManager.getSubscription()
                    .then(async function (subscription) {
                        if (subscription) {
                            return subscription;
                        }

                        const response = await fetch('/api/vapid-public-key');
                        const jsonResponse = JSON.parse(await response.text());
                        const vapidPublicKey = jsonResponse.vapid_public_key;
                        const convertedVapidKey = urlBase64ToUint8Array(vapidPublicKey);

                        return registration.pushManager.subscribe({
                            userVisibleOnly: true,
                            applicationServerKey: convertedVapidKey
                        });
                    });

            }).then(function (subscription) {
                console.log('register!', subscription)
                fetch('/api/web-push-register', {
                    method: 'post',
                    headers: {
                        'Content-type': 'application/json'
                    },
                    body: JSON.stringify({
                        subscription: subscription,
                        user_id: userId,
                    }),
                }).then((response) => {
                    if (response.status === 200) {
                        response.json().then((data) => {
                            setCookie('web_push_subscription_registered', 'true');
                            setCookie('web_push_subscription_id', data.data.id);
                            window.location = redirectUrl;
                        });
                    }
                });
            });
    });
} else {
    console.log('serviceWorker not supported');
}
