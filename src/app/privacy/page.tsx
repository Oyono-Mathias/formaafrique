import { Button } from "@/components/ui/button";

export default function PrivacyPolicyPage() {
  return (
    <div className="container mx-auto px-4 md:px-6 py-12 md:py-20">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold font-headline text-primary mb-8">
          Politique de Confidentialité
        </h1>
        <div className="prose prose-lg max-w-none">
          <p>Dernière mise à jour : {new Date().toLocaleDateString('fr-FR')}</p>
          
          <h2>1. Introduction</h2>
          <p>
            Nous respectons votre vie privée. Cette politique explique comment nous collectons, utilisons et protégeons vos données.
          </p>

          <h2>2. Données que nous collectons</h2>
          <p>
            Nous pouvons collecter des informations que vous nous fournissez directement :
          </p>
          <ul>
            <li>
              <strong>Informations de compte :</strong> Votre nom, votre adresse e-mail, et votre mot de passe pour créer et gérer votre compte.
            </li>
            <li>
              <strong>Progression de formation :</strong> Nous suivons les cours que vous suivez, votre progression dans les modules et les certificats que vous obtenez.
            </li>
             <li>
              <strong>Dons :</strong> Si vous faites un don, nous collectons les informations de transaction nécessaires (sans stocker les détails de votre carte de crédit).
            </li>
          </ul>

          <h2>3. Comment nous utilisons vos données</h2>
          <p>
            Vos données sont utilisées uniquement pour les finalités suivantes :
          </p>
          <ul>
            <li>Fournir, opérer et améliorer nos services de formation.</li>
            <li>Personnaliser votre expérience d'apprentissage.</li>
            <li>Délivrer vos certificats de réussite.</li>
            <li>Traiter vos dons de manière sécurisée.</li>
            <li>Communiquer avec vous concernant votre compte ou nos services.</li>
          </ul>

          <h2>4. Sécurité de vos données</h2>
          <p>
            La sécurité de vos données est une priorité. Nous utilisons des services de stockage de données sécurisés comme Firebase Firestore, qui applique des mesures de sécurité robustes, y compris le chiffrement, pour protéger vos informations.
          </p>
          
          <h2>5. Partage de vos données</h2>
          <p>
            Nous ne vendons, n'échangeons ni ne transférons vos informations personnelles à des tiers. Vos données restent confidentielles et ne sont utilisées que dans le cadre des services de FormaAfrique.
          </p>

          <h2>6. Vos droits</h2>
          <p>
            Vous avez le droit d'accéder à vos données, de les corriger ou de demander leur suppression. Pour toute demande de suppression de compte et de données associées, veuillez nous contacter.
          </p>

          <h2>7. Nous contacter</h2>
          <p>
            Si vous avez des questions sur cette politique ou si vous souhaitez exercer vos droits, veuillez nous contacter à : <a href="mailto:contact@formaafrique.org">contact@formaafrique.org</a>.
          </p>
        </div>
        <div className="mt-8 text-center">
            <Button>J’ai lu et j’accepte la politique de confidentialité</Button>
        </div>
      </div>
    </div>
  );
}
