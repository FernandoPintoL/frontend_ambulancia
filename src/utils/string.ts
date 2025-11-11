// @ts-nocheck
/**
 * String Utilities
 * Helper functions for string manipulation
 */

/**
 * Capitalize first character of a string
 * Safely handles undefined/null values
 */
export const capitalizeFirst = (str: string | undefined | null): string => {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
};

/**
 * Capitalize all words in a string
 */
export const capitalizeWords = (str: string | undefined | null): string => {
  if (!str) return '';
  return str
    .split(' ')
    .map((word) => capitalizeFirst(word))
    .join(' ');
};
