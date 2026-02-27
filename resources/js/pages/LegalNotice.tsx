import { Head, Link } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import AppearanceToggleDropdown from '@/components/appearance-dropdown';
import logoImage from '@/../assets/images/logo.png';

export default function LegalNotice() {
    return (
        <div className="min-h-screen bg-white dark:bg-slate-900 font-sans text-slate-900 dark:text-white flex flex-col">
            <Head title="Mentions Légales - VIMAIZ" />

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
                        <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-8">Mentions Légales</h1>

                        <div className="prose prose-slate dark:prose-invert max-w-none space-y-8">
                            <section>
                                <h2 className="text-2xl font-semibold text-slate-900 dark:text-white mb-4">1. Éditeur du site</h2>
                                <p className="text-slate-600 dark:text-slate-300">
                                    Le site VIMAIZ est édité par :
                                </p>
                                <ul className="text-slate-600 dark:text-slate-300 list-disc pl-6 space-y-2">
                                    <li><strong>Raison sociale :</strong> VIMAIZ (anciennement Nettolia)</li>
                                    <li><strong>Forme juridique :</strong> Auto-entrepreneur (Entreprise Individuelle)</li>
                                    <li><strong>Siège social :</strong> 12 rue porte de la ville, 73330 Le Pont de Beauvoisin, France</li>
                                    <li><strong>SIRET :</strong> 832 759 294 00032</li>
                                    <li><strong>Email :</strong> contact@vimaiz.com</li>
                                </ul>
                            </section>

                            <section>
                                <h2 className="text-2xl font-semibold text-slate-900 dark:text-white mb-4">2. Directeur de la publication</h2>
                                <p className="text-slate-600 dark:text-slate-300">
                                    Le directeur de la publication est : [Nom du gérant]
                                </p>
                            </section>

                            <section>
                                <h2 className="text-2xl font-semibold text-slate-900 dark:text-white mb-4">3. Hébergement</h2>
                                <p className="text-slate-600 dark:text-slate-300">
                                    Le site est hébergé par :
                                </p>
                                <ul className="text-slate-600 dark:text-slate-300 list-disc pl-6 space-y-2">
                                    <li><strong>Nom de l'hébergeur :</strong> OVHcloud</li>
                                    <li><strong>Adresse :</strong> 2 rue Kellermann, 59100 Roubaix, France</li>
                                    <li><strong>Site web :</strong> <a href="https://www.ovhcloud.com/fr/" className="text-sky-600 hover:underline" target="_blank" rel="noopener noreferrer">https://www.ovhcloud.com/fr/</a></li>
                                </ul>
                            </section>

                            <section>
                                <h2 className="text-2xl font-semibold text-slate-900 dark:text-white mb-4">4. Propriété intellectuelle</h2>
                                <p className="text-slate-600 dark:text-slate-300">
                                    L'ensemble du contenu présent sur le site VIMAIZ (textes, images, vidéos, logos, marques, etc.) 
                                    est la propriété exclusive de VIMAIZ ou de ses partenaires. Toute reproduction, représentation, 
                                    modification, publication ou adaptation de tout ou partie des éléments du site, quel que soit 
                                    le moyen ou le procédé utilisé, est interdite sans l'autorisation écrite préalable de VIMAIZ.
                                </p>
                            </section>

                            <section>
                                <h2 className="text-2xl font-semibold text-slate-900 dark:text-white mb-4">5. Données personnelles</h2>
                                <p className="text-slate-600 dark:text-slate-300">
                                    VIMAIZ s'engage à respecter la confidentialité des données personnelles collectées sur son site. 
                                    Pour plus d'informations sur le traitement de vos données personnelles, veuillez consulter notre{' '}
                                    <Link href="/confidentialite" className="text-sky-600 hover:underline">
                                        Politique de confidentialité
                                    </Link>.
                                </p>
                            </section>

                            <section>
                                <h2 className="text-2xl font-semibold text-slate-900 dark:text-white mb-4">6. Cookies</h2>
                                <p className="text-slate-600 dark:text-slate-300">
                                    Le site VIMAIZ utilise des cookies pour améliorer l'expérience utilisateur et établir des 
                                    statistiques de fréquentation. En poursuivant votre navigation sur ce site, vous acceptez 
                                    l'utilisation de cookies.
                                </p>
                            </section>

                            <section>
                                <h2 className="text-2xl font-semibold text-slate-900 dark:text-white mb-4">7. Responsabilité</h2>
                                <p className="text-slate-600 dark:text-slate-300">
                                    VIMAIZ s'efforce d'assurer l'exactitude et la mise à jour des informations diffusées sur 
                                    son site. Cependant, VIMAIZ ne peut garantir l'exactitude, la précision ou l'exhaustivité 
                                    des informations mises à disposition sur ce site.
                                </p>
                                <p className="text-slate-600 dark:text-slate-300 mt-4">
                                    VIMAIZ décline toute responsabilité en cas de dommages directs ou indirects causés aux 
                                    utilisateurs du site, quelle qu'en soit la nature, résultant de l'accès ou de l'utilisation 
                                    du site.
                                </p>
                            </section>

                            <section>
                                <h2 className="text-2xl font-semibold text-slate-900 dark:text-white mb-4">8. Droit applicable</h2>
                                <p className="text-slate-600 dark:text-slate-300">
                                    Les présentes mentions légales sont régies par le droit français. Tout litige relatif à 
                                    l'utilisation du site VIMAIZ sera soumis à la compétence exclusive des tribunaux français.
                                </p>
                            </section>

                            <section>
                                <h2 className="text-2xl font-semibold text-slate-900 dark:text-white mb-4">9. Contact</h2>
                                <p className="text-slate-600 dark:text-slate-300">
                                    Pour toute question concernant ces mentions légales, vous pouvez nous contacter à l'adresse 
                                    suivante : <a href="mailto:contact@vimaiz.com" className="text-sky-600 hover:underline">contact@vimaiz.com</a>
                                </p>
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
                                <img src={logoImage} alt="VIMAIZ" className="h-8 object-contain" />
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
