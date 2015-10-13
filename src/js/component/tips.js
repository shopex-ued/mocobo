(function($, window, document, undefined) {
    'use strict';

    Mobile.libs.tips = {
        name: 'tips',

        settings: {
            // to display the massage text and so on
            content: '',
            // disappear after how many milliseconds.
            delay: 3000,
            // controll the tips' style.
            type: 'pop',
            // extra class
            class: '',
            // relative positioning of element.
            relativeTo: document.body
        },

        effect: {
            pop: {
                in: 'slide-in-down',
                out: 'slide-out-up'
            },
            msg: {
                in: 'fade-in',
                out: 'fade-out'
            }
        },

        init: function(scope, method, options) {
            this.bindings(method, options);
            // this.show();
        },

        events: function() {
            var self = this;
            var attr = this.attr_name();
            $(this.scope)
                .on('click.tips', '[' + attr + ']', function(e) {
                    e.preventDefault();

                    var content = $(this).attr(attr + '-content');
                    var type = $(this).attr(attr);

                    self.show(content, type);
                });
        },

        create: function(content, type) {
            var tipTpl = '<div class="' + type + 'tip ' + this.settings.class + '">' +
                '<div class="content animated">' +
                content +
                '</div>' +
            '</div>';
            this.element = $(tipTpl).appendTo(document.body);
        },

        show: function(content, type) {
            content = content || this.settings.content;
            type = type || this.settings.type;

            clearTimeout(this.timer);
            if(!this.element) this.create(content, type);
            else this.element
                .off('animationend webkitAnimationEnd')
                .find('.content')
                    .html(content);

            if(type === 'pop' && this.settings.relativeTo) {
                this.element.css('top', $(this.settings.relativeTo).offset().top);
            }
            else {
                this.element.css('top', '');
            }

            type = this.effect[type];
            this.element
                .trigger('show.tips')
                .find('.content')
                    .removeClass(type.out)
                    .addClass(type.in);

            if (this.settings.delay) {
                this.timer = setTimeout($.proxy(function() {
                    this.hide(type);
                }, this), this.settings.delay);
            }
        },

        hide: function(type) {
            var self = this;
            type = type || this.effect[this.settings.type];

            this.element
                .trigger('hide.tips')
                .find('.content')
                    .removeClass(type.in)
                    .addClass(type.out)
                    .one('animationend webkitAnimationEnd', function() {
                        $(this).parent().remove();
                        self.element = null;
                    });
        },

        reflow: function() {}
    };
})(jQuery, window, window.document);
