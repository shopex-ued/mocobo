(function($, window, document, undefined) {
    'use strict';

    var openModals = [];

    Mobile.libs.modal = {
        name: 'modal',

        locked: false,

        settings: {
            animation: 'fade',
            animation_speed: 250,
            close_on_backdrop_click: true,
            close_on_esc: true,
            close_modal_class: 'close-modal',
            multiple_opened: false,
            backdrop: true,
            backdrop_class: 'backdrop',
            root_element: 'body',
            no_scroll: true,
            preventTargetDefault: true,
            open: $.noop,
            opened: $.noop,
            close: $.noop,
            closed: $.noop,
            on_ajax_error: $.noop,
            css: {
                open: {
                    'opacity': 0,
                    'visibility': 'visible'
                },
                close: {
                    'opacity': 1,
                    'visibility': 'hidden'
                }
            }
        },

        init: function(scope, method, options) {
            $.extend(true, this.settings, method, options);
            this.bindings(method, options);
        },

        events: function(scope) {
            var self = this;

            $(this.scope)
                .off('.' + this.name)
                .on('click.' + this.name, '[data-' + this.name + '-id]:not(:disabled):not(.disabled)', function(e) {
                    if(self.settings.preventTargetDefault) e.preventDefault();

                    if (!self.locked) {
                        var element = $(this),
                            ajax = element.data(this.name + '-ajax'),
                            replaceContentSel = element.data(this.name + '-replace-content');

                        self.locked = true;

                        if (typeof ajax === 'undefined') {
                            self.open.call(self, element);
                        } else {
                            var url = ajax === true ? element.attr('href') : ajax;
                            self.open.call(self, element, {
                                url: url
                            }, {
                                replaceContentSel: replaceContentSel
                            });
                        }
                    }
                });

            $(document)
                // .off('click.' + this.name)
                .on('click.' + this.name, this.close_targets(), function(e) {
                    if (self.settings.preventTargetDefault) e.preventDefault();
                    if (!self.locked) {
                        var settings = $('[data-' + self.name + '].open').data(self.name + '-init') || self.settings,
                            backdrop_clicked = settings.backdrop && ($(e.target)[0] === $('.' + settings.backdrop_class)[0]);

                        if (backdrop_clicked) {
                            if (settings.close_on_backdrop_click) {
                                e.stopPropagation();
                            } else {
                                return;
                            }
                        }

                        self.locked = true;
                        self.close.call(self, backdrop_clicked ? $('[data-' + self.name + '].open:not(.toback)') : $(this).closest('[data-' + self.name + ']'));
                    }
                });

            if ($('[data-' + this.name + ']', this.scope).length > 0) {
                $(this.scope)
                    // .off('.' + this.name)
                    .on('open.' + this.name, this.settings.open)
                    .on('opened.' + this.name, this.settings.opened)
                    .on('opened.' + this.name, this.open_video)
                    .on('close.' + this.name, this.settings.close)
                    .on('closed.' + this.name, this.settings.closed)
                    .on('closed.' + this.name, this.close_video);
            } else {
                $(this.scope)
                    // .off('.' + this.name)
                    .on('open.' + this.name, '[data-' + this.name + ']', this.settings.open)
                    .on('opened.' + this.name, '[data-' + this.name + ']', this.settings.opened)
                    .on('opened.' + this.name, '[data-' + this.name + ']', this.open_video)
                    .on('close.' + this.name, '[data-' + this.name + ']', this.settings.close)
                    .on('closed.' + this.name, '[data-' + this.name + ']', this.settings.closed)
                    .on('closed.' + this.name, '[data-' + this.name + ']', this.close_video);
            }

            return true;
        },

        open: function(target, ajax_settings) {
            var self = this,
                container;

            if (target) {
                if (typeof target.selector !== 'undefined') {
                    // Find the named node; only use the first one found, since the rest of the code assumes there's only one node
                    container = $('#' + target.data(this.name + '-id')).first();
                } else {
                    container = $(this.scope);

                    ajax_settings = target;
                }
            } else {
                container = $(this.scope);
            }

            var settings = container.data(this.name + '-init');
            settings = settings || this.settings;

            if (container.hasClass('open') && target !== undefined && target.data(this.name + '-id') == container.attr('id')) {
                return this.close(container);
            }

            if (!container.hasClass('open')) {
                var open_container = $('[data-' + this.name + '].open');

                container.attr('tabindex', '0').attr('aria-hidden', 'false');

                // prevents annoying scroll positioning bug with position: absolute;
                if (settings.no_scroll) {
                    var $doc = $('html');
                    $doc.one('open.' + this.name, function() {
                        $(this).addClass('modal-open');
                    }).on('touchmove.' + this.name, function(e) {
                        e.preventDefault();
                    });
                }

                // Prevent namespace event from triggering twice
                container.on('open.' + this.name, function(e) {
                    if (e.namespace !== this.name) return;
                });

                container.on('open.' + this.name).trigger('open.' + this.name);

                if (open_container.length < 1) {
                    this.toggle_backdrop(container, true);
                }

                if (typeof ajax_settings === 'string') {
                    ajax_settings = {
                        url: ajax_settings
                    };
                }

                var openModal = function() {
                    if (open_container.length > 0) {
                        if (settings.multiple_opened) {
                            self.to_back(open_container);
                        } else {
                            self.hide(open_container, settings.css.close);
                        }
                    }

                    // bl: add the open_container that isn't already in the background to the openModals array
                    if (settings.multiple_opened) {
                        openModals.push(container);
                    }

                    self.show(container, settings.css.open);
                };

                if (typeof ajax_settings === 'undefined' || !ajax_settings.url) {
                    openModal();
                } else {
                    var old_success = typeof ajax_settings.success !== 'undefined' ? ajax_settings.success : null;
                    $.extend(ajax_settings, {
                        success: function(data, textStatus, jqXHR) {
                            if ($.isFunction(old_success)) {
                                var result = old_success(data, textStatus, jqXHR);
                                if (typeof result == 'string') {
                                    data = result;
                                }
                            }

                            if (typeof options !== 'undefined' && typeof options.replaceContentSel !== 'undefined') {
                                container.find(options.replaceContentSel).html(data);
                            } else {
                                container.html(data);
                            }

                            $(container)
                                .mobile('section', 'reflow')
                                .children().mobile();

                            openModal();
                        }
                    });

                    // check for if user initalized with error callback
                    if (settings.on_ajax_error !== $.noop) {
                        $.extend(ajax_settings, {
                            error: settings.on_ajax_error
                        });
                    }

                    $.ajax(ajax_settings);
                }
            }
            $(window).trigger('resize');
        },

        close: function(container) {
            var container = container && container.length ? container : $(this.scope),
                open_containers = $('[data-' + this.name + '].open'),
                settings = container.data(this.name + '-init') || this.settings,
                self = this;

            if (open_containers.length > 0) {

                container.removeAttr('tabindex', '0').attr('aria-hidden', 'true');

                // prevents annoying scroll positioning bug with position: absolute;
                if (settings.no_scroll) {
                    var $doc = $('html');
                    $doc.one('close.' + this.name, function() {
                        $(this).removeClass('modal-open');
                    })
                    .off('touchmove');
                }

                this.locked = true;

                container.trigger('close.' + this.name);

                if ((settings.multiple_opened && open_containers.length === 1) || !settings.multiple_opened || container.length > 1) {
                    this.toggle_backdrop(container, false);
                    this.to_front(container);
                }

                if (settings.multiple_opened) {
                    var isCurrent = container.is(':not(.toback)');
                    this.hide(container, settings.css.close, settings);
                    if (isCurrent) {
                        // remove the last container since it is now closed
                        openModals.pop();
                    } else {
                        // if this isn't the current container, then find it in the array and remove it
                        openModals = $.grep(openModals, function(elt) {
                            var isThis = elt[0] === container[0];
                            if (isThis) {
                                // since it's not currently in the front, put it in the front now that it is hidden
                                // so that if it's re-opened, it won't be .toback
                                self.to_front(container);
                            }
                            return !isThis;
                        });
                    }
                    // finally, show the next container in the stack, if there is one
                    if (openModals.length > 0) {
                        this.to_front(openModals[openModals.length - 1]);
                    }
                } else {
                    this.hide(open_containers, settings.css.close, settings);
                }
            }
        },

        close_targets: function() {
            var base = '.' + this.settings.close_modal_class;

            if (this.settings.backdrop && this.settings.close_on_backdrop_click) {
                return base + ', .' + this.settings.backdrop_class;
            }

            return base;
        },

        toggle_backdrop: function(container, state) {
            if (!this.settings.backdrop) return;
            if ($('.' + this.settings.backdrop_class).length === 0) {
                this.settings.backdrop = $('<div />', {
                        'class': this.settings.backdrop_class
                    })
                    .appendTo('body').hide();
            }

            var visible = this.settings.backdrop.filter(':visible').length > 0;
            if (state != visible) {
                if (state == undefined ? visible : !state) {
                    this.hide(this.settings.backdrop);
                } else {
                    this.show(this.settings.backdrop);
                }
            }
        },

        show: function(el, css) {
            // is container
            var self = this;
            if (css) {
                var settings = el.data(this.name + '-init') || this.settings,
                    root_element = settings.root_element,
                    context = this;

                if (el.parent(root_element).length === 0) {
                    var placeholder = el.wrap('<div style="display: none;" />').parent();

                    el.on('closed.' + this.name + '.wrapped', function() {
                        el.detach().appendTo(placeholder);
                        el.unwrap().unbind('closed.' + this.name + '.wrapped');
                    });

                    el.detach().appendTo(root_element);
                }

                var animData = getAnimationData(settings.animation);
                if (!animData.animate) {
                    this.locked = false;
                }

                if (animData.fade) {
                    var end_css = {
                        opacity: 1
                    };

                    return requestAnimationFrame(function() {
                        return el
                            .css(css)
                            .animate(end_css, settings.animation_speed, 'linear', function() {
                                context.locked = false;
                                el.trigger('opened.' + self.name);
                            })
                            .addClass('open')
                            .trigger('open.' + self.name);
                    });
                }

                return el.css(css)
                    .addClass('open')
                    .trigger('opened.' + this.name);
            }

            var settings = this.settings;

            // should we animate the background?
            if (getAnimationData(settings.animation).fade) {
                return el.fadeIn(settings.animation_speed);
            }

            this.locked = false;

            return el.show();
        },

        to_back: function(el) {
            el.addClass('toback');
        },

        to_front: function(el) {
            el.removeClass('toback');
        },

        hide: function(el, css) {
            // is container
            var self = this;
            if (css) {
                var settings = el.data(this.name + '-init'),
                    context = this;
                settings = settings || this.settings;

                var animData = getAnimationData(settings.animation);
                if (!animData.animate) {
                    this.locked = false;
                }

                if (animData.fade) {
                    var end_css = {
                        opacity: 0
                    };

                    return requestAnimationFrame(function() {
                        return el
                            .animate(end_css, settings.animation_speed, 'linear', function() {
                                context.locked = false;
                                el.css(css).trigger('closed.' + self.name);
                            })
                            .removeClass('open');
                    });
                }

                return el.css(css).removeClass('open').trigger('closed.' + this.name);
            }

            var settings = this.settings;

            // should we animate the background?
            if (getAnimationData(settings.animation).fade) {
                return el.fadeOut(settings.animation_speed);
            }

            return el.hide();
        },

        close_video: function(e) {
            var video = $('.flex-video', e.target),
                iframe = $('iframe', video);

            if (iframe.length > 0) {
                iframe.attr('data-src', iframe[0].src);
                iframe.attr('src', iframe.attr('src'));
                video.hide();
            }
        },

        open_video: function(e) {
            var video = $('.flex-video', e.target),
                iframe = video.find('iframe');

            if (iframe.length > 0) {
                var data_src = iframe.attr('data-src');
                if (typeof data_src === 'string') {
                    iframe[0].src = iframe.attr('data-src');
                } else {
                    var src = iframe[0].src;
                    iframe[0].src = undefined;
                    iframe[0].src = src;
                }
                video.show();
            }
        },

        off: function() {
            $(this.scope).off('.' + this.name);
        },

        reflow: function() {}
    };

    /*
     * getAnimationData('fade')       // {animate: true,  fade: true}
     * getAnimationData(null)         // {animate: false, fade: false}
     */
    function getAnimationData(str) {
        var fade = /fade/i.test(str);
        return {
            animate: fade,
            fade: fade
        };
    }
}(jQuery, window, window.document));
