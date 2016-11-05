(function($, window, document, undefined) {
    'use strict';

    Mobile.libs.responsive = {
        name: 'responsive',

        cache: {},

        loaded: false,

        settings: {
            named_queries: {
                'default': 'only screen',
                'small': Mobile.media_queries['small'],
                'small-only': Mobile.media_queries['small-only'],
                'medium': Mobile.media_queries['medium'],
                'medium-only': Mobile.media_queries['medium-only'],
                'landscape': 'only screen and (orientation: landscape)',
                'portrait': 'only screen and (orientation: portrait)',
                'retina': 'only screen and (-webkit-min-device-pixel-ratio: 2),' +
                    'only screen and (min-device-pixel-ratio: 2),' +
                    'only screen and (min-resolution: 192dpi),' +
                    'only screen and (min-resolution: 2dppx)',
                'retina3x': 'only screen and (-webkit-min-device-pixel-ratio: 3),' +
                    'only screen and (min-device-pixel-ratio: 3),' +
                    'only screen and (min-resolution: 249dpi),' +
                    'only screen and (min-resolution: 2.6dppx)'
            },

            directives: {
                replace: function(el, path, trigger) {
                    var orig_path,
                        last_path;
                    // The trigger argument, if called within the directive, fires
                    // an event named after the directive on the element, passing
                    // any parameters along to the event that you pass to trigger.
                    //
                    // ex. trigger(), trigger([a, b, c]), or trigger(a, b, c)
                    //
                    // This allows you to bind a callback like so:
                    // $('#responsiveContainer').on('replace', function (e, a, b, c) {
                    //   console.log($(this).html(), a, b, c);
                    // });

                    if (el !== null && /IMG/.test(el[0].nodeName)) {
                        orig_path = el[0].src;
                        // orig_path = el.each(function() {
                        //     this.src = path;
                        // });

                        if (new RegExp(path, 'i').test(orig_path)) {
                            return;
                        }

                        el.attr("src", path);

                        return trigger(el[0].src);
                    }
                    last_path = el.data(this.name + '-last-path'),
                        self = this;

                    if (last_path == path) {
                        return;
                    }

                    if (/\.(gif|jpg|jpeg|tiff|png)([?#].*)?/i.test(path)) {
                        $(el).css('background-image', 'url(' + path + ')');
                        el.data(this.name + '-last-path', path);
                        return trigger(path);
                    }

                    return $.get(path, function(response) {
                        el.html(response);
                        el.data(self.name + '-last-path', path);
                        trigger();
                    });

                }
            }
        },

        init: function(scope, method, options) {
            Mobile.inherit(this, 'random_str');

            this.data_attr = 'data-' + this.name;
            $.extend(true, this.settings, method, options);
            this.bindings(method, options);
            this.reflow();
        },

        get_media_hash: function() {
            var mediaHash = '';
            for (var queryName in this.settings.named_queries) {
                mediaHash += matchMedia(this.settings.named_queries[queryName]).matches.toString();
            }
            return mediaHash;
        },

        events: function() {
            var self = this,
                prevMediaHash;

            $(window)
                .off('.' + this.name)
                .on('resize.' + this.name, function() {
                    var currMediaHash = self.get_media_hash();
                    if (currMediaHash !== prevMediaHash) {
                        self.resize();
                    }
                    prevMediaHash = currMediaHash;
                });

            return this;
        },

        resize: function() {
            var cache = this.cache,
                uuid,
                passed,
                args;

            if (!this.loaded) {
                setTimeout($.proxy(this.resize, this), 50);
                return;
            }

            for (uuid in cache) {
                if (cache.hasOwnProperty(uuid)) {
                    passed = this.results(uuid, cache[uuid]);
                    if (passed) {
                        this.settings.directives[passed.scenario[1]]
                        .call(this, passed.el, passed.scenario[0], (function(passed) {
                            if (arguments[0] instanceof Array) {
                                args = arguments[0];
                            } else {
                                args = Array.prototype.slice.call(arguments, 0);
                            }

                            return function() {
                                passed.el.trigger(passed.scenario[1], args);
                            }
                        }(passed)));
                    }
                }
            }

        },

        results: function(uuid, scenarios) {
            var count = scenarios.length,
                el = $('[data-uuid="' + uuid + '"]'),
                mq,
                rule,
                res = false;

            if (count > 0) {
                while (count--) {
                    rule = scenarios[count][2];
                    if (this.settings.named_queries.hasOwnProperty(rule)) {
                        mq = matchMedia(this.settings.named_queries[rule]);
                    } else {
                        mq = matchMedia(rule);
                    }
                    if (mq.matches) {
                        res = {
                            el: el,
                            scenario: scenarios[count]
                        };
                        break;
                    }
                }
            }

            return res;
        },

        load: function(force_update) {
            if (typeof this.cached_nodes === 'undefined' || force_update) {
                this.update_responsiveness();
            }
        },

        update_responsiveness: function() {
            var data_attr = this.data_attr,
                elements = $('[' + data_attr + ']'),
                count = elements.length,
                i = count,
                element,
                str;

            this.cache = {};
            this.cached_nodes = [];
            this.loaded = count === 0;

            while (i--) {
                element = elements[i];

                if (element) {
                    str = element.getAttribute(data_attr) || '';

                    if (str.length > 0) {
                        this.cached_nodes.push(element);
                    }
                }

            }

            this.loaded = true;
            this.enhance();

            return this;
        },

        enhance: function() {
            var i = this.cached_nodes.length;

            while (i--) {
                this.object($(this.cached_nodes[i]));
            }

            $(window).trigger('resize.' + this.name);
        },

        convert_directive: function(directive) {

            var trimmed = this.trim(directive);

            if (trimmed.length > 0) {
                return trimmed;
            }

            return 'replace';
        },

        parse_scenario: function(scenario) {
            // This logic had to be made more complex since some users were using commas in the url path
            // So we cannot simply just split on a comma

            var directive_match = scenario[0].match(/(.+),\s*(\w+)\s*$/),
                // getting the mq has gotten a bit complicated since we started accounting for several use cases
                // of URLs. For now we'll continue to match these scenarios, but we may consider having these scenarios
                // as nested objects or arrays in F6.
                // regex: match everything before close parenthesis for mq
                media_query = scenario[1].match(/\((.*)\)/);

            if (directive_match) {
                var path = directive_match[1],
                    directive = directive_match[2];

            } else {
                var cached_split = scenario[0].split(/,\s*$/),
                    path = cached_split[0],
                    directive = '';
            }

            return [this.trim(path), this.convert_directive(directive), this.trim(media_query[1])];
        },

        object: function(el) {
            var raw_arr = this.parse_data_attr(el),
                i = raw_arr.length,
                scenarios = [],
                scenario,
                params;

            if (i > 0) {
                while (i--) {
                    // split array between comma delimited content and mq
                    // regex: comma, optional space, open parenthesis
                    scenario = raw_arr[i].split(/,\s*/);

                    if (scenario.length <= 1) {
                        scenario.push('(default)');
                    }
                    params = this.parse_scenario(scenario);
                    scenarios.push(params);
                }
            }

            this.store(el, scenarios);
        },

        store: function(el, scenarios) {
            var uuid = this.random_str(),
                current_uuid = el.data('uuid');

            if (!this.cache[current_uuid]) {
                el.attr('data-uuid', uuid);
                this.cache[uuid] = scenarios;
            }
        },

        parse_data_attr: function(el) {
            var raw = el.data(this.name).split(/\[(.*?)\]/),
                i = raw.length,
                output = [];

            while (i--) {
                if (raw[i].replace(/[\W\d]+/, '').length > 4) {
                    output.push(raw[i]);
                }
            }

            return output;
        },

        reflow: function() {
            this.load(true);
        }

    };

}(jQuery, window, window.document));
