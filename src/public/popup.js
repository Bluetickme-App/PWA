(() => {
    if (typeof String.prototype.trimLeft !== "function") {
        String.prototype.trimLeft = function() {
            return this.replace(/^\s+/, "");
        };
    }
    if (typeof String.prototype.trimRight !== "function") {
        String.prototype.trimRight = function() {
            return this.replace(/\s+$/, "");
        };
    }
    if (typeof Array.prototype.map !== "function") {
        Array.prototype.map = function(callback, thisArg) {
            for (var i=0, n=this.length, a=[]; i<n; i++) {
                if (i in this) a[i] = callback.call(thisArg, this[i]);
            }
            return a;
        };
    }

    function getCookies() {
        var c = document.cookie, v = 0, cookies = {};
        if (document.cookie.match(/^\s*\$Version=(?:"1"|1);\s*(.*)/)) {
            c = RegExp.$1;
            v = 1;
        }
        if (v === 0) {
            c.split(/[,;]/).map(function(cookie) {
                var parts = cookie.split(/=/, 2),
                    name = decodeURIComponent(parts[0].trimLeft()),
                    value = parts.length > 1 ? decodeURIComponent(parts[1].trimRight()) : null;
                cookies[name] = value;
            });
        } else {
            c.match(/(?:^|\s+)([!#$%&'*+\-.0-9A-Z^`a-z|~]+)=([!#$%&'*+\-.0-9A-Z^`a-z|~]*|"(?:[\x20-\x7E\x80\xFF]|\\[\x00-\x7F])*")(?=\s*[,;]|$)/g).map(function($0, $1) {
                var name = $0,
                    value = $1.charAt(0) === '"'
                              ? $1.substr(1, -1).replace(/\\(.)/g, "$1")
                              : $1;
                cookies[name] = value;
            });
        }
        return cookies;
    }
    function getCookie(name) {
        return getCookies()[name];
    }

    function addCssToDocument(css){
        var style = document.createElement('style')
        style.innerText = css
        document.head.appendChild(style)
    }

    function isMobileAgent() {
        return window.navigator.userAgent.toLowerCase().indexOf("mobil") > -1;
    }

    function removeNotificationPopup() {
        if (document.getElementById('notification-container')) {
            document.getElementById('notification-container').remove();
        }
    }

    function renderNotificationPermissionPopup() {
        if (getCookie('web_push_subscription_registered') === 'true') {
            console.log("notifications are already registered!");
            return;
        }

        let closedByUser = false;
        let allowedNotification = false;
        const pushPermissionSite = 'https://api.bluetickme.com';
        const logoImage = 'https://api.bluetickme.com/images/logo.jpg';
        const title = "Bluetickme, wants to send you notifications, do you agree?";
        const agreeButtonText = "Agree";
        const isMobile = isMobileAgent();

        if (allowedNotification) {
            return;
        }

        if (closedByUser) {
            return;
        }

        const css = `
        #notification-container {
            position: fixed;
            top: 0px;
            left: 0px;
            height: 80px;
            width: 100%;
            background-color: rgb(255, 255, 255);
            border-bottom: 1px solid rgb(222, 222, 222);
            z-index: 1000000;
        }

        #notification-container .inner-container {
            max-width: 991px;
            position: relative;
            margin: auto;
        }

        #notification-container .agree-button-container {
            position: absolute;
            right: 0px;
            top: 50px;
        }
        #notification-container .agree-button-container button {
            color: rgb(255, 255, 255);
            background-color: rgb(0, 138, 252);
            border: 0px;
            border-radius: 4px;
            padding: 4px;
            width: 100px;
            height: 25px;
            cursor: pointer;
        }

        #notification-container .close-button-container {
            position: absolute;
            right: 0px;
            top: 8px;
        }
        #notification-container .close-button-container button {
            border: 0px;
            cursor: pointer;
            font-size: 15px;
        }

        #notification-container .title-container {
            display: inline-block;
            width: calc(100% - 160px);
            vertical-align: top;
            text-align: center;
        }
        #notification-container .title-container > span {
            margin-top: 32px;
            margin-left: 32px;
            font-size: 14px;
            display: inline-block;
        }

        #notification-container .logo-container {
            display: inline-block;
            width: 60px;
        }
        #notification-container .logo-container img {
            width: 60px;
            height: 60px;
            margin-top: 10px;
        }

        @media screen and (max-width: 991px) {
            #notification-container .inner-container {
                margin: 0 20px;
            }

            #notification-container .title-container {
                width: calc(100% - 200px);
            }

            #notification-container .close-button-container {
                right: 20px;
            }
            #notification-container .close-button-container {
               right: 20px;
            }
        }

        @media screen and (max-width: 785px) {
        }

        @media screen and (max-width: 576px) {
            #notification-container .inner-container {
                margin: 0 10px;
            }

            #notification-container .logo-container {
                width: 50px;
            }
            #notification-container .logo-container img {
                width: 50px;
                height: 50px;
                margin-top: 15px;
            }

            #notification-container .title-container {
                width: calc(100% - 100px);
                max-width: calc(100% - 100px);
            }
            #notification-container .title-container span {
                margin-top: 25px;
                margin-left: 12px;
                font-size: 12px;
                text-align: left;
            }

            #notification-container .close-button-container {
                right: 0px;
            }
            #notification-container .agree-button-container {
                right: 0px;
            }
        }

        @media screen and (max-width: 360px) {
            #notification-container .logo-container img {
                margin-top: 12px;
            }
            #notification-container .title-container span {
                margin-top: 12px;
            }
        }
        `;

        addCssToDocument(css);

        const rootElem = document.createElement("div");
        rootElem.id = "notification-container";

        const rootContainer = document.createElement("div");
        rootContainer.classList = 'inner-container';

        const agreeButtonElem = document.createElement("button");
        agreeButtonElem.innerHTML = agreeButtonText;

        const agreeButtonElemContainer = document.createElement("div");
        agreeButtonElemContainer.classList = 'agree-button-container';
        agreeButtonElemContainer.onclick = ((ev) => {
            removeNotificationPopup();
            window.open(pushPermissionSite);
        });
        agreeButtonElemContainer.appendChild(agreeButtonElem);

        const closeButtonElem = document.createElement("button");
        closeButtonElem.innerHTML = 'x';
        closeButtonElem.addEventListener("focus", function () {
            this.style.border = "0";
        });
        const closeButtonElemContainer = document.createElement("div");
        closeButtonElemContainer.classList = 'close-button-container';
        closeButtonElemContainer.onclick = ((ev) => {
            removeNotificationPopup();
        });
        closeButtonElemContainer.appendChild(closeButtonElem);

        const titleElem = document.createTextNode(title);
        const titleElemSpanContainer = document.createElement("span");
        titleElemSpanContainer.appendChild(titleElem);
        const titleElemContainer = document.createElement("div");
        titleElemContainer.classList = 'title-container';
        titleElemContainer.appendChild(titleElemSpanContainer);

        const logoImageElem = document.createElement("img");
        logoImageElem.src = logoImage;
        logoImageElem.alt = 'Bluetickme';
        const logoElemContainer = document.createElement("div");
        logoElemContainer.classList = 'logo-container';
        logoElemContainer.appendChild(logoImageElem);

        rootContainer.append(logoElemContainer);
        rootContainer.append(titleElemContainer);
        rootContainer.append(closeButtonElemContainer);
        rootContainer.append(agreeButtonElemContainer);
        rootElem.append(rootContainer);
        document.body.appendChild(rootElem);
    }

    function removeAppDownloadPopup() {
        if (document.getElementById('app-download-container')) {
            document.getElementById('app-download-container').remove();
        }
    }

    function renderAppDownloadPopup() {
        const isAndroid = /(android)/i.test(navigator.userAgent);
        const isIOS = /(iPad)/i.test(navigator.userAgent) || /(iPhone)/i.test(navigator.userAgent) || /(iPod)/i.test(navigator.userAgent);
        const isMobile = isMobileAgent();
        if (!isMobile || !isAndroid) {
            return;
        }

        const androidDownloadUrl = 'https://api.bluetickme.com/app.apk';
        const title = "Click \"Get App\" to Download BlueTickMe App!";
        const getAppButtonText = "Get App";

        const css = `
        #app-download-container {
            position: fixed;
            bottom: 47px;
            left: 0px;
            height: auto;
            width: 100%;
            background-color: rgb(255, 255, 255);
            border-top: 1px solid rgb(222, 222, 222);
            border-bottom: 1px solid rgb(222, 222, 222);
            z-index: 1000000;
            visibility: hidden;
            opacity: 0;
            transition: visibility 0s, opacity 0.8s linear;
        }
        #app-download-container.visible {
            visibility: visible;
            opacity: 1;
        }

        #app-download-container .inner-container {
            margin: 15px 10px;
            float: left;
            width: calc(100% - 20px);
        }

        #app-download-container .close-button-container {
            display: inline-block;
        }

        #app-download-container .title-container {
            display: inline-block;
            width: calc(100% - 130px);
            text-align: center;
            padding: 0 5px;
            vertical-align: middle;
        }

        #app-download-container .get-app-button-container {
            display: inline-block;
            float: right;
        }

        #app-download-container .close-button-container button {
            border: 0px;
            cursor: pointer;
            font-size: 15px;
        }

        #app-download-container .title-container > span {
            font-size: 14px;
            display: inline-block;
        }

        #app-download-container .get-app-button-container button {
            color: rgb(255, 255, 255);
            background-color: rgb(0, 138, 252);
            border: 0px;
            border-radius: 4px;
            padding: 4px;
            width: 100px;
            height: 25px;
            cursor: pointer;
        }

        @media screen and (max-width: 360px) {
            #app-download-container .title-container {
                width: calc(100% - 30px);
            }

            #app-download-container .get-app-button-container {
                display: block;
                width: 100%;
                text-align: center;
                margin-top: 20px;
            }
        }
        `;
        addCssToDocument(css);

        const rootElem = document.createElement("div");
        rootElem.id = "app-download-container";

        const rootContainer = document.createElement("div");
        rootContainer.classList = 'inner-container';

        const getAppButtonElem = document.createElement("button");
        getAppButtonElem.innerHTML = getAppButtonText;

        const getAppButtonElemContainer = document.createElement("div");
        getAppButtonElemContainer.classList = 'get-app-button-container';
        getAppButtonElemContainer.onclick = ((ev) => {
            removeAppDownloadPopup();
            window.location = androidDownloadUrl;
        });
        getAppButtonElemContainer.appendChild(getAppButtonElem);

        const closeButtonElem = document.createElement("button");
        closeButtonElem.innerHTML = 'x';
        closeButtonElem.addEventListener("focus", function () {
            this.style.border = "0";
        });
        const closeButtonElemContainer = document.createElement("div");
        closeButtonElemContainer.classList = 'close-button-container';
        closeButtonElemContainer.onclick = ((ev) => {
            removeAppDownloadPopup();
        });
        closeButtonElemContainer.appendChild(closeButtonElem);

        const titleElem = document.createTextNode(title);
        const titleElemSpanContainer = document.createElement("span");
        titleElemSpanContainer.appendChild(titleElem);
        const titleElemContainer = document.createElement("div");
        titleElemContainer.classList = 'title-container';
        titleElemContainer.appendChild(titleElemSpanContainer);

        rootContainer.append(closeButtonElemContainer);
        rootContainer.append(titleElemContainer);
        rootContainer.append(getAppButtonElemContainer);
        rootElem.append(rootContainer);
        document.body.appendChild(rootElem);

        window.setTimeout(function () {
            rootElem.classList.add('visible');
        }, 350);
    }

    document.addEventListener("DOMContentLoaded", function () {
        renderNotificationPermissionPopup();
        const isIsReactNativeWebViewUndefined = typeof isReactNativeWebView === "undefined";
        if (isIsReactNativeWebViewUndefined) {
            renderAppDownloadPopup();
        }
    });
})();
