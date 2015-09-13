(function($, window, document, undefined) {
    'use strict';

    Mobile.libs.imagesbox = {
        name: 'imagesbox',

        settings: {
            templates: {
                viewing: [
                    '<a href="#" class="imagesbox-close">&times;</a>',
                    '<div class="visible-img" style="display: none">',
                    '<div class="imagesbox-touch-label"></div>',
                    '<img src="data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs%3D" alt="" />',
                    '<p class="imagesbox-caption"></p>',
                    '</div>',
                    '<img class="imagesbox-preload-next" style="display: none" src="data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs%3D" alt="" />',
                    '<img class="imagesbox-preload-prev" style="display: none" src="data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs%3D" alt="" />'
                ].join('')
            },

            // comma delimited list of selectors that, on click, will close imagesbox,
            // add 'div.imagesbox-blackout, div.visible-img' to close on background click
            close_selectors: '.imagesbox-close, div.imagesbox-blackout',

            // Default to the entire li element.
            open_selectors: '',

            // Image will be skipped in carousel.
            skip_selector: '',

            touch_label: '',

            // event initializers and locks
            init: false,
            locked: false
        },

        init: function(scope, method, options) {
            var self = this;
            Mobile.inherit(this, 'throttle image_loaded');

            this.bindings(method, options);

            if ($(this.scope).is('[' + this.attr_name() + ']')) {
                this.assemble($('li', this.scope));
            } else {
                $('[' + this.attr_name() + ']', this.scope).each(function() {
                    self.assemble($('li', this));
                });
            }
        },

        events: function(scope) {
            var self = this,
                $scroll_container = $('.scroll-container');

            if ($scroll_container.length > 0) {
                this.scope = $scroll_container;
            }

            $(this.scope)
                .off('.imagesbox')
                .on('click.imagesbox', 'ul[' + this.attr_name() + '] li ' + this.settings.open_selectors,
                    function(e, current, target) {
                        var current = current || $(this),
                            target = target || current,
                            next = current.next('li'),
                            settings = current.closest('[' + self.attr_name() + ']').data(self.attr_name(true) + '-init'),
                            image = $(e.target);

                        e.preventDefault();

                        if (!settings) {
                            self.init();
                            settings = current.closest('[' + self.attr_name() + ']').data(self.attr_name(true) + '-init');
                        }

                        // if imagesbox is open and the current image is
                        // clicked, go to the next image in sequence
                        if (target.hasClass('visible') &&
                            current[0] === target[0] &&
                            next.length > 0 && self.is_open(current)) {
                            target = next;
                            image = $('img', target);
                        }

                        // set current and target to the clicked li if not otherwise defined.
                        self.open(image, current, target);
                    })

            .on('click.imagesbox', this.settings.close_selectors, function(e) {
                Mobile.libs.imagesbox.close(e, this);
            });

            $(window).off('.imagesbox').on('resize.imagesbox', function() {
                self.resize();
            });

            this.swipe_events(scope);
        },

        swipe_events: function(scope) {
            var self = this;

            $(this.scope)
                .on('touchstart.imagesbox', '.visible-img', function(e) {
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

                    $(this).data('swipe-transition', data);
                    e.stopPropagation();
                })
                .on('touchmove.imagesbox', '.visible-img', function(e) {
                    if (!e.touches) {
                        e = e.originalEvent;
                    }
                    // Ignore pinch/zoom events
                    if (e.touches.length > 1 || e.scale && e.scale !== 1) {
                        return;
                    }

                    var data = $(this).data('swipe-transition');

                    if (typeof data === 'undefined') {
                        data = {};
                    }

                    data.delta_x = e.touches[0].pageX - data.start_page_x;

                    if (typeof data.is_scrolling === 'undefined') {
                        data.is_scrolling = !!(data.is_scrolling || Math.abs(data.delta_x) < Math.abs(e.touches[0].pageY - data.start_page_y));
                    }

                    if (!data.is_scrolling && !data.active) {
                        e.preventDefault();
                        var direction = (data.delta_x < 0) ? 'next' : 'prev';
                        data.active = true;
                        self.nav(e, direction);
                    }
                })
                .on('touchend.imagesbox', '.visible-img', function(e) {
                    $(this).data('swipe-transition', {});
                    e.stopPropagation();
                });
        },

        assemble: function($li) {
            var $el = $li.parent();

            if ($el.parent().hasClass('carousel')) {
                return;
            }

            $el.after('<div id="mobileImagesboxHolder"></div>');

            var grid = $el.detach(),
                grid_outerHTML = '';

            if (grid[0] == null) {
                return;
            } else {
                grid_outerHTML = grid[0].outerHTML;
            }

            var holder = $('#mobileImagesboxHolder'),
                settings = $el.data(this.attr_name(true) + '-init'),
                data = {
                    grid: '<div class="carousel">' + grid_outerHTML + '</div>',
                    viewing: settings.templates.viewing
                },
                wrapper = '<div class="imagesbox-assembled"><div>' + data.viewing + data.grid + '</div></div>',
                touch_label = this.settings.touch_label;

            if ('ontouchstart' in document) {
                wrapper = $(wrapper).find('.imagesbox-touch-label').html(touch_label).end();
            }

            holder.after(wrapper).remove();
        },

        open: function($image, current, target) {
            var self = this,
                body = $(document.body),
                root = target.closest('.imagesbox-assembled'),
                container = $('div', root).first(),
                visible_image = $('.visible-img', container),
                image = $('img', visible_image).not($image),
                label = $('.imagesbox-touch-label', container),
                error = false,
                loaded = {};

            // Event to disable scrolling on touch devices when Imagesbox is activated
            $('body').on('touchmove', function(e) {
                e.preventDefault();
            });

            image.error(function() {
                error = true;
            });

            function startLoad() {
                setTimeout(function() {
                    this.image_loaded(image, function() {
                        if (image.outerWidth() === 1 && !error) {
                            startLoad.call(this);
                        } else {
                            cb.call(this, image);
                        }
                    }.bind(this));
                }.bind(this), 100);
            }

            function cb(image) {
                var $image = $(image);
                $image.css('visibility', 'visible');
                $image.trigger('imageVisible');
                // toggle the gallery
                body.css('overflow', 'hidden');
                root.addClass('imagesbox-blackout');
                container.addClass('imagesbox-container');
                visible_image.show();
                this.fix_height(target)
                    .caption($('.imagesbox-caption', visible_image), $('img', target))
                    .center_and_label(image, label)
                    .shift(current, target, function() {
                        target.closest('li').siblings().removeClass('visible');
                        target.closest('li').addClass('visible');
                    });
                visible_image.trigger('opened.imagesbox')
            }

            if (!this.locked()) {
                visible_image.trigger('open.imagesbox');
                // set the image to the selected thumbnail
                loaded = this.load($image);
                image.attr('src', loaded.src);
                // if (loaded.responsive) {
                //     image
                //         .attr('data-responsive', loaded.responsive)
                //         .mobile('responsive', 'reflow');
                // } else {
                //     image
                //         .attr('src', loaded.src)
                //         .attr('data-responsive', '');
                // }
                image.css('visibility', 'hidden');

                startLoad.call(this);
            }
        },

        close: function(e, el) {
            e.preventDefault();

            var root = (function(target) {
                    if (/blackout/.test(target.selector)) {
                        return target;
                    } else {
                        return target.closest('.imagesbox-blackout');
                    }
                }($(el))),
                body = $(document.body),
                container, visible_image;

            if (el === e.target && root) {
                body.css('overflow', '');
                container = $('div', root).first();
                visible_image = $('.visible-img', container);
                visible_image.trigger('close.imagesbox');
                this.settings.prev_index = 0;
                $('ul[' + this.attr_name() + ']', root)
                    .attr('style', '').closest('.imagesbox-blackout')
                    .removeClass('imagesbox-blackout');
                container.removeClass('imagesbox-container');
                visible_image.hide();
                visible_image.trigger('closed.imagesbox');
            }

            // Event to re-enable scrolling on touch devices
            $('body').off('touchmove');

            return false;
        },

        is_open: function(current) {
            return current.parent().prop('style').length > 0;
        },

        nav: function(e, direction) {
            var imagesbox = $('ul[' + this.attr_name() + ']', '.imagesbox-blackout');

            e.preventDefault();
            this.go(imagesbox, direction);
        },

        resize: function() {
            var image = $('img', '.imagesbox-blackout .visible-img'),
                label = $('.imagesbox-touch-label', '.imagesbox-blackout');

            if (image.length) {
                this.center_and_label(image, label);
                image.trigger('resized.imagesbox')
            }
        },

        // visual adjustments
        fix_height: function(target) {
            var lis = target.parent().children(),
                self = this;

            lis.each(function() {
                    var li = $(this),
                        image = li.find('img');

                    if (li.height() > image.outerHeight()) {
                        li.addClass('fix-height');
                    }
                })
                .closest('ul')
                .width(lis.length * 100 + '%');

            return this;
        },

        center_and_label: function(target, label) {
            if (label.length > 0) {
                label.css({
                    marginLeft: -(label.outerWidth() / 2),
                    marginTop: -(target.outerHeight() / 2) - label.outerHeight() - 10
                });
            }
            return this;
        },

        // image loading and preloading

        load: function($image) {
            var href,
                // responsive,
                closest_a;

            if ($image[0].nodeName === 'A') {
                href = $image.attr('href');
                // responsive = $image.data('imagesbox-responsive');
            } else {
                closest_a = $image.closest('a');
                href = closest_a.attr('href');
                // responsive = closest_a.data('imagesbox-responsive');
            }

            this.preload($image);

            return {
                'src': href ? href : $image.attr('src')
                // 'responsive': href ? responsive : $image.data('imagesbox-responsive')
            }
        },

        preload: function($image) {
            this
                .img($image.closest('li').next(), 'next')
                .img($image.closest('li').prev(), 'prev');
        },

        img: function(img, sibling_type) {
            if (img.length) {
                var preload_img = $('.imagesbox-preload-' + sibling_type),
                    new_a = $('a', img),
                    src,
                    // responsive,
                    image;

                if (new_a.length) {
                    src = new_a.attr('href');
                    // responsive = new_a.data('imagesbox-responsive');
                } else {
                    image = $('img', img);
                    src = image.attr('src');
                    // responsive = image.data('imagesbox-responsive');
                }

                preload_img.attr('src', src);
                // if (responsive) {
                //     preload_img.attr('data-responsive', responsive);
                // } else {
                //     preload_img.attr('src', src);
                //     preload_img.attr('data-responsive', '');
                // }
            }
            return this;
        },

        // image caption

        caption: function(container, $image) {
            var caption = $image.attr('data-caption');

            if (caption) {
                var containerPlain = container.get(0);
                containerPlain.innerHTML = caption;
                container.show();
            } else {
                container
                    .text('')
                    .hide();
            }
            return this;
        },

        // directional methods

        go: function($ul, direction) {
            var current = $('.visible', $ul),
                target = current[direction]();

            // Check for skip selector.
            if (this.settings.skip_selector && target.find(this.settings.skip_selector).length != 0) {
                target = target[direction]();
            }

            if (target.length) {
                $('img', target)
                    .trigger('click.imagesbox', [current, target])
                    .trigger('change.imagesbox');
            }
        },

        shift: function(current, target, callback) {
            var imagesbox = target.parent(),
                old_index = this.settings.prev_index || target.index(),
                direction = this.direction(imagesbox, current, target),
                left = parseInt(imagesbox.css('left'), 10),
                width = target.outerWidth(),
                skip_shift;

            var dir_obj = {};

            // we use jQuery animate instead of CSS transitions because we
            // need a callback to unlock the next animation
            // needs support for RTL **
            if (target.index() !== old_index && !/skip/.test(direction)) {
                if (/left/.test(direction)) {
                    this.lock();
                    dir_obj.left = left + width;
                    imagesbox.animate(dir_obj, 300, this.unlock());
                } else if (/right/.test(direction)) {
                    this.lock();
                    dir_obj.left = left - width;
                    imagesbox.animate(dir_obj, 300, this.unlock());
                }
            } else if (/skip/.test(direction)) {
                // the target image is not adjacent to the current image, so
                // do we scroll right or not
                skip_shift = target.index() - this.settings.up_count;
                this.lock();

                if (skip_shift > 0) {
                    dir_obj.left = -(skip_shift * width);
                    imagesbox.animate(dir_obj, 300, this.unlock());
                } else {
                    dir_obj.left = 0;
                    imagesbox.animate(dir_obj, 300, this.unlock());
                }
            }

            callback();
        },

        direction: function($el, current, target) {
            var lis = $('li', $el),
                li_width = lis.outerWidth() + (lis.outerWidth() / 4),
                up_count = Math.floor($('.imagesbox-container').outerWidth() / li_width) - 1,
                target_index = lis.index(target),
                response;

            this.settings.up_count = up_count;

            if (this.adjacent(this.settings.prev_index, target_index)) {
                if ((target_index > up_count) && target_index > this.settings.prev_index) {
                    response = 'right';
                } else if ((target_index > up_count - 1) && target_index <= this.settings.prev_index) {
                    response = 'left';
                } else {
                    response = false;
                }
            } else {
                response = 'skip';
            }

            this.settings.prev_index = target_index;

            return response;
        },

        adjacent: function(current_index, target_index) {
            for (var i = target_index + 1; i >= target_index - 1; i--) {
                if (i === current_index) {
                    return true;
                }
            }
            return false;
        },

        // lock management

        lock: function() {
            this.settings.locked = true;
        },

        unlock: function() {
            this.settings.locked = false;
        },

        locked: function() {
            return this.settings.locked;
        },

        off: function() {
            $(this.scope).off('.imagesbox');
            $(window).off('.imagesbox');
        },

        reflow: function() {
            this.init();
        }
    };

}(jQuery, window, window.document));
