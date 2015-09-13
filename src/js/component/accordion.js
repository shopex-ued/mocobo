(function($, window, document, undefined) {
    'use strict';

    Mobile.libs.accordion = {
        name: 'accordion',

        settings: {
            content_class: 'content',
            active_class: 'active',
            multi_expand: false,
            toggleable: true,
            callback: function() {}
        },

        init: function(scope, method, options) {
            this.bindings(method, options);
        },

        events: function(instance) {
            var self = this;
            var S = this.S;
            self.create($(instance));

            $(this.scope)
                .off('.accordion')
                .on('click.accordion', '[' + this.attr_name() + '] > .item > a', function(e) {
                    e.preventDefault();

                    var accordion = $(this).closest('[' + self.attr_name() + ']'),
                        groupSelector = self.attr_name() + '=' + accordion.attr(self.attr_name()),
                        settings = accordion.data(self.attr_name(true) + '-init') || self.settings,
                        target = $('#' + this.href.split('#')[1]).parent(),
                        items = $('> .item', accordion),
                        active_item;

                    if (accordion.attr(self.attr_name())) {
                        items = items.add('[' + groupSelector + '] > .item');
                    }
                    active_item = items.filter('.' + settings.active_class);

                    if (settings.toggleable && target.hasClass(settings.active_class)) {
                        target.toggleClass(settings.active_class, false);
                        $(this).attr('aria-expanded', function(i, attr) {
                            return attr === 'true' ? 'false' : 'true';
                        });
                        settings.callback(target);
                        target.triggerHandler('toggled', [accordion]);
                        accordion.triggerHandler('toggled', [target]);
                        return;
                    }

                    if (!settings.multi_expand) {
                        active_item
                            .removeClass(settings.active_class)
                            .children('a')
                                .attr('aria-expanded', 'false');
                    }

                    target.addClass(settings.active_class);
                    $(this).attr('aria-expanded', 'true');
                    settings.callback(target);
                    target.triggerHandler('toggled', [accordion]);
                    accordion.triggerHandler('toggled', [target]);
                });
        },

        create: function($instance) {
            var self = this,
                accordion = $instance,
                items = $('> .item', accordion),
                settings = accordion.data(self.attr_name(true) + '-init') || self.settings;

            items
                .children('a')
                    .attr('aria-expanded', 'false')
                .end()
                .filter('.' + settings.active_class).children('a')
                    .attr('aria-expanded', 'true');

            if (settings.multi_expand) {
                $instance.attr('aria-multiselectable', 'true');
            }
        },

        off: function() {},

        reflow: function() {}
    };
}(jQuery, window, window.document));
