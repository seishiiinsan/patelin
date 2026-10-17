import type { Metadata } from "next";
import { LegalPage } from "@/components/legal-page";

export const metadata: Metadata = { title: "Confidentialité" };

export default function ConfidentialitePage() {
  return (
    <LegalPage title="Politique de confidentialité" updated="17 octobre 2026">
      <h2>Ce que nous collectons</h2>
      <ul>
        <li>
          À la connexion avec Google ou Discord : ton nom, ton adresse e-mail et
          ta photo de profil. Ils restent privés ; les autres joueurs ne voient
          que ton pseudo.
        </li>
        <li>Ton pseudo et ta progression dans le jeu.</li>
        <li>
          Pour chaque session : l’adresse IP et le navigateur utilisé, pour la
          sécurité du compte et la lutte contre la triche.
        </li>
      </ul>

      <h2>Pourquoi</h2>
      <p>
        Ces données servent uniquement à faire fonctionner le jeu et à le
        protéger des abus. Elles ne sont ni vendues, ni partagées, ni utilisées
        pour de la publicité.
      </p>

      <h2>Cookies</h2>
      <p>
        Patelin n’utilise qu’un cookie de session, indispensable pour rester
        connecté. Il n’y a aucun cookie publicitaire ni de mesure d’audience :
        aucun consentement n’est donc demandé.
      </p>

      <h2>Hébergement et conservation</h2>
      <p>
        Les données sont hébergées en France par OVH. Elles sont conservées tant
        que ton compte existe ; les sessions expirent au bout de 7 jours sans
        activité.
      </p>

      <h2>Tes droits</h2>
      <ul>
        <li>
          Accès et portabilité : bouton « Exporter mes données » sur ton profil.
        </li>
        <li>
          Effacement : bouton « Supprimer mon compte » sur ton profil, effet
          immédiat.
        </li>
        <li>
          Rectification, opposition ou toute autre demande : [adresse e-mail de
          contact]. Tu peux aussi saisir la CNIL (cnil.fr).
        </li>
      </ul>
    </LegalPage>
  );
}
