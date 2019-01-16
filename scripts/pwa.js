function isMobile() {
    // check if running on a mobile device
    return (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent));
}

function isAndroid() {
    // check if running on an Android device
    return navigator.userAgent.toLowerCase().indexOf("android") > -1;
}

function isInstalled() {
    // check if the application is already installed on the device
    return (window.matchMedia('(display-mode: standalone)').matches) || (
        ('standalone' in window.navigator) && (window.navigator.standalone)
    );
}

function installAndroid() {
    alert('Install Android');
}

function installIOS() {
    alert('Install iOS');
}

function setupPWA() {
    if (isMobile()) {
        if (isAndroid()) {
            // Android
            if (!isInstalled()) {
                installAndroid();
            }
        } else {
            // iOS
            if (!isInstalled()) {
                installIOS();
            }
        }
    }
}

setupPWA();
