(function($, window, document, undefined) {
    'use strict';

    Mobile.libs.topbar = {
        name: 'topbar',

        settings: {
            start_offset: 0,
            //Make topbar be absorbing
            absorb_on: true,
            //Absorbing's class
            absorb_class: 'absorb',
            is_hover: true
        },

        init: function(section, method, options) {
            Mobile.inherit(this, 'add_custom_rule throttle');
            var self = this;

            this.bindings(method, options);

            $('[' + this.attr_name() + ']', this.scope).each(function() {
                var topbar = $(this),
                    settings = topbar.data(self.attr_name(true) + '-init');
                var topbarContainer = topbar.parent();
                if (topbarContainer.hasClass('fixed')) {
                    if (topbarContainer.hasClass('bottom')) {
                        $('body').css('padding-bottom', topbar.outerHeight());
                    }
                    else {
                        $('body').css('padding-top', topbar.outerHeight());
                    }
                    return;
                }

                if (self.absorbable(topbarContainer, settings)) {
                    self.settings.absorb_class = settings.absorb_class;
                    self.settings.absorb_topbar = topbar;
                    topbar.data('height', topbarContainer.outerHeight(true));
                    topbar.data('absorbOffset', topbarContainer.offset().top);

                    if (!settings.adsorbed) {
                        self.adsorbed(topbar);

                        // Pad body when absorb (scrolled) or fixed.
                        self.add_custom_rule('.act-topbar-fixed { padding-top: ' + topbar.data('height') + 'px; }');
                    }
                }

            });

        },

        absorbable: function(topbarContainer, settings) {
            var absorb = topbarContainer.hasClass(settings.absorb_class);

            return settings.absorb_on && absorb;
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

            $(window).off('.topbar').on('resize.topbar', this.throttle(function() {
                self.resize.call(self);
            }, 50)).trigger('resize.topbar').load(function() {
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

                var absorbContainer = topbar.parent('.' + self.settings.absorb_class);
                var absorbOffset;

                if (self.absorbable(absorbContainer, settings)) {
                    if (absorbContainer.hasClass('fixed')) {
                        // Remove the fixed to allow for correct calculation of the offset.
                        absorbContainer.removeClass('fixed');

                        absorbOffset = absorbContainer.offset().top;
                        if ($(document.body).hasClass('act-topbar-fixed')) {
                            absorbOffset -= topbar.data('height');
                        }

                        topbar.data('absorbOffset', absorbOffset);
                        absorbContainer.addClass('fixed');
                    } else {
                        absorbOffset = absorbContainer.offset().top;
                        topbar.data('absorbOffset', absorbOffset);
                    }
                }

            });
        },

        adsorbed: function(topbar) {
            // check for absorb
            this.absorb();

            topbar.data(this.attr_name(true), $.extend({}, topbar.data(this.attr_name(true)), {
                adsorbed: true
            }));
        },

        // height: function(ul) {
        //     var total = 0,
        //         self = this;

        //     $('> li', ul).each(function() {
        //         total += $(this).outerHeight(true);
        //     });

        //     return total;
        // },

        absorb: function() {
            var self = this;

            $(window).on('scroll', function() {
                self.update_absorb_positioning();
            });
        },

        update_absorb_positioning: function() {
            var klass = '.' + this.settings.absorb_class,
                $window = $(window),
                self = this;

            if (self.settings.absorb_topbar && self.absorbable(this.settings.absorb_topbar.parent(), this.settings)) {
                console.log(1);
                var distance = this.settings.absorb_topbar.data('absorbOffset') + this.settings.start_offset;
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
