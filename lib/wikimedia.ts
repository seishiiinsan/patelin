// Helpers for data coming from Wikidata and Wikimedia Commons.

// "http://commons.wikimedia.org/wiki/Special:FilePath/Rodez%20cath%C3%A9drale.jpg" → "Rodez cathédrale.jpg"
export function fileNameFromCommonsUrl(url: string): string {
  const name = url.slice(url.lastIndexOf("/") + 1);
  return decodeURIComponent(name).replaceAll("_", " ");
}

const ENTITIES: Record<string, string> = {
  "&amp;": "&",
  "&lt;": "<",
  "&gt;": ">",
  "&quot;": '"',
  "&#39;": "'",
  "&nbsp;": " ",
};

// Commons credits come as HTML snippets ("<a href=…>Jean Dupont</a>"): keep the readable text.
export function htmlToText(html: string): string {
  return (
    html
      .replace(/<[^>]*>/g, " ")
      .replace(
        /&(amp|lt|gt|quot|#39|nbsp);/g,
        (entity) => ENTITIES[entity] ?? entity,
      )
      .replace(/\s+/g, " ")
      // Tags removed before a period or comma leave a stray space: "Wikipedia ."
      .replace(/ ([.,])/g, "$1")
      .trim()
  );
}

// Licenses the "carte postale ancienne" variant accepts: no attribution or share-alike strings.
export function isPublicDomain(licenseShortName: string): boolean {
  return /public domain|^pd|cc0/i.test(licenseShortName.trim());
}
