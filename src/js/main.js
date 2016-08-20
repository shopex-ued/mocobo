//Open the Mobile Front-end Codebase JS
$(document).mobile();

if ((/MicroMessenger/i).test(window.navigator.userAgent)) {
    document.querySelector('[data-topbar]').style.display = 'none';
}

