var evt = new Evt('body');

QUnit.test("constructor - new", function (assert) {
    assert.ok(evt instanceof Evt);
});

QUnit.test("constructor - no new", function (assert) {
    var evtNoNew = Evt('body');

    assert.ok(evtNoNew instanceof Evt);
});

QUnit.test("cache", function (assert) {
    var evt2 = new Evt('body');

    assert.ok(evt === evt2, 'Is same object');
    assert.ok(Object.keys(Evt.prototype.instances).length === 1, 'One entry in cache');
});

QUnit.test("add event", function (assert) {
    evt.on('click', function (e) {

    });

    assert.ok(evt.events.click, 'Click event added');
    assert.ok(evt.events.click["undefined"].length === 1, 'undefined selector has one event');

    // reset events
    evt.events = {};
});

QUnit.test("add delegated event", function (assert) {
    evt.on('click', 'div', function (e) {

    });

    assert.ok(evt.events.click, 'Click event added');
    assert.ok(evt.events.click["div"].length === 1, '"div" selector has one event')

    // reset events
    evt.events = {};
});

QUnit.test("remove event; all", function (assert) {
    var clicked = false,
        dblclicked = false,
        clicker = function () {
            clicked = true;
        },
        dblclicker = function () {
            dblclicked = true;
        },
        click = document.createEvent('MouseEvents'),
        dblclick = document.createEvent('MouseEvents');

    click.initEvent('click', true, true);
    dblclick.initEvent('dblclick', true, true);

    evt.on('click', clicker);
    evt.on('dblclick', dblclicker);

    evt.off();

    evt.el.dispatchEvent(click);
    evt.el.dispatchEvent(dblclick);

    assert.ok(clicked === false, 'click is gone');
    assert.ok(dblclicked === false, 'dblclick is gone');

    evt.events = {};
});

QUnit.test("remove event; single", function (assert) {
    var clicked = false,
        dblclicked = false,
        clicker = function () {
            clicked = true;
        },
        dblclicker = function () {
            dblclicked = true;
        },
        click = document.createEvent('MouseEvents'),
        dblclick = document.createEvent('MouseEvents');

    click.initEvent('click', true, true);
    dblclick.initEvent('dblclick', true, true);


    evt.on('click', clicker);
    evt.on('dblclick', dblclicker);

    evt.off('click');

    evt.el.dispatchEvent(click);
    evt.el.dispatchEvent(dblclick);

    assert.ok(clicked === false, 'click is gone');
    assert.ok(dblclicked === true, 'dblclick is present');

    evt.events = {};
});

QUnit.test("remove delegated event; all", function (assert) {
    var clicked = false,
        dblclick = false,
        clicker = function () {
            clicked = true;
        },
        dblclicker = function () {
            dblclick = true;
        },
        click = document.createEvent('MouseEvents'),
        dblclick = document.createEvent('MouseEvents');

    click.initEvent('click', true, true);
    dblclick.initEvent('dblclick', true, true);

    evt.on('click', 'div', clicker);
    evt.on('dblclick', 'div', dblclicker);

    evt.off('click', 'div');

    evt.el.querySelector('div').dispatchEvent(click);
    evt.el.querySelector('div').dispatchEvent(dblclick);

    assert.ok(clicked === false, 'click is gone');
    assert.ok(dblclick === true, 'dblclick is present');

    evt.events = {};
});

QUnit.test("remove delegated event; single", function (assert) {
    var clicked = false,
        context = false,
        clicker = function () {
            clicked = true;
        },
        contexter = function () {
            context = true;
        },
        click = document.createEvent('MouseEvents'),
        dblclick = document.createEvent('MouseEvents');

    click.initEvent('click', true, true);
    dblclick.initEvent('dblclick', true, true);

    evt.on('click', 'div', clicker);
    evt.on('click', 'div', contexter);

    evt.off('click', 'div', clicker);

    evt.el.querySelector('div').dispatchEvent(click);

    assert.ok(clicked === false, 'click is gone');
    assert.ok(context === true, 'contextmenu is present');

    evt.off();
});

QUnit.test("stopPropagation; Evt handlers only", function (assert) {
    var level1 = false,
        level2 = false,
        clicker1 = function () {
            level1 = true;
        },
        clicker2 = function (e) {
            level2 = true;
            e.stopPropagation();
        },
        click = document.createEvent('MouseEvents'),
        evt = new Evt("#propagation");

    click.initEvent('click', true, true);

    evt.on('click', '#level2', clicker2);
    evt.on('click', '#level1', clicker1);

    document.querySelector('#level2').dispatchEvent(click);

    assert.ok(level1 === false, 'Level 1 is not reached');
    assert.ok(level2 === true, 'level 2 is reached');

    evt.off();
});

QUnit.test("stopPropagation; Mixed handlers", function (assert) {
    var level1 = false,
        level2 = false,
        clicker1 = function () {
            level1 = true;
        },
        clicker2 = function (e) {
            level2 = true;
            e.stopPropagation();
        },
        click = document.createEvent('MouseEvents'),
        evt = new Evt("#propagation"),
        element = document.querySelector('#level2');

    click.initEvent('click', true, true);

    evt.on('click', '#level1', clicker1);
    element.addEventListener('click', clicker2);

    element.dispatchEvent(click);

    assert.ok(level1 === false, 'Level 1 is not reached');
    assert.ok(level2 === true, 'level 2 is reached');

    element.removeEventListener('click', clicker2);
});
