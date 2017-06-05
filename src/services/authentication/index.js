/**
 * @summary Race timing system
 * @author Guillaume Deconinck & Wojciech Grynczel
*/

'use strict';

const authentication = require('feathers-authentication');
const local = require('feathers-authentication-local');
const jwt = require('feathers-authentication-jwt');

module.exports = function() {
  const app = this;

  let config = app.get('auth');

  app.configure(authentication(config.token));
  app.configure(local());
  app.configure(jwt());

  app.service('authentication')
    .hooks({
      before: {
        // You can chain multiple strategies on create method
        create: [authentication.hooks.authenticate(['jwt', 'local'])]
      }
  });


};
