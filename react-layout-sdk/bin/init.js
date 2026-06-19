#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const args = process.argv.slice(2);
const command = args[0] || 'init';

const projectRoot = process.cwd();

// Detect project structure
const hasSrc = fs.existsSync(path.join(projectRoot, 'src'));
const basePath = hasSrc ? path.join(projectRoot, 'src') : projectRoot;

const componentsDir = path.join(basePath, 'components');
const hasAppRouter = fs.existsSync(path.join(basePath, 'app'));
const hasPagesRouter = fs.existsSync(path.join(basePath, 'pages'));

if (!hasAppRouter && !hasPagesRouter) {
  console.error("❌ Could not find an 'app' or 'pages' directory. Make sure you are running this in the root of a Next.js project.");
  process.exit(1);
}

// Helper to ensure directory exists
function ensureDirSync(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
    console.log(`📁 Created directory: ${dirPath}`);
  }
}

function toPascalCase(str) {
  return str.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join('');
}

if (command === 'generate' || command === 'g') {
  const type = args[1];
  const uid = args[2];

  if (type === 'component' && uid) {
    ensureDirSync(componentsDir);
    
    // Parse UID
    let category = 'core';
    let compName = uid;
    if (uid.includes('.')) {
      const parts = uid.split('.');
      category = parts[0];
      compName = parts[1];
    }
    
    const componentNamePascal = toPascalCase(compName);
    
    // 1. Create Component File
    const compPath = path.join(componentsDir, `${componentNamePascal}.tsx`);
    if (!fs.existsSync(compPath)) {
      const compContent = `import React from 'react';\n\nexport default function ${componentNamePascal}(props: any) {\n  return (\n    <div style={{ padding: '20px', border: '1px solid #ddd', margin: '10px 0' }}>\n      <h2>${componentNamePascal} Component</h2>\n      <pre style={{ background: '#f4f4f4', padding: '10px' }}>{JSON.stringify(props, null, 2)}</pre>\n    </div>\n  );\n}\n`;
      fs.writeFileSync(compPath, compContent);
      console.log(`✅ Created component: components/${componentNamePascal}.tsx`);
    } else {
      console.log(`⚠️  Component components/${componentNamePascal}.tsx already exists. Skipping creation.`);
    }

    // 2. Update factory.ts / factory.tsx
    let factoryPath = path.join(componentsDir, 'factory.ts');
    if (!fs.existsSync(factoryPath)) {
      if (fs.existsSync(path.join(componentsDir, 'factory.tsx'))) {
        factoryPath = path.join(componentsDir, 'factory.tsx');
      } else if (fs.existsSync(path.join(componentsDir, 'factory.js'))) {
        factoryPath = path.join(componentsDir, 'factory.js');
      }
    }
    
    if (fs.existsSync(factoryPath)) {
      let factoryContent = fs.readFileSync(factoryPath, 'utf8');
      
      // Inject Import
      const importStatement = `import ${componentNamePascal} from './${componentNamePascal}';`;
      if (!factoryContent.includes(importStatement)) {
        // Find last import
        const lines = factoryContent.split('\n');
        let lastImportIndex = -1;
        for (let i = 0; i < lines.length; i++) {
          if (lines[i].startsWith('import ')) {
            lastImportIndex = i;
          }
        }
        
        if (lastImportIndex !== -1) {
          lines.splice(lastImportIndex + 1, 0, importStatement);
        } else {
          lines.unshift(importStatement);
        }
        factoryContent = lines.join('\n');
      }

      // Inject Mapping
      const mappingStatement = `'${uid}': ${componentNamePascal},`;
      if (!factoryContent.includes(`'${uid}':`) && !factoryContent.includes(`"${uid}":`)) {
        factoryContent = factoryContent.replace(
          /(?:export\s+)?const\s+componentMap.*=\s*{/,
          `$& \n  ${mappingStatement}`
        );
      }
      
      fs.writeFileSync(factoryPath, factoryContent);
      console.log(`✅ Registered '${uid}' in components/factory.ts`);
    } else {
      console.error(`❌ components/factory.ts not found. Please run 'npx react-layout-sdk init' first.`);
    }
    
    process.exit(0);
  } else {
    console.error("❌ Usage: npx react-layout-sdk generate component <component.uid>");
    process.exit(1);
  }
}

if (command === 'init') {
  ensureDirSync(componentsDir);

  // 1. Create factory.ts
  const factoryPath = path.join(componentsDir, 'factory.ts');
  const factoryContent = `import Header from './Header';\nimport Footer from './Footer';\n\nexport const componentMap = {\n  'core.header': Header,\n  'core.footer': Footer,\n};\n`;
  if (!fs.existsSync(factoryPath)) {
    fs.writeFileSync(factoryPath, factoryContent);
    console.log('✅ Created components/factory.ts');
  }

  // 2. Create Header.tsx
  const headerPath = path.join(componentsDir, 'Header.tsx');
  const headerContent = `import React from 'react';\n\nexport default function Header(props: any) {\n  const title = props?.title || 'JD Header';\n  const logoUrl = props?.logoUrl;\n\n  return (\n    <header style={{ padding: '20px', background: '#f5f5f5', borderBottom: '1px solid #ddd' }}>\n      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>\n        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>\n          {logoUrl && <img src={logoUrl} alt="Logo" width="40" />}\n          <h1 style={{ margin: 0, fontSize: '1.5rem' }}>{title}</h1>\n        </div>\n      </div>\n    </header>\n  );\n}\n`;
  if (!fs.existsSync(headerPath)) {
    fs.writeFileSync(headerPath, headerContent);
    console.log('✅ Created components/Header.tsx');
  }

  // 3. Create Footer.tsx
  const footerPath = path.join(componentsDir, 'Footer.tsx');
  const footerContent = `import React from 'react';\n\nexport default function Footer(props: any) {\n  const text = props?.text || '© 2026 JD Layout';\n  return (\n    <footer style={{ padding: '20px', background: '#333', color: '#fff', textAlign: 'center', marginTop: '40px' }}>\n      <p style={{ margin: 0 }}>{text}</p>\n    </footer>\n  );\n}\n`;
  if (!fs.existsSync(footerPath)) {
    fs.writeFileSync(footerPath, footerContent);
    console.log('✅ Created components/Footer.tsx');
  }

  // 4. Generate Page routing
  if (hasAppRouter) {
    console.log('🔍 Detected Next.js App Router');
    
    const existingAppPage = path.join(basePath, 'app', 'page.tsx');
    if (fs.existsSync(existingAppPage)) {
      const backupPath = path.join(basePath, 'app', 'page.tsx.bak');
      fs.renameSync(existingAppPage, backupPath);
      console.log('⚠️  Renamed existing app/page.tsx to app/page.tsx.bak to avoid catch-all route conflict.');
    }

    const pageDir = path.join(basePath, 'app', '[[...slug]]');
    ensureDirSync(pageDir);
    
    const appPagePath = path.join(pageDir, 'page.tsx');
    const appPageContent = `import React from 'react';\nimport { fetchJDLayout, Placeholder } from 'react-layout-sdk';\nimport { componentMap } from '@/components/factory';\n\nexport default async function Page({ params }: { params: Promise<{ slug?: string[] }> }) {\n  const resolvedParams = await params;\n  const slugArray = resolvedParams?.slug || [];\n  const path = slugArray.join('/') || '/';\n  const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337';\n  \n  try {\n    const layoutData = await fetchJDLayout(STRAPI_URL, path, 'en');\n    if (!layoutData || !layoutData.strapi) return <h1>404 - Not Found</h1>;\n\n    const { route } = layoutData.strapi;\n\n    return (\n      <div className="layout-wrapper">\n        <Placeholder name="header" rendering={route.placeholders.header || []} componentMap={componentMap} />\n        <main style={{ minHeight: '60vh', padding: '20px' }}>\n          <Placeholder name="main" rendering={route.placeholders.main || []} componentMap={componentMap} />\n        </main>\n        <Placeholder name="footer" rendering={route.placeholders.footer || []} componentMap={componentMap} />\n      </div>\n    );\n  } catch (error) {\n    return <h1>Error Loading Layout</h1>;\n  }\n}\n`;
    if (!fs.existsSync(appPagePath)) {
      fs.writeFileSync(appPagePath, appPageContent);
      console.log('✅ Created app/[[...slug]]/page.tsx');
    }
  } else if (hasPagesRouter) {
    console.log('🔍 Detected Next.js Pages Router');

    const existingPagesIndex = path.join(basePath, 'pages', 'index.tsx');
    if (fs.existsSync(existingPagesIndex)) {
      const backupPath = path.join(basePath, 'pages', 'index.tsx.bak');
      fs.renameSync(existingPagesIndex, backupPath);
      console.log('⚠️  Renamed existing pages/index.tsx to pages/index.tsx.bak to avoid catch-all route conflict.');
    }

    const pagePath = path.join(basePath, 'pages', '[[...slug]].tsx');
    const pagesContent = `import React from 'react';\nimport { fetchJDLayout, Placeholder } from 'react-layout-sdk';\nimport { componentMap } from '@/components/factory';\n\nexport default function LayoutPage({ layoutData, error }: any) {\n  if (error || !layoutData?.strapi) return <h1>404 - Layout Not Found</h1>;\n\n  const { route } = layoutData.strapi;\n  return (\n    <div className="layout-wrapper">\n      <Placeholder name="header" rendering={route.placeholders.header || []} componentMap={componentMap} />\n      <main style={{ minHeight: '60vh', padding: '20px' }}>\n        <Placeholder name="main" rendering={route.placeholders.main || []} componentMap={componentMap} />\n      </main>\n      <Placeholder name="footer" rendering={route.placeholders.footer || []} componentMap={componentMap} />\n    </div>\n  );\n}\n\nexport async function getServerSideProps(context: any) {\n  const slugArray = context.params?.slug || [];\n  const path = slugArray.join('/') || '/';\n  const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337';\n\n  try {\n    const layoutData = await fetchJDLayout(STRAPI_URL, path, 'en');\n    if (!layoutData) return { notFound: true };\n\n    return { props: { layoutData } };\n  } catch (error) {\n    return { props: { error: true } };\n  }\n}\n`;
    if (!fs.existsSync(pagePath)) {
      fs.writeFileSync(pagePath, pagesContent);
      console.log('✅ Created pages/[[...slug]].tsx');
    }
  }

  console.log('\n🚀 Layout setup complete! Please verify your Strapi URL in your routing page.');
}
