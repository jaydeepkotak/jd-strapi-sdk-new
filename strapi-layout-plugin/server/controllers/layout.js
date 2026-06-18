'use strict';

const getComponentPopulate = (strapi, componentUid, depth = 0) => {
  if (depth > 2) return '*';
  const component = strapi.components[componentUid];
  if (!component) return '*';

  const populate = {};
  const attributes = component.attributes || {};

  for (const [attrName, attrDef] of Object.entries(attributes)) {
     const type = attrDef.type;
     if (type === 'media') {
         populate[attrName] = true;
     } else if (type === 'component') {
         const targetComp = attrDef.component;
          populate[attrName] = {
              populate: getComponentPopulate(strapi, targetComp, depth + 1)
          };
     } else if (type === 'relation') {
          populate[attrName] = { populate: '*' };
     }
  }
  return Object.keys(populate).length > 0 ? populate : '*';
};

const getDynamicSectionsPopulate = (strapi) => {
  const populate = {};
  const components = strapi.components;

  for (const [uid, schema] of Object.entries(components)) {
    if (uid.startsWith('velox.')) {
      const attributes = schema.attributes || {};
      const populateMap = {}; 

      for (const [attrName, attrDef] of Object.entries(attributes)) {
        const type = attrDef.type;

        if (type === 'media') {
             populateMap[attrName] = true;
        } else if (type === 'component') {
             const targetComp = attrDef.component;
             populateMap[attrName] = { 
                populate: getComponentPopulate(strapi, targetComp)
             };
        } else if (type === 'dynamiczone') {
             populateMap[attrName] = { populate: '*' };
        } else if (type === 'relation' && attrDef.target) {
           const targetUid = attrDef.target;
           const targetModel = strapi.contentTypes[targetUid];
           
           if (targetModel) {
               const targetAttributes = targetModel.attributes || {};
               const targetPopulate = {};
               let hasComplexFields = false;

               for (const [targetAttrName, targetAttrDef] of Object.entries(targetAttributes)) {
                   if (targetAttrDef.type === 'component') {
                       const targetComp = targetAttrDef.component;
                       targetPopulate[targetAttrName] = { 
                           populate: getComponentPopulate(strapi, targetComp)
                       };
                       hasComplexFields = true;
                   } else if (targetAttrDef.type === 'dynamiczone') {
                       targetPopulate[targetAttrName] = { populate: '*' };
                       hasComplexFields = true;
                   } else if (targetAttrDef.type === 'media') {
                       targetPopulate[targetAttrName] = true;
                       hasComplexFields = true;
                   }
               }

               if (hasComplexFields) {
                   populateMap[attrName] = { populate: targetPopulate };
               } else {
                   populateMap[attrName] = { populate: '*' }; 
               }
           }
        }
      }
      
      if (Object.keys(populateMap).length > 0) {
          populate[uid] = { populate: populateMap };
      } else {
          populate[uid] = { populate: '*' };
      }
    }
  }
  return populate;
};

