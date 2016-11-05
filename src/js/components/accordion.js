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
            this.create($(instance));

            $(this.scope)
                .off('.' + this.name)
                .on('click.' + this.name, '[data-' + this.name + '] > .item > a', function(e) {
                    e.preventDefault();

                    var container = $(this).closest('[data-' + self.name + ']'),
                        groupSelector = 'data-' + self.name + '=' + container.data(self.name),
                        settings = container.data(self.name + '-init') || self.settings,
                        // target = $('#' + this.href.split('#')[1]).parent(),
                        contentAttr = $(this).context.attributes['data-content'],
                        target = $('#' + (contentAttr ? contentAttr.value : this.href.split('#')[1])).parent(),
                        items = $('> .item', container),
                        active_item;

                    if (container.data(self.name)) {
                        items = items.add('[' + groupSelector + '] > .item');
                    }
                    active_item = items.filter('.' + settings.active_class);

                    if (settings.toggleable && target.hasClass(settings.active_class)) {
                        target.toggleClass(settings.active_class, false);
                        $(this).attr('aria-expanded', function(i, attr) {
                            return attr === 'true' ? 'false' : 'true';
                        });
                        settings.callback(target);
                        target.triggerHandler('toggled', [container]);
                        container.triggerHandler('toggled', [target]);
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
                    target.triggerHandler('toggled', [container]);
                    container.triggerHandler('toggled', [target]);
                });
        },

        create: function(container) {
            var items = $('> .item', container),
                settings = container.data(this.name + '-init') || this.settings;

            items
                .children('a')
                    .attr('aria-expanded', 'false')
                .end()
                .filter('.' + settings.active_class).children('a')
                    .attr('aria-expanded', 'true');

            if (settings.multi_expand) {
                container.attr('aria-multiselectable', 'true');
            }
        },

        off: function() {},

        reflow: function() {}
    };
}(jQuery, window, window.document));
