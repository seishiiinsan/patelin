import { stripAccents } from "./text";

export const PSEUDO_MIN_LENGTH = 3;
export const PSEUDO_MAX_LENGTH = 20;

// Names that would let a player pass for the team.
const RESERVED = new Set([
  "admin",
  "administrateur",
  "anonyme",
  "moderateur",
  "modo",
  "patelin",
  "root",
  "staff",
  "support",
  "systeme",
]);

// Insults checked as whole words: short ones would otherwise match real commune names
// ("con" is inside "Conques").
const BANNED_WORDS = new Set([
  "con",
  "conne",
  "fdp",
  "pd",
  "pute",
  "merde",
  "nazi",
  "shit",
  "fuck",
]);

// Insults long enough to be checked anywhere in the pseudo.
const BANNED_FRAGMENTS = [
  "connard",
  "salope",
  "encule",
  "batard",
  "nique",
  "hitler",
  "bitch",
  "nigger",
  "negro",
];

// Lowercase, accent-free form used for uniqueness: "Élodie" and "elodie" are the same pseudo.
export function pseudoKey(pseudo: string): string {
  return stripAccents(pseudo).toLowerCase();
}

export type PseudoCheck =
  { ok: true; pseudo: string; key: string } | { ok: false; error: string };

export function validatePseudo(input: string): PseudoCheck {
  const pseudo = input.trim();
  const key = pseudoKey(pseudo);

  if (pseudo.length < PSEUDO_MIN_LENGTH || pseudo.length > PSEUDO_MAX_LENGTH) {
    return {
      ok: false,
      error: `Ton pseudo doit faire entre ${PSEUDO_MIN_LENGTH} et ${PSEUDO_MAX_LENGTH} caractères.`,
    };
  }
  if (!/^[a-z0-9_-]+$/.test(key)) {
    return {
      ok: false,
      error:
        "Utilise seulement des lettres, des chiffres, des tirets et des tirets bas.",
    };
  }
  const words = key.split(/[_\-0-9]+/).filter(Boolean);
  if (
    RESERVED.has(key) ||
    words.some((word) => BANNED_WORDS.has(word)) ||
    BANNED_FRAGMENTS.some((fragment) => key.includes(fragment))
  ) {
    return { ok: false, error: "Ce pseudo n’est pas disponible." };
  }
  return { ok: true, pseudo, key };
}
