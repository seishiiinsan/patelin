// Text helpers shared by slugs and pseudos.

// "Île-de-France" → "Ile-de-France": decompose accented letters, then drop the accents.
export function stripAccents(text: string): string {
  return text.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}
