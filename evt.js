(function (window)
{
    "use strict";

    var matches = window.document.documentElement.matches,
        stopPropagation = window.Event.prototype.stopPropagation,
        stopImmediatePropagation = window.Event.prototype.stopImmediatePropagation;

    if (!matches)
    {
        var prefixes = ["ms", "moz", "webkit"],
            prefix = prefixes.pop();

        while (prefix)
        {
            matches = prefix + "MatchesSelector";
            if (matches in window.document.documentElement)
            {
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
    function listen (e)
    {
        Evt.prototype.instances[this].handle(e);
    }

    /**
     * @param selector
     * @returns {*}
     * @constructor
     */
    var Evt = function (selector)
    {
        if (!(this instanceof Evt))
        {
            return new Evt(selector);
        }

        var el = selector instanceof Node ? selector : window.document.querySelector(selector);

        if (this.instances[el])
        {
            return this.instances[el];
        }

        this.el = el;

        this.events = {};

        this.instances[el] = this;
    };

    /**
     * Holds the instances
     * @type {{}}
     */
    Evt.prototype.instances = {};

    /**
     * Test whether a element matches a selector
     * @param element
     * @param selector
     * @returns {boolean}
     */
    Evt.prototype.matches = function (element, selector)
    {
        if (selector === "undefined")
        {
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
    Evt.prototype.on = function (event, selector, callback)
    {
        if (typeof selector === "function")
        {
            callback = selector;
            selector = undefined;
        }

        if (!this.events[event])
        {
            this.events[event] = {};

            // Only add one listener per element
            this.el.addEventListener(event, listen);
        }

        if (!this.events[event][selector])
        {
            this.events[event][selector] = [];
        }

        this.events[event][selector].push(callback);

        return this;
    };

    /**
     * @param event
     * @param [selector]
     * @param [callback]
     */
    Evt.prototype.off = function (event, selector, callback)
    {
        if (!event && !selector && !callback)
        {
            for (event in this.events)
            {
                if (!this.events.hasOwnProperty(event))
                {
                    continue;
                }

                this.el.removeEventListener(event, listen);
            }
        }

        if (event && !selector && !callback)
        {
            delete this.events[event];

            this.el.removeEventListener(event, listen);
        }

        if (event && selector && !callback)
        {
            delete this.events[event][selector];

            if (Object.keys(this.events[event]).length === 0)
            {
                this.off(event);
            }
        }

        if (event && selector && callback)
        {
            var index = this.events[event][selector].indexOf(callback);

            this.events[event][selector].splice(index, 1);

            if (this.events[event][selector].length === 0)
            {
                this.off(event, selector);
            }
        }

        return this;
    };

    Evt.prototype.handle = function (e)
    {
        var event = e.type,
            node = e.target,
            events = this.events[event],
            stop = false,
            stopImmediate = false;

        e.stopPropagation = function ()
        {
            stop = true;

            stopPropagation.call(this);
        };

        e.stopImmediatePropagation = function ()
        {
            stop = true;
            stopImmediate = true;

            stopImmediatePropagation.call(this);
        };

        function handle(evt)
        {
            evt.call(node, e);

            return stopImmediate;
        }

        while (node != this.el.parentNode)
        {
            for (var selector in events)
            {
                if (!events.hasOwnProperty(selector))
                {
                    continue;
                }

                if (this.matches(node, selector))
                {
                    events[selector].some(handle);
                }

                if (stop)
                {
                    return;
                }
            }

            node = node.parentNode;
        }
    };

    window.Evt = Evt;
})(window);

