'use strict';

module.exports = {
  'content-api': {
    type: 'content-api',
    prefix: '',
    routes: [
      {
        method: 'GET',
        path: '/layout/:slug(.*)',
        handler: 'layout.getLayout',
        config: {
          policies: [],
        },
      },
    ],
  },
};
