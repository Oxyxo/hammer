const globRegex = require('glob-to-regexp')

let events = []

/**
 * This method registers the callback function
 * for the given event. When the event is emitted
 * will the callback function be called. You can listen
 * to multiple event with the use of a wildcard.
 * @method   on
 * @param    {String}   event event name that you want to listen to.
 * @param    {Function}    fn this callback function is called when the event occures.
 * @example  intercom.on('pages:*', function (...arguments) {})
 */
exports.on = function (event, cb) {
  events.push({
    'event': event,
    'regexp': globRegex(event),
    'fn': cb
  })
}

/**
 * By calling this method can you emit a message to all
 * listening functions. A payload can be given to the called
 * functions. The given data is applied to the listners callback
 * function.
 * @method   emit
 * @param    {String} event Name of the event that you want to call.
 * @param    {Array}   data the given data will be given in form of a argument to all listeners
 */
exports.emit = function (event, data = []) {
  if (!Array.isArray(data)) {
    data = [data]
  }

  for (let listener of events) {
    if (!listener.regexp.test(event)) {
      continue
    }

    listener.fn.apply(null, data)
  }
}
