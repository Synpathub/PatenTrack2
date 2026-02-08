/**
 * Normalize a string by trimming, converting to lowercase, and removing extra spaces
 */
export function normalize(str: string): string {
  return str.trim().toLowerCase().replace(/\s+/g, ' ');
}

/**
 * Trim whitespace from a string
 */
export function trim(str: string): string {
  return str.trim();
}

/**
 * Convert string to lowercase
 */
export function toLowerCase(str: string): string {
  return str.toLowerCase();
}

/**
 * Convert string to uppercase
 */
export function toUpperCase(str: string): string {
  return str.toUpperCase();
}

/**
 * Remove extra spaces from a string
 */
export function removeExtraSpaces(str: string): string {
  return str.replace(/\s+/g, ' ');
}

/**
 * Capitalize first letter of string
 */
export function capitalize(str: string): string {
  if (!str) return str;
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}
