import { Button } from '@/components/ui/button';
import { Head, Link } from '@inertiajs/react';
import {
    ArrowRight,
    Calendar,
    CheckCircle,
    CreditCard,
    Home,
    MapPin,
    Shield,
    Sparkles,
    Star,
    Users,
} from 'lucide-react';
import { motion } from 'motion/react';

interface Props {
    canLogin: boolean;
    canRegister: boolean;
}

export default function Welcome({ canLogin, canRegister }: Props) {
    return (
        <div className="min-h-screen bg-white font-sans text-slate-900 scroll-smooth">
            <Head title="VIMAIZ — Planifiez votre ménage" />

            {/* NAV */}
            <nav className="fixed z-50 w-full bg-white/95 backdrop-blur-sm border-b border-slate-100">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="flex h-16 items-center justify-between">
                        <div className="flex items-center gap-8">
                            <Link href="/" className="flex items-center gap-2">
                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary">
                                    <Sparkles className="h-6 w-6 text-white" />
                                </div>
                                <span className="text-xl font-bold text-slate-900">VIMAIZ</span>
                            </Link>

                            <div className="hidden items-center space-x-6 md:flex">
                                <a
                                    href="#comment-ca-marche"
                                    className="text-sm font-medium text-slate-600 transition-colors hover:text-primary"
                                >
                                    Faire le ménage
                                </a>
                                <a
                                    href="#professionnels"
                                    className="text-sm font-medium text-slate-600 transition-colors hover:text-primary"
                                >
                                    Professionnels
                                </a>
                            </div>
                        </div>

                        <div className="hidden items-center space-x-6 md:flex">
                            <div className="relative group">
                                <button className="text-sm font-medium text-slate-600 hover:text-primary">
                                    À propos
                                </button>
                                <div className="absolute right-0 mt-2 w-48 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all bg-white rounded-lg shadow-lg border border-slate-100 py-2">
                                    <a href="#about" className="block px-4 py-2 text-sm text-slate-600 hover:bg-slate-50">À propos de VIMAIZ</a>
                                    <a href="#services" className="block px-4 py-2 text-sm text-slate-600 hover:bg-slate-50">Service</a>
                                    <a href="#comment-ca-marche" className="block px-4 py-2 text-sm text-slate-600 hover:bg-slate-50">Fonctionnement</a>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center space-x-3">
                            {canLogin ? (
                                <Link href={route('dashboard')}>
                                    <Button variant="default" size="sm">
                                        Mon Espace
                                    </Button>
                                </Link>
                            ) : (
                                <>
                                    <Link
                                        href={route('login')}
                                        className="text-sm font-medium text-slate-600 hover:text-primary"
                                    >
                                        Connexion
                                    </Link>
                                    <Link href={route('register')}>
                                        <Button size="sm">
                                            Inscription
                                        </Button>
                                    </Link>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </nav>

            {/* HERO */}
            <section className="relative bg-gradient-to-br from-sky-50 via-white to-cyan-50 pt-16">
                <div className="absolute inset-0 overflow-hidden">
                    <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-primary/10 blur-3xl" />
                    <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-cyan-200/30 blur-3xl" />
                </div>

                <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
                    <div className="grid lg:grid-cols-2 gap-12 items-center">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6 }}
                        >
                            <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-sm font-medium text-primary">
                                <Sparkles className="h-4 w-4" />
                                Service de ménage professionnel
                            </div>

                            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-slate-900 leading-tight mb-6">
                                Planifiez votre ménage.
                                <span className="block text-primary">VIMAIZ s'occupe du reste.</span>
                            </h1>

                            <p className="text-lg text-slate-600 mb-8 max-w-xl">
                                Confiez votre maison, villa ou chalet à des professionnels qualifiés.
                                Nous orchestrons tout : devis, paiement sécurisé et intervention.
                            </p>

                            <div className="flex flex-col sm:flex-row gap-4">
                                <Link href={canLogin ? route('dashboard') : route('register')}>
                                    <Button size="lg" className="w-full sm:w-auto gap-2">
                                        Demander un ménage
                                        <ArrowRight className="h-5 w-5" />
                                    </Button>
                                </Link>
                                <a href="#comment-ca-marche">
                                    <Button variant="secondary" size="lg" className="w-full sm:w-auto">
                                        Comment ça marche
                                    </Button>
                                </a>
                            </div>

                            <div className="mt-10 flex items-center gap-8 text-sm text-slate-500">
                                <div className="flex items-center gap-2">
                                    <CheckCircle className="h-5 w-5 text-green-500" />
                                    Paiement sécurisé
                                </div>
                                <div className="flex items-center gap-2">
                                    <Shield className="h-5 w-5 text-primary" />
                                    Agents vérifiés
                                </div>
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.6, delay: 0.2 }}
                            className="relative hidden lg:block"
                        >
                            <div className="relative rounded-3xl bg-white p-8 shadow-2xl shadow-primary/10 border border-slate-100">
                                <div className="absolute -top-4 -right-4 rounded-full bg-primary p-3 shadow-lg">
                                    <Sparkles className="h-6 w-6 text-white" />
                                </div>
                                
                                <h3 className="text-lg font-semibold mb-6">Demande rapide</h3>
                                
                                <div className="space-y-4">
                                    <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50">
                                        <Home className="h-5 w-5 text-primary" />
                                        <div>
                                            <p className="text-sm font-medium">Type de logement</p>
                                            <p className="text-xs text-slate-500">Maison, Villa, Chalet</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50">
                                        <Calendar className="h-5 w-5 text-primary" />
                                        <div>
                                            <p className="text-sm font-medium">Date & Heure</p>
                                            <p className="text-xs text-slate-500">Choisissez votre créneau</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50">
                                        <CreditCard className="h-5 w-5 text-primary" />
                                        <div>
                                            <p className="text-sm font-medium">Paiement sécurisé</p>
                                            <p className="text-xs text-slate-500">Avant l'intervention</p>
                                        </div>
                                    </div>
                                </div>

                                <Link href={canLogin ? route('dashboard') : route('register')}>
                                    <Button className="w-full mt-6">
                                        Commencer
                                    </Button>
                                </Link>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* COMMENT ÇA MARCHE */}
            <section id="comment-ca-marche" className="py-24 bg-white">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
                            Comment ça marche ?
                        </h2>
                        <p className="text-lg text-slate-600 max-w-2xl mx-auto">
                            Un processus simple et transparent en 4 étapes
                        </p>
                    </div>

                    <div className="grid md:grid-cols-4 gap-8">
                        {[
                            {
                                step: '1',
                                icon: Home,
                                title: 'Ajoutez votre logement',
                                description: 'Renseignez les détails de votre maison, villa ou chalet',
                            },
                            {
                                step: '2',
                                icon: Calendar,
                                title: 'Planifiez',
                                description: 'Choisissez la date, l\'heure et la durée souhaitée',
                            },
                            {
                                step: '3',
                                icon: CreditCard,
                                title: 'Validez & Payez',
                                description: 'Recevez un devis, acceptez et payez en ligne',
                            },
                            {
                                step: '4',
                                icon: Sparkles,
                                title: 'C\'est fait !',
                                description: 'Un agent qualifié intervient chez vous',
                            },
                        ].map((item, index) => (
                            <motion.div
                                key={item.step}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: index * 0.1 }}
                                viewport={{ once: true }}
                                className="relative"
                            >
                                <div className="text-center">
                                    <div className="relative inline-flex mb-6">
                                        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
                                            <item.icon className="h-8 w-8 text-primary" />
                                        </div>
                                        <span className="absolute -top-2 -right-2 flex h-7 w-7 items-center justify-center rounded-full bg-primary text-sm font-bold text-white">
                                            {item.step}
                                        </span>
                                    </div>
                                    <h3 className="text-lg font-semibold text-slate-900 mb-2">{item.title}</h3>
                                    <p className="text-sm text-slate-600">{item.description}</p>
                                </div>
                                {index < 3 && (
                                    <div className="hidden md:block absolute top-8 left-[60%] w-[80%] border-t-2 border-dashed border-slate-200" />
                                )}
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* SERVICES */}
            <section id="services" className="py-24 bg-slate-50">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
                            Types de logements
                        </h2>
                        <p className="text-lg text-slate-600 max-w-2xl mx-auto">
                            VIMAIZ intervient exclusivement dans ces types de propriétés
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {[
                            {
                                title: 'Maison',
                                description: 'Entretien complet de votre maison individuelle',
                                features: ['Toutes surfaces', 'Intérieur complet', 'Espaces de vie'],
                            },
                            {
                                title: 'Villa',
                                description: 'Service premium pour villas et grandes propriétés',
                                features: ['Grandes surfaces', 'Multiples pièces', 'Finitions soignées'],
                            },
                            {
                                title: 'Chalet',
                                description: 'Spécialistes des chalets et résidences secondaires',
                                features: ['Zones montagnardes', 'Bois et matériaux', 'Accès spécifiques'],
                            },
                        ].map((service, index) => (
                            <motion.div
                                key={service.title}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: index * 0.1 }}
                                viewport={{ once: true }}
                                className="bg-white rounded-2xl p-8 shadow-sm border border-slate-100 hover:shadow-lg hover:border-primary/20 transition-all"
                            >
                                <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10 mb-6">
                                    <Home className="h-7 w-7 text-primary" />
                                </div>
                                <h3 className="text-xl font-semibold text-slate-900 mb-3">{service.title}</h3>
                                <p className="text-slate-600 mb-6">{service.description}</p>
                                <ul className="space-y-2">
                                    {service.features.map((feature) => (
                                        <li key={feature} className="flex items-center gap-2 text-sm text-slate-600">
                                            <CheckCircle className="h-4 w-4 text-green-500" />
                                            {feature}
                                        </li>
                                    ))}
                                </ul>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* PROFESSIONNELS CTA */}
            <section id="professionnels" className="py-24 bg-primary">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="grid lg:grid-cols-2 gap-12 items-center">
                        <div>
                            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
                                Vous êtes professionnel du ménage ?
                            </h2>
                            <p className="text-lg text-white/80 mb-8">
                                Rejoignez le réseau VIMAIZ et recevez des missions qualifiées.
                                Nous nous occupons de trouver les clients, vous vous concentrez sur votre métier.
                            </p>
                            <ul className="space-y-4 mb-8">
                                {[
                                    'Auto-entrepreneur ou société (SIRET obligatoire)',
                                    'Missions attribuées automatiquement',
                                    'Paiement garanti après chaque intervention',
                                    'Aucune commission sur vos revenus visibles',
                                ].map((item) => (
                                    <li key={item} className="flex items-center gap-3 text-white">
                                        <CheckCircle className="h-5 w-5 text-white/80" />
                                        {item}
                                    </li>
                                ))}
                            </ul>
                            <Link href={route('register') + '?role=agent'}>
                                <Button size="lg" variant="secondary" className="gap-2">
                                    Devenir partenaire
                                    <ArrowRight className="h-5 w-5" />
                                </Button>
                            </Link>
                        </div>
                        <div className="hidden lg:flex justify-center">
                            <div className="relative">
                                <div className="absolute inset-0 bg-white/10 rounded-3xl blur-2xl" />
                                <div className="relative bg-white/10 backdrop-blur rounded-3xl p-8 border border-white/20">
                                    {/* Illustration style unDraw - Professional cleaner */}
                                    <svg className="w-64 h-48 mx-auto" viewBox="0 0 400 300" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        {/* Person */}
                                        <circle cx="200" cy="80" r="35" fill="white" fillOpacity="0.9"/>
                                        <path d="M200 115C170 115 150 145 150 180V240H250V180C250 145 230 115 200 115Z" fill="white" fillOpacity="0.9"/>
                                        {/* Cleaning tools */}
                                        <rect x="260" y="120" width="8" height="120" rx="4" fill="white" fillOpacity="0.7"/>
                                        <ellipse cx="264" cy="110" rx="20" ry="15" fill="white" fillOpacity="0.6"/>
                                        {/* Bucket */}
                                        <path d="M120 200L130 260H170L180 200H120Z" fill="white" fillOpacity="0.7"/>
                                        <path d="M115 200H185" stroke="white" strokeOpacity="0.8" strokeWidth="4" strokeLinecap="round"/>
                                        {/* Sparkles */}
                                        <circle cx="300" cy="160" r="8" fill="white" fillOpacity="0.5"/>
                                        <circle cx="320" cy="140" r="5" fill="white" fillOpacity="0.4"/>
                                        <circle cx="100" cy="150" r="6" fill="white" fillOpacity="0.5"/>
                                        <circle cx="80" cy="180" r="4" fill="white" fillOpacity="0.4"/>
                                        {/* Checkmark badge */}
                                        <circle cx="280" cy="80" r="25" fill="white" fillOpacity="0.8"/>
                                        <path d="M268 80L276 88L292 72" stroke="#0ea5e9" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
                                    </svg>
                                    <p className="text-center text-white/80 text-sm mt-4">
                                        Rejoignez notre réseau d'agents professionnels
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ABOUT */}
            <section id="about" className="py-24 bg-white">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="grid lg:grid-cols-2 gap-16 items-center">
                        <div>
                            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-6">
                                À propos de VIMAIZ
                            </h2>
                            <p className="text-lg text-slate-600 mb-6">
                                VIMAIZ est une plateforme innovante qui révolutionne le service de ménage à domicile.
                                Inspirée du modèle Uber, notre approche centralise tout le processus pour garantir
                                une expérience simple et sécurisée.
                            </p>
                            <p className="text-slate-600 mb-8">
                                Vous ne cherchez pas un agent, l'agent ne vous cherche pas.
                                <strong className="text-slate-900"> VIMAIZ orchestre la relation</strong> pour
                                vous offrir un service de qualité, sans surprise.
                            </p>
                            <div className="grid grid-cols-3 gap-6">
                                {[
                                    { value: '100%', label: 'Sécurisé' },
                                    { value: '24h', label: 'Réponse max' },
                                    { value: '5★', label: 'Qualité' },
                                ].map((stat) => (
                                    <div key={stat.label} className="text-center">
                                        <p className="text-2xl font-bold text-primary">{stat.value}</p>
                                        <p className="text-sm text-slate-500">{stat.label}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            {[
                                { icon: Shield, title: 'Agents vérifiés', desc: 'SIRET et documents contrôlés' },
                                { icon: CreditCard, title: 'Paiement sécurisé', desc: 'Avant chaque intervention' },
                                { icon: Star, title: 'Qualité garantie', desc: 'Photos avant/après obligatoires' },
                                { icon: MapPin, title: 'Partout en France', desc: 'Réseau national d\'agents' },
                            ].map((item) => (
                                <div key={item.title} className="bg-slate-50 rounded-2xl p-6">
                                    <item.icon className="h-8 w-8 text-primary mb-4" />
                                    <h4 className="font-semibold text-slate-900 mb-1">{item.title}</h4>
                                    <p className="text-sm text-slate-600">{item.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* FOOTER */}
            <footer className="bg-slate-900 text-white py-16">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="grid md:grid-cols-4 gap-8 mb-12">
                        <div>
                            <div className="flex items-center gap-2 mb-4">
                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary">
                                    <Sparkles className="h-6 w-6 text-white" />
                                </div>
                                <span className="text-xl font-bold">VIMAIZ</span>
                            </div>
                            <p className="text-slate-400 text-sm">
                                Planifiez votre ménage.<br />
                                VIMAIZ s'occupe du reste.
                            </p>
                        </div>
                        <div>
                            <h4 className="font-semibold mb-4">À propos</h4>
                            <ul className="space-y-2 text-sm text-slate-400">
                                <li><a href="#about" className="hover:text-white transition">À propos de VIMAIZ</a></li>
                                <li><a href="#services" className="hover:text-white transition">Service</a></li>
                                <li><a href="#comment-ca-marche" className="hover:text-white transition">Fonctionnement</a></li>
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
                                <li><Link href={route('register') + '?role=agent'} className="hover:text-white transition">Devenir partenaire</Link></li>
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
