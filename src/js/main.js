//Open the Mobile Framework JS
$(document).mobile();

if ((/MicroMessenger/i).test(window.navigator.userAgent)) {
    document.querySelector('[data-topbar]').style.display = 'none';
    document.body.style.minHeight = window.innerHeight + 'px';
}

// 通用倒计时，包括倒计时所在容器，倒数秒数，显示方式，回调。
function countdown(element, options) {
    var self = this;
    options = $.extend({
        start: 60,
        secondOnly: false,
        callback: null
    }, options || {});
    var t = options.start;
    var sec = options.secondOnly;
    var fn = options.callback;
    var d = +new Date();
    var diff = Math.round((d + t * 1000) / 1000);
    this.timer = timeout(element, diff, fn);
    this.stop = function() {
        clearTimeout(self.timer);
    };

    function timeout(element, until, fn) {
        var str = '',
            started = false,
            left = {
                d: 0,
                h: 0,
                m: 0,
                s: 0,
                t: 0
            },
            current = Math.round(+new Date() / 1000),
            data = {
                d: '天',
                h: '时',
                m: '分',
                s: '秒'
            };

        left.s = until - current;

        if (left.s < 0) {
            return;
        } else if (left.s == 0) {
            fn && fn();
        }
        if (!sec) {
            if (Math.floor(left.s / 86400) > 0) {
                left.d = Math.floor(left.s / 86400);
                left.s = left.s % 86400;
                str += left.d + data.d;
                started = true;
            }
            if (Math.floor(left.s / 3600) > 0) {
                left.h = Math.floor(left.s / 3600);
                left.s = left.s % 3600;
                started = true;
            }
        }
        if (started) {
            str += ' ' + left.h + data.h;
            started = true;
        }
        if (!sec) {
            if (Math.floor(left.s / 60) > 0) {
                left.m = Math.floor(left.s / 60);
                left.s = left.s % 60;
                started = true;
            }
        }
        if (started) {
            str += ' ' + left.m + data.m;
            started = true;
        }
        if (Math.floor(left.s) > 0) {
            started = true;
        }
        if (started) {
            str += ' ' + left.s + data.s;
            started = true;
        }

        $(element).html(str);
        return setTimeout(function() {
            timeout(element, until, fn);
        }, 1000);
    }
}
