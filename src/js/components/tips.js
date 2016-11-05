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
            // show on init
            show: false,
            // extra class
            class: '',
            // relative positioning of element.
            relativeTo: document.body,
            // background overlay element.
            has_overlay: false,
            overlay_class: 'overlay'
        },

        effect: {
            pop: {
                in: 'slide-in-down',
                out: 'slide-out-up',
                speed: 'fast'
            },
            msg: {
                in: 'pulse',
                out: 'zoom-out',
                speed: 'faster'
            },
            slide: {
                in: 'slide-in-up',
                out: 'slide-out-down',
                speed: 'fast'
            },
            overlay: {
                in: 'fade-in',
                out: 'fade-out',
                speed: 'normal'
            }
        },

        init: function(scope, method, options) {
            this.bindings(method, options);
            this.settings.show && this.show();
        },

        events: function() {
            var self = this;
            var attr = 'data-' + this.name;
            $(this.scope)
                .off('click.' + this.name)
                .on('click.' + this.name, '[' + attr + ']', function(e) {
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

            if(this.settings.has_overlay) {
                var overlayTpl = '<div class="' + this.settings.overlay_class + ' animated"></div>';
                this.overlay = $(overlayTpl).appendTo(document.body);
            }
        },

        show: function(content, type) {
            content = content || this.settings.content;
            type = type || this.settings.type;

            clearTimeout(this.timer);
            this.destroy();
            this.create(content, type);

            // if(!this.element) this.create(content, type);
            // else {
            //     this.element
            //         .off('animationend webkitAnimationEnd')
            //         .find('.content')
            //             .html(content);

            //     if(this.overlay) this.overlay.off('animationend webkitAnimationEnd');
            // }

            if(type === 'pop' && this.settings.relativeTo) {
                this.element.css('top', $(this.settings.relativeTo).offset().top);
            }

            type = this.effect[type];
            this.element
                .show()
                .trigger('show.' + this.name)
                .find('.content')
                    .addClass(type.speed)
                    .removeClass(type.out)
                    .addClass(type.in);

            if(this.overlay) {
                this.overlay
                    .show()
                    .trigger('show.overlay')
                    .removeClass(this.effect.overlay.out)
                    .addClass(this.effect.overlay.in)
            }

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
                .trigger('hide.' + this.name)
                .find('.content')
                    .removeClass(type.in)
                    .addClass(type.out)
                    .one('animationend webkitAnimationEnd', function() {
                        self.destroy();
                    });
            if(this.overlay) {
                this.overlay
                    .trigger('hide.overlay')
                    .removeClass(this.effect.overlay.in)
                    .addClass(this.effect.overlay.out)
                    .one('animationend webkitAnimationEnd', function() {
                        $(this).remove();
                        self.overlay = null;
                    });
            }
        },

        destroy: function () {
            if(this.element) {
                this.element
                    .off('animationend webkitAnimationEnd')
                    .remove();
                this.element = null;
            }
            return this;
        },

        reflow: function() {}
    };
})(jQuery, window, window.document);
