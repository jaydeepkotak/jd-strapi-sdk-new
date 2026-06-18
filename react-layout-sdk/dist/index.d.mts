import React from 'react';

interface ComponentFactoryProps {
    componentName: string;
    props: any;
    placeholderName?: string;
    customProps?: any;
    componentMap: Record<string, React.ComponentType<any>>;
}
declare const ComponentFactory: React.FC<ComponentFactoryProps>;
interface PlaceholderProps {
    name: string;
    rendering: any[];
    customProps?: any;
    componentMap: Record<string, React.ComponentType<any>>;
}
declare const Placeholder: React.FC<PlaceholderProps>;

interface VeloxPlaceholderData {
    __component: string;
    [key: string]: any;
}
interface VeloxRoute {
    name: string;
    displayName: string;
    placeholders: Record<string, VeloxPlaceholderData[]>;
}
interface VeloxContext {
    pageEditing: boolean;
    site: Record<string, any>;
    language: string;
    locales: any[];
}
interface VeloxLayoutResponse {
    strapi: {
        context: VeloxContext;
        route: VeloxRoute;
    };
}
declare const fetchVeloxLayout: (apiUrl: string, slug: string, locale?: string, options?: RequestInit) => Promise<VeloxLayoutResponse | null>;

export { ComponentFactory, type ComponentFactoryProps, Placeholder, type PlaceholderProps, type VeloxContext, type VeloxLayoutResponse, type VeloxPlaceholderData, type VeloxRoute, fetchVeloxLayout };
