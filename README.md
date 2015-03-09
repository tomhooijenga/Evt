# Evt
Javascript Event delegation

## Api
``` js
// create a new instance
var evt = new Evt('#mydiv');

// Works like a Factory too
var evt2 = Evt('#mydiv');

// Instances are recycled
evt === evt2 // true

// Attach an event
evt.on('click', function (e) {
  // Do stuff
});

// Attach a delegated event
evt.on('click', 'a', function (e) {
  // Do stuff
});

// Chain an event
evt.on('click', 'a', function (e) {
  // Do stuff
}).on('dblclick', function (e) {
  // Do more stuff
});

// Remov all events
evt.off();

// Remove a specific event
evt.off('click');

// Remove a specific handler for an event
evt.off('click', func);

// Remove a specific delegated event
evt.off('click', 'a');

// Remove a specific handler for a delegated event
evt.off('click', 'a', func);
```
## Compatibility
Evt should work in recent browsers (IE >= 9). It requires W3C Events (addEventHandler/removeEventHandler),
as well as the following functions.
* ``Node.matches``
* ``Array.prototype.indexOf``
* ``Object.keys``
