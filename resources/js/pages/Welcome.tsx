import { Button } from '@/components/ui/button';
import { Head, Link } from '@inertiajs/react';
import AppearanceToggleDropdown from '@/components/appearance-dropdown';
import {
    ArrowRight,
    Calendar,
    CheckCircle,
    Clock,
    CreditCard,
    Home,
    MapPin,
    Shield,
    Star,
    Users,
    Brush,
    Zap,
    PartyPopper,
} from 'lucide-react';
import { motion } from 'motion/react';
import logoImage from '@/../assets/images/logo.png';

interface Props {
    canLogin: boolean;
    canRegister: boolean;
}

export default function Welcome({ canLogin, canRegister }: Props) {
    return (
        <div className="min-h-screen bg-white dark:bg-slate-900 font-sans text-slate-900 dark:text-white scroll-smooth">
            <Head title="VIMAIZ — Planifiez votre ménage" />

            {/* NAV */}
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
                                <a
                                    href="#comment-ca-marche"
                                    className="text-sm font-medium text-slate-600 dark:text-slate-300 transition-colors hover:text-primary"
                                >
                                    Faire le ménage
                                </a>
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

                        <div className="hidden items-center space-x-6 md:flex">
                            <div className="relative group">
                                <button className="text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-primary">
                                    À propos
                                </button>
                                <div className="absolute right-0 mt-2 w-48 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-slate-100 dark:border-slate-700 py-2">
                                    <a href="#about" className="block px-4 py-2 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700">À propos de VIMAIZ</a>
                                    <a href="#services" className="block px-4 py-2 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700">Service</a>
                                    <a href="#comment-ca-marche" className="block px-4 py-2 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700">Fonctionnement</a>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center space-x-3">
                            <AppearanceToggleDropdown />
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
                                        className="text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-primary"
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
            <section className="relative bg-gradient-to-br from-sky-50 via-white to-cyan-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 pt-16 overflow-hidden">
                <div className="absolute inset-0 overflow-hidden">
                    <motion.div 
                        className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-primary/10 blur-3xl"
                        animate={{ 
                            scale: [1, 1.2, 1],
                            opacity: [0.5, 0.8, 0.5]
                        }}
                        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                    />
                    <motion.div 
                        className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-cyan-200/30 blur-3xl"
                        animate={{ 
                            scale: [1.2, 1, 1.2],
                            opacity: [0.6, 0.9, 0.6]
                        }}
                        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
                    />
                    <motion.div 
                        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-96 w-96 rounded-full bg-primary/5 blur-3xl"
                        animate={{ 
                            scale: [1, 1.3, 1],
                            rotate: [0, 180, 360]
                        }}
                        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                    />
                </div>

                <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
                    <div className="grid lg:grid-cols-2 gap-12 items-center">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6 }}
                        >
                            <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-sm font-medium text-primary">
                                <Brush className="h-4 w-4" />
                                Service de ménage professionnel
                            </div>

                            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-slate-900 dark:text-white leading-tight mb-6">
                                Conciergeries et propriétaires Airbnb
                                <span className="block text-primary">automatisez et suivez le ménage de vos locations saisonnières.</span>
                            </h1>

                            <p className="text-base text-slate-600 dark:text-slate-300 mb-8 max-w-xl">
                                Confiez la gestion du ménage de vos logements à des professionnels qualifiés et minutieusement sélectionnés.
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

                            <div className="mt-10 flex items-center gap-8 text-sm text-slate-500 dark:text-slate-400">
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
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            transition={{ duration: 0.8, delay: 0.3, type: "spring", stiffness: 100 }}
                            className="relative hidden lg:block"
                        >
                            <div className="relative rounded-3xl bg-white dark:bg-slate-800 p-8 shadow-2xl shadow-primary/20 border border-slate-100 dark:border-slate-700 hover:shadow-3xl hover:shadow-primary/30 transition-all duration-500">
                                <motion.div 
                                    className="absolute -top-4 -right-4 rounded-full bg-primary p-3 shadow-lg"
                                    animate={{ rotate: [0, 10, -10, 0] }}
                                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                                >
                                    <Zap className="h-6 w-6 text-white" />
                                </motion.div>
                                
                                <h3 className="text-lg font-semibold mb-6 dark:text-white">Demande rapide</h3>
                                
                                <div className="space-y-4">
                                    <motion.div 
                                        className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-700 hover:bg-primary/5 dark:hover:bg-primary/10 hover:scale-[1.02] transition-all duration-300 cursor-pointer"
                                        whileHover={{ x: 5 }}
                                    >
                                        <div className="p-2 rounded-lg bg-primary/10">
                                            <Home className="h-5 w-5 text-primary" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium dark:text-white">Type de logement</p>
                                            <p className="text-xs text-slate-500 dark:text-slate-400">Appartement, Maison, Villa, Chalet</p>
                                        </div>
                                    </motion.div>
                                    <motion.div 
                                        className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-700 hover:bg-primary/5 dark:hover:bg-primary/10 hover:scale-[1.02] transition-all duration-300 cursor-pointer"
                                        whileHover={{ x: 5 }}
                                    >
                                        <div className="p-2 rounded-lg bg-primary/10">
                                            <Calendar className="h-5 w-5 text-primary" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium dark:text-white">Date & Heure</p>
                                            <p className="text-xs text-slate-500 dark:text-slate-400">Choisissez votre créneau</p>
                                        </div>
                                    </motion.div>
                                    <motion.div 
                                        className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-700 hover:bg-primary/5 dark:hover:bg-primary/10 hover:scale-[1.02] transition-all duration-300 cursor-pointer"
                                        whileHover={{ x: 5 }}
                                    >
                                        <div className="p-2 rounded-lg bg-primary/10">
                                            <CreditCard className="h-5 w-5 text-primary" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium dark:text-white">Paiement sécurisé</p>
                                            <p className="text-xs text-slate-500 dark:text-slate-400">Avant l'intervention</p>
                                        </div>
                                    </motion.div>
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
            <section id="comment-ca-marche" className="py-24 bg-white dark:bg-slate-900">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4">
                            Comment ça marche ?
                        </h2>
                        <p className="text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
                            Un processus simple et transparent en 4 étapes
                        </p>
                    </div>

                    <div className="relative">
                        {/* Connecting lines - positioned to touch icons directly */}
                        <div className="hidden md:block absolute top-[4.5rem] left-0 right-0 z-0">
                            <svg className="w-full h-4" preserveAspectRatio="none">
                                {/* Line 1→2: touches icon 1 right edge to icon 2 left edge */}
                                <line 
                                    x1="16%" y1="50%" x2="34%" y2="50%" 
                                    stroke="#0ea5e9" 
                                    strokeWidth="2" 
                                    strokeDasharray="8 6"
                                    strokeOpacity="0.5"
                                />
                                {/* Line 2→3: touches icon 2 right edge to icon 3 left edge */}
                                <line 
                                    x1="41%" y1="50%" x2="59%" y2="50%" 
                                    stroke="#0ea5e9" 
                                    strokeWidth="2" 
                                    strokeDasharray="8 6"
                                    strokeOpacity="0.5"
                                />
                                {/* Line 3→4: touches icon 3 right edge to icon 4 left edge */}
                                <line 
                                    x1="66%" y1="50%" x2="84%" y2="50%" 
                                    stroke="#0ea5e9" 
                                    strokeWidth="2" 
                                    strokeDasharray="8 6"
                                    strokeOpacity="0.5"
                                />
                            </svg>
                        </div>
                        
                        <div className="grid md:grid-cols-4 gap-8 relative z-10">
                            {[
                                {
                                    step: '1',
                                    icon: Home,
                                    title: 'Ajoutez votre logement',
                                    description: 'Renseignez les détails de votre appartement, maison, villa ou chalet',
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
                                    icon: PartyPopper,
                                    title: 'C\'est fait !',
                                    description: 'Un agent qualifié intervient chez vous',
                                },
                            ].map((item, index) => (
                                <motion.div
                                    key={item.step}
                                    initial={{ opacity: 0, y: 30 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.6, delay: index * 0.15, type: "spring", stiffness: 100 }}
                                    viewport={{ once: true, margin: "-50px" }}
                                    whileHover={{ y: -8, transition: { duration: 0.3 } }}
                                    className="relative group"
                                >
                                    <div className="text-center p-6 rounded-2xl bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm border border-transparent group-hover:border-primary/20 group-hover:bg-white dark:group-hover:bg-slate-800 group-hover:shadow-xl group-hover:shadow-primary/10 transition-all duration-500">
                                        <div className="relative inline-flex mb-6">
                                            <motion.div 
                                                className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 group-hover:bg-primary/20 transition-colors duration-300"
                                                whileHover={{ scale: 1.1, rotate: 5 }}
                                            >
                                                <item.icon className="h-8 w-8 text-primary" />
                                            </motion.div>
                                            <motion.span 
                                                className="absolute -top-2 -right-2 z-20 flex h-7 w-7 items-center justify-center rounded-full bg-primary text-sm font-bold text-white shadow-lg"
                                                whileHover={{ scale: 1.2 }}
                                            >
                                                {item.step}
                                            </motion.span>
                                        </div>
                                        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2 group-hover:text-primary transition-colors">{item.title}</h3>
                                        <p className="text-sm text-slate-600 dark:text-slate-400">{item.description}</p>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* SERVICES */}
            <section id="services" className="py-24 bg-slate-50 dark:bg-slate-800">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4">
                            Types de logements
                        </h2>
                        <p className="text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
                            VIMAIZ intervient exclusivement dans ces types de propriétés
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {[
                            {
                                title: 'Appartement',
                                description: 'Studios, T1, T2 et plus — tous types d\'appartements',
                                features: ['Petites surfaces', 'Grands appartements', 'Résidences'],
                            },
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
                                initial={{ opacity: 0, y: 30, scale: 0.95 }}
                                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                                transition={{ duration: 0.6, delay: index * 0.15, type: "spring", stiffness: 100 }}
                                viewport={{ once: true, margin: "-50px" }}
                                whileHover={{ y: -10, scale: 1.02 }}
                                className="bg-white dark:bg-slate-900 rounded-2xl p-8 shadow-sm border border-slate-100 dark:border-slate-700 hover:shadow-2xl hover:shadow-primary/15 hover:border-primary/30 transition-all duration-500 group"
                            >
                                <motion.div 
                                    className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10 mb-6 group-hover:bg-primary group-hover:shadow-lg group-hover:shadow-primary/30 transition-all duration-300"
                                    whileHover={{ rotate: 10 }}
                                >
                                    <Home className="h-7 w-7 text-primary group-hover:text-white transition-colors" />
                                </motion.div>
                                <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-3 group-hover:text-primary transition-colors">{service.title}</h3>
                                <p className="text-slate-600 dark:text-slate-400 mb-6">{service.description}</p>
                                <ul className="space-y-3">
                                    {service.features.map((feature, featureIndex) => (
                                        <motion.li 
                                            key={feature} 
                                            className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400"
                                            initial={{ opacity: 0, x: -10 }}
                                            whileInView={{ opacity: 1, x: 0 }}
                                            transition={{ delay: 0.3 + featureIndex * 0.1 }}
                                            viewport={{ once: true }}
                                        >
                                            <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                                            {feature}
                                        </motion.li>
                                    ))}
                                </ul>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* PROFESSIONNELS CTA */}
            <section id="professionnels" className="py-24 bg-primary relative overflow-hidden">
                <motion.div 
                    className="absolute inset-0"
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                >
                    <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl" />
                    <div className="absolute bottom-0 left-0 w-80 h-80 bg-cyan-400/10 rounded-full blur-3xl" />
                </motion.div>
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
                    <div className="grid lg:grid-cols-2 gap-12 items-center">
                        <motion.div
                            initial={{ opacity: 0, x: -30 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.8, type: "spring" }}
                            viewport={{ once: true }}
                        >
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
                                ].map((item, index) => (
                                    <motion.li 
                                        key={item} 
                                        className="flex items-center gap-3 text-white"
                                        initial={{ opacity: 0, x: -20 }}
                                        whileInView={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.2 + index * 0.1 }}
                                        viewport={{ once: true }}
                                    >
                                        <CheckCircle className="h-5 w-5 text-white/80" />
                                        {item}
                                    </motion.li>
                                ))}
                            </ul>
                            <motion.div
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                <Link href={route('register') + '?role=agent'}>
                                    <Button size="lg" variant="secondary" className="gap-2 shadow-xl shadow-black/20 hover:shadow-2xl hover:shadow-black/30 transition-shadow">
                                        Devenir partenaire
                                        <ArrowRight className="h-5 w-5" />
                                    </Button>
                                </Link>
                            </motion.div>
                        </motion.div>
                        <motion.div 
                            className="hidden lg:flex justify-center"
                            initial={{ opacity: 0, x: 30 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.8, delay: 0.2, type: "spring" }}
                            viewport={{ once: true }}
                        >
                            <div className="relative">
                                <motion.div 
                                    className="absolute inset-0 bg-white/10 rounded-3xl blur-2xl"
                                    animate={{ scale: [1, 1.1, 1] }}
                                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                                />
                                <div className="relative bg-white/10 backdrop-blur rounded-3xl p-8 border border-white/20 hover:bg-white/15 transition-colors duration-500">
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
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* ABOUT */}
            <section id="about" className="py-24 bg-white dark:bg-slate-900">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="grid lg:grid-cols-2 gap-16 items-center">
                        <motion.div
                            initial={{ opacity: 0, x: -30 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.8, type: "spring" }}
                            viewport={{ once: true }}
                        >
                            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-6">
                                À propos de VIMAIZ
                            </h2>
                            <p className="text-lg text-slate-600 dark:text-slate-300 mb-6">
                                VIMAIZ est une plateforme qui met en relation les conciergeries et propriétaires Airbnb avec des professionnels du ménage qualifiés et disposant d'un SIRET, tout en automatisant la gestion et le suivi des missions.
                            </p>
                            <p className="text-slate-600 dark:text-slate-300 mb-6">
                                Nous sommes partis d'un constat simple, dans la location saisonnière, gérer les logements, les voyageurs et trouver des agents de ménage fiables, sérieux et professionnels est devenu un véritable défi.
                            </p>
                            <p className="text-slate-600 dark:text-slate-300 mb-6">
                                Le ménage est l'un des éléments les plus importants dans l'expérience des voyageurs, mais aussi l'un des plus difficiles à organiser et suivre au quotidien pour les conciergeries et propriétaires.
                            </p>
                            <p className="text-slate-600 dark:text-slate-300 mb-6">
                                VIMAIZ a été créé pour simplifier cette gestion grâce à une plateforme pensée comme un véritable assistant opérationnel pour les locations saisonnières.
                            </p>
                            <p className="text-slate-600 dark:text-slate-300 mb-8">
                                Suivi des prestations, organisation des missions, visibilité sur les interventions, centralisation des échanges VIMAIZ aide les conciergeries et propriétaires à gagner du temps, et travailler dans de meilleures conditions avec des agents sélectionnés minutieusement.
                            </p>
                        </motion.div>
                        <div className="grid grid-cols-2 gap-4">
                            {[
                                { icon: Shield, value: '100%', label: 'Sécurisé', desc: 'Agents vérifiés avec SIRET' },
                                { icon: Clock, value: '24h', label: 'Réponse max', desc: 'Devis sous 24h' },
                                { icon: Star, value: '5★', label: 'Qualité', desc: 'Photos avant/après' },
                                { icon: MapPin, value: 'France', label: 'National', desc: 'Réseau d\'agents' },
                            ].map((item, index) => (
                                <motion.div
                                    key={item.label}
                                    className="bg-slate-50 dark:bg-slate-800 rounded-2xl p-6 hover:bg-primary/5 dark:hover:bg-primary/10 hover:shadow-lg hover:shadow-primary/10 transition-all duration-300 group text-center"
                                    initial={{ opacity: 0, y: 20, scale: 0.95 }}
                                    whileInView={{ opacity: 1, y: 0, scale: 1 }}
                                    transition={{ duration: 0.5, delay: index * 0.1 }}
                                    viewport={{ once: true }}
                                    whileHover={{ y: -5 }}
                                >
                                    <motion.div whileHover={{ scale: 1.1, rotate: 5 }} className="flex justify-center">
                                        <item.icon className="h-8 w-8 text-primary mb-3 group-hover:text-primary transition-colors" />
                                    </motion.div>
                                    <p className="text-3xl font-bold text-primary mb-1">{item.value}</p>
                                    <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">{item.label}</p>
                                    <p className="text-xs text-slate-500 dark:text-slate-400">{item.desc}</p>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* FOOTER */}
            <footer className="bg-slate-900 text-white py-16">
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
