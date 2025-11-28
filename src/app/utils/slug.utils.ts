/**
 * Slugifies a string by removing diacritics, converting to lowercase,
 * and replacing non-alphanumeric characters with hyphens.
 * @param str The string to slugify.
 * @returns The slugified string.
 */
export const slugify = (str: string) => {
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '-')
    .replace(/-{2,}/g, '-')
    .replace(/^-+|-+$/g, '');
};