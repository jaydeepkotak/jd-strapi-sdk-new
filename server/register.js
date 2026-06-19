'use strict';

const fs = require('fs');
const path = require('path');

module.exports = ({ strapi }) => {
  // --- Auto-seed & Inject components before Strapi loads models ---
  try {
    const pluginComponentsDir = path.join(__dirname, 'components');
    const appComponentsDir = path.join(strapi.dirs.app.src, 'components');

    // 1. Inject directly into memory to prevent database.init crash
    const componentsToInject = {
      'core.header': require('./components/core/header.json'),
      'core.footer': require('./components/core/footer.json'),
      'core.link': require('./components/core/link.json'),
      'core.social-link': require('./components/core/social-link.json'),
      'core.footer-column': require('./components/core/footer-column.json'),
      'shared.seo': require('./components/shared/seo.json')
    };

    if (!strapi.components) {
      strapi.components = {};
    }

    for (const [uid, schema] of Object.entries(componentsToInject)) {
      if (!strapi.components[uid]) {
        const parts = uid.split('.');
        const category = parts[0];
        const modelName = parts.slice(1).join('.');
        
        // Mock the structure Strapi expects for components to avoid database.init crash
        strapi.components[uid] = Object.assign({}, schema, { 
          uid, 
          category,
          modelName,
          modelType: 'component'
        });
      }
    }

    // 2. Also copy to physical files so user can see them in UI
    const coreDir = path.join(appComponentsDir, 'core');
    const sharedDir = path.join(appComponentsDir, 'shared');

    if (!fs.existsSync(appComponentsDir)) fs.mkdirSync(appComponentsDir, { recursive: true });
    if (!fs.existsSync(coreDir)) fs.mkdirSync(coreDir, { recursive: true });
    if (!fs.existsSync(sharedDir)) fs.mkdirSync(sharedDir, { recursive: true });

    const filesToCopy = [
      { src: path.join(pluginComponentsDir, 'core', 'header.json'), dest: path.join(coreDir, 'header.json') },
      { src: path.join(pluginComponentsDir, 'core', 'footer.json'), dest: path.join(coreDir, 'footer.json') },
      { src: path.join(pluginComponentsDir, 'core', 'link.json'), dest: path.join(coreDir, 'link.json') },
      { src: path.join(pluginComponentsDir, 'core', 'social-link.json'), dest: path.join(coreDir, 'social-link.json') },
      { src: path.join(pluginComponentsDir, 'core', 'footer-column.json'), dest: path.join(coreDir, 'footer-column.json') },
      { src: path.join(pluginComponentsDir, 'shared', 'seo.json'), dest: path.join(sharedDir, 'seo.json') }
    ];

    filesToCopy.forEach(({ src, dest }) => {
      if (!fs.existsSync(dest) && fs.existsSync(src)) {
        fs.copyFileSync(src, dest);
      }
    });

    // 3. Scaffold Page API if it doesn't exist
    const apiPageDir = path.join(strapi.dirs.app.src, 'api', 'page');
    const apiPageContentTypesDir = path.join(apiPageDir, 'content-types', 'page');
    const apiPageRoutesDir = path.join(apiPageDir, 'routes');
    const apiPageControllersDir = path.join(apiPageDir, 'controllers');
    const apiPageServicesDir = path.join(apiPageDir, 'services');

    if (!fs.existsSync(apiPageDir)) {
      fs.mkdirSync(apiPageContentTypesDir, { recursive: true });
      fs.mkdirSync(apiPageRoutesDir, { recursive: true });
      fs.mkdirSync(apiPageControllersDir, { recursive: true });
      fs.mkdirSync(apiPageServicesDir, { recursive: true });

      const templatesDir = path.join(__dirname, 'templates', 'page');
      
      const pageFilesToCopy = [
        { src: path.join(templatesDir, 'schema.json'), dest: path.join(apiPageContentTypesDir, 'schema.json') },
        { src: path.join(templatesDir, 'route.js'), dest: path.join(apiPageRoutesDir, 'page.js') },
        { src: path.join(templatesDir, 'controller.js'), dest: path.join(apiPageControllersDir, 'page.js') },
        { src: path.join(templatesDir, 'service.js'), dest: path.join(apiPageServicesDir, 'page.js') }
      ];

      pageFilesToCopy.forEach(({ src, dest }) => {
        if (!fs.existsSync(dest) && fs.existsSync(src)) {
          fs.copyFileSync(src, dest);
        }
      });
      strapi.log.info('[strapi-layout-plugin] Scaffolded base page API.');
    }

    strapi.log.info('[strapi-layout-plugin] Injected and seeded layout components during register phase.');
  } catch (error) {
    strapi.log.error('[strapi-layout-plugin] Failed to auto-seed components:', error);
  }
  // -------------------------------------------------------

  const graphqlPlugin = strapi.plugin('graphql');
  
  if (!graphqlPlugin) {
      return;
  }

  const extensionService = graphqlPlugin.service('extension');

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
