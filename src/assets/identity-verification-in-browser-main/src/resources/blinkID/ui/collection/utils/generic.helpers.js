/**
 * Copyright (c) Microblink Ltd. All rights reserved.
 */
export function stringToArray(inputString) {
  if (!inputString || !inputString.length) {
    return [];
  }
  return inputString.split(',').map(el => el.trim());
}
export function stringToObject(inputString) {
  if (!inputString || !inputString.length) {
    return {};
  }
  return JSON.parse(inputString);
}
export function hasSupportedImageFiles(files) {
  const imageRegex = RegExp(/^image\//);
  for (let i = 0; i < files.length; ++i) {
    if (imageRegex.exec(files[i].type)) {
      return true;
    }
  }
  return false;
}
export function extractFilenameFromPath(path) {
  return path.split('\\').pop();
}
export function getImageFile(fileList) {
  if (fileList === null) {
    return null;
  }
  let image = null;
  const imageRegex = RegExp(/^image\//);
  for (let i = 0; i < fileList.length; ++i) {
    if (imageRegex.exec(fileList[i].type)) {
      image = fileList[i];
    }
  }
  return image;
}
/**
 * Inspired by https://github.com/JedWatson/classnames.
 * @param classes Class names and their conditions.
 * @returns Joined string of class names.
 */
export function classNames(classes) {
  const result = [];
  const keys = Object.keys(classes);
  keys.forEach((key) => {
    if (classes[key]) {
      result.push(key);
    }
  });
  return result.join(' ');
}
export function getWebComponentParts(root) {
  const partsChildren = root.querySelectorAll('[part]');
  const parts = [];
  partsChildren.forEach((el) => {
    const elementParts = el.getAttribute('part').split(' ');
    while (elementParts && elementParts.length) {
      parts.push(elementParts.pop());
    }
  });
  return parts;
}
export function setWebComponentParts(hostEl) {
  const partParts = [
    hostEl.tagName.toLowerCase(),
    hostEl.getAttribute('id')
  ];
  hostEl.setAttribute('part', partParts.join(' ').trim());
}
