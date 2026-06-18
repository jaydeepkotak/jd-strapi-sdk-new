'use strict';

module.exports = {
  type: 'content-api',
  routes: [
    {
      method: 'GET',
      path: '/:slug(.*)',
      handler: 'layout.getLayout',
      config: {
        auth: false,
      },
    },
  ],
};
