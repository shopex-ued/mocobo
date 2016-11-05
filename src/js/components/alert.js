(function($, window, document, undefined) {
    'use strict';

    Mobile.libs.alert = {
        name: 'alert',

        settings: {
            callback: function() {}
        },

        init: function(scope, method, options) {
            this.bindings(method, options);
        },

        events: function() {
            var self = this;

            $(this.scope).off('.' + this.name).on('click.' + this.name, '[data-' + this.name + '] .close', function(e) {
                var container = $(this).closest('[data-' + self.name + ']'),
                    settings = container.data(self.name + '-init') || self.settings;

                e.preventDefault();

                container
                    .addClass(this.name + '-close')
                    .on('transitionend webkitTransitionEnd', function(e) {
                        $(this).trigger('close.' + this.name).remove();
                        settings.callback();
                    });
            });
        },

        reflow: function() {}
    };
}(jQuery, window, window.document));
