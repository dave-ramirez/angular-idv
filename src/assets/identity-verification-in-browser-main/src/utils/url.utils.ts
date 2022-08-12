
const CHAR_FORWARD_SLASH = '/';

/**
 * Standardizes Url in this way:
 *
 * 1. Url ends with forward-slash.
 *
 * @param url Url to standardize.
 * @returns Standardized Url.
 */
export function standardizeUrl(url: string): string {
  if (url == null || url.length === 0) { return url; }

  let stnrz = url;

  if (stnrz.charAt(stnrz.length - 1) !== CHAR_FORWARD_SLASH) {
    stnrz = `${stnrz}${CHAR_FORWARD_SLASH}`;
  }

  return stnrz;
}

/**
 * Standardizes path in this way:
 *
 * 1. Path does not start with forward-slash.
 * 2. Path ends with forward-slash.
 *
 * @param path Path to standardize.
 * @returns Standardized path.
 */
export function standardizePath(path: string): string {
  if (path == null || path.length === 0) { return path; }

  let stnrz = path;

  // does not start with forward-slash
  if (stnrz.charAt(0) === CHAR_FORWARD_SLASH) {
    stnrz = stnrz.substring(1);
  }

  // ends with forward-slash
  if (stnrz.charAt(stnrz.length - 1) !== CHAR_FORWARD_SLASH) {
    stnrz = `${stnrz}${CHAR_FORWARD_SLASH}`;
  }

  return stnrz;
}

/**
 * Gets app url origin.
 *
 * For example, if current app location href is "https://myapp.com/part1/part2"
 * then app url origin will be "https://myapp.com/".
 * @returns Standardized app Url origin.
 */
export function getAppUrlOrigin(): string {
  return standardizeUrl(document.location.origin);
}
