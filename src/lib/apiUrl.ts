/**
 * Helper function to get full API URL for assets
 * Handles both absolute URLs and relative pathsx
 */

const getApiBaseUrl = (): string => {
  // If VITE_API_URL is set, use it (without /api suffix as it's added in api.ts)
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  // Fallback to empty string for relative paths
  return '';
};

/**
 * Get full URL for an asset path
 * @param path - Relative path like '/uploads/images/photo.jpg'
 * @returns Full URL or relative path
 */
export const getAssetUrl = (path: string): string => {
  if (!path) return '';
  
  // If already a full URL, return as is
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }
  
  // Get base URL and construct full path
  const baseUrl = getApiBaseUrl();
  return baseUrl ? `${baseUrl}${path}` : path;
};

