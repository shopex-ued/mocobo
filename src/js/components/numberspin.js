(function($, window, document, undefined) {
    'use strict';

    Mobile.libs.numberspin = {
        name: 'numberspin',

        settings: {
            min: 0, // Minimum value.
            max: Number.MAX_VALUE, // Maximum value.
            step: 1, // Incremental/decremental step on up/down change.
            // defaultValue: null, // Applied when no correct value is set on the input with value attribute.
            autoInit: true, // Auto fill the input value with settings' 'defaultValue' or 'min'.
            // Execute this function before the input value change with return true or false.
            // beforeValid: $.noop,
            // show message when validate is error
            validMessage: {
                target: null,
                min: '不能小于{min}',
                max: '不能大于{max}',
                notnumber: '只能输入数字',
                show: {
                    display: 'block'
                },
                hide: {
                    display: 'none'
                }
            },
            // Execute after validate is error
            // validError: null,
            // Execute after validate is success
            // validSuccess: null
        },

        init: function(scope, method, options) {
            this.bindings(method, options);
        },

        events: function() {
            var self = this;
            $(this.scope)
                .off('.' + this.name)
                .on('touchstart.' + this.name, '[data-' + this.name + '] > button:not(:disabled)', function(e) {
                    e.preventDefault();

                    var target = $(this).parent('[data-' + self.name + ']');
                    var input = target.find('input[type=text], input[type=number]');
                    var value = +input.val();
                    var settings = self.getSettings(input, value, target);

                    if (typeof settings.beforeValidate !== 'function' || settings.beforeValidate(input)) {
                        value += $(this).hasClass('prefix') ? -settings.step : settings.step;
                        self.setValue(input, value, target, settings);
                    }
                })
                .on('focus.' + this.name, '[data-' + this.name + '] > input', function(e) {
                    // Make default value as a Number.
                    self.settings.defaultValue = +this.value;
                })
                .on('change.' + this.name, '[data-' + this.name + '] > input', function(e) {
                    var input = $(this);
                    var target = input.parent('[data-' + self.name + ']');
                    var settings = self.getSettings(input, self.settings.defaultValue, target);
                    if (typeof settings.beforeValidate !== 'function' || settings.beforeValidate($(this))) {
                        self.setValue($(this), +input.val(), target, settings);
                    }
                });

            if (this.settings.autoInit) {
                $(this.scope).find('[data-' + this.name + ']').each(function() {
                    var target = $(this);
                    var input = target.find('input');
                    var settings = self.getSettings(input, input.val(), target);
                    input.val(settings.defaultValue);
                    target.trigger('init.' + self.name, [input]);
                });
            }
        },

        getSettings: function(input, value, target) {
            var settings = target.data(this.name + '-init');
            return $.extend(settings, {
                min: +input.attr('min'),
                max: +input.attr('max'),
                step: +input.attr('step') || 1,
                defaultValue: value || input.attr('min') || this.settings.min
            });
        },

        setValue: function(input, value, target, settings) {
            if (this.validate(input, value, target, settings)) {
                input.val(value);
                settings.defaultValue = value;
                target.trigger('valuechange.' + this.name, [input]);
            }
        },

        validate: function(input, value, target, settings) {
            var msg = '';
            var result = false;
            var alertBox = target.next(settings.validMessage.target);
            alertBox = alertBox.length ? alertBox : $(settings.validMessage.target);

            if (value == settings.min) {
                target.trigger('min.' + this.name, [input]);
            } else if (value < settings.min) {
                value = settings.min;
                msg = settings.validMessage.min.replace('{min}', settings.min);
            } else if (value == settings.max) {
                target.trigger('max.' + this.name, [input]);
            } else if (value > settings.max) {
                value = settings.max;
                msg = settings.validMessage.max.replace('{max}', settings.max);
            } else if (!/^-?\d*$/.test(value)) {
                value = settings.defaultValue;
                target.trigger('notnumber.' + this.name, [input]);
                msg = settings.validMessage.notnumber;
            }
            if (msg) {
                if (typeof settings.validError === 'function') settings.validError(target, input, msg);
                else if(alertBox.length) alertBox.css(settings.validMessage.show).html(msg);
                else alert(msg);
                result = false;
            } else {
                if (typeof settings.validSuccess === 'function') settings.validSuccess(target, input);
                else if(alertBox.length) alertBox.css(settings.validMessage.hide);
                result = true;
            }
            return result;
        },

        reflow: function() {}
    };
})(jQuery, window, window.document);
