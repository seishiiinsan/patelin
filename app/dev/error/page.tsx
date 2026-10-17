import { notFound } from "next/navigation";

// Development-only page that fails on purpose, to check that server errors are logged
// and that the error page shows up.
export default function DevErrorPage() {
  if (process.env.NODE_ENV === "production") notFound();
  throw new Error("Erreur volontaire de /dev/error");
}
