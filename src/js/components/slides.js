(function($, window, document, undefined) {
    'use strict';

    var Slides = function(el, settings) {
        // Don't reinitialize plugin
        if (el.hasClass(settings.slides_container_class)) {
            return this;
        }

        var self = this,
            container,
            slides_container = el,
            bullets_container,
            idx = 0,
            animate,
            timer,
            locked = false,
            adjust_height_after = false;

        this.slides = function() {
            return slides_container.children(settings.slide_selector);
        };

        this.slides().first().addClass(settings.slide_active_class);

        this.update_slide_bullets = function(index) {
            if (settings.bullets) {
                bullets_container
                    .children().eq(index)
                        .addClass(settings.bullets_active_class)
                    .siblings('.' + settings.bullets_active_class)
                        .removeClass(settings.bullets_active_class)
            }
        };

        this.update_active_link = function(index) {
            var link = $('[data-slides-link="' + self.slides().eq(index).attr('data-slides-preview') + '"]');
            link
                .addClass(settings.bullets_active_class)
            .siblings('.' + settings.bullets_active_class)
                .removeClass(settings.bullets_active_class);
        };

        this.build_markup = function() {
            slides_container.wrap('<div class="' + settings.container_class + '"></div>');
            container = slides_container.parent();
            slides_container.addClass(settings.slides_container_class);

            if (settings.bullets) {
                bullets_container = $('<ol>').addClass(settings.bullets_container_class);
                container.append(bullets_container);
                bullets_container.wrap('<div class="slide-bullets-container"></div>');
                self.slides().each(function(idx, el) {
                    var bullet = $('<li>').data('slides-preview', idx);
                    bullets_container.append(bullet);
                });
            }

        };

        this._goto = function(next_idx, start_timer) {
            // if (locked) {return false;}
            if (next_idx === idx) {
                return false;
            }
            if (typeof timer === 'object') {
                timer.restart();
            }
            var slides = self.slides();

            var dir = 'next';
            locked = true;
            if (next_idx < idx) {
                dir = 'prev';
            }
            if (next_idx >= slides.length) {
                if (!settings.circular) {
                    return false;
                }
                next_idx = 0;
            } else if (next_idx < 0) {
                if (!settings.circular) {
                    return false;
                }
                next_idx = slides.length - 1;
            }

            var current = $(slides.get(idx));
            var next = $(slides.get(next_idx));

            current.css('zIndex', 2);
            current.removeClass(settings.slide_active_class);
            next.css('zIndex', 4).addClass(settings.slide_active_class);

            slides_container.trigger('before-slide-change.slides');
            settings.before_slide_change();
            self.update_active_link(next_idx);

            var callback = function() {
                var unlock = function() {
                    idx = next_idx;
                    locked = false;
                    if (start_timer === true) {
                        timer = self.create_timer();
                        timer.start();
                    }
                    self.update_slide_bullets(idx);
                    slides_container.trigger('after-slide-change.slides', [{
                        total_slides: slides.length
                    }]);
                    settings.after_slide_change(idx, slides.length);
                };
                if (slides_container.outerHeight() != next.outerHeight() && settings.variable_height) {
                    slides_container.animate({
                        'height': next.outerHeight()
                    }, 250, 'linear', unlock);
                } else {
                    unlock();
                }
            };

            if (slides.length === 1) {
                callback();
                return false;
            }

            var start_animation = function() {
                if (dir === 'next') {
                    animate.next(current, next, callback);
                }
                if (dir === 'prev') {
                    animate.prev(current, next, callback);
                }
            };

            if (next.outerHeight() > slides_container.outerHeight() && settings.variable_height) {
                slides_container.animate({
                    'height': next.outerHeight()
                }, 250, 'linear', start_animation);
            } else {
                start_animation();
            }
        };

        this.link_custom = function(e) {
            e.preventDefault();
            var link = $(this).attr('data-slides-link');
            if ((typeof link === 'string') && (link = $.trim(link)) != '') {
                var slide = container.find('[data-slides-preview=' + link + ']');
                if (slide.index() != -1) {
                    self._goto(slide.index());
                }
            }
        };

        this.timer_callback = function() {
            self._goto(idx + 1, true);
        }

        this.compute_dimensions = function() {
            var current = $(self.slides().get(idx));
            var h = current.outerHeight();
            if (!settings.variable_height) {
                self.slides().each(function() {
                    if ($(this).outerHeight() > h) {
                        h = $(this).outerHeight();
                    }
                });
            }
            slides_container.height(h);
        };

        this.create_timer = function() {
            var t = new Timer(settings, self.timer_callback);
            return t;
        };

        this.stop_timer = function() {
            if (typeof timer === 'object') {
                timer.stop();
            }
        };

        this.init = function() {
            self.build_markup();
            if (settings.autoplay) {
                timer = self.create_timer();
                Mobile.utils.image_loaded(this.slides().children('img'), timer.start);
            }
            animate = new FadeAnimation(settings, slides_container);
            if (settings.animation === 'slide') {
                animate = new SlideAnimation(settings, slides_container);
            }

            if (settings.swipe) {
                container.on('touchstart.slides', function(e) {
                        if (!e.touches) {
                            e = e.originalEvent;
                        }
                        var data = {
                            start_page_x: e.touches[0].pageX,
                            start_page_y: e.touches[0].pageY,
                            start_time: (new Date()).getTime(),
                            delta_x: 0,
                            is_scrolling: undefined
                        };
                        container.data('swipe-transition', data);
                        e.stopPropagation();
                    })
                    .on('touchmove.slides', function(e) {
                        if (!e.touches) {
                            e = e.originalEvent;
                        }
                        // Ignore pinch/zoom events
                        if (e.touches.length > 1 || e.scale && e.scale !== 1) {
                            return;
                        }

                        var data = container.data('swipe-transition');
                        if (typeof data === 'undefined') {
                            data = {};
                        }

                        data.delta_x = e.touches[0].pageX - data.start_page_x;

                        if (typeof data.is_scrolling === 'undefined') {
                            data.is_scrolling = !!(data.is_scrolling || Math.abs(data.delta_x) < Math.abs(e.touches[0].pageY - data.start_page_y));
                        }

                        if (!data.is_scrolling && !data.active) {
                            e.preventDefault();
                            var direction = (data.delta_x < 0) ? (idx + 1) : (idx - 1);
                            data.active = true;
                            self._goto(direction);
                        }
                    })
                    .on('touchend.slides', function(e) {
                        container.data('swipe-transition', {});
                        e.stopPropagation();
                    })
            }

            $(document).on('click', '[data-slides-link]', self.link_custom);
            $(window).on('load resize', self.compute_dimensions);
            Mobile.utils.image_loaded(this.slides().children('img'), self.compute_dimensions);
            Mobile.utils.image_loaded(this.slides().children('img'), function() {
                container.prev('.' + settings.preloader_class).css('display', 'none');
                self.update_slide_bullets(0);
                self.update_active_link(0);
                slides_container.trigger('ready.slides');
            });
        };

        this.init();
    };

    var Timer = function(settings, callback) {
        var self = this,
            duration = settings.timer_speed,
            start,
            timeout,
            left = -1;

        this.restart = function() {
            clearTimeout(timeout);
            left = -1;
        };

        this.start = function() {
            left = (left === -1) ? duration : left;
            start = new Date().getTime();
            timeout = setTimeout(function() {
                self.restart();
                callback();
            }, left);
        };

        this.stop = function() {
            clearTimeout(timeout);
            var end = new Date().getTime();
            left = left - (end - start);
        };
    };

    var SlideAnimation = function(settings, container) {
        var duration = settings.animation_speed;
        var margin = 'marginLeft';
        var animMargin = {};
        animMargin[margin] = '0%';

        this.next = function(current, next, callback) {
            current.animate({
                marginLeft: '-100%'
            }, duration);
            next.animate(animMargin, duration, function() {
                current.css(margin, '100%');
                callback();
            });
        };

        this.prev = function(current, prev, callback) {
            current.animate({
                marginLeft: '100%'
            }, duration);
            prev.css(margin, '-100%');
            prev.animate(animMargin, duration, function() {
                current.css(margin, '100%');
                callback();
            });
        };
    };

    var FadeAnimation = function(settings, container) {
        var duration = settings.animation_speed;
        var margin = 'marginLeft';

        this.next = function(current, next, callback) {
            next.css({
                'margin': '0%',
                'opacity': '0.01'
            });
            next.animate({
                'opacity': '1'
            }, duration, 'linear', function() {
                current.css('margin', '100%');
                callback();
            });
        };

        this.prev = function(current, prev, callback) {
            prev.css({
                'margin': '0%',
                'opacity': '0.01'
            });
            prev.animate({
                'opacity': '1'
            }, duration, 'linear', function() {
                current.css('margin', '100%');
                callback();
            });
        };
    };

    Mobile.libs = Mobile.libs || {};

    Mobile.libs.slides = {
        name: 'slides',

        settings: {
            animation: 'slide',
            timer_speed: 5000,
            animation_speed: 500,
            container_class: 'slide-container',
            slides_container_class: 'previews',
            preloader_class: 'preloader',
            slide_selector: '*',
            bullets_container_class: 'slide-bullets',
            bullets_active_class: 'active',
            slide_active_class: 'active',
            bullets: true,
            circular: true,
            autoplay: true,
            variable_height: false,
            swipe: true,
            before_slide_change: $.noop,
            after_slide_change: $.noop
        },

        init: function(scope, method, options) {
            Mobile.inherit(this, 'image_loaded');
            this.bindings(method, options);
        },

        events: function(instance) {
            var slides_instance = new Slides($(instance), $(instance).data(this.name + '-init'));
            $(instance).data(this.name + '-instance', slides_instance);
        },

        reflow: function() {
            var self = this;

            if ($(this.scope).is('[data-' + this.name + ']')) {
                var $el = $(this.scope);
                var instance = $el.data(this.name + '-instance');
                instance.compute_dimensions();
            } else {
                $('[data-' + this.name + ']', this.scope).each(function(idx) {
                    var $el = $(this);
                    var opts = self.data_options($el);
                    var instance = $el.data(self.name + '-instance');
                    instance.compute_dimensions();
                });
            }
        }
    };

}(jQuery, window, window.document));

