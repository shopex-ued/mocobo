(function($, window, document, undefined) {
    'use strict';

    Mobile.libs.equalizer = {
        name: 'equalizer',

        settings: {
            use_tallest: true,
            beforeChange: $.noop,
            afterChange: $.noop,
            equalize_on_stack: false,
            act_on_hidden: false
        },

        init: function(scope, method, options) {
            this.bindings(method, options);
            this.reflow();
        },

        events: function() {
            $(window).off('.equalizer').on('resize.equalizer', function(e) {
                this.reflow();
            }.bind(this));
        },

        equalize: function(equalizer) {
            var isStacked = false,
                equalizer = $(equalizer),
                group = equalizer.data('equalizer'),
                settings = equalizer.data(this.attr_name(true) + '-init') || this.settings,
                vals,
                firstTopOffset;

            if (settings.act_on_hidden) {
                vals = group ? equalizer.find('[' + this.attr_name() + '-watch="' + group + '"]') : equalizer.find('[' + this.attr_name() + '-watch]');
            } else {
                vals = group ? equalizer.find('[' + this.attr_name() + '-watch="' + group + '"]:visible') : equalizer.find('[' + this.attr_name() + '-watch]:visible');
            }

            if (vals.length === 0) {
                return;
            }

            settings.beforeChange();
            equalizer.trigger('beforeChange.equalizer');
            vals.height('inherit');

            if (settings.equalize_on_stack === false) {
                firstTopOffset = vals.first().offset().top;
                vals.each(function() {
                    if ($(this).offset().top !== firstTopOffset) {
                        isStacked = true;
                        return false;
                    }
                });
                if (isStacked) {
                    return;
                }
            }

            var heights = vals.map(function() {
                return $(this).outerHeight(false);
            }).get();

            if (settings.use_tallest) {
                var max = Math.max.apply(null, heights);
                vals.css('height', max);
            } else {
                var min = Math.min.apply(null, heights);
                vals.css('height', min);
            }

            settings.afterChange();
            equalizer.trigger('afterChange.equalizer');
        },

        reflow: function() {
            var self = this;

            $('[' + this.attr_name() + ']', this.scope).each(function() {
                self.equalize(this);
            });
        }
    };
})(jQuery, window, window.document);
