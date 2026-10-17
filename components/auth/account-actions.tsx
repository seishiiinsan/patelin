"use client";

import { useState } from "react";
import { authClient } from "@/lib/auth-client";

// After a session change, full page loads drop whatever the client router cached for the
// previous session.
export function SignOutButton() {
  return (
    <button
      type="button"
      onClick={async () => {
        await authClient.signOut();
        // eslint-disable-next-line @next/next/no-location-assign-relative-destination -- full load on purpose, see above
        window.location.assign("/");
      }}
      className="rounded-full border border-border bg-surface px-5 py-2 font-semibold"
    >
      Se déconnecter
    </button>
  );
}

// Deleting is permanent: the player types their pseudo to confirm.
export function DeleteAccount({ pseudo }: { pseudo: string }) {
  const [open, setOpen] = useState(false);
  const [confirmation, setConfirmation] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function remove() {
    setError(null);
    const { error } = await authClient.deleteUser();
    if (error) {
      // Better Auth asks for a recent sign-in before a deletion.
      setError(
        "Reconnecte-toi, puis réessaie : la suppression demande une connexion récente.",
      );
      return;
    }
    // eslint-disable-next-line @next/next/no-location-assign-relative-destination -- full load on purpose, see above
    window.location.assign("/");
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="self-start text-sm font-semibold text-accent underline"
      >
        Supprimer mon compte
      </button>
    );
  }

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-accent p-4">
      <p className="text-sm">
        Ton compte, ta collection et tout ce qui t’appartient seront supprimés
        définitivement. Pour confirmer, écris ton pseudo :{" "}
        <strong>{pseudo}</strong>
      </p>
      <input
        aria-label="Pseudo de confirmation"
        value={confirmation}
        onChange={(event) => setConfirmation(event.target.value)}
        className="rounded-lg border border-border bg-surface px-3 py-2"
      />
      {error && (
        <p role="alert" className="text-sm font-semibold text-accent">
          {error}
        </p>
      )}
      <div className="flex gap-3">
        <button
          type="button"
          disabled={confirmation !== pseudo}
          onClick={remove}
          className="rounded-full bg-accent px-5 py-2 font-semibold text-white disabled:opacity-50"
        >
          Supprimer définitivement
        </button>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="font-semibold"
        >
          Annuler
        </button>
      </div>
    </div>
  );
}
