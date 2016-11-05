(function($, window, document, undefined) {
    'use strict';

    Mobile.libs.topbar = {
        name: 'topbar',

        settings: {
            sticky_class: 'sticky',
            start_offset: 0,
            is_hover: true
        },

        init: function(section, method, options) {
            Mobile.inherit(this, 'add_custom_rule');
            var self = this;

            this.bindings(method, options);

            $('[data-' + this.name + ']', this.scope).each(function() {
                var topbar = $(this),
                    topbarContainer = topbar.parent(),
                    maxHeight = Math.max(topbarContainer.outerHeight(), topbar.outerHeight()),
                    settings = topbar.data(self.name + '-init');
                if (topbarContainer.hasClass('fixed')) {
                    if (topbarContainer.hasClass('bottom')) {
                        $('body').css('padding-bottom', maxHeight);
                    }
                    else {
                        $('body').css('padding-top', maxHeight);
                    }
                    return;
                }

                if (self.stickable(topbarContainer, settings)) {
                    self.settings.sticky_class = settings.sticky_class;
                    self.settings.sticky_topbar = topbar;
                    topbar.data('height', topbarContainer.outerHeight(true));
                    topbar.data('stickyOffset', topbarContainer.offset().top);

                    if (!settings.sticked) {
                        settings.start_offset && topbarContainer.css('top', settings.start_offset);
                        self.sticked(topbar);

                        // Pad body when sticky (scrolled) or fixed.
                        self.add_custom_rule('.act-topbar-fixed { padding-top: ' + topbar.data('height') + 'px; }');
                    }
                }

            });

        },

        stickable: function(topbarContainer, settings) {
            return topbarContainer.hasClass(settings.sticky_class);
        },

        timer: null,

        events: function(bar) {
            var self = this;

            $(this.scope)
                .off('.' + this.name)
                .on('click.' + this.name + ' contextmenu.' + this.name, '.top-bar .top-bar-section li a[href^="#"],[data-' + this.name + '] .top-bar-section li a[href^="#"]', function(e) {
                    var li = $(this).closest('li'),
                        topbar = li.closest('[data-' + self.name + ']'),
                        settings = topbar.data(self.name + '-init');

                    if (settings.is_hover) {
                        var hoverLi = $(this).closest('.hover');
                        hoverLi.removeClass('hover');
                    }
                });

            $(window).off('.' + this.name)
                .on('resize.' + this.name, this.resize())
                .trigger('resize.' + this.name)
                .load(function() {
                    // Ensure that the offset is calculated after all of the pages resources have loaded
                    $(this).trigger('resize.' + this.name);
                });

            $('body').off('.' + this.name).on('click.' + this.name, function(e) {
                var parent = $(e.target).closest('li').closest('li.hover');

                if (parent.length > 0) {
                    return;
                }

                $('[data-' + self.name + '] li.hover').removeClass('hover');
            });

            // Show dropdown menus when their items are focused
            $(this.scope).find('.dropdown a')
                .focus(function() {
                    $(this).parents('.has-dropdown').addClass('hover');
                })
                .blur(function() {
                    $(this).parents('.has-dropdown').removeClass('hover');
                });
        },

        resize: function() {
            var self = this;
            $('[data-' + this.name + ']').each(function() {
                var topbar = $(this),
                    settings = topbar.data(self.name + '-init');

                var stickyContainer = topbar.parent('.' + self.settings.sticky_class);
                var stickyOffset;

                if (self.stickable(stickyContainer, self.settings)) {
                    if (stickyContainer.hasClass('fixed')) {
                        // Remove the fixed to allow for correct calculation of the offset.
                        stickyContainer.removeClass('fixed');

                        stickyOffset = stickyContainer.offset().top;
                        if ($(document.body).hasClass('act-topbar-fixed')) {
                            stickyOffset -= topbar.data('height');
                        }

                        topbar.data('stickyOffset', stickyOffset);
                        stickyContainer.addClass('fixed');
                    } else {
                        stickyOffset = stickyContainer.offset().top;
                        topbar.data('stickyOffset', stickyOffset);
                    }
                }

            });
        },

        sticked: function(topbar) {
            // check for sticky
            this.sticky(topbar.parent());

            topbar.data(this.name, $.extend({}, topbar.data(this.name), {
                sticked: true
            }));
        },

        sticky: function(element) {
            var self = this;

            $(window).on('scroll', function() {
                if(!self.supportSticky(element)) {
                    self.update_sticky_positioning();
                }
                self.changeStatus(element, 'sticking');
            });
        },

        changeStatus: function(element, className) {
            var stickier = this.settings.sticky_topbar;
            if(stickier) {
                if (this.isSticky(stickier)) {
                    element.addClass(className);
                }
                else {
                    element.removeClass(className);
                }
            }
        },

        isSticky: function(element) {
            var $window = $(window),
                distance = element.data('stickyOffset') - this.settings.start_offset;
            return $window.scrollTop() > distance;
        },

        supportSticky: function(element) {
            var dom = document.createElement('test');
            dom.style.position = '-webkit-sticky';
            dom.style.position = 'sticky';
            return /sticky/.test(dom.style.position) && ['visible', ''].indexOf($(element).parent().css('overflow')) > -1;
        },

        update_sticky_positioning: function() {
            var klass = '.' + this.settings.sticky_class,
                stickier = this.settings.sticky_topbar;

            if (stickier && this.stickable(stickier.parent(), this.settings)) {
                if (this.isSticky(stickier)) {
                    if (!$(klass).hasClass('fixed')) {
                        $(klass).addClass('fixed');
                        $('body').addClass('act-topbar-fixed');
                    }
                } else {
                    if ($(klass).hasClass('fixed')) {
                        $(klass).removeClass('fixed');
                        $('body').removeClass('act-topbar-fixed');
                    }
                }
            }
        },

        off: function() {
            $(this.scope).off('.topbar');
            $(window).off('.topbar');
        },

        reflow: function() {}
    };
}(jQuery, window, window.document));
