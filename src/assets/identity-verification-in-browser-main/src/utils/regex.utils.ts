
export function adjustToValidNewLineCharacters(text: string): string {
  if (!text) { return text; }
  return text.replace(/\\n/g, '\n');
}
