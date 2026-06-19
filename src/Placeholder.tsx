import React from 'react';

export interface ComponentFactoryProps {
  componentName: string;
  props: any;
  placeholderName?: string;
  customProps?: any;
  componentMap: Record<string, React.ComponentType<any>>;
}

export const ComponentFactory: React.FC<ComponentFactoryProps> = ({ 
  componentName, 
  props, 
  placeholderName, 
  customProps,
  componentMap 
}) => {
  const Component = componentMap[componentName];

  if (!Component) {
    console.warn(`[JD SDK] Component not found for: ${componentName}`);
    return (
      <div style={{
          padding: '2rem', 
          margin: '1rem', 
          border: '2px dashed #eab308', 
          backgroundColor: '#fef9c3', 
          color: '#713f12', 
          borderRadius: '0.75rem', 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          justifyContent: 'center',
          fontFamily: 'sans-serif'
      }}>
        <strong style={{ fontSize: '1.25rem', color: '#ca8a04', marginBottom: '0.5rem' }}>⚠️ Warning</strong> 
        <div style={{ fontSize: '1.125rem' }}>
          Component not implemented: 
          <code style={{ 
              backgroundColor: '#f3f4f6', 
              padding: '0.25rem 0.5rem', 
              borderRadius: '0.25rem', 
              marginLeft: '0.5rem',
              color: '#1f2937',
              border: '1px solid #d1d5db'
          }}>
            {componentName}
          </code>
        </div>
      </div>
    );
  }

  return <Component styles={props.styles} placeholderName={placeholderName} {...props} {...customProps} />;
};

export interface PlaceholderProps {
    name: string;
    rendering: any[];
    customProps?: any;
    componentMap: Record<string, React.ComponentType<any>>;
}

export const Placeholder: React.FC<PlaceholderProps> = ({ name, rendering, customProps, componentMap }) => {
    if(!rendering || !Array.isArray(rendering) || rendering.length === 0) return null;

    return (
        <React.Fragment>
            {rendering.map((component, index) => (
                <ComponentFactory 
                    key={`${component.__component}-${index}`} 
                    componentName={component.__component} 
                    props={component}
                    customProps={customProps}
                    placeholderName={name}
                    componentMap={componentMap}
                />
            ))}
        </React.Fragment>
    );
}
