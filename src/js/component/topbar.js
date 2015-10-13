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

            $('[' + this.attr_name() + ']', this.scope).each(function() {
                var topbar = $(this),
                    settings = topbar.data(self.attr_name(true) + '-init');
                var topbarContainer = topbar.parent();
                var maxHeight = Math.max(topbarContainer.outerHeight(), topbar.outerHeight());
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
                .off('.topbar')
                .on('click.topbar contextmenu.topbar', '.top-bar .top-bar-section li a[href^="#"],[' + this.attr_name() + '] .top-bar-section li a[href^="#"]', function(e) {
                    var li = $(this).closest('li'),
                        topbar = li.closest('[' + self.attr_name() + ']'),
                        settings = topbar.data(self.attr_name(true) + '-init');

                    if (settings.is_hover) {
                        var hoverLi = $(this).closest('.hover');
                        hoverLi.removeClass('hover');
                    }
                });

            $(window).off('.topbar')
                .on('resize.topbar', this.resize())
                .trigger('resize.topbar')
                .load(function() {
                    // Ensure that the offset is calculated after all of the pages resources have loaded
                    $(this).trigger('resize.topbar');
                });

            $('body').off('.topbar').on('click.topbar', function(e) {
                var parent = $(e.target).closest('li').closest('li.hover');

                if (parent.length > 0) {
                    return;
                }

                $('[' + self.attr_name() + '] li.hover').removeClass('hover');
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
            $('[' + this.attr_name() + ']').each(function() {
                var topbar = $(this),
                    settings = topbar.data(self.attr_name(true) + '-init');

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

            topbar.data(this.attr_name(true), $.extend({}, topbar.data(this.attr_name(true)), {
                sticked: true
            }));
        },

        sticky: function(topbar) {
            var self = this;

            if(!this.supportSticky(topbar)) {
                $(window).on('scroll', function() {
                    self.update_sticky_positioning();
                });
            }
        },

        supportSticky: function(element) {
            var dom = document.createElement('test');
            dom.style.position = '-webkit-sticky';
            dom.style.position = 'sticky';
            return /sticky/.test(dom.style.position) && ['visible', ''].indexOf($(element).parent().css('overflow')) > -1;
        },

        update_sticky_positioning: function() {
            var klass = '.' + this.settings.sticky_class,
                $window = $(window);

            if (this.settings.sticky_topbar && this.stickable(this.settings.sticky_topbar.parent(), this.settings)) {
                var distance = this.settings.sticky_topbar.data('stickyOffset') - this.settings.start_offset;
                if ($window.scrollTop() > distance) {
                    if (!$(klass).hasClass('fixed')) {
                        $(klass).addClass('fixed');
                        $('body').addClass('act-topbar-fixed');
                    }
                } else if ($window.scrollTop() <= distance) {
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
