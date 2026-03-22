export function getGWSearchUrl(modelName: string): string {
  const cleaned = modelName
    .replace(/\s*\(CP\)\s*$/, '')
    .replace(/\s*Kill Team\s*$/, '')
    .trim();
  return `https://www.warhammer.com/en-IE/plp?search=${encodeURIComponent(cleaned)}`;
}
