(function($, window, document, undefined) {
    'use strict';

    Mobile.libs.validator = {
        name: 'validator',

        settings: {
            validate_on: 'manual', // change (when input value changes), blur (when input blur), manual (when call custom events)
            exception: ':hidden, [data-validator-ignore]', // ignore validate with 'exception' setting
            focus_on_invalid: false, // automatically bring the focus to an invalid input field
            has_hint: true, // popup a alert window if invalid
            error_labels: true, // labels with a for="inputId" will receive an `error` class
            error_class: 'has-error', // labels with a for="inputId" will receive an `error` class
            feedback: '.form-row', // support a parent(s) selector for feedback an error message box
            alert_element: '.alert-box', // for an error message box class
            isAjax: false, // You can set ajax mode
            preventDefault: false,
            // the amount of time Validator will take before it validates the form (in ms).
            // smaller time will result in faster validation
            timeout: 1000,
            patterns: {
                alpha: /^[a-zA-Z]*$/,
                digital: /^\d*$/,
                alpha_digital: /^[a-zA-Z\d]*$/,
                int: /^[-+]?\d*$/,
                positive: /^\+?\d*(?:[\.]\d+)?$/,
                negative: /^-\d*(?:[\.]\d+)?$/,
                number: /^[-+]?\d*(?:[\.]\d+)?$/,
                // http://www.whatwg.org/specs/web-apps/current-work/multipage/states-of-the-type-attribute.html#valid-e-mail-address
                email: /^[\w.!#$%&'*+\/=?^`{|}~-]+@[a-zA-Z\d](?:[a-zA-Z\d-]{0,61}[a-zA-Z\d])?(?:\.[a-zA-Z\d](?:[a-zA-Z\d-]{0,61}[a-zA-Z\d])?)*$/,
                // http://blogs.lse.ac.uk/lti/2008/04/23/a-regular-expression-to-match-any-url/
                url: /^(https?|ftp|file|ssh):\/\/([-;:&=\+\$,\w]+@{1})?([-A-Za-z\d\.]+)+:?(\d+)?((\/[-\+~%\/\.\w]+)?\??([-\+=&;%@\.\w]+)?#?([\w]+)?)?/,
                // abc.de
                domain: /^([a-zA-Z\d]([a-zA-Z\d\-]{0,61}[a-zA-Z\d])?\.)+[a-zA-Z]{2,8}$/,
                datetime: /^([0-2]\d{3})\-([0-1]\d)\-([0-3]\d)\s([0-2]\d):([0-5]\d):([0-5]\d)([-+]([0-1]\d)\:00)?$/,
                // YYYY-MM-DD
                date: /(?:19|20)\d{2}[-/.](?:(?:0?[1-9]|1[0-2])[-/.](?:0?[1-9]|1\d|2\d)|(?:(?!02)(?:0?[1-9]|1[0-2])[-/.](?:30))|(?:(?:0?[13578]|1[02])[-/.]31))$/,
                // HH:MM:SS
                time: /^(0?\d|1\d|2[0-3])(:[0-5]\d){2}$/,
                // #FFF or #FFFFFF
                color: /^#([a-fA-F\d]{6}|[a-fA-F\d]{3})$/,
                mobile: /^0?(?:1(?:[38]\d)|(?:4[579])|(?:[57][0-35-9]))\d{8}$/,
                tel: /^(0\d{2,3}-?)?[2-9]\d{5,7}(-\d{1,5})?$/,
                zip: /^\d{6}$/
            },
            verifiers: {
                requiredone: function(el, required, parent) {
                    return $(el).closest('[' + this.attr_name() + ']').find('input[type="' + el.type + '"][name="' + el.name + '"]:checked:not(:disabled)').length;
                },
                equalto: function(el, required, parent) {
                    var from = document.querySelector(el.getAttribute(this.add_namespace(this.attr_name() + '-equalto')));

                    return from && (from.value === el.value);

                },
                oneof: function(el, required, parent) {
                    var els = document.querySelectorAll(el.getAttribute(this.add_namespace(this.attr_name() + '-oneof')));
                    return this.valid_oneof(els, required, parent);
                }
            },
            alerts: {
                required: '请输入/选择{placeholder}！',
                alpha: '请填写英文字母！',
                digital: '只允许填写数字！',
                alpha_digital: '请填写英文字母或数字！',
                int: '请填写整数！',
                positive: '请填写正数！',
                negative: '请填写负数！',
                number: '请填写数值！',
                email: '请填写正确d的邮箱地址！',
                url: '请填写正确的 URL 地址！',
                domain: '请填写正确的域名！',
                datetime: '请填写正确的日期和时间格式！',
                date: '请填写正确的日期格式！',
                time: '请填写正确的时间格式！',
                color: '请填写十六进制颜色格式！',
                mobile: '手机号码有误，请重新填写！',
                tel: '电话号码有误，请重新填写!',
                zip: '邮政编码格式有误，请重新填写！'
            }
        },

        timer: null,

        init: function(scope, method) {
            this.bindings(method, Array.prototype.slice.call(arguments, 2));
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
                    var is_ajax = $(this).attr(self.attr_name()) === 'ajax' || self.settings.isAjax;
                    return self.validate($(this).find('input, textarea, select, [' + self.attr_name() +  '-verifier]').not(settings.exception).get(), e, is_ajax);
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
                    var id = this.id,
                        eqTo = form.find('[' + self.attr_name() +  '-equalto="#' + id + '"]');
                    // checks if there is an equalTo equivalent related by id
                    if (typeof eqTo[0] !== "undefined" && eqTo.val().length) {
                        validate(eqTo[0], e);
                    }

                    if (settings.validate_on === 'blur') {
                        validate(this, e);
                    }
                })
                .on('change.validator', function(e) {
                    var id = this.id,
                        eqTo = form.find('[' + self.attr_name() +  '-equalto="#' + id + '"]');
                    // checks if there is an equalTo equivalent related by id
                    if (typeof eqTo[0] !== "undefined" && eqTo.val().length) {
                        validate(eqTo[0], e);
                    }

                    if (settings.validate_on === 'change') {
                        validate(this, e);
                    }
                });
                // Not compatible, so commet it for a while
                // .on('focus.validator', function(e) {
                //     if (navigator.userAgent.match(/iPad|iPhone|Android|BlackBerry|Windows Phone|webOS/i)) {
                //         $('html, body').animate({
                //             scrollTop: $(e.target).offset().top
                //         }, 100);
                //     }
                // });
        },

        reset: function(form, e) {
            form.removeAttr(this.invalid_attr);
            var settings = form.data(this.attr_name(true) + '-init') || {};

            $('[' + this.invalid_attr + ']', form).removeAttr(this.invalid_attr);
            $('.' + settings.error_class, form).not(settings.alert_element).removeClass(settings.error_class);
            $(':input', form).not(':radio, :checkbox, :button, :submit, :reset,' + settings.exception).val('').removeAttr(this.invalid_attr);
            $('input:radio, input:checkbox', form).prop('checked', false).removeAttr(this.invalid_attr);
        },

        validate: function(els, e, is_ajax) {
            var validations = this.parse_patterns(els),
                validation_count = validations.length,
                form = $(els[0]).closest('form'),
                submit_event = /submit/i.test(e.type);

            // Has to count up to make sure the focus gets applied to the top error
            for (var i = 0; i < validation_count; i++) {
                if (!validations[i] && (submit_event || is_ajax)) {
                    if (this.settings.focus_on_invalid) {
                        els[i].focus();
                    }
                    form.trigger('invalid.validator', [e]);
                    $(els[i]).closest('form').attr(this.invalid_attr, '');
                    return false;
                }
            }

            if (submit_event || is_ajax) {
                if (this.settings.preventDefault) e.preventDefault();
                form.trigger('valid.validator', [e]);
            }

            form.removeAttr(this.invalid_attr);

            if (is_ajax) {
                $[form.attr('method')](form.attr('action'), form.serialize(), function(rs) {
                    form.trigger('complete.validator', [rs]);
                });
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
            var type = el.type,
                required = el.hasAttribute('required'),
                pattern = el.getAttribute('pattern') || '';

            if (this.settings.patterns.hasOwnProperty(pattern) && pattern.length > 0) {
                return [el, pattern, this.settings.patterns[pattern], required];
            } else if (pattern.length > 0) {
                return [el, null, new RegExp('^' + pattern + '$'), required];
            }

            if (this.settings.patterns.hasOwnProperty(type)) {
                return [el, type, this.settings.patterns[type], required];
            }

            pattern = /^[\s\S]*$/;

            return [el, 'required', pattern, required];
        },

        // TODO: Break this up into smaller methods, getting hard to read.
        check_validation: function(el_patterns) {
            var i = el_patterns.length,
                validations = [],
                form = $(el_patterns[0][0]).closest('[' + this.attr_name() + ']'),
                settings = form.data(this.attr_name(true) + '-init') || {};
            if(!i) return validations;
            while (i--) {
                var el = el_patterns[i][0],
                    required = el_patterns[i][3],
                    value = el.value.trim(),
                    is_radio = el.type === 'radio',
                    is_checkbox = el.type === 'checkbox',
                    direct_parent = $(el).parent(),
                    verifier = el.getAttribute(this.add_namespace(this.attr_name() + '-verifier')),
                    label = (function() {
                        var label = $(el).siblings('label');
                        if (!label.length) {
                            label = $('label[for="' + el.id + '"]');
                        }
                        return label;
                    })(),
                    valid_length = required ? (value.length > 0) : true,
                    el_validations = [],
                    parent,
                    valid;

                if ((is_radio || is_checkbox) && required) {
                    verifier = 'requiredone';
                }
                // support old way to do equalTo validations
                if (el.getAttribute(this.add_namespace(this.attr_name() + '-equalto'))) {
                    verifier = 'equalto';
                }
                if (el.getAttribute(this.add_namespace(this.attr_name() + '-oneof'))) {
                    verifier = 'oneof';
                }

                if (settings.feedback) {
                    parent = $(el).parents(settings.feedback).eq(0);
                }
                if (!parent || !parent.length) {
                    if (direct_parent.is('label')) {
                        parent = direct_parent.parent();
                    } else {
                        parent = direct_parent;
                    }
                }

                if (verifier) {
                    // Validate using each of the specified (space-delimited) verifiers.
                    var verifiers = verifier.split(' ');
                    var last_valid = true,
                        all_valid = true;
                    for (var iv = 0; iv < verifiers.length; iv++) {
                        valid = this.settings.verifiers[verifiers[iv]].apply(this, [el, required, parent]);
                        el_validations.push(valid);
                        all_valid = valid && last_valid;
                        last_valid = valid;
                    }
                    if (all_valid) {
                        this.validSuccess(el, parent, label);
                    } else {
                        validations = this.validError(el, parent, label, i, el_patterns, el_validations);
                        if(validations.length) break;
                    }
                } else {
                    el_validations.push(el_patterns[i][2].test(value) && valid_length || !required && !value.length || el.disabled);

                    el_validations = [el_validations.every(function(valid) {
                        return valid;
                    })];
                    if (el_validations[0]) {
                        this.validSuccess(el, parent, label);
                    } else {
                        validations = this.validError(el, parent, label, i, el_patterns, el_validations);
                        if(validations.length) break;
                    }
                }
                validations = validations.concat(el_validations);
            }

            return validations;
        },

        validSuccess: function(el, parent, label) {
            el.removeAttribute(this.invalid_attr);
            el.setAttribute('aria-invalid', 'false');
            el.removeAttribute('aria-describedby');
            parent.removeClass(this.settings.error_class);
            if (label.length > 0 && this.settings.error_labels) {
                label.removeClass(this.settings.error_class).removeAttr('role');
            }
            $(el).triggerHandler('valid');
        },

        validError: function(el, parent, label, i, el_patterns, el_validations) {
            var validations = [];
            el.setAttribute(this.invalid_attr, '');
            el.setAttribute('aria-invalid', 'true');

            // Try to find the error associated with the input
            var errorElement = parent.find(this.settings.alert_element);
            var type = this.settings.alerts[el_patterns[i][1]];
            var msg = el_patterns[i][0].dataset.alerts;
            if(!msg) {
                if (type) {
                    msg = type.replace('{placeholder}', label.text().replace(/[：:]$/, '') || el_patterns[i][0].placeholder || '有一项');
                } else {
                    msg = '输入不符合要求，请检查！';
                }
            }

            if (!errorElement.length) {
                if(this.settings.has_hint) {
                    alert(msg);
                    $(el).triggerHandler('invalid');
                    return validations.concat(el_validations);
                }
            } else {
                // errorElement.html(msg);
                var errorID = errorElement.attr('id');
                if (errorID) {
                    el.setAttribute('aria-describedby', errorID);
                }
            }

            // el.setAttribute('aria-describedby', $(el).find('.error')[0].id);
            parent.addClass(this.settings.error_class);
            if (label.length > 0 && this.settings.error_labels) {
                label.addClass(this.settings.error_class).attr('role', 'alert');
            }
            $(el).triggerHandler('invalid');

            return validations;
        },

        // valid_checkbox: function(el, required) {
        //     var el = $(el),
        //         valid = (el.is(':checked') || !required || el.get(0).getAttribute('disabled'));

        //     if (valid) {
        //         el.removeAttr(this.invalid_attr).parent().removeClass(this.settings.error_class);
        //         $(el).triggerHandler('valid');
        //     } else {
        //         el.attr(this.invalid_attr, '').parent().addClass(this.settings.error_class);
        //         $(el).triggerHandler('invalid');
        //     }

        //     return valid;
        // },

        // valid_radio: function(el, required) {
        //     var name = el.getAttribute('name'),
        //         group = $(el).closest('[data-' + this.attr_name(true) + ']').find("[name='" + name + "']"),
        //         count = group.length,
        //         valid = false,
        //         disabled = false;

        //     // Has to count up to make sure the focus gets applied to the top error
        //     for (var i = 0; i < count; i++) {
        //         if (group[i].getAttribute('disabled')) {
        //             disabled = true;
        //             valid = true;
        //         } else {
        //             if (group[i].checked) {
        //                 valid = true;
        //             } else {
        //                 if (disabled) {
        //                     valid = false;
        //                 }
        //             }
        //         }
        //     }

        //     // Has to count up to make sure the focus gets applied to the top error
        //     for (var i = 0; i < count; i++) {
        //         if (valid) {
        //             $(group[i]).removeAttr(this.invalid_attr).parent().removeClass(this.settings.error_class);
        //             $(group[i]).triggerHandler('valid');
        //         } else {
        //             $(group[i]).attr(this.invalid_attr, '').parent().addClass(this.settings.error_class);
        //             $(group[i]).triggerHandler('invalid');
        //         }
        //     }

        //     return valid;
        // },

        // valid_equal: function(el, required, parent) {
        //     var from = document.getElementById(el.getAttribute(this.add_namespace(this.attr_name() + '-equalto'))).value,
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
                form = $('[' + this.attr_name() + ']'); //.attr('novalidate', 'novalidate');
            form.each(function(idx, el) {
                self.events(el);
            });
        }
    };
}(jQuery, window, window.document));

