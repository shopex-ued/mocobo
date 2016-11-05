(function($, window, document, undefined) {
    'use strict';

    Mobile.libs.offcanvas = {
        name: 'offcanvas',

        settings: {
            open_method: 'move',
            close_on_click: false
        },

        init: function(scope, method, options) {
            this.bindings(method, options);
        },

        events: function() {
            var self = this,
                move_class = '',
                right_postfix = '',
                left_postfix = '',
                settings = this.settings;

            if (settings.open_method === 'move') {
                move_class = 'move-';
                right_postfix = 'right';
                left_postfix = 'left';
            } else if (settings.open_method === 'overlap_single') {
                move_class = 'overlap-';
                right_postfix = 'right';
                left_postfix = 'left';
            } else if (settings.open_method === 'overlap') {
                move_class = 'overlap';
            }

            $(this.scope)
                .off('.' + this.name)
                .on('click.' + this.name, '[data-' + this.name + '] .left-offcanvas-toggle', function(e) {
                    // var settings = self.get_settings(e);
                    var $off_canvas = self.get_wrapper(e);
                    self.click_toggle_class(e, move_class + right_postfix);
                    if (settings.open_method !== 'overlap') {
                        $off_canvas.find('.left.offcanvas-submenu').removeClass(move_class + right_postfix);
                    }
                    $(this).attr('aria-expanded', 'true');
                })
                .on('click.' + this.name, '[data-' + this.name + '] .left.offcanvas-menu a', function(e) {
                    var settings = self.get_settings(e);
                    var parent = $(this).parent('li');
                    var $off_canvas = self.get_wrapper(e);

                    if (settings.close_on_click && !parent.hasClass('has-submenu') && !parent.hasClass('back')) {
                        self.hide.call(self, move_class + right_postfix, self.get_wrapper(e));
                        parent.parent().removeClass(move_class + right_postfix);
                    } else if (parent.hasClass('has-submenu')) {
                        e.preventDefault();
                        $(this).siblings('.left.offcanvas-submenu').toggleClass(move_class + right_postfix);
                    } else if (parent.hasClass('back')) {
                        e.preventDefault();
                        parent.parent().removeClass(move_class + right_postfix);
                    }
                    $off_canvas.find('.left-offcanvas-toggle').attr('aria-expanded', 'true');
                })
                //end of left canvas
                .on('click.' + this.name, '[data-' + this.name + '] .right-offcanvas-toggle', function(e) {
                    // var settings = self.get_settings(e);
                    var $off_canvas = self.get_wrapper(e);
                    self.click_toggle_class(e, move_class + left_postfix);
                    if (settings.open_method !== 'overlap') {
                        $off_canvas.find('.right.offcanvas-submenu').removeClass(move_class + left_postfix);
                    }
                    $(this).attr('aria-expanded', 'true');
                })
                .on('click.' + this.name, '[data-' + this.name + '] .right.offcanvas-menu a', function(e) {
                    var settings = self.get_settings(e);
                    var parent = $(this).parent('li');
                    var $off_canvas = self.get_wrapper(e);

                    if (settings.close_on_click && !parent.hasClass('has-submenu') && !parent.hasClass('back')) {
                        self.hide.call(self, move_class + left_postfix, self.get_wrapper(e));
                        parent.parent().removeClass(move_class + left_postfix);
                    } else if (parent.hasClass('has-submenu')) {
                        e.preventDefault();
                        $(this).siblings('.right.offcanvas-submenu').toggleClass(move_class + left_postfix);
                    } else if (parent.hasClass('back')) {
                        e.preventDefault();
                        parent.parent().removeClass(move_class + left_postfix);
                    }
                    $off_canvas.find('.right-offcanvas-toggle').attr('aria-expanded', 'true');
                })
                //end of right canvas
                .on('click.' + this.name, '[data-' + this.name + '] .exit-offcanvas', function(e) {
                    var $off_canvas = self.get_wrapper(e);
                    self.click_remove_class(e, move_class + left_postfix);
                    $off_canvas.find('.right.offcanvas-submenu').removeClass(move_class + left_postfix);
                    if (right_postfix) {
                        self.click_remove_class(e, move_class + right_postfix);
                        $off_canvas.find('.left.offcanvas-submenu').removeClass(move_class + left_postfix);
                    }
                    $off_canvas.find('.right-offcanvas-toggle').attr('aria-expanded', 'true');
                })
                .on('click.' + this.name, '[data-' + this.name + '] .exit-offcanvas', function(e) {
                    var $off_canvas = self.get_wrapper(e);
                    self.click_remove_class(e, move_class + left_postfix);
                    $off_canvas.find('.left-offcanvas-toggle').attr('aria-expanded', 'false');
                    if (right_postfix) {
                        self.click_remove_class(e, move_class + right_postfix);
                        $off_canvas.find('.right-offcanvas-toggle').attr('aria-expanded', 'false');
                    }
                });
        },

        toggle: function(class_name, $off_canvas) {
            if ($off_canvas.hasClass(class_name)) {
                this.hide(class_name, $off_canvas);
            } else {
                this.show(class_name, $off_canvas);
            }
        },

        show: function(class_name, $off_canvas) {
            $off_canvas.trigger('open.' + this.name);
            $off_canvas.addClass(class_name);
            if(this.settings.open_method !== 'move') {
                $off_canvas.find('.offcanvas-menu').addClass('no-transform');
            }
        },

        hide: function(class_name, $off_canvas) {
            $off_canvas.trigger('close.' + this.name);
            $off_canvas.removeClass(class_name);
            if(this.settings.open_method !== 'move') {
                $off_canvas.find('.no-transform').removeClass('no-transform');
            }
        },

        click_toggle_class: function(e, class_name) {
            e.preventDefault();
            var $off_canvas = this.get_wrapper(e);
            this.toggle(class_name, $off_canvas);
        },

        click_remove_class: function(e, class_name) {
            e.preventDefault();
            var $off_canvas = this.get_wrapper(e);
            this.hide(class_name, $off_canvas);
        },

        get_settings: function(e) {
            var container = $(e.target).closest('[data-' + this.name + ']');
            return container.data(this.name + '-init') || this.settings;
        },

        get_wrapper: function(e) {
            var $off_canvas = $(e ? e.target : this.scope).closest('.offcanvas-wrap');

            if ($off_canvas.length === 0) {
                $off_canvas = $('.offcanvas-wrap');
            }

            return $off_canvas;
        },

        reflow: function() {}
    };
}(jQuery, window, window.document));
