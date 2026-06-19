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

interface JDPlaceholderData {
    __component: string;
    [key: string]: any;
}
interface JDRoute {
    name: string;
    displayName: string;
    placeholders: Record<string, JDPlaceholderData[]>;
}
interface JDContext {
    pageEditing: boolean;
    site: Record<string, any>;
    language: string;
    locales: any[];
}
interface JDLayoutResponse {
    strapi: {
        context: JDContext;
        route: JDRoute;
    };
}
declare const fetchJDLayout: (apiUrl: string, slug: string, locale?: string, options?: RequestInit) => Promise<JDLayoutResponse | null>;

export { ComponentFactory, type ComponentFactoryProps, type JDContext, type JDLayoutResponse, type JDPlaceholderData, type JDRoute, Placeholder, type PlaceholderProps, fetchJDLayout };
