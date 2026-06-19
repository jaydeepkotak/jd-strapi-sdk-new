# React Layout SDK (JD Layout System)

The **React Layout SDK** is an enterprise-grade Frontend SDK designed to consume layout definitions from Strapi via the **Strapi Layout Plugin**. Inspired by robust headless ecosystems like Sitecore JSS, this SDK provides dynamic placeholder routing and a scaffold generator to stream-line Developer Experience (DX).

## Installation

Install the package using your favorite package manager:

```bash
npm install react-layout-sdk
```

## Quick Start (Project Scaffolding)

To quickly set up your Next.js project to work with the JD Layout System, run the init command at the root of your project:

```bash
npx react-layout-sdk init
```

**What this does:**
1. Creates a `src/components/factory.tsx` file for component mapping.
2. Generates base boilerplate components like `Header.tsx` and `Footer.tsx`.
3. Auto-configures your Next.js App Router (`app/[[...slug]]/page.tsx`) or Pages Router to catch all layout routes and fetch them dynamically using `fetchJDLayout`.

## Component Scaffolding

You can scaffold new React components and automatically map them to their corresponding Strapi components in `factory.tsx` using the generate command:

```bash
npx react-layout-sdk generate component <strapi-component-uid>
```

**Example:**
```bash
npx react-layout-sdk generate component blocks.hero-banner
```
*This command will:*
- Create `src/components/HeroBanner.tsx`.
- Automatically inject `import HeroBanner` and map `'blocks.hero-banner': HeroBanner` inside your `factory.tsx`.

## API Reference

### 1. `fetchJDLayout(apiUrl, slug, locale)`
Fetches the layout structure and content from the Strapi backend.

```typescript
import { fetchJDLayout } from 'react-layout-sdk';

const layoutData = await fetchJDLayout('http://localhost:1337', '/home', 'en');
const { route } = layoutData.strapi;
```

### 2. `<Placeholder />`
Renders a specific dynamic zone (like `header`, `main`, or `footer`) by matching the JSON data against your React components.

```tsx
import { Placeholder } from 'react-layout-sdk';
import { componentMap } from '@/components/factory';

<main>
  <Placeholder 
    name="main" 
    rendering={route.placeholders.main || []} 
    componentMap={componentMap} 
  />
</main>
```

## TypeScript Support

This package comes with full TypeScript definitions, including `JDLayoutResponse`, `JDRoute`, and `JDContext`.
