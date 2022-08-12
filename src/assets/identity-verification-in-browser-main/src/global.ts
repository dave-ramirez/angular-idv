let resourcesDirPath: string;
let license: string;
let devMode: boolean;
let docscanSkipUnsupportedBack: boolean;

export function setResourcesDirPath(path: string): void {
  resourcesDirPath = path;
}

export function getResourcesDirPath(): string {
  return resourcesDirPath;
}

export function setLicense(licence: string): void {
  license = licence;
}

export function getLicense(): string {
  return license;
}

export function setDevMode(value: boolean): void {
  devMode = value;
}

export function getDevMode(): boolean {
  return devMode;
}

export function setDocscanSkipUnsupportedBack(value: boolean): void {
  docscanSkipUnsupportedBack = value;
}

export function getDocscanSkipUnsupportedBack(): boolean {
  return docscanSkipUnsupportedBack;
}
