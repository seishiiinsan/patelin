import type { Metadata } from "next";
import { LegalPage } from "@/components/legal-page";

export const metadata: Metadata = { title: "Mentions légales" };

// Bracketed values are to be filled in by the publisher before the public launch.
export default function MentionsLegalesPage() {
  return (
    <LegalPage title="Mentions légales" updated="17 octobre 2026">
      <h2>Éditeur</h2>
      <p>
        Patelin est un jeu gratuit édité à titre non professionnel par [Nom de
        l’éditeur]. Contact : [adresse e-mail de contact].
      </p>
      <p>Directeur de la publication : [Nom de l’éditeur].</p>

      <h2>Hébergement</h2>
      <p>OVH SAS, 2 rue Kellermann, 59100 Roubaix, France. Téléphone : 1007.</p>

      <h2>Données et contenus</h2>
      <ul>
        <li>
          Données des communes : geo.api.gouv.fr (INSEE, IGN), sous Licence
          Ouverte Etalab 2.0.
        </li>
        <li>
          Photos et cartes postales : Wikimedia Commons. Chaque image reste sous
          la licence de son auteur, indiquée avec la carte.
        </li>
      </ul>
    </LegalPage>
  );
}
