(function($, window, document, undefined) {
    'use strict';

    Mobile.libs.validator = {
        name: 'validator',

        settings: {
            validate_on: 'change', // change (when input value changes), blur (when input blur), manual (when call custom events)
            // ignore validate with 'exception' setting
            exception: ':hidden, [data-validator-ignore]',
            focus_on_invalid: true, // automatically bring the focus to an invalid input field
            error_labels: true, // labels with a for="inputId" will receive an `error` class
            error_class: 'has-error', // labels with a for="inputId" will receive an `error` class
            alert_element: '.alert-box',
            // the amount of time Validator will take before it validates the form (in ms).
            // smaller time will result in faster validation
            timeout: 1000,
            patterns: {
                alpha: /^[a-zA-Z]+$/,
                alphanum: /^[a-zA-Z0-9]+$/,
                int: /^[-+]?\d+$/,
                number: /^[-+]?\d*(?:[\.\,]\d+)?$/,
                // http://www.whatwg.org/specs/web-apps/current-work/multipage/states-of-the-type-attribute.html#valid-e-mail-address
                email: /^[a-zA-Z0-9.!#$%&'*+\/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/,
                // http://blogs.lse.ac.uk/lti/2008/04/23/a-regular-expression-to-match-any-url/
                url: /^(https?|ftp|file|ssh):\/\/([-;:&=\+\$,\w]+@{1})?([-A-Za-z0-9\.]+)+:?(\d+)?((\/[-\+~%\/\.\w]+)?\??([-\+=&;%@\.\w]+)?#?([\w]+)?)?/,
                // abc.de
                domain: /^([a-zA-Z0-9]([a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,8}$/,
                datetime: /^([0-2][0-9]{3})\-([0-1][0-9])\-([0-3][0-9])\s([0-5][0-9])\:([0-5][0-9])\:([0-5][0-9])([\-\+]([0-1][0-9])\:00)?$/,
                // YYYY-MM-DD
                date: /(?:19|20)[0-9]{2}[-\/.](?:(?:0[1-9]|1[0-2])[-\/.](?:0[1-9]|1[0-9]|2[0-9])|(?:(?!02)(?:0[1-9]|1[0-2])[-\/.](?:30))|(?:(?:0[13578]|1[02])[-\/.]31))$/,
                // HH:MM:SS
                time: /^(0[0-9]|1[0-9]|2[0-3])(:[0-5][0-9]){2}$/,
                // #FFF or #FFFFFF
                color: /^#?([a-fA-F0-9]{6}|[a-fA-F0-9]{3})$/,
                mobile: /^0?1[3-8]\d{9}$/
            },
            verifiers: {
                equalto: function(el, required, parent) {
                    var from = document.getElementById(el.getAttribute(this.add_namespace('data-equalto'))).value,
                        to = el.value,
                        valid = (from === to);

                    return valid;
                },
                oneof: function(el, required, parent) {
                    var els = document.querySelectorAll(el.getAttribute(this.add_namespace('data-oneof')));
                    return this.valid_oneof(els, required, parent);
                }
            },
            alerts: {
                required: '请输入/选择{placeholder}！',
                alpha: '请填写英文字母！',
                alphanum: '请填写英文字母或数字！',
                int: '请填写整数！',
                number: '请填写数值！',
                email: '请填写正确的邮箱地址！',
                url: '请填写正确的 URL 地址！',
                domain: '请填写正确的域名！',
                datetime: '请填写正确的日期和时间格式！',
                date: '请填写正确的日期！',
                time: '请填写正确的时间！',
                color: '请填写正确的颜色格式！',
                mobile: '手机号码格式错误，请重新填写！'
            }
        },

        timer: null,

        init: function(scope, method, options) {
            this.bindings(method, options);
        },

        events: function(scope) {
            var self = this,
                form = $(scope).attr('novalidate', 'novalidate'),
                settings = form.data(this.attr_name(true) + '-init') || {};

            this.invalid_attr = this.add_namespace('data-invalid');

            function validate(originalSelf, e) {
                clearTimeout(self.timer);
                self.timer = setTimeout(function() {
                    self.validate([originalSelf], e);
                }.bind(originalSelf), settings.timeout);
            }


            form
                .off('.validator')
                .on('submit.validator', function(e) {
                    var is_ajax = $(this).attr(self.attr_name()) === 'ajax';
                    return self.validate($(this).find('input, textarea, select, [data-validator-verifier]').not(settings.exception).get(), e, is_ajax);
                })
                .on('validate.validator', function(e) {
                    if (settings.validate_on === 'manual') {
                        self.validate([e.target], e);
                    }
                })
                .on('reset', function(e) {
                    return self.reset($(this), e);
                })
                .find('input, textarea, select').not(settings.exception)
                .off('.validator')
                .on('blur.validator', function(e) {
                    var id = this.getAttribute('id'),
                        eqTo = form.find('[data-equalto="' + id + '"]');
                    // checks if there is an equalTo equivalent related by id
                    if (typeof eqTo[0] !== "undefined" && eqTo.val().length) {
                        validate(eqTo[0], e);
                    }

                    if (settings.validate_on === 'blur') {
                        validate(this, e);
                    }
                })
                .on('change.validator', function(e) {
                    var id = this.getAttribute('id'),
                        eqTo = form.find('[data-equalto="' + id + '"]');
                    // checks if there is an equalTo equivalent related by id
                    if (typeof eqTo[0] !== "undefined" && eqTo.val().length) {
                        validate(eqTo[0], e);
                    }

                    if (settings.validate_on === 'change') {
                        validate(this, e);
                    }
                })
                .on('focus', function(e) {
                    if (navigator.userAgent.match(/iPad|iPhone|Android|BlackBerry|Windows Phone|webOS/i)) {
                        $('html, body').animate({
                            scrollTop: $(e.target).offset().top
                        }, 100);
                    }
                });
        },

        reset: function(form, e) {
            form.removeAttr(this.invalid_attr);
            var settings = form.data(this.attr_name(true) + '-init') || {};

            $('[' + this.invalid_attr + ']', form).removeAttr(this.invalid_attr);
            $('.' + settings.error_class, form).not(settings.alert_element).removeClass(settings.error_class);
            $(':input', form).not(':button, :submit, :reset,' + settings.exception).val('').removeAttr(this.invalid_attr);
        },

        validate: function(els, e, is_ajax) {
            var validations = this.parse_patterns(els),
                validation_count = validations.length,
                form = $(els[0]).closest('form'),
                submit_event = /submit/.test(e.type);

            // Has to count up to make sure the focus gets applied to the top error
            for (var i = 0; i < validation_count; i++) {
                if (!validations[i] && (submit_event || is_ajax)) {
                    if (this.settings.focus_on_invalid) {
                        els[i].focus();
                    }
                    form.trigger('invalid.validator');
                    $(els[i]).closest('form').attr(this.invalid_attr, '');
                    return false;
                }
            }

            if (submit_event || is_ajax) {
                form.trigger('valid.validator');
            }

            form.removeAttr(this.invalid_attr);

            if (is_ajax) {
                return false;
            }

            return true;
        },

        parse_patterns: function(els) {
            var i = els.length,
                el_patterns = [];

            while (i--) {
                el_patterns.push(this.pattern(els[i]));
            }

            return this.check_validation(el_patterns);
        },

        pattern: function(el) {
            var type = el.getAttribute('type'),
                required = typeof el.getAttribute('required') === 'string';

            var pattern = el.getAttribute('pattern') || '';

            if (this.settings.patterns.hasOwnProperty(pattern) && pattern.length > 0) {
                return [el, pattern, this.settings.patterns[pattern], required];
            } else if (pattern.length > 0) {
                return [el, null, new RegExp(pattern), required];
            }

            if (this.settings.patterns.hasOwnProperty(type)) {
                return [el, type, this.settings.patterns[type], required];
            }

            pattern = /.*/;

            return [el, 'required', pattern, required];
        },

        // TODO: Break this up into smaller methods, getting hard to read.
        check_validation: function(el_patterns) {
            var i = el_patterns.length,
                validations = [],
                form = $(el_patterns[0][0]).closest('[data-' + this.attr_name(true) + ']'),
                settings = form.data(this.attr_name(true) + '-init') || {};
            while (i--) {
                var el = el_patterns[i][0],
                    required = el_patterns[i][3],
                    value = el.value.trim(),
                    direct_parent = $(el).parent(),
                    verifier = el.getAttribute(this.add_namespace('data-validator-verifier')),
                    is_radio = el.type === 'radio',
                    is_checkbox = el.type === 'checkbox',
                    label = $('label[for="' + el.getAttribute('id') + '"]'),
                    valid_length = (required) ? (el.value.length > 0) : true,
                    el_validations = [];

                var parent, valid;

                // support old way to do equalTo validations
                if (el.getAttribute(this.add_namespace('data-equalto'))) {
                    verifier = 'equalto';
                }
                if (el.getAttribute(this.add_namespace('data-oneof'))) {
                    verifier = 'oneof';
                }

                if (!direct_parent.is('label')) {
                    parent = direct_parent;
                } else {
                    parent = direct_parent.parent();
                }

                if (is_radio && required) {
                    el_validations.push(this.valid_radio(el, required));
                } else if (is_checkbox && required) {
                    el_validations.push(this.valid_checkbox(el, required));

                } else if (verifier) {
                    // Validate using each of the specified (space-delimited) verifiers.
                    var verifiers = verifier.split(' ');
                    var last_valid = true,
                        all_valid = true;
                    for (var iv = 0; iv < verifiers.length; iv++) {
                        valid = this.settings.verifiers[verifiers[iv]].apply(this, [el, required, parent])
                        el_validations.push(valid);
                        all_valid = valid && last_valid;
                        last_valid = valid;
                    }
                    if (all_valid) {
                        $(el).removeAttr(this.invalid_attr);
                        parent.removeClass(this.settings.error_class);
                        if (label.length > 0 && this.settings.error_labels) {
                            label.removeClass(this.settings.error_class).removeAttr('role');
                        }
                        $(el).triggerHandler('valid');
                    } else {
                        $(el).attr(this.invalid_attr, '');
                        parent.addClass(this.settings.error_class);
                        if (label.length > 0 && this.settings.error_labels) {
                            label.addClass(this.settings.error_class).attr('role', 'alert');
                        }
                        $(el).triggerHandler('invalid');
                    }
                } else {
                    if (el_patterns[i][2].test(value) && valid_length ||
                        !required && el.value.length < 1 || $(el).prop('disabled')) {
                        el_validations.push(true);
                    } else {
                        el_validations.push(false);
                    }

                    el_validations = [el_validations.every(function(valid) {
                        return valid;
                    })];
                    if (el_validations[0]) {
                        $(el).removeAttr(this.invalid_attr);
                        el.setAttribute('aria-invalid', 'false');
                        el.removeAttribute('aria-describedby');
                        parent.removeClass(this.settings.error_class);
                        if (label.length > 0 && this.settings.error_labels) {
                            label.removeClass(this.settings.error_class).removeAttr('role');
                        }
                        $(el).triggerHandler('valid');
                    } else {
                        $(el).attr(this.invalid_attr, '');
                        el.setAttribute('aria-invalid', 'true');

                        // Try to find the error associated with the input
                        var errorElem = parent.find(this.settings.alert_element);
                        var type = this.settings.alerts[el_patterns[i][1]];
                        var msg = el_patterns[i][0].dataset.alerts;
                        if(!msg) {
                            if (type) {
                                msg = type.replace('{placeholder}', label.text() || el_patterns[i][0].placeholder || '有一项');
                            } else {
                                msg = '输入不符合要求，请检查！';
                            }
                        }

                        if (!errorElem.length) {
                            alert(msg);
                            $(el).triggerHandler('invalid');
                            validations = validations.concat(el_validations);
                            break;
                        } else {
                            // errorElem.html(msg);
                            var errorID = errorElem[0].id || '';
                            if (errorID.length > 0) {
                                el.setAttribute('aria-describedby', errorID);
                            }
                        }

                        // el.setAttribute('aria-describedby', $(el).find('.error')[0].id);
                        parent.addClass(this.settings.error_class);
                        if (label.length > 0 && this.settings.error_labels) {
                            label.addClass(this.settings.error_class).attr('role', 'alert');
                        }
                        $(el).triggerHandler('invalid');
                    }
                }
                validations = validations.concat(el_validations);
            }

            return validations;
        },

        valid_checkbox: function(el, required) {
            var el = $(el),
                valid = (el.is(':checked') || !required || el.get(0).getAttribute('disabled'));

            if (valid) {
                el.removeAttr(this.invalid_attr).parent().removeClass(this.settings.error_class);
                $(el).triggerHandler('valid');
            } else {
                el.attr(this.invalid_attr, '').parent().addClass(this.settings.error_class);
                $(el).triggerHandler('invalid');
            }

            return valid;
        },

        valid_radio: function(el, required) {
            var name = el.getAttribute('name'),
                group = $(el).closest('[data-' + this.attr_name(true) + ']').find("[name='" + name + "']"),
                count = group.length,
                valid = false,
                disabled = false;

            // Has to count up to make sure the focus gets applied to the top error
            for (var i = 0; i < count; i++) {
                if (group[i].getAttribute('disabled')) {
                    disabled = true;
                    valid = true;
                } else {
                    if (group[i].checked) {
                        valid = true;
                    } else {
                        if (disabled) {
                            valid = false;
                        }
                    }
                }
            }

            // Has to count up to make sure the focus gets applied to the top error
            for (var i = 0; i < count; i++) {
                if (valid) {
                    $(group[i]).removeAttr(this.invalid_attr).parent().removeClass(this.settings.error_class);
                    $(group[i]).triggerHandler('valid');
                } else {
                    $(group[i]).attr(this.invalid_attr, '').parent().addClass(this.settings.error_class);
                    $(group[i]).triggerHandler('invalid');
                }
            }

            return valid;
        },

        // valid_equal: function(el, required, parent) {
        //     var from = document.getElementById(el.getAttribute(this.add_namespace('data-equalto'))).value,
        //         to = el.value,
        //         valid = (from === to);

        //     if (valid) {
        //         $(el).removeAttr(this.invalid_attr);
        //         parent.removeClass(this.settings.error_class);
        //         if (label.length > 0 && settings.error_labels) {
        //             label.removeClass(this.settings.error_class);
        //         }
        //     } else {
        //         $(el).attr(this.invalid_attr, '');
        //         parent.addClass(this.settings.error_class);
        //         if (label.length > 0 && settings.error_labels) {
        //             label.addClass(this.settings.error_class);
        //         }
        //     }

        //     return valid;
        // },

        valid_oneof: function(el, required, parent, doNotValidateOthers) {
            var el = $(el),
                // others = $('[' + this.add_namespace('data-oneof') + ']'),
                valid = el.filter(function() {
                    return ['radio', 'checkbox'].indexOf(this.type) > -1 ? this.checked : !!this.value.trim();
                }).length > 0;

            if (valid) {
                el.removeAttr(this.invalid_attr);
                parent.removeClass(this.settings.error_class);
            } else {
                el.attr(this.invalid_attr, '');
                parent.addClass(this.settings.error_class);
            }

            if (!doNotValidateOthers) {
                var _this = this;
                el.each(function() {
                    _this.valid_oneof.call(_this, this, null, parent, true);
                });
            }

            return valid;
        },

        reflow: function(scope, options) {
            var self = this,
                form = $('[' + this.attr_name() + ']').attr('novalidate', 'novalidate');
            $(form).each(function(idx, el) {
                self.events(el);
            });
        }
    };
}(jQuery, window, window.document));
