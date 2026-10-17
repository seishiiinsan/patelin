import type { Metadata } from "next";
import { LegalPage } from "@/components/legal-page";

export const metadata: Metadata = { title: "Conditions d’utilisation" };

export default function CguPage() {
  return (
    <LegalPage
      title="Conditions générales d’utilisation"
      updated="17 octobre 2026"
    >
      <h2>Le jeu</h2>
      <p>
        Patelin est un jeu de collection gratuit, sans achat ni publicité. La
        monnaie et les cartes du jeu n’ont aucune valeur réelle et ne peuvent
        être ni achetées, ni vendues contre de l’argent.
      </p>

      <h2>Compte</h2>
      <ul>
        <li>On crée un compte en se connectant avec Google ou Discord.</li>
        <li>
          Un seul compte par personne : les comptes secondaires peuvent être
          suspendus.
        </li>
        <li>
          Le pseudo est public. Il ne doit être ni insultant, ni trompeur, ni
          usurper l’identité de quelqu’un.
        </li>
        <li>Tu peux supprimer ton compte à tout moment depuis ton profil.</li>
      </ul>

      <h2>Fair-play</h2>
      <p>
        Les scripts, l’automatisation, l’exploitation de bugs et les échanges
        arrangés entre comptes d’une même personne sont interdits. En cas
        d’abus, l’éditeur peut retirer des cartes ou des récompenses, geler les
        échanges ou supprimer le compte.
      </p>

      <h2>Disponibilité</h2>
      <p>
        Le jeu est fourni tel quel, sans garantie de disponibilité. Ses règles,
        ses taux et son contenu peuvent évoluer.
      </p>

      <h2>Contact</h2>
      <p>Pour toute question : [adresse e-mail de contact].</p>
    </LegalPage>
  );
}
