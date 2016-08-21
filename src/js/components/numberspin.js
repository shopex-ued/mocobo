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
                notnumber: '只能输入数字'
            },
            // Execute after validate is error
            validError: null,
            // Execute after validate is success
            validSuccess: null
        },

        init: function(scope, method, options) {
            this.bindings(method, options);
        },

        events: function() {
            var self = this;
            $(this.scope)
                .off('.numberspin')
                .on('touchstart.numberspin', '[' + this.attr_name() + '] > a', function(e) {
                    e.preventDefault();

                    var target = $(this).parent('[' + self.attr_name() + ']');
                    var input = target.find('input');
                    var value = +input.val();
                    var settings = self.getSettings(input, target, value);

                    if (typeof settings.beforeValidate !== 'function' || settings.beforeValidate(input)) {
                        value += $(this).hasClass('prefix') ? -settings.step : settings.step;
                        self.setNumber(target, input, value, settings);
                    }
                })
                .on('focus.numberspin', '[' + this.attr_name() + '] > input', function(e) {
                    // Make default value as a Number.
                    self.settings.defaultValue = +this.value;
                })
                .on('input.numberspin', '[' + this.attr_name() + '] > input', function(e) {
                    var input = $(this);
                    var target = input.parent('[' + self.attr_name() + ']');
                    var settings = self.getSettings(input, target, self.settings.defaultValue);
                    if (typeof settings.beforeValidate !== 'function' || settings.beforeValidate($(this))) {
                        self.setNumber(target, $(this), +input.val(), settings);
                    }
                });
            if (this.settings.autoInit) {
                $(this.scope).find('[' + this.attr_name() + ']').each(function() {
                    var target = $(this);
                    var input = target.find('input');
                    var settings = self.getSettings(input, target, input.val());
                    input.val(settings.defaultValue);
                });
            }
        },

        getSettings: function(input, target, value) {
            var settings = target.data(this.attr_name(true) + '-init');
            return $.extend(settings, {
                min: +input.attr('min'),
                max: +input.attr('max'),
                step: +input.attr('step') || 1,
                defaultValue: value || input.attr('min') || this.settings.min
            });
        },

        setNumber: function(target, input, value, settings) {
            this.validate(target, input, value, settings);
        },

        setValue: function(input, value) {
            this.settings.defaultValue = value;
            input.val(value).trigger('change.numberspin');
        },

        validate: function(element, input, value, settings) {
            var msg = '';
            var result = false;
            var alertBox = element.next(settings.validMessage.target);
            alertBox = alertBox.length ? alertBox : $(settings.validMessage.target);

            if (value < settings.min) {
                value = settings.min;
                input.trigger('min.numberspin');
                msg = settings.validMessage.min.replace('{min}', settings.min);
            } else if (value > settings.max) {
                value = settings.max;
                input.trigger('max.numberspin');
                msg = settings.validMessage.max.replace('{max}', settings.max);
            } else if (isNaN(value)) {
                value = settings.defaultValue;
                input.trigger('notnumber.numberspin');
                msg = settings.validMessage.notnumber;
            }
            if (msg) {
                if (typeof settings.validError === 'function') settings.validError(element, input, msg);
                else if(alertBox.length) alertBox.show().html(msg);
                else alert(msg);
            } else {
                if (typeof settings.validSuccess === 'function') settings.validSuccess(element, input);
                else if(alertBox.length) alertBox.hide();
                result = true;
            }
            this.setValue(input, value);
            return result;
        },

        reflow: function() {}
    };
})(jQuery, window, window.document);