
export class FontConfig {
  constructor(
    public family: string,
    public source: string,
    public style: string,
    public weight: string
  ) { }
}

async function loadOneFont(config: FontConfig): Promise<void> {
  try {
    const font = new FontFace(
      config.family,
      config.source,
      { style: config.style, weight: config.weight }
    );
    const loadedFont = await font.load();
    document.fonts.add(loadedFont);
  } catch (err) {
    return;
  }
}

export async function loadFonts(...configs: FontConfig[]): Promise<void> {
  await Promise.all(configs.map(config => loadOneFont(config)));
}