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
            $(window).off('.' + this.name).on('resize.' + this.name, function(e) {
                this.reflow();
            }.bind(this));
        },

        equalize: function(container) {
            var isStacked = false,
                container = $(container),
                group = container.data(this.name),
                settings = container.data(this.name + '-init') || this.settings,
                vals,
                firstTopOffset;

            if (settings.act_on_hidden) {
                vals = group ? container.find('[data-' + this.name + '-watch="' + group + '"]') : container.find('[data-' + this.name + '-watch]');
            } else {
                vals = group ? container.find('[data-' + this.name + '-watch="' + group + '"]:visible') : container.find('[data-' + this.name + '-watch]:visible');
            }

            if (vals.length === 0) {
                return;
            }

            settings.beforeChange();
            container.trigger('beforeChange.' + this.name);
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
            container.trigger('afterChange.' + this.name);
        },

        reflow: function() {
            var self = this;

            $('[data-' + this.name + ']', this.scope).each(function() {
                self.equalize(this);
            });
        }
    };
})(jQuery, window, window.document);
