import { stripAccents } from "./text";

// Lowercase, accent-free form of a commune name, so that "ile tudy" finds "Île-Tudy" and
// "boeurs" finds "Bœurs-en-Othe". The migration that added Commune.searchName computes the
// same key in SQL: keep the two in step.
export function searchKey(text: string): string {
  return stripAccents(
    text.toLowerCase().replaceAll("œ", "oe").replaceAll("æ", "ae"),
  )
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}
