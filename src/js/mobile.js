/*
 * Mobile's Front-end Library
 */

(function($, window, document, undefined) {
    'use strict';

    // Enable FastClick if present

    $(function() {
        if (typeof FastClick !== 'undefined') {
            // Don't attach to body if undefined
            if (typeof document.body !== 'undefined') {
                FastClick.attach(document.body);
            }
        }
    });

    /*
     * jquery.requestAnimationFrame
     * https://github.com/gnarf37/jquery-requestAnimationFrame
     * Requires jQuery 1.8+
     *
     * Copyright (c) 2012 Corey Frang
     * Licensed under the MIT license.
     */

    (function(jQuery) {


        // requestAnimationFrame polyfill adapted from Erik Möller
        // fixes from Paul Irish and Tino Zijdel
        // http://paulirish.com/2011/requestanimationframe-for-smart-animating/
        // http://my.opera.com/emoller/blog/2011/12/20/requestanimationframe-for-smart-er-animating

        var animating,
            lastTime = 0,
            vendors = ['webkit'],
            requestAnimationFrame = window.requestAnimationFrame,
            cancelAnimationFrame = window.cancelAnimationFrame,
            jqueryFxAvailable = 'undefined' !== typeof jQuery.fx;

        for (; lastTime < vendors.length && !requestAnimationFrame; lastTime++) {
            requestAnimationFrame = window[vendors[lastTime] + 'RequestAnimationFrame'];
            cancelAnimationFrame = cancelAnimationFrame ||
                window[vendors[lastTime] + 'CancelAnimationFrame'] ||
                window[vendors[lastTime] + 'CancelRequestAnimationFrame'];
        }

        function raf() {
            if (animating) {
                requestAnimationFrame(raf);

                if (jqueryFxAvailable) {
                    jQuery.fx.tick();
                }
            }
        }

        if (requestAnimationFrame) {
            // use rAF
            window.requestAnimationFrame = requestAnimationFrame;
            window.cancelAnimationFrame = cancelAnimationFrame;

            if (jqueryFxAvailable) {
                jQuery.fx.timer = function(timer) {
                    if (timer() && jQuery.timers.push(timer) && !animating) {
                        animating = true;
                        raf();
                    }
                };

                jQuery.fx.stop = function() {
                    animating = false;
                };
            }
        } else {
            // polyfill
            window.requestAnimationFrame = function(callback) {
                var currTime = new Date().getTime(),
                    timeToCall = Math.max(0, 16 - (currTime - lastTime)),
                    id = window.setTimeout(function() {
                        callback(currTime + timeToCall);
                    }, timeToCall);
                lastTime = currTime + timeToCall;
                return id;
            };

            window.cancelAnimationFrame = function(id) {
                clearTimeout(id);
            };

        }

    }($));

    /*
     * Custom the Mobile Core functions
    */

    var header_helpers = function(class_array) {
        var head = $('head');

        head.prepend($.map(class_array, function(class_name) {
            if (head.has('.' + class_name).length === 0) {
                return '<meta class="' + class_name + '" />';
            }
        }));
    };

    header_helpers([
        'mobile-mq-small',
        'mobile-mq-small-only',
        'mobile-mq-medium',
        'mobile-mq-medium-only'
    ]);

    var trim = function(str) {
        if (typeof str === 'string') {
            return str.trim();
        }
        return str;
    }

    // Event binding and data-options updating.

    var bindings = function(method, options) {
        var self = this,
            config = ($.isArray(options) ? options[0] : options) || method,
            bind = function() {
                var $this = $(this),
                    should_bind_events = !$this.data(self.name + '-init');
                $this.data(self.name + '-init', $.extend(true, {}, self.settings, config, self.data_options($this)));

                if (should_bind_events) {
                    self.events(this);
                }
            };

        if ($(this.scope).is('[data-' + this.name + ']')) {
            bind.call(this.scope);
        } else {
            $('[data-' + this.name + ']', this.scope).each(bind);
        }
        // # Patch to fix #5043 to move this *after* the if/else clause in order for Backbone and similar frameworks to have improved control over event binding and data-options updating.
        if (typeof method === 'string') {
            if($.isArray(options)) return this[method].apply(this, options);
            else return this[method].call(this, options);
        }

    };

    var single_image_loaded = function(image, callback) {
        function loaded() {
            callback(image[0]);
        }

        function bindLoad() {
            this.one('load', loaded);
        }

        if (!image.attr('src')) {
            loaded();
            return;
        }

        if (image[0].complete || image[0].readyState === 4) {
            loaded();
        } else {
            bindLoad.call(image);
        }
    };

    function removeQuotes(string) {
        if (typeof string === 'string' || string instanceof String) {
            string = string.replace(/^['\\/"]+|(;\s?})+|['\\/"]+$/g, '');
        }

        return string;
    }

    function MediaQuery(selector) {
        this.selector = selector;
        this.query = '';
    }

    MediaQuery.prototype.toString = function() {
　　　　　return this.query = this.query || $(this.selector).css('font-family').replace(/^[\/\\'"]+|(;\s?})+|[\/\\'"]+$/g, '');
    };

    window.Mobile = {
        name: 'Mobile',

        media_queries: {
            'small': new MediaQuery('.mobile-mq-small'),
            'small-only': new MediaQuery('.mobile-mq-small-only'),
            'medium': new MediaQuery('.mobile-mq-medium'),
            'medium-only': new MediaQuery('.mobile-mq-medium-only')
        },

        stylesheet: $('<style></style>').appendTo('head')[0].sheet,

        global: {},

        init: function(scope, libraries, method, options, response) {
            var args = [scope, method, options, response],
                responses = [];

            // set mobile global scope
            this.scope = scope || this.scope;

            if (libraries && typeof libraries === 'string' && !/reflow/i.test(libraries)) {
                if (this.libs.hasOwnProperty(libraries)) {
                    responses.push(this.init_lib(libraries, args));
                }
            } else {
                for (var lib in this.libs) {
                    responses.push(this.init_lib(lib, libraries));
                }
            }

            // $(window).load(function() {
            //     $(window)
            //         .trigger('resize.imagesbox')
            //         .trigger('resize.dropdown')
            //         .trigger('resize.equalizer')
            //         .trigger('resize.responsive')
            //         .trigger('resize.topbar')
            //         .trigger('resize.slides');
            // });

            return scope;
        },

        init_lib: function(lib, args) {
            if (this.libs.hasOwnProperty(lib)) {
                this.patch(this.libs[lib]);

                if (args && args.hasOwnProperty(lib)) {
                    if (typeof this.libs[lib].settings !== 'undefined') {
                        $.extend(true, this.libs[lib].settings, args[lib]);
                    } else if (typeof this.libs[lib].defaults !== 'undefined') {
                        $.extend(true, this.libs[lib].defaults, args[lib]);
                    }
                    return this.libs[lib].init.apply(this.libs[lib], [this.scope, args[lib]]);
                }

                args = args instanceof Array ? args : new Array(args);
                return this.libs[lib].init.apply(this.libs[lib], args);
            }

            return function() {};
        },

        patch: function(lib) {
            lib.scope = this.scope;
            lib['data_options'] = this.utils.data_options;
            lib['bindings'] = bindings;
            lib['trim'] = trim;
        },

        inherit: function(scope, methods) {
            var methods_arr = methods.split(' '),
                i = methods_arr.length;

            while (i--) {
                if (this.utils.hasOwnProperty(methods_arr[i])) {
                    scope[methods_arr[i]] = this.utils[methods_arr[i]];
                }
            }
        },

        libs: {},

        // methods that can be inherited in libraries
        utils: {

            // Description:
            //    Parses data-options attribute
            //
            // Arguments:
            //    El (jQuery Object): Element to be parsed.
            //
            // Returns:
            //    Options (Javascript Object): Contents of the element's data-options
            //    attribute.
            data_options: function(el, data_attr_name) {
                data_attr_name = data_attr_name || 'options';
                var opts = {},
                    ii, p, opts_arr;

                var cached_options = el.data(data_attr_name);

                if (typeof cached_options === 'object') {
                    return cached_options;
                }

                opts_arr = (cached_options || ':').split(';');
                ii = opts_arr.length;

                function isNumber(o) {
                    return !isNaN(o - 0) && o !== null && o !== '' && o !== false && o !== true;
                }

                while (ii--) {
                    p = opts_arr[ii].split(':');
                    p = [p[0], p.slice(1).join(':')];

                    if (/true/i.test(p[1])) {
                        p[1] = true;
                    }
                    if (/false/i.test(p[1])) {
                        p[1] = false;
                    }
                    if (isNumber(p[1])) {
                        if (p[1].indexOf('.') === -1) {
                            p[1] = parseInt(p[1], 10);
                        } else {
                            p[1] = parseFloat(p[1]);
                        }
                    }

                    if (p.length === 2 && p[0].length > 0) {
                        opts[trim(p[0])] = trim(p[1]);
                    }
                }

                return opts;
            },

            // Description:
            //    Adds JS-recognizable media queries
            //
            // Arguments:
            //    Media (String): Key string for the media query to be stored as in
            //    Mobile.media_queries
            //
            //    Class (String): Class name for the generated <meta> tag
            register_media: function(media, media_class) {
                if (Mobile.media_queries[media] === undefined) {
                    $('head').append('<meta class="' + media_class + '"/>');
                    Mobile.media_queries[media] = removeQuotes($('.' + media_class).css('font-family'));
                }
            },

            // Description:
            //    Add custom CSS within a JS-defined media query
            //
            // Arguments:
            //    Rule (String): CSS rule to be appended to the document.
            //
            //    Media (String): Optional media query string for the CSS rule to be
            //    nested under.
            add_custom_rule: function(rule, media) {
                if (media === undefined && Mobile.stylesheet) {
                    Mobile.stylesheet.insertRule(rule, Mobile.stylesheet.cssRules.length);
                } else {
                    var query = Mobile.media_queries[media];

                    if (query !== undefined) {
                        Mobile.stylesheet.insertRule('@media ' +
                            Mobile.media_queries[media] + '{ ' + rule + ' }', Mobile.stylesheet.cssRules.length);
                    }
                }
            },

            // Description:
            //    Performs a callback function when an image is fully loaded
            //
            // Arguments:
            //    Image (jQuery Object): Image(s) to check if loaded.
            //
            //    Callback (Function): Function to execute when image is fully loaded.
            image_loaded: function(images, callback) {
                var self = this,
                    unloaded = images.length;

                function pictures_has_height(images) {
                    var pictures_number = images.length;

                    for (var i = pictures_number - 1; i >= 0; i--) {
                        if (images.attr('height') === undefined) {
                            return false;
                        };
                    };

                    return true;
                }

                if (unloaded === 0 || pictures_has_height(images)) {
                    callback(images);
                }

                images.each(function() {
                    single_image_loaded($(this), function() {
                        unloaded -= 1;
                        if (unloaded === 0) {
                            callback(images);
                        }
                    });
                });
            },

            // Description:
            //    Returns a random, alphanumeric string
            //
            // Arguments:
            //    Length (Integer): Length of string to be generated. Defaults to random
            //    integer.
            //
            // Returns:
            //    Rand (String): Pseudo-random, alphanumeric string.
            random_str: function() {
                if (!this.fidx) {
                    this.fidx = 0;
                }
                this.prefix = this.prefix || [(this.name || 'M'), (+new Date).toString(36)].join('-');

                return this.prefix + (this.fidx++).toString(36);
            },

            // Description:
            //    Helper for window.matchMedia
            //
            // Arguments:
            //    mq (String): Media query
            //
            // Returns:
            //    (Boolean): Whether the media query passes or not
            match: function(mq) {
                return window.matchMedia(mq).matches;
            },

            // Description:
            //    Helpers for checking Mobile default media queries with JS
            //
            // Returns:
            //    (Boolean): Whether the media query passes or not

            is_small_up: function() {
                return this.match(Mobile.media_queries.small);
            },

            is_medium_up: function() {
                return this.match(Mobile.media_queries.medium);
            },

            is_small_only: function() {
                return !this.is_medium_up();
            },

            is_medium_only: function() {
                return this.is_medium_up();
            }
        }
    };

    $.fn.mobile = function() {
        var args = Array.prototype.slice.call(arguments, 0);

        return this.each(function() {
            Mobile.init.apply(Mobile, [this].concat(args));
            return this;
        });
    };

}(jQuery, window, window.document));
