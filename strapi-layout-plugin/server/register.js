'use strict';

module.exports = ({ strapi }) => {
  const extensionService = strapi.plugin('graphql').service('extension');

  if (!extensionService) {
      return;
  }

  extensionService.use(({ strapi }) => ({
    typeDefs: `
      type LayoutPlaceholder {
        header: JSON
        main: JSON
        footer: JSON
      }
      
      type LayoutRoute {
        name: String
        displayName: String
        placeholders: LayoutPlaceholder
      }

      type LayoutContext {
        pageEditing: Boolean
        site: JSON
        language: String
        locales: JSON
      }

      type LayoutResponse {
        context: LayoutContext
        route: LayoutRoute
      }

      extend type Query {
        getLayout(slug: String!, locale: String): LayoutResponse
      }
    `,
    resolvers: {
      Query: {
        getLayout: async (parent, args, context) => {
          const { slug, locale } = args;

          // Call the plugin's layout controller directly
          const controller = strapi.plugin('strapi-layout-plugin').controller('layout');
          
          // Mock Koa ctx for the controller
          const mockCtx = {
            params: { slug },
            query: { locale: locale || 'en' },
            notFound: (msg) => { throw new Error(msg || 'Not Found'); },
            internalServerError: (msg, err) => { throw new Error(msg || 'Internal Server Error'); }
          };

          await controller.getLayout(mockCtx);

          if (mockCtx.body && mockCtx.body.strapi) {
             return mockCtx.body.strapi;
          }
          
          throw new Error('Failed to fetch layout via GraphQL');
        },
      },
    },
    resolversConfig: {
      'Query.getLayout': {
        auth: false,
      },
    },
  }));
};
