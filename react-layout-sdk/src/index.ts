export { Placeholder, ComponentFactory } from './Placeholder';
export type { PlaceholderProps, ComponentFactoryProps } from './Placeholder';

// Useful type definitions for the API response
export interface VeloxPlaceholderData {
  __component: string;
  [key: string]: any;
}

export interface VeloxRoute {
  name: string;
  displayName: string;
  placeholders: Record<string, VeloxPlaceholderData[]>;
}

export interface VeloxContext {
  pageEditing: boolean;
  site: Record<string, any>;
  language: string;
  locales: any[];
}

export interface VeloxLayoutResponse {
  strapi: {
    context: VeloxContext;
    route: VeloxRoute;
  }
}

// Hook / Utility function to fetch layout
export const fetchVeloxLayout = async (
    apiUrl: string, 
    slug: string, 
    locale: string = 'en',
    options?: RequestInit
): Promise<VeloxLayoutResponse | null> => {
    try {
        const querySymbol = slug.includes('?') ? '&' : '?';
        const res = await fetch(`${apiUrl}/api/layout/${slug}${querySymbol}locale=${locale}`, {
            ...options,
        });

        if (!res.ok) {
            console.error(`[Velox SDK] Failed to fetch layout: ${res.statusText}`);
            return null;
        }

        return await res.json() as VeloxLayoutResponse;
    } catch (error) {
        console.error(`[Velox SDK] Network error fetching layout`, error);
        return null;
    }
}
