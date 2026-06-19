# Strapi Layout Plugin (JD Layout System)

The **Strapi Layout Plugin** is a custom Headless CMS extension designed to provide dynamic, layout-based routing and a component orchestration API out-of-the-box. Paired with the `react-layout-sdk`, it acts as a headless Layout Service—similar to enterprise systems like Sitecore.

## Installation

Install the plugin inside your Strapi project:

```bash
npm install strapi-layout-plugin
```

## Setup & Initialization

After installing the plugin, ensure you have enabled it in your Strapi `config/plugins.js` or `config/plugins.ts` file:

```javascript
module.exports = {
  // ...
  'layout': {
    enabled: true,
    resolve: './node_modules/strapi-layout-plugin' // Optional depending on Strapi version mapping
  },
  // ...
}
```

Once you restart your Strapi backend, the plugin will automatically scaffold:
1. **Core Components**: Automatically injects base components (`core.header`, `core.footer`, `core.link`, etc.) into your Strapi components folder.
2. **Page Collection Type**: Generates a generic `Page` content type to act as the route tree for your layout.
3. **Global Layout Single Type**: Generates a `Global Layout` content type to control persistent layout features across your app.

## API Reference

The plugin exposes a public layout retrieval endpoint:

### `GET /api/layout/:slug`

Fetches the structured JSON layout data representing the matched route, fully populated with dynamic zones (`header`, `main`, and `footer`).

**Response Structure (JD Layout Schema):**
```json
{
  "strapi": {
    "context": {
      "pageEditing": false,
      "site": {
        "name": "JD"
      },
      "language": "en"
    },
    "route": {
      "name": "home",
      "displayName": "Home Page",
      "placeholders": {
        "header": [
          {
            "__component": "core.header",
            "title": "Welcome"
          }
        ],
        "main": [],
        "footer": []
      }
    }
  }
}
```

## Next Steps

To consume this data effortlessly on the frontend, install the companion package in your React / Next.js application:

```bash
npm install react-layout-sdk
```