module.exports = ({ strapi }) => ({
  async getLayout(ctx) {
    const { slug } = ctx.params;

    try {
      const requestedLocale = ctx.query.locale || 'en';
      let availableLocales = [];
      try {
          if (strapi.plugin('i18n')) {
             availableLocales = await strapi.plugin('i18n').service('locales').find();
          }
      } catch (e) {
          console.warn('Layout Plugin: Could not fetch locales', e);
      }

      console.log('Layout Plugin: Processing slug:', slug);
      
      let slugVariations = [
        slug,
        slug.startsWith('/') ? slug.substring(1) : `/${slug}`,
        slug.endsWith('/') ? slug.slice(0, -1) : slug 
      ].filter(Boolean);

      let page = null;
      const pages = await strapi.entityService.findMany('api::page.page', {
        locale: requestedLocale,
        filters: { 
            slug: {
                $in: slugVariations
            }
        },
        populate: {
          seo: { populate: '*' },
          sections: {
            on: getDynamicSectionsPopulate(strapi)
          },
        },
      });

      if (pages && pages.length > 0) {
        page = pages[0];
      }

      if (!page) {
         let childSlug = slug;
         let parentSlug = '';
         
         if (slug.includes('/')) {
             const parts = slug.split('/');
             childSlug = parts.pop();
             parentSlug = parts.join('/');
         }
         
         let allowedContentType = null;
         
         if (parentSlug) {
             const parentPage = await strapi.entityService.findMany('api::page.page', {
                 filters: { slug: parentSlug },
                 limit: 1,
                 populate: { sections: true }
             });
             
             if (parentPage && parentPage.length > 0) {
                 const p = parentPage[0];
                 if (p.relatedContentType) {
                     allowedContentType = p.relatedContentType;
                 } else if (p.sections && Array.isArray(p.sections)) {
                     for (const section of p.sections) {
                         const compName = section.__component;
                         if (compName && compName.endsWith('-list')) {
                             const parts = compName.split('.');
                             if (parts.length > 1) {
                                 const featureName = parts[1].replace(/-list$/, '');
                                 const candidateUid = `api::${featureName}.${featureName}`;
                                 if (strapi.contentTypes[candidateUid]) {
                                     allowedContentType = candidateUid;
                                     break; 
                                 }
                             }
                         }
                     }
                 }
                 
                 if (!allowedContentType) {
                    for (const [uid, ct] of Object.entries(strapi.contentTypes)) {
                        if (!uid.startsWith('api::')) continue;
                        const info = ct.info || {};
                        if (info.pluralName === parentSlug || ct.collectionName === parentSlug || info.singularName === parentSlug) {
                            allowedContentType = uid;
                            break;
                        }
                    }
                 }
             }
         }

         let routableTypes = [];
         if (allowedContentType) {
             routableTypes = [allowedContentType];
         } else if (parentSlug) {
             routableTypes = []; 
         }

         for (const uid of routableTypes) {
             if (!strapi.contentTypes[uid]) continue;
             
             const entities = await strapi.entityService.findMany(uid, {
                locale: requestedLocale,
                filters: { slug: childSlug },
                populate: (function() {
                    const model = strapi.contentTypes[uid];
                    const attributes = model?.attributes || {};
                    const populate = {};
                    const candidates = ['section', 'sections', 'seo', 'image', 'banner', 'blocks'];
                    for (const candidate of candidates) {
                        if (attributes[candidate]) {
                             if (attributes[candidate].type === 'dynamiczone' || attributes[candidate].type === 'component') {
                                 populate[candidate] = { populate: '*' };
                             } else if (attributes[candidate].type === 'media') {
                                 populate[candidate] = true;
                             } else if (attributes[candidate].type === 'relation') {
                                 populate[candidate] = { populate: '*' };
                             }
                        }
                    }
                    return populate;
                })()
             });

             if (entities && entities.length > 0) {
                 const entity = entities[0];
                 const typeName = uid.split('.')[1];
                 
                 let pageSections = [];
                 if (Array.isArray(entity.section)) {
                     pageSections = entity.section;
                 } else if (Array.isArray(entity.sections)) {
                     pageSections = entity.sections;
                 } else if (Array.isArray(entity.blocks)) {
                     pageSections = entity.blocks;
                 } else {
                     pageSections = [{
                         __component: `velox.${typeName}-detail`,
                         id: 0,
                         ...entity
                     }];
                 }

                 page = {
                    id: `${typeName}-${entity.id}`,
                    title: entity.title || entity.name || 'Untitled',
                    slug: slug, 
                    sections: pageSections
                 };
                 break;
             }
         }
      }

      if (!page) {
        return ctx.notFound('Page/Article not found');
      }

      const globalLayout = await strapi.entityService.findMany('api::layout.layout', {
          locale: requestedLocale,
          populate: {
              defaultSeo: { populate: '*' },
              header: { on: getDynamicSectionsPopulate(strapi) },
              footer: { on: getDynamicSectionsPopulate(strapi) }
          }
      });
      
      const siteName = globalLayout?.siteName || "Velox";
      const language = page.locale || requestedLocale;
      const { sections } = page;

      ctx.body = {
        strapi: {
          context: {
            pageEditing: false, 
            site: { name: siteName },
            language: language,
            locales: availableLocales 
          },
          route: {
            name: slug,
            displayName: page.title,
            placeholders: {
              header: globalLayout?.header || [],
              main: sections || [],
              footer: globalLayout?.footer || []
            }
          },
        },
      };
    } catch (err) {
      console.error('Layout Plugin Error:', err);
      return ctx.internalServerError('Internal Server Error', err);
    }
  },
});
