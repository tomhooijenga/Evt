var evt = new Evt("body");

QUnit.test("constructor - new", function (assert)
{
    assert.ok(evt instanceof Evt);
});

QUnit.test("constructor - no new", function (assert)
{
    var evtNoNew = Evt("body");

    assert.ok(evtNoNew instanceof Evt);
});

QUnit.test("cache", function (assert)
{
    var evt2 = new Evt("body");

    assert.ok(evt === evt2, "Is same object");
    assert.ok(Object.keys(Evt.prototype.instances).length === 1, "One entry in cache");
});

QUnit.test("add event", function (assert)
{
    evt.on("click", function ()
    {
    });

    assert.ok(evt.handlers);
    assert.ok(evt.events.click === 1);

    evt.off();
});

QUnit.test("add delegated event", function (assert)
{
    evt.on("click", "div", function (e)
    {
    });

    assert.ok(evt.handlers);
    assert.ok(evt.events.click === 1);
    assert.ok(evt.handlers[0].selector === "div");

    evt.off();
});

QUnit.test("remove event; all", function (assert)
{
    evt.on("click", function ()
    {
    });
    evt.on("click", function ()
    {
    });

    evt.off();

    assert.ok(evt.handlers.length === 0);
});

QUnit.test("remove event; single", function (assert)
{
    function fn1()
    {
    }

    function fn2()
    {
    }

    evt.on("click", fn1);
    evt.on("click", fn2);

    evt.off("click", fn1);

    assert.ok(evt.events.click === 1);
    assert.ok(evt.handlers[0].callback === fn2);

    evt.off();
});

QUnit.test("remove delegated event; all", function (assert)
{
    evt.on("click", "div", function ()
    {
    });
    evt.on("click", "div", function ()
    {
    });

    evt.off("click", "div");

    assert.ok(evt.events.click === 0);
    assert.ok(evt.handlers.length === 0);

    evt.off();
});

QUnit.test("remove delegated event; single", function (assert)
{
    function fn1()
    {
    }

    function fn2()
    {
    }

    evt.on("click", "div", fn1);
    evt.on("click", "div", fn2);

    evt.off("click", "div", fn1);

    assert.ok(evt.events.click === 1);
    assert.ok(evt.handlers[0].callback === fn2);

    evt.off();
});

QUnit.test("remove events; namespaced", function (assert)
{
    evt.on("evtA.namespace", function ()
    {
    }).on("evtA.namespace.otherspace", function ()
    {
    }).on("evtB.namespace", function ()
    {
    });

    evt.off(".namespace");

    assert.ok(evt.events.evtA === 0);
    assert.ok(evt.events.evtB === 0);

    evt.off();
});

QUnit.test("stopPropagation; Evt handlers only", function (assert)
{
    var level1 = false,
        level2 = false,
        clicker1 = function ()
        {
            level1 = true;
        },
        clicker2 = function (e)
        {
            level2 = true;
            e.stopPropagation();
        },
        click = document.createEvent("MouseEvents"),
        evt = new Evt("#propagation");

    click.initEvent("click", true, true);

    evt.on("click", "#level2", clicker2);
    evt.on("click", "#level1", clicker1);

    document.querySelector("#level2").dispatchEvent(click);

    assert.ok(level1 === false, "Level 1 is not reached");
    assert.ok(level2 === true, "level 2 is reached");

    evt.off();
});

QUnit.test("stopPropagation; Mixed handlers", function (assert)
{
    var level1 = false,
        level2 = false,
        clicker1 = function ()
        {
            level1 = true;
        },
        clicker2 = function (e)
        {
            level2 = true;
            e.stopPropagation();
        },
        click = document.createEvent("MouseEvents"),
        evt = new Evt("#propagation"),
        element = document.querySelector("#level2");

    click.initEvent("click", true, true);

    evt.on("click", "#level1", clicker1);
    element.addEventListener("click", clicker2);

    element.dispatchEvent(click);

    assert.ok(level1 === false, "Level 1 is not reached");
    assert.ok(level2 === true, "level 2 is reached");

    element.removeEventListener("click", clicker2);
    evt.off();
});

QUnit.test("namespaced; add event", function (assert)
{
    var click = document.createEvent("MouseEvents");

    click.initEvent("click", true, true);

    evt.on("click.c.b.a", function ()
    {
        assert.ok(true);
    });

    evt.el.dispatchEvent(click);

    assert.ok(evt.events.click === 1);
    assert.ok(evt.handlers[0].namespace === "a.b.c");

    evt.off();
});

QUnit.test("namespaced; trigger", function (assert)
{
    evt.on("click.a", function ()
    {
        assert.ok(true);
    });

    evt.on("click.b.a", function ()
    {
        assert.ok(true);
    });

    evt.on("click.b", function ()
    {
        assert.ok(false);
    });

    evt.on("click", function ()
    {
        assert.ok(true);
    });

    evt.trigger("click.a");

    evt.off();
});

QUnit.test("namespaced; delegated trigger", function (assert)
{
    var evt = Evt("#propagation"),
        called = 0;

    evt.on("click", "#level1", function ()
    {
        // Second
        assert.ok(++called === 2);
    })
        .on("click", "#level2", function ()
        {
            // First
            assert.ok(++called === 1);
        })
        .on("click.b", "#level2", function ()
        {
            assert.ok(false);
        })
        .trigger("click.a", document.getElementById("level2"));

    evt.off();
});