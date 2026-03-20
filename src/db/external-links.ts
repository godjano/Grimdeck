export function getGWSearchUrl(modelName: string): string {
  const cleaned = modelName
    .replace(/\s*\(CP\)\s*$/, '')
    .replace(/\s*Kill Team\s*$/, '')
    .trim();
  // Use Google search scoped to GW site — works regardless of region
  return `https://www.google.com/search?q=site:games-workshop.com+${encodeURIComponent(cleaned)}`;
}
