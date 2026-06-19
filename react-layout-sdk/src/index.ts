export { Placeholder, ComponentFactory } from './Placeholder';
export type { PlaceholderProps, ComponentFactoryProps } from './Placeholder';

// Useful type definitions for the API response
export interface JDPlaceholderData {
  __component: string;
  [key: string]: any;
}

export interface JDRoute {
  name: string;
  displayName: string;
  placeholders: Record<string, JDPlaceholderData[]>;
}

export interface JDContext {
  pageEditing: boolean;
  site: Record<string, any>;
  language: string;
  locales: any[];
}

export interface JDLayoutResponse {
  strapi: {
    context: JDContext;
    route: JDRoute;
  }
}

// Hook / Utility function to fetch layout
export const fetchJDLayout = async (
    apiUrl: string, 
    slug: string, 
    locale: string = 'en',
    options?: RequestInit
): Promise<JDLayoutResponse | null> => {
    try {
        const querySymbol = slug.includes('?') ? '&' : '?';
        const res = await fetch(`${apiUrl}/api/layout/${slug}${querySymbol}locale=${locale}`, {
            ...options,
        });

        if (!res.ok) {
            console.error(`[JD SDK] Failed to fetch layout: ${res.statusText}`);
            return null;
        }

        return await res.json() as JDLayoutResponse;
    } catch (error) {
        console.error(`[JD SDK] Network error fetching layout`, error);
        return null;
    }
}
