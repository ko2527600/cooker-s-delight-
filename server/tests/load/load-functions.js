/**
 * Artillery helper functions for the load test.
 * Provides dynamic data generators used in scenario flows.
 */

let counter = 0

/**
 * Generates a unique delivery address for each virtual user.
 */
export function generateDeliveryData(context, events, done) {
  counter++
  context.vars.deliveryAddress = `${counter} Load Test Street, Accra`
  context.vars.orderNote = `Load test order #${counter}`
  return done()
}

/**
 * Generates a random menu category for filtering tests.
 */
export function pickRandomCategory(context, events, done) {
  const categories = ["Rice Dishes", "Soups", "Grills", "Drinks", "Sides"]
  context.vars.category = categories[Math.floor(Math.random() * categories.length)]
  return done()
}

/**
 * Logs response time for custom reporting.
 */
export function logSlowResponse(requestParams, response, context, events, done) {
  if (response.timings.response > 300) {
    console.warn(`Slow response: ${response.timings.response}ms for ${requestParams.url}`)
  }
  return done()
}
