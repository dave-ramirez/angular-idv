export function buildDataUrlFromImageData(imageData: ImageData): string {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  canvas.width = imageData.width;
  canvas.height = imageData.height;
  ctx.putImageData(imageData, 0, 0);

  const dataUrl = canvas.toDataURL();

  return dataUrl;
}

export function buildBase64FromImageData(imageData: ImageData): string {
  const base64DataUrl = buildDataUrlFromImageData(imageData);
  const prefixLength = 'data:image/png;base64,'.length;
  const base64Data = base64DataUrl.substring(prefixLength);
  return base64Data;
}

export function buildJpgDataUrlFromBase64(base64data: string): string {
  return `data:image/jpg;base64,${base64data}`;
}
