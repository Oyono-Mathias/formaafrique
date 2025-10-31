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
            Bienvenue sur FormaAfrique. Nous nous engageons à protéger votre vie privée. Cette politique de confidentialité explique comment nous collectons, utilisons, divulguons et protégeons vos informations lorsque vous visitez notre site web.
          </p>

          <h2>2. Collecte de vos informations</h2>
          <p>
            Nous pouvons collecter des informations vous concernant de plusieurs manières. Les informations que nous pouvons collecter sur le site comprennent :
          </p>
          <ul>
            <li>
              <strong>Données personnelles :</strong> Les informations personnellement identifiables, telles que votre nom, votre adresse e-mail, que vous nous fournissez volontairement lorsque vous vous inscrivez sur le site ou que vous choisissez de participer à diverses activités liées au site.
            </li>
            <li>
              <strong>Données de progression :</strong> Nous collectons des informations sur les cours que vous suivez, vos progrès et les certificats que vous obtenez.
            </li>
          </ul>

          <h2>3. Utilisation de vos informations</h2>
          <p>
            Avoir des informations précises sur vous nous permet de vous offrir une expérience fluide, efficace et personnalisée. Spécifiquement, nous pouvons utiliser les informations collectées à votre sujet via le site pour :
          </p>
          <ul>
            <li>Créer et gérer votre compte.</li>
            <li>Vous envoyer par e-mail des informations concernant votre compte ou vos commandes.</li>
            <li>Suivre et analyser l'utilisation et les tendances pour améliorer votre expérience avec le site.</li>
            <li>Vous notifier des mises à jour du site.</li>
          </ul>

          <h2>4. Sécurité de vos informations</h2>
          <p>
            Nous utilisons des mesures de sécurité administratives, techniques et physiques pour aider à protéger vos informations personnelles. Bien que nous ayons pris des mesures raisonnables pour sécuriser les informations personnelles que vous nous fournissez, veuillez être conscient que malgré nos efforts, aucune mesure de sécurité n'est parfaite ou impénétrable.
          </p>

          <h2>5. Vos droits</h2>
          <p>
            Vous avez le droit de consulter, de modifier ou de supprimer vos données personnelles. Vous pouvez le faire directement depuis les paramètres de votre profil ou en nous contactant aux coordonnées ci-dessous.
          </p>

          <h2>6. Nous contacter</h2>
          <p>
            Si vous avez des questions ou des commentaires sur cette politique de confidentialité, veuillez nous contacter à : <a href="mailto:privacy@formaafrique.com">privacy@formaafrique.com</a>.
          </p>
        </div>
      </div>
    </div>
  );
}
