(function (window) {
    "use strict";

    var matches = window.document.documentElement.matches,
        stopPropagation = window.Event.prototype.stopPropagation,
        stopImmediatePropagation = window.Event.prototype.stopImmediatePropagation;

    if (!matches) {
        var prefixes = ["ms", "moz", "webkit"],
            prefix = prefixes.pop();

        while (prefix) {
            matches = prefix + "MatchesSelector";
            if (matches in window.document.documentElement) {
                matches = window.document.documentElement[matches];
                break;
            }

            prefix = prefixes.pop();
        }
    }

    /**
     * HEY! Listen!
     * Named function for easy (un)binding of events
     * @param {Event} e
     */
    function listen(e) {
        Evt.prototype.instances[this].handle(e);
    }

    /**
     * @param event
     * @returns {{type: (boolean|string), namespace: (boolean|Array.<string>), regex: (boolean|RegExp)}}
     */
    function extract(event)
    {
        event = (event || '').split(".");

        var type = event.shift(),
            namespace = event.sort(),
            regex = new RegExp(namespace.join(".*?\\."));

        return {
            type: !!type && type,
            namespace: !!namespace.length && namespace.join("."),
            regex: !!namespace.length && regex
        };
    }

    /**
     * @param selector
     * @returns {*}
     * @constructor
     */
    var Evt = function (selector) {
        if (!(this instanceof Evt)) {
            return new Evt(selector);
        }

        var el = selector instanceof Node ? selector : window.document.querySelector(selector);

        if (this.instances[el]) {
            return this.instances[el];
        }

        /**
         * @type Node
         */
        this.el = el;

        /**
         * @type {Object.<string, number>}
         */
        this.events = {};

        /**
         * @type {Array.<Object>}
         */
        this.handlers = [];

        this.instances[el] = this;
    };



    /**
     * Holds the instances
     * @type {Object.<Node, Evt>}
     */
    Evt.prototype.instances = {};

    /**
     * Test whether a element matches a selector
     * @param element
     * @param selector
     * @returns {boolean}
     */
    Evt.prototype.matches = function (element, selector) {
        if (!selector) {
            return this.el === element;
        }

        return matches.call(element, selector);
    };

    /**
     * Attach a callback to an event
     * @param event
     * @param selector
     * @param [callback]
     */
    Evt.prototype.on = function (event, selector, callback) {
        if (typeof selector === "function") {
            return this.on(event, undefined, selector);
        }

        event = extract(event);

        var type = event.type,
            namespace = event.namespace || '';

        if (!this.events[type]) {
            this.events[type] = 0;

            this.el.addEventListener(type, listen);
        }

        this.events[type]++;

        this.handlers.push({
            event:     type,
            namespace: namespace,
            selector:  selector,
            callback:  callback
        });

        return this;
    };

    /**
     * @param [event]
     * @param [selector]
     * @param [callback]
     */
    Evt.prototype.off = function (event, selector, callback) {
        if (typeof selector === "function") {
            return this.off(event, undefined, selector);
        }

        event = extract(event);

        if (!event.type && !event.namespace && !selector && !callback) {
            for (event in this.events) {
                if (!this.events.hasOwnProperty(event)) continue;

                this.el.removeEventListener(event, listen);
            }

            this.events = {};
            this.handlers = [];

            return this;
        }

        var handler,
            i = this.handlers.length;

        while (i--) {
            handler = this.handlers[i];

            if (event.type && event.type !== handler.event) continue;
            if (event.namespace && !event.regex.test(handler.namespace)) continue;
            if (selector && selector !== handler.selector) continue;
            if (callback && callback !== handler.callback) continue;

            this.events[handler.event]--;

            if (this.events[handler.event] === 0) {
                this.el.removeEventListener(handler.event, listen);
            }

            this.handlers.splice(i, 1);
        }

        return this;
    };

    /**
     * @param e
     */
    Evt.prototype.handle = function (e) {
        var event = e.type,
            namespace = e.namespace && e.namespace.split("."),
            test,
            node = e.target,
            handlers = this.handlers,
            stop = false,
            stopImmediate = false;

        if (namespace) {
            test = new RegExp(namespace.join(".*?\\."));
        }

        e.stopPropagation = function () {
            stop = true;

            stopPropagation.call(this);
        };

        e.stopImmediatePropagation = function () {
            stop = true;
            stopImmediate = true;

            stopImmediatePropagation.call(this);
        };

        function handle(handler) {
            if (event !== handler.event) return;

            if (!this.matches(node, handler.selector)) return;

            if (namespace && handler.namespace)
            {
                if (!test.test(handler.namespace)) return;
            }

            handler.callback.call(node, e);

            return stopImmediate;
        }

        while (node !== this.el.parentNode) {

            handlers.some(handle, this);

            if (stop) break;

            node = node.parentNode;
        }
    };

    /**
     * @param evt
     * @param [target]
     */
    Evt.prototype.trigger = function (event, target) {
        var evt;

        target = target || this.el;

        event = extract(event);

        evt = window.document.createEvent("Events");

        evt.initEvent(event.type, true, true);

        if (event.namespace) evt.namespace = event.namespace;

        target.dispatchEvent(evt);

        return this;
    };

    window["Evt"] = Evt;
})(window);

