'use strict'

let events = {}

/**
 *
 * @method   on
 * @param    {String}  event Name of the event that you want to listen to.
 * @param    {Function}   fn The callback function that needs to be called on that event.
 */
exports.on = function (event, fn) {
  if (!events[event]) {
    events[event] = []
  }

  events[event].push(fn)
}

/**
 *
 * @method   call
 * @param    {String}    event Name of the event that you want to call
 * @param    {Object}     data Args that you want to give to the events
 * @param    {Object}  options Options to give to the call function
 * @returns  {Promise}         A promise that returns a string if resolved, or an Error if rejected.
 */
exports.call = async function (event, data = {}, options = {}) {
  if (!events[event]) {
    return
  }

  let ctx = data

  for (let listener in events[event]) {
    const callback = events[event][listener]
    await callback(ctx)
  }

  return ctx
}
