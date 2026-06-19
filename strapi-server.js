'use strict';

const register = require('./server/register');
const server = require('./server');

module.exports = {
  register,
  ...server,
};
