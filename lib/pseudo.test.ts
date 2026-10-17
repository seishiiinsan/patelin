import { describe, expect, it } from "vitest";
import { pseudoKey, validatePseudo } from "./pseudo";

describe("pseudoKey", () => {
  it("ignores case and accents", () => {
    expect(pseudoKey("Élodie")).toBe(pseudoKey("elodie"));
  });
});

describe("validatePseudo", () => {
  it.each(["Gabin", "Élodie_12", "le-patelinois", "abc"])(
    "accepts %s",
    (pseudo) => {
      expect(validatePseudo(pseudo).ok).toBe(true);
    },
  );

  it("trims spaces around the pseudo", () => {
    expect(validatePseudo("  Gabin ")).toEqual({
      ok: true,
      pseudo: "Gabin",
      key: "gabin",
    });
  });

  it.each([
    ["ab", "entre 3 et 20"],
    ["a".repeat(21), "entre 3 et 20"],
    ["Jean Dupont", "lettres, des chiffres"],
    ["jean@mail", "lettres, des chiffres"],
  ])("rejects %s", (pseudo, error) => {
    const check = validatePseudo(pseudo);
    expect(check.ok).toBe(false);
    if (!check.ok) expect(check.error).toContain(error);
  });

  it.each(["Admin", "patelin", "gros_con", "Connard42", "SALOPE"])(
    "refuses %s",
    (pseudo) => {
      expect(validatePseudo(pseudo)).toEqual({
        ok: false,
        error: "Ce pseudo n’est pas disponible.",
      });
    },
  );

  it("keeps commune names that contain a short insult", () => {
    expect(validatePseudo("Conques").ok).toBe(true);
  });
});
