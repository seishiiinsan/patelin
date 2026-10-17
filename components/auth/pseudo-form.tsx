"use client";

import { useActionState } from "react";
import { choosePseudo } from "@/app/bienvenue/actions";
import { PSEUDO_MAX_LENGTH, PSEUDO_MIN_LENGTH } from "@/lib/pseudo";

export function PseudoForm() {
  const [state, action, pending] = useActionState(choosePseudo, {
    error: null,
  });

  return (
    <form
      action={action}
      className="flex w-full max-w-sm flex-col gap-3 text-left"
    >
      <label className="flex flex-col gap-1 font-semibold">
        Ton pseudo
        <input
          name="pseudo"
          required
          minLength={PSEUDO_MIN_LENGTH}
          maxLength={PSEUDO_MAX_LENGTH}
          autoComplete="nickname"
          aria-describedby="pseudo-help"
          className="rounded-lg border border-border bg-surface px-3 py-2 font-normal"
        />
      </label>
      <p id="pseudo-help" className="text-sm text-muted">
        {PSEUDO_MIN_LENGTH} à {PSEUDO_MAX_LENGTH} caractères : lettres,
        chiffres, - et _. Il sera visible par les autres joueurs et gravé sur
        tes cartes.
      </p>
      {state.error && (
        <p role="alert" className="text-sm font-semibold text-accent">
          {state.error}
        </p>
      )}
      <button
        type="submit"
        disabled={pending}
        className="rounded-full bg-brand px-6 py-3 font-semibold text-brand-ink disabled:opacity-60"
      >
        Valider
      </button>
    </form>
  );
}
