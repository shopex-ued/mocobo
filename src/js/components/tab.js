(function($, window, document, undefined) {
    'use strict';

    Mobile.libs.tab = {
        name: 'tab',

        settings: {
            active_class: 'active',
            content_class: 'tabs-content',
            panel_class: 'content',
            callback: function() {},
            deep_linking: false,
            scroll_to_content: true,
            is_hover: false
        },

        default_tab_hashes: [],

        init: function(scope, method, options) {
            var self = this;

            // Store the default active tabs which will be referenced when the
            // location hash is absent, as in the case of navigating the tabs and
            // returning to the first viewing via the browser Back button.
            $('[' + this.attr_name() + '] > .active > a', this.scope).each(function() {
                self.default_tab_hashes.push(this.hash);
            });

            // store the initial href, which is used to allow correct behaviour of the
            // browser back button when deep linking is turned on.
            this.entry_location = window.location.href;

            this.bindings(method, options);
            this.handle_location_hash_change();
        },

        events: function() {
            var self = this;

            var usual_tab_behavior = function(e, target) {
                var settings = $(target).closest('[' + self.attr_name() + ']').data(self.attr_name(true) + '-init');
                if (!settings.is_hover || 'ontouchstart' in document) {
                    e.preventDefault();
                    e.stopPropagation();
                    self.toggle_active_tab($(target).parent());
                }
            };

            $(this.scope)
                .off('.tab')
                // Click event: tab title
                .on('click.tab', '[' + this.attr_name() + '] > * > a', function(e) {
                    var el = this;
                    usual_tab_behavior(e, el);
                });

            // Location hash change event
            $(window).on('hashchange.tab', function(e) {
                e.preventDefault();
                self.handle_location_hash_change();
            });
        },

        handle_location_hash_change: function() {

            var self = this;

            $('[' + this.attr_name() + ']', this.scope).each(function() {
                var settings = $(this).data(self.attr_name(true) + '-init');
                if (settings.deep_linking) {
                    // Match the location hash to a label
                    var hash;
                    if (settings.scroll_to_content) {
                        hash = self.scope.location.hash;
                    } else {
                        // prefix the hash to prevent anchor scrolling
                        hash = self.scope.location.hash.replace('mob-', '');
                    }
                    if (hash != '') {
                        // Check whether the location hash references a tab content div or
                        // another element on the page (inside or outside the tab content div)
                        var hash_element = $(hash);
                        if (hash_element.hasClass(settings.panel_class) && hash_element.parent().hasClass(settings.content_class)) {
                            // Tab content div
                            self.toggle_active_tab($('[' + self.attr_name() + '] > * > a[href=' + hash + ']').parent());
                        } else {
                            // Not the tab content div. If inside the tab content, find the
                            // containing tab and toggle it as active.
                            var hash_tab_container_id = hash_element.closest('.' + settings.panel_class).attr('id');
                            if (hash_tab_container_id != undefined) {
                                self.toggle_active_tab($('[' + self.attr_name() + '] > * > a[href=#' + hash_tab_container_id + ']').parent(), hash);
                            }
                        }
                    } else {
                        // Reference the default tab hashes which were initialized in the init function
                        for (var ind = 0; ind < self.default_tab_hashes.length; ind++) {
                            self.toggle_active_tab($('[' + self.attr_name() + '] > * > a[href=' + self.default_tab_hashes[ind] + ']').parent());
                        }
                    }
                }
            });
        },

        toggle_active_tab: function(tab, location_hash) {
            var self = this,
                tabs = tab.closest('[' + this.attr_name() + ']'),
                tab_link = tab.find('a'),
                anchor = tab.children('a').first(),
                target_hash = '#' + anchor.attr('href').split('#')[1],
                target = $(target_hash),
                siblings = tab.siblings(),
                settings = tabs.data(this.attr_name(true) + '-init'),
                go_to_hash = function(hash) {
                    // This function allows correct behaviour of the browser's back button when deep linking is enabled. Without it
                    // the user would get continually redirected to the default hash.
                    var is_entry_location = window.location.href === self.entry_location,
                        default_hash = settings.scroll_to_content ? self.default_tab_hashes[0] : is_entry_location ? window.location.hash : 'mob-' + self.default_tab_hashes[0].replace('#', '')

                    if (!(is_entry_location && hash === default_hash)) {
                        window.location.hash = hash;
                    }
                };

            // allow usage of data-tab-content attribute instead of href
            if (anchor.data('tab-content')) {
                target_hash = '#' + anchor.data('tab-content').split('#')[1];
                target = $(target_hash);
            }

            if (settings.deep_linking) {

                if (settings.scroll_to_content) {

                    // retain current hash to scroll to content
                    go_to_hash(location_hash || target_hash);

                    if (location_hash == undefined || location_hash == target_hash) {
                        tab.parent()[0].scrollIntoView();
                    } else {
                        $(target_hash)[0].scrollIntoView();
                    }
                } else {
                    // prefix the hashes so that the browser doesn't scroll down
                    if (location_hash != undefined) {
                        go_to_hash('mob-' + location_hash.replace('#', ''));
                    } else {
                        go_to_hash('mob-' + target_hash.replace('#', ''));
                    }
                }
            }

            // WARNING: The activation and deactivation of the tab content must
            // occur after the deep linking in order to properly refresh the browser window.
            // Clean up multiple attr instances to done once
            tab.addClass(settings.active_class).triggerHandler('opened');
            tab_link.attr('aria-selected', 'true');
            siblings.removeClass(settings.active_class);
            siblings.find('a').attr('aria-selected', 'false');
            target.siblings().removeClass(settings.active_class).attr('aria-hidden', 'true');
            target.addClass(settings.active_class).attr('aria-hidden', 'false');
            settings.callback(tab);
            target.triggerHandler('toggled', [target]);
            tabs.triggerHandler('toggled', [tab]);
        },

        off: function() {},

        reflow: function() {}
    };
}(jQuery, window, window.document));
