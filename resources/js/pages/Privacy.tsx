import { Head, Link } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import AppearanceToggleDropdown from '@/components/appearance-dropdown';
import logoImage from '@/../assets/images/logo.png';

export default function Privacy() {
    return (
        <div className="min-h-screen bg-white dark:bg-slate-900 font-sans text-slate-900 dark:text-white flex flex-col">
            <Head title="Politique de Confidentialité - VIMAIZ" />

            {/* NAV - Same as Welcome */}
            <nav className="fixed z-50 w-full bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm border-b border-slate-100 dark:border-slate-800">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="flex h-16 items-center justify-between">
                        <div className="flex items-center gap-8">
                            <Link href="/" className="flex items-center">
                                <img 
                                    src={logoImage} 
                                    alt="VIMAIZ" 
                                    className="h-22 object-contain brightness-0 saturate-100 invert-0 sepia-100 hue-rotate-[190deg] saturate-[500%]" 
                                    style={{ filter: 'brightness(0) saturate(100%) invert(48%) sepia(79%) saturate(2476%) hue-rotate(166deg) brightness(98%) contrast(101%)' }}
                                />
                            </Link>

                            <div className="hidden items-center space-x-6 md:flex">
                                <Link
                                    href={route('professionals.index')}
                                    className="text-sm font-medium text-slate-600 dark:text-slate-300 transition-colors hover:text-primary"
                                >
                                    Devenir Agent
                                </Link>
                                <Link
                                    href={route('contact.index')}
                                    className="text-sm font-medium text-slate-600 dark:text-slate-300 transition-colors hover:text-primary"
                                >
                                    Contact
                                </Link>
                            </div>
                        </div>

                        <div className="flex items-center space-x-3">
                            <AppearanceToggleDropdown />
                            <Link href={route('login')}>
                                <Button variant="ghost" size="sm">
                                    Connexion
                                </Button>
                            </Link>
                            <Link href={route('register')}>
                                <Button size="sm">
                                    Inscription
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>
            </nav>

            <main className="pt-24 pb-16 flex-grow">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-8 md:p-12 border border-slate-100 dark:border-slate-700">
                        <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-8">Politique de Confidentialité</h1>

                        <div className="prose prose-slate dark:prose-invert max-w-none space-y-8">
                            <section>
                                <p className="text-slate-600 dark:text-slate-300">
                                    VIMAIZ s'engage à protéger la vie privée de ses utilisateurs. Cette politique de confidentialité 
                                    explique comment nous collectons, utilisons, partageons et protégeons vos données personnelles 
                                    lorsque vous utilisez notre plateforme.
                                </p>
                            </section>

                            <section>
                                <h2 className="text-2xl font-semibold text-slate-900 dark:text-white mb-4">1. Données collectées</h2>
                                <h3 className="text-xl font-medium text-slate-800 dark:text-slate-200 mb-3">1.1 Données que vous nous fournissez</h3>
                                <ul className="text-slate-600 dark:text-slate-300 list-disc pl-6 space-y-2">
                                    <li><strong>Informations de compte :</strong> nom, prénom, adresse email, numéro de téléphone</li>
                                    <li><strong>Informations de profil :</strong> photo de profil, adresse, ville</li>
                                    <li><strong>Pour les agents :</strong> pièce d'identité, justificatifs, informations bancaires</li>
                                    <li><strong>Informations de paiement :</strong> coordonnées bancaires (traitées de manière sécurisée)</li>
                                    <li><strong>Communications :</strong> messages échangés via la plateforme</li>
                                </ul>

                                <h3 className="text-xl font-medium text-slate-800 dark:text-slate-200 mb-3 mt-6">1.2 Données collectées automatiquement</h3>
                                <ul className="text-slate-600 dark:text-slate-300 list-disc pl-6 space-y-2">
                                    <li><strong>Données techniques :</strong> adresse IP, type de navigateur, système d'exploitation</li>
                                    <li><strong>Données d'utilisation :</strong> pages visitées, durée de visite, actions effectuées</li>
                                    <li><strong>Données de localisation :</strong> localisation approximative (si autorisée)</li>
                                    <li><strong>Cookies :</strong> identifiants de session, préférences utilisateur</li>
                                </ul>
                            </section>

                            <section>
                                <h2 className="text-2xl font-semibold text-slate-900 dark:text-white mb-4">2. Utilisation des données</h2>
                                <p className="text-slate-600 dark:text-slate-300 mb-4">Nous utilisons vos données personnelles pour :</p>
                                <ul className="text-slate-600 dark:text-slate-300 list-disc pl-6 space-y-2">
                                    <li>Créer et gérer votre compte utilisateur</li>
                                    <li>Faciliter la mise en relation entre clients et agents</li>
                                    <li>Traiter les paiements et les transactions</li>
                                    <li>Vous envoyer des notifications relatives à vos réservations</li>
                                    <li>Améliorer nos services et votre expérience utilisateur</li>
                                    <li>Assurer la sécurité de la plateforme et prévenir les fraudes</li>
                                    <li>Respecter nos obligations légales et réglementaires</li>
                                    <li>Vous envoyer des communications marketing (avec votre consentement)</li>
                                </ul>
                            </section>

                            <section>
                                <h2 className="text-2xl font-semibold text-slate-900 dark:text-white mb-4">3. Partage des données</h2>
                                <p className="text-slate-600 dark:text-slate-300 mb-4">Nous ne vendons jamais vos données personnelles. Nous pouvons partager vos données avec :</p>
                                <ul className="text-slate-600 dark:text-slate-300 list-disc pl-6 space-y-2">
                                    <li><strong>Autres utilisateurs :</strong> pour faciliter les réservations (nom, photo, coordonnées)</li>
                                    <li><strong>Prestataires de services :</strong> paiement, hébergement, support client</li>
                                    <li><strong>Autorités légales :</strong> si la loi l'exige ou pour protéger nos droits</li>
                                    <li><strong>Partenaires commerciaux :</strong> uniquement avec votre consentement explicite</li>
                                </ul>
                            </section>

                            <section>
                                <h2 className="text-2xl font-semibold text-slate-900 dark:text-white mb-4">4. Conservation des données</h2>
                                <p className="text-slate-600 dark:text-slate-300">
                                    Nous conservons vos données personnelles aussi longtemps que nécessaire pour fournir nos services 
                                    et respecter nos obligations légales. Les données de compte sont conservées tant que votre compte 
                                    est actif. Après suppression de votre compte, nous conservons certaines données pour :
                                </p>
                                <ul className="text-slate-600 dark:text-slate-300 list-disc pl-6 space-y-2 mt-4">
                                    <li>Respecter nos obligations légales (facturation, comptabilité)</li>
                                    <li>Résoudre d'éventuels litiges</li>
                                    <li>Prévenir les fraudes</li>
                                </ul>
                            </section>

                            <section>
                                <h2 className="text-2xl font-semibold text-slate-900 dark:text-white mb-4">5. Sécurité des données</h2>
                                <p className="text-slate-600 dark:text-slate-300">
                                    Nous mettons en œuvre des mesures de sécurité techniques et organisationnelles pour protéger 
                                    vos données contre tout accès non autorisé, perte, destruction ou altération :
                                </p>
                                <ul className="text-slate-600 dark:text-slate-300 list-disc pl-6 space-y-2 mt-4">
                                    <li>Chiffrement SSL/TLS pour les transmissions de données</li>
                                    <li>Mots de passe chiffrés</li>
                                    <li>Accès restreint aux données personnelles</li>
                                    <li>Surveillance et audits réguliers de sécurité</li>
                                    <li>Formation de notre personnel sur la protection des données</li>
                                </ul>
                            </section>

                            <section>
                                <h2 className="text-2xl font-semibold text-slate-900 dark:text-white mb-4">6. Vos droits</h2>
                                <p className="text-slate-600 dark:text-slate-300 mb-4">Conformément au Règlement Général sur la Protection des Données (RGPD) et à la loi Informatique et Libertés, vous disposez des droits suivants :</p>
                                <ul className="text-slate-600 dark:text-slate-300 list-disc pl-6 space-y-2">
                                    <li><strong>Droit d'accès :</strong> consulter les données que nous détenons sur vous</li>
                                    <li><strong>Droit de rectification :</strong> corriger vos données inexactes ou incomplètes</li>
                                    <li><strong>Droit de suppression :</strong> demander la suppression de vos données</li>
                                    <li><strong>Droit d'opposition :</strong> vous opposer au traitement de vos données</li>
                                    <li><strong>Droit à la portabilité :</strong> recevoir vos données dans un format structuré</li>
                                    <li><strong>Droit de retrait du consentement :</strong> retirer votre consentement à tout moment</li>
                                </ul>
                                <p className="text-slate-600 dark:text-slate-300 mt-4">
                                    Pour exercer ces droits, contactez-nous à : <a href="mailto:privacy@vimaiz.com" className="text-sky-600 hover:underline">privacy@vimaiz.com</a>
                                </p>
                            </section>

                            <section>
                                <h2 className="text-2xl font-semibold text-slate-900 dark:text-white mb-4">7. Cookies</h2>
                                <p className="text-slate-600 dark:text-slate-300 mb-4">
                                    Nous utilisons des cookies et technologies similaires pour améliorer votre expérience sur notre site :
                                </p>
                                <ul className="text-slate-600 dark:text-slate-300 list-disc pl-6 space-y-2">
                                    <li><strong>Cookies essentiels :</strong> nécessaires au fonctionnement du site</li>
                                    <li><strong>Cookies de performance :</strong> analyser l'utilisation du site</li>
                                    <li><strong>Cookies fonctionnels :</strong> mémoriser vos préférences</li>
                                    <li><strong>Cookies marketing :</strong> personnaliser la publicité (avec consentement)</li>
                                </ul>
                                <p className="text-slate-600 dark:text-slate-300 mt-4">
                                    Vous pouvez gérer vos préférences de cookies dans les paramètres de votre navigateur.
                                </p>
                            </section>

                            <section>
                                <h2 className="text-2xl font-semibold text-slate-900 dark:text-white mb-4">8. Transferts internationaux</h2>
                                <p className="text-slate-600 dark:text-slate-300">
                                    Vos données peuvent être transférées et stockées sur des serveurs situés en dehors de l'Union Européenne. 
                                    Dans ce cas, nous nous assurons que des garanties appropriées sont en place pour protéger vos 
                                    données conformément au RGPD et aux standards internationaux.
                                </p>
                            </section>

                            <section>
                                <h2 className="text-2xl font-semibold text-slate-900 dark:text-white mb-4">9. Mineurs</h2>
                                <p className="text-slate-600 dark:text-slate-300">
                                    Nos services ne sont pas destinés aux personnes de moins de 18 ans. Nous ne collectons pas 
                                    sciemment de données personnelles de mineurs. Si vous êtes parent et pensez que votre enfant 
                                    nous a fourni des informations, contactez-nous immédiatement.
                                </p>
                            </section>

                            <section>
                                <h2 className="text-2xl font-semibold text-slate-900 dark:text-white mb-4">10. Modifications de cette politique</h2>
                                <p className="text-slate-600 dark:text-slate-300">
                                    Nous pouvons modifier cette politique de confidentialité à tout moment. Les modifications 
                                    seront publiées sur cette page avec une nouvelle date de mise à jour. Nous vous encourageons 
                                    à consulter régulièrement cette page pour rester informé de nos pratiques.
                                </p>
                            </section>

                            <section>
                                <h2 className="text-2xl font-semibold text-slate-900 dark:text-white mb-4">11. Contact</h2>
                                <p className="text-slate-600 dark:text-slate-300">
                                    Pour toute question concernant cette politique de confidentialité ou vos données personnelles :
                                </p>
                                <ul className="text-slate-600 dark:text-slate-300 list-none pl-0 space-y-2 mt-4">
                                    <li><strong>Email :</strong> <a href="mailto:contact@vimaiz.com" className="text-sky-600 hover:underline">contact@vimaiz.com</a></li>
                                    <li><strong>Adresse :</strong> 12 rue porte de la ville, 73330 Le Pont de Beauvoisin, France</li>
                                </ul>
                            </section>
                        </div>

                        <div className="mt-12 pt-8 border-t border-slate-200 dark:border-slate-700">
                            <p className="text-sm text-slate-500 dark:text-slate-400">
                                Dernière mise à jour : {new Date().toLocaleDateString('fr-FR', { 
                                    year: 'numeric', 
                                    month: 'long', 
                                    day: 'numeric' 
                                })}
                            </p>
                        </div>
                    </div>
                </div>
            </main>

            {/* FOOTER - Same as Welcome */}
            <footer className="bg-slate-900 text-white py-16 mt-auto">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="grid md:grid-cols-5 gap-8 mb-12 items-start">
                        <div>
                            <h4 className="font-semibold mb-4">
                                <img src={logoImage} alt="VIMAIZ" className="h-6 object-contain" />
                            </h4>
                            <p className="text-slate-400 text-sm">
                                Planifiez votre ménage.<br />
                                VIMAIZ s'occupe du reste.
                            </p>
                        </div>
                        <div>
                            <h4 className="font-semibold mb-4">À propos</h4>
                            <ul className="space-y-2 text-sm text-slate-400">
                                <li><Link href="/#about" className="hover:text-white transition">À propos de VIMAIZ</Link></li>
                                <li><Link href="/#services" className="hover:text-white transition">Service</Link></li>
                                <li><Link href="/#comment-ca-marche" className="hover:text-white transition">Fonctionnement</Link></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-semibold mb-4">Clients</h4>
                            <ul className="space-y-2 text-sm text-slate-400">
                                <li><Link href={route('register')} className="hover:text-white transition">Inscription</Link></li>
                                <li><Link href={route('login')} className="hover:text-white transition">Connexion</Link></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-semibold mb-4">Professionnels</h4>
                            <ul className="space-y-2 text-sm text-slate-400">
                                <li><Link href={route('professionals.index')} className="hover:text-white transition">Devenir Agent</Link></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-semibold mb-4">Légal</h4>
                            <ul className="space-y-2 text-sm text-slate-400">
                                <li><Link href={route('legal.notice')} className="hover:text-white transition">Mentions légales</Link></li>
                                <li><Link href={route('privacy')} className="hover:text-white transition">Confidentialité</Link></li>
                                <li><Link href={route('contact.index')} className="hover:text-white transition">Contact</Link></li>
                            </ul>
                        </div>
                    </div>
                    <div className="border-t border-slate-800 pt-8 text-center text-sm text-slate-500">
                        <p>&copy; {new Date().getFullYear()} VIMAIZ. Tous droits réservés.</p>
                    </div>
                </div>
            </footer>
        </div>
    );
}
