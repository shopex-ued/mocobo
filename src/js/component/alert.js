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

            $(this.scope).off('.alert').on('click.alert', '[' + this.attr_name() + '] .close', function(e) {
                var alertBox = $(this).closest('[' + self.attr_name() + ']'),
                    settings = alertBox.data(self.attr_name(true) + '-init') || self.settings;

                e.preventDefault();
                alertBox.addClass('alert-close');
                alertBox.on('transitionend webkitTransitionEnd', function(e) {
                    $(this).trigger('close.alert').remove();
                    settings.callback();
                });
            });
        },

        reflow: function() {}
    };
}(jQuery, window, window.document));
