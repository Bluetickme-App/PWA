(() => {
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
            z-index: 100;
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

    document.addEventListener("DOMContentLoaded", function () {
        renderNotificationPermissionPopup();
    });
})();
