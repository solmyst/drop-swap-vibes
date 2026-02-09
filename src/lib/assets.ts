// Asset path utility for deployment
export const getAssetPath = (path: string): string => {
  const base = import.meta.env.MODE === 'production' ? '/drop-swap-vibes' : '';
  return `${base}${path}`;
};

export const ASSETS = {
  logo: getAssetPath('/brand-logo.svg'),
  favicon: getAssetPath('/favicon.ico'),
  placeholder: getAssetPath('/placeholder.svg'),
} as const;
