// Asset path utility for deployment
// Using custom domain (revastra.me), so no base path needed
export const getAssetPath = (path: string): string => {
  return path;
};

export const ASSETS = {
  logo: getAssetPath('/brand-logo.svg'),
  favicon: getAssetPath('/favicon.ico'),
  placeholder: getAssetPath('/placeholder.svg'),
} as const;
