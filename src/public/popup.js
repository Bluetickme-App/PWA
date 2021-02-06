function isMobileAgent() {
    return window.navigator.userAgent.toLowerCase().indexOf("mobil") > -1;
}

function renderNotificationPermissionPopup() {
    let closedByUser = false;
    let allowedNotification = false;
    const pushPermissionSite = 'http://localhost:3000';
    const logoImage = 'http://localhost:3000/images/logo.jpg';
    const title = "Bluetickme, want to send you notifications, do you agree?";
    const agreeButtonText = "Agree";
    const isMobile = isMobileAgent();
    const windowWidth = window.innerWidth;
    let resolutionType = 'desktop'; // tablet, mobile

    if (allowedNotification) {
        return;
    }

    if (closedByUser) {
        return;
    }

    function removeNotificationPopup() {
        document.getElementById('notification-container').remove();
    }

    const rootElem = document.createElement("div");
    rootElem.id = "notification-container";
    rootElem.style.position = "fixed";
    rootElem.style.top = 0;
    rootElem.style.left = 0;
    rootElem.style.height = "80px";
    rootElem.style.width = "100%";
    rootElem.style.backgroundColor = "#ffffff";
    rootElem.style.borderBottom = "1px solid #dedede";

    const rootContainer = document.createElement("div");
    rootContainer.style.maxWidth = "991px";
    rootContainer.style.position = "relative";
    rootContainer.style.margin = "auto";

    const agreeButtonElem = document.createElement("button");
    agreeButtonElem.innerHTML = agreeButtonText;
    agreeButtonElem.style.color = "#fff";
    agreeButtonElem.style.backgroundColor = "#008AFC";
    agreeButtonElem.style.border = "0";
    agreeButtonElem.style.borderRadius = "4px";
    agreeButtonElem.style.padding = "4px";
    agreeButtonElem.style.width = "100px";
    agreeButtonElem.style.height = "25px";
    agreeButtonElem.style.cursor = "pointer";

    const agreeButtonElemContainer = document.createElement("div");
    agreeButtonElemContainer.style.position = "absolute";
    agreeButtonElemContainer.style.right = "20px";
    agreeButtonElemContainer.style.top = "50px";
    agreeButtonElemContainer.onclick = ((ev) => {
        removeNotificationPopup();
        window.open(pushPermissionSite);
    });
    agreeButtonElemContainer.appendChild(agreeButtonElem);

    const closeButtonElem = document.createElement("button");
    closeButtonElem.innerHTML = 'x';
    closeButtonElem.style.border = "0";
    closeButtonElem.style.cursor = "pointer";
    closeButtonElem.addEventListener("focus", function () {
        this.style.border = "0";
    });
    const closeButtonElemContainer = document.createElement("div");
    closeButtonElemContainer.style.position = "absolute";
    closeButtonElemContainer.style.right = "20px";
    closeButtonElemContainer.style.top = "8px";
    closeButtonElemContainer.onclick = ((ev) => {
        removeNotificationPopup();
    });
    closeButtonElemContainer.appendChild(closeButtonElem);

    const titleElem = document.createTextNode(title);
    const titleElemSpanContainer = document.createElement("span");
    titleElemSpanContainer.style.marginTop = "32px";
    titleElemSpanContainer.style.marginLeft = "32px";
    titleElemSpanContainer.style.display = "inline-block";
    titleElemSpanContainer.appendChild(titleElem);
    const titleElemContainer = document.createElement("div");
    titleElemContainer.style.display = "inline-block";
    titleElemContainer.style.width = "calc(100% - 80px)";
    titleElemContainer.style.verticalAlign = "top";
    titleElemContainer.appendChild(titleElemSpanContainer);

    const logoImageElem = document.createElement("img");
    logoImageElem.src = logoImage;
    logoImageElem.alt = 'Bluetickme';
    logoImageElem.style.width = "60px";
    logoImageElem.style.height = "60px";
    logoImageElem.style.marginTop = "10px";
    const logoElemContainer = document.createElement("div");
    logoElemContainer.style.display = "inline-block";
    logoElemContainer.style.width = "60px";
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
