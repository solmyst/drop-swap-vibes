// Asset path utility for GitHub Pages deployment
export const getAssetPath = (path: string): string => {
  const base = import.meta.env.MODE === 'production' ? '/drop-swap-vibes' : '';
  return `${base}${path}`;
};

// Common asset paths
export const ASSETS = {
  logo: getAssetPath('/logo.svg'),
  favicon: getAssetPath('/favicon.ico'),
  placeholder: getAssetPath('/placeholder.svg'),
} as const;