import {
    OutlineButton,
    PrimaryButton,
    SecondaryButton,
} from '@/components/ui/buttons';
import { Head, Link } from '@inertiajs/react';
import {
    Calendar,
    CheckCircle,
    MapPin,
    Search,
    Smile,
    Sparkles,
    Star,
} from 'lucide-react';
import {
    motion,
    useMotionValueEvent,
    useScroll,
    useTransform,
} from 'motion/react';
import { useEffect, useState } from 'react';
import banner from '../../assets/images/banner.jpg';
import logo from '../../assets/images/logo.png';

interface Props {
    canLogin: boolean;
    canRegister: boolean;
}

export default function Accueil({ canLogin, canRegister }: Props) {
    const { scrollY } = useScroll();

    // parallax transforms
    const parallax = useTransform(scrollY, [0, 800], [0, -120]);
    const fadeHero = useTransform(scrollY, [0, 400], [1, 0.15]);

    // header background switch
    const bgValue = useTransform(scrollY, [0, 200], [0, 1]);
    const [bgClass, setBgClass] = useState('bg-transparent');
    const [textClass, setTextClass] = useState('text-white');

    useMotionValueEvent(bgValue, 'change', (v) => {
        if (v < 0.45) {
            setBgClass('bg-transparent');
        } else {
            setBgClass('bg-gray-800 backdrop-blur-md shadow-sm');
        }
    });

    // subtle animated mesh gradient state
    const [meshSeed, setMeshSeed] = useState(() => Math.random());
    useEffect(() => {
        const t = setInterval(() => setMeshSeed(Math.random()), 6000);
        return () => clearInterval(t);
    }, []);

    return (
        <div className="min-h-screen bg-white font-sans text-neutral-900">
            <Head title="VIMAIZ — Marketplace Premium" />

            {/* NAV */}
            <nav
                className={`fixed z-50 w-full transition-all duration-300 ${bgClass}`}
            >
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="flex h-20 items-center justify-between">
                        <div className="flex items-center gap-3">
                            <img
                                src={logo}
                                alt=""
                                height={20}
                                width={120}
                                className="grayscale"
                            />
                        </div>

                        <div className="hidden items-center space-x-8 md:flex">
                            <Link
                                href={route('services.index')}
                                className="text-sm font-medium text-white transition-colors hover:text-neutral-300"
                            >
                                Services
                            </Link>
                            <Link
                                href={route('agents.index')}
                                className="text-sm font-medium text-white transition-colors hover:text-neutral-300"
                            >
                                Trouver un agent
                            </Link>
                            <a
                                href="#comment-ca-marche"
                                className="text-sm font-medium text-white transition-colors hover:text-neutral-300"
                            >
                                Comment ça marche
                            </a>
                        </div>

                        <div className="flex items-center space-x-4">
                            {canLogin && (
                                <Link
                                    href={route('login')}
                                    className="text-sm font-medium text-white transition-colors hover:text-neutral-300"
                                >
                                    Se connecter
                                </Link>
                            )}
                            {canRegister && (
                                <Link href={route('register')}>
                                    <PrimaryButton className="rounded-full px-6 py-2.5 text-sm shadow-lg transition-all hover:bg-neutral-200">
                                        Commencer
                                    </PrimaryButton>
                                </Link>
                            )}
                        </div>
                    </div>
                </div>
            </nav>

            {/* HERO - Premium Background with Scale & Blur */}
            <section className="relative flex min-h-screen items-center justify-center overflow-hidden">
                {/* Background Image with Scale & Blur */}
                <motion.div
                    style={{
                        scale: useTransform(scrollY, [0, 600], [1.2, 1]),
                        filter: useTransform(
                            scrollY,
                            [0, 600],
                            ['blur(2px)', 'blur(0px)'],
                        ),
                    }}
                    className="absolute inset-0 opacity-50"
                >
                    <div
                        className="h-full w-full bg-cover bg-fixed bg-center"
                        style={{
                            backgroundImage: `url(${banner})`,
                        }}
                    />
                </motion.div>

                {/* Darkening Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-b from-neutral-900/80 via-neutral-900/60 to-neutral-900/40" />

                {/* CONTENT */}
                <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <motion.div
                        style={{ opacity: fadeHero }}
                        className="pt-20 text-center"
                    >
                        <div className="mb-6 inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white backdrop-blur-sm">
                            <span className="relative flex h-2 w-2">
                                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-60" />
                                <span className="relative inline-flex h-2 w-2 rounded-full bg-neutral-200" />
                            </span>
                            Marketplace de Nettoyage • Confiance & Qualité
                        </div>

                        <h1 className="mb-6 text-4xl leading-tight font-extrabold text-white md:text-6xl">
                            Redécouvrez l
                            <span className="bg-gradient-to-r from-neutral-200 via-neutral-400 to-neutral-200 bg-clip-text text-transparent">
                                'Art du Nettoyage
                            </span>
                        </h1>

                        <p className="mx-auto mb-8 max-w-2xl text-lg text-neutral-200">
                            Connectez-vous avec des professionnels vérifiés,
                            assurés et évalués — réservation simple, résultats
                            premium.
                        </p>

                        <div className="flex flex-col justify-center gap-4 sm:flex-row">
                            <Link href={route('search.index')}>
                                <PrimaryButton
                                    size="lg"
                                    className="rounded-full px-8 py-6 text-lg shadow-xl hover:scale-105"
                                >
                                    Trouver un agent
                                </PrimaryButton>
                            </Link>

                            <Link href={route('register')}>
                                <OutlineButton
                                    size="lg"
                                    className="rounded-full border-white/20 bg-white/10 px-8 py-6 text-lg text-white backdrop-blur-sm hover:bg-white/20 hover:text-white"
                                >
                                    Devenir agent
                                </OutlineButton>
                            </Link>
                        </div>

                        {/* quick stats */}
                        {/* <div className="mt-14 grid grid-cols-2 md:grid-cols-4 gap-6 bg-white/10 backdrop-blur-sm rounded-3xl p-6 mx-6 md:mx-28 border border-white/10">
                            {[
                                { label: 'Agents vérifiés', value: '500+' },
                                { label: 'Clients satisfaits', value: '10k+' },
                                { label: 'Villes couvertes', value: '25+' },
                                { label: 'Note moyenne', value: '4.9/5' },
                            ].map((s, i) => (
                                <div key={i} className="text-center">
                                    <div className="text-2xl md:text-3xl font-bold text-white">{s.value}</div>
                                    <div className="text-sm text-neutral-200 mt-1">{s.label}</div>
                                </div>
                            ))}
                        </div> */}
                    </motion.div>
                </div>
            </section>

            {/* SEARCH CARD */}
            <div className="relative z-20 mx-auto -mt-12 max-w-3xl px-4">
                <div className="flex flex-col items-center gap-4 rounded-3xl bg-white p-6 shadow-2xl md:flex-row">
                    <input
                        aria-label="ville"
                        type="text"
                        placeholder="Votre ville"
                        className="flex-1 rounded-full border border-neutral-200 px-4 py-3 transition focus:ring-2 focus:ring-neutral-400 focus:outline-none"
                    />
                    <select className="rounded-full border border-neutral-200 px-4 py-3 transition focus:ring-2 focus:ring-neutral-400 focus:outline-none">
                        <option>Type de service</option>
                        <option>Ménage standard</option>
                        <option>Nettoyage profond</option>
                    </select>
                    <button className="rounded-full bg-neutral-900 px-6 py-3 font-medium text-white transition hover:bg-neutral-800">
                        Rechercher
                    </button>
                </div>
            </div>

            {/* Services */}
            <ServicesSection />

            {/* Cinematic Section - Scale + Blur + Gradient */}
            <CinematicSection />

            {/* Top Agents */}
            <TopAgentsSection />

            {/* How it works */}
            <HowItWorksSection />

            {/* Testimonials */}
            <TestimonialsSection />

            {/* Futuristic Section - Opacity + Animated Blobs + Gradient */}
            <FuturisticSection />

            {/* Features */}
            <FeaturesSection />

            <Footer />
        </div>
    );
}

/* ----------------------------- Helper Components ---------------------------- */

function AnimatedMesh({ seed = 0 }: { seed?: number }) {
    const id = `mesh-${String(seed).replace('.', '')}`;
    return (
        <svg
            className="h-full w-full"
            preserveAspectRatio="none"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 800 600"
            aria-hidden
        >
            <defs>
                <linearGradient id={`${id}-g`} x1="0" x2="1" y1="0" y2="1">
                    <stop offset="0%" stopColor="#171717" stopOpacity="1" />
                    <stop offset="50%" stopColor="#262626" stopOpacity="0.8" />
                    <stop
                        offset="100%"
                        stopColor="#525252"
                        stopOpacity="0.35"
                    />
                </linearGradient>
                <filter
                    id={`${id}-noise`}
                    x="0"
                    y="0"
                    width="100%"
                    height="100%"
                >
                    <feTurbulence
                        baseFrequency="0.8"
                        numOctaves="2"
                        stitchTiles="stitch"
                    />
                    <feColorMatrix type="saturate" values="0" />
                </filter>
            </defs>

            <rect width="100%" height="100%" fill={`url(#${id}-g)`} />

            <g opacity="0.18" filter={`url(#${id}-noise)`}>
                <path
                    d="M0,120 C150,200 300,60 450,120 C600,180 750,60 900,120 L900,600 L0,600 Z"
                    fill="#ffffff"
                    transform="translate(0,0)"
                />
            </g>

            {/* animated blobs */}
            <motion.g
                animate={{
                    translateX: [0, 40, -20, 0],
                    translateY: [0, -20, 10, 0],
                    rotate: [0, 2, -2, 0],
                }}
                transition={{ duration: 12, repeat: Infinity }}
            >
                <circle
                    cx="120"
                    cy="80"
                    r="220"
                    fill="#171717"
                    opacity="0.25"
                />
            </motion.g>

            <motion.g
                animate={{
                    translateX: [0, -30, 10, 0],
                    translateY: [0, 10, -10, 0],
                }}
                transition={{ duration: 10, repeat: Infinity }}
            >
                <circle
                    cx="680"
                    cy="420"
                    r="260"
                    fill="#262626"
                    opacity="0.2"
                />
            </motion.g>
        </svg>
    );
}

function ServicesSection() {
    const services = [
        {
            name: 'Ménage standard',
            desc: 'Nettoyage rapide et efficace de votre espace. Idéal pour un entretien régulier.',
            price: 'À partir de 25 MAD/h',
            icon: Search,
            features: ['Dépoussiérage', 'Aspiration', 'Nettoyage surfaces'],
        },
        {
            name: 'Nettoyage profond',
            desc: 'Désinfection complète et nettoyage en profondeur. Pour un résultat impeccable.',
            price: 'À partir de 50 MAD/h',
            icon: Calendar,
            features: [
                'Désinfection totale',
                'Zones difficiles',
                'Produits premium',
            ],
        },
        {
            name: 'Lavage des vitres',
            desc: 'Vitres étincelantes sans traces. Intérieur et extérieur disponibles.',
            price: 'À partir de 20 MAD/h',
            icon: Smile,
            features: [
                'Sans traces',
                'Produits écologiques',
                'Finition parfaite',
            ],
        },
    ];

    return (
        <div className="bg-neutral-50 py-24">
            <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                >
                    <h2 className="mb-4 text-3xl font-bold text-neutral-900 md:text-4xl">
                        Nos services populaires
                    </h2>
                    <p className="mx-auto mb-12 max-w-2xl text-lg text-neutral-600">
                        Des prestations adaptées à tous vos besoins, réalisées
                        par des professionnels certifiés
                    </p>
                </motion.div>
                <div className="grid gap-8 md:grid-cols-3">
                    {services.map((s, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, y: 18 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: idx * 0.12 }}
                            className="group cursor-pointer rounded-2xl border border-transparent bg-white p-8 shadow-lg transition-all hover:border-neutral-900/20 hover:shadow-2xl"
                        >
                            <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-xl bg-neutral-100 text-neutral-900 transition-transform group-hover:scale-110">
                                <s.icon className="h-7 w-7" />
                            </div>
                            <h3 className="mb-3 text-xl font-bold text-neutral-900">
                                {s.name}
                            </h3>
                            <p className="mb-4 leading-relaxed text-neutral-600">
                                {s.desc}
                            </p>
                            <ul className="mb-6 space-y-2 text-sm text-neutral-500">
                                {s.features.map((feature, i) => (
                                    <li
                                        key={i}
                                        className="flex items-center gap-2"
                                    >
                                        <CheckCircle className="h-4 w-4 text-neutral-900" />
                                        {feature}
                                    </li>
                                ))}
                            </ul>
                            <div className="flex items-center justify-between border-t border-neutral-100 pt-4">
                                <span className="font-semibold text-neutral-900">
                                    {s.price}
                                </span>
                                <Link
                                    href={route('services.index')}
                                    className="text-sm font-medium text-neutral-600 hover:text-neutral-900"
                                >
                                    En savoir plus →
                                </Link>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </div>
    );
}

function TopAgentsSection() {
    const agents = [
        {
            name: 'Sarah Jenkins',
            specialty: 'Nettoyage profond',
            exp: 5,
            location: 'Paris, France',
            rating: 4.9,
            avatar: 'https://images.unsplash.com/photo-1581578731117-104f2a41272c?auto=format&fit=crop&w=400&q=80',
        },
        {
            name: 'Paul Martin',
            specialty: 'Ménage standard',
            exp: 3,
            location: 'Lyon, France',
            rating: 4.8,
            avatar: 'https://images.unsplash.com/photo-1556910103-1c02745a30bf?auto=format&fit=crop&w=400&q=80',
        },
        {
            name: 'Clara Dupont',
            specialty: 'Vitres & façades',
            exp: 4,
            location: 'Marseille, France',
            rating: 4.7,
            avatar: 'https://images.unsplash.com/photo-1520333789090-1afc82db536a?auto=format&fit=crop&w=400&q=80',
        },
    ];

    return (
        <div className="bg-white py-24">
            <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
                <h2 className="mb-8 text-3xl font-bold text-neutral-900">
                    Agents les mieux notés
                </h2>
                <div className="grid gap-8 md:grid-cols-3">
                    {agents.map((agent, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, y: 18 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: idx * 0.12 }}
                            className="group overflow-hidden rounded-2xl border border-neutral-100 transition-all duration-300 hover:shadow-2xl"
                        >
                            <div className="relative aspect-[4/3] overflow-hidden bg-neutral-100">
                                <img
                                    src={agent.avatar}
                                    alt={agent.name}
                                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                                />
                                <div className="absolute top-4 right-4 flex items-center gap-1 rounded-lg bg-white/90 px-2 py-1 text-xs font-bold shadow-sm backdrop-blur">
                                    <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />{' '}
                                    {agent.rating}
                                </div>
                            </div>
                            <div className="p-6">
                                <h3 className="text-lg font-bold text-neutral-900">
                                    {agent.name}
                                </h3>
                                <p className="mb-4 text-sm text-neutral-500">
                                    {agent.specialty} • {agent.exp} ans
                                    d'expérience
                                </p>
                                <div className="mb-6 flex items-center gap-2 text-sm text-neutral-600">
                                    <MapPin className="h-4 w-4 text-neutral-400" />
                                    <span>{agent.location}</span>
                                </div>
                                <button className="w-full rounded-xl border border-neutral-200 py-3 font-medium text-neutral-700 transition-colors hover:border-neutral-300 hover:bg-neutral-50">
                                    Voir Profil
                                </button>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </div>
    );
}

function HowItWorksSection() {
    return (
        <section id="comment-ca-marche" className="bg-neutral-50 py-24">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="mb-16 text-center">
                    <h2 className="mb-4 text-3xl font-bold text-neutral-900 md:text-4xl">
                        Comment ça marche ?
                    </h2>
                    <p className="mx-auto max-w-2xl text-lg text-neutral-600">
                        Que vous cherchiez un nettoyage parfait ou des clients
                        réguliers, VIMAIZ simplifie tout.
                    </p>
                </div>

                <div className="grid gap-12 md:grid-cols-2">
                    {/* Client Side */}
                    <div className="rounded-3xl bg-white p-8 shadow-xl shadow-neutral-200/50">
                        <div className="mb-8 flex items-center gap-4">
                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-neutral-900 text-white">
                                <Search className="h-6 w-6" />
                            </div>
                            <h3 className="text-2xl font-bold text-neutral-900">
                                Pour les Clients
                            </h3>
                        </div>
                        <ul className="space-y-8">
                            {[
                                {
                                    title: 'Recherchez',
                                    desc: 'Trouvez des agents qualifiés près de chez vous en quelques clics.',
                                },
                                {
                                    title: 'Réservez',
                                    desc: 'Choisissez votre créneau et payez en toute sécurité.',
                                },
                                {
                                    title: 'Profitez',
                                    desc: 'Un service impeccable, garanti et assuré.',
                                },
                            ].map((step, i) => (
                                <li key={i} className="flex gap-4">
                                    <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-neutral-100 font-bold text-neutral-900">
                                        {i + 1}
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-neutral-900">
                                            {step.title}
                                        </h4>
                                        <p className="text-neutral-600">
                                            {step.desc}
                                        </p>
                                    </div>
                                </li>
                            ))}
                        </ul>
                        <div className="mt-8 border-t border-neutral-100 pt-8">
                            <Link href={route('agents.index')}>
                                <PrimaryButton className="w-full justify-center rounded-xl py-6 text-base">
                                    Trouver mon agent
                                </PrimaryButton>
                            </Link>
                        </div>
                    </div>

                    {/* Agent Side */}
                    <div className="rounded-3xl bg-neutral-900 p-8 text-white shadow-xl shadow-neutral-900/20">
                        <div className="mb-8 flex items-center gap-4">
                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-neutral-900">
                                <Sparkles className="h-6 w-6" />
                            </div>
                            <h3 className="text-2xl font-bold text-white">
                                Pour les Agents
                            </h3>
                        </div>
                        <ul className="space-y-8">
                            {[
                                {
                                    title: 'Créez votre profil',
                                    desc: 'Mettez en avant votre expérience et vos services.',
                                },
                                {
                                    title: 'Recevez des missions',
                                    desc: 'Acceptez les demandes qui correspondent à votre emploi du temps.',
                                },
                                {
                                    title: 'Gagnez plus',
                                    desc: 'Fixez vos tarifs et recevez vos paiements rapidement.',
                                },
                            ].map((step, i) => (
                                <li key={i} className="flex gap-4">
                                    <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-white/10 font-bold text-white">
                                        {i + 1}
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-white">
                                            {step.title}
                                        </h4>
                                        <p className="text-neutral-400">
                                            {step.desc}
                                        </p>
                                    </div>
                                </li>
                            ))}
                        </ul>
                        <div className="mt-8 border-t border-white/10 pt-8">
                            <Link href={route('register')}>
                                <SecondaryButton className="w-full justify-center rounded-xl py-6 text-base hover:bg-neutral-200">
                                    Devenir Agent VIMAIZ
                                </SecondaryButton>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

function TestimonialsSection() {
    const testimonials = [
        {
            text: "Le meilleur service de nettoyage que j'ai utilisé. Mon appartement est comme neuf !",
            author: 'Marie L., Paris',
            rating: 5,
        },
        {
            text: 'Professionnels, ponctuels et très efficaces. Je recommande.',
            author: 'Jean P., Lyon',
            rating: 5,
        },
    ];

    return (
        <div className="bg-white py-24">
            <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
                <h2 className="mb-8 text-3xl font-bold text-neutral-900">
                    Avis clients
                </h2>
                <div className="space-y-12">
                    {testimonials.map((t, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, y: 12 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: idx * 0.12 }}
                            className="rounded-3xl bg-neutral-50 p-8 shadow-lg"
                        >
                            <div className="mb-4 flex items-center gap-2 text-yellow-500">
                                {Array(t.rating)
                                    .fill(0)
                                    .map((_, i) => (
                                        <Star
                                            key={i}
                                            className="h-4 w-4 fill-current"
                                        />
                                    ))}
                            </div>
                            <p className="mb-2 text-neutral-700 italic">
                                "{t.text}"
                            </p>
                            <p className="font-bold text-neutral-900">
                                {t.author}
                            </p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </div>
    );
}

function FeaturesSection() {
    const features = [
        {
            title: 'Satisfaction garantie',
            desc: 'Si vous n’êtes pas satisfait, nous refaisons le nettoyage gratuitement.',
        },
        {
            title: 'Assurance complète',
            desc: 'Votre propriété est protégée jusqu’à 1M€.',
        },
        {
            title: 'Produits écologiques',
            desc: 'Sûr pour votre famille, vos animaux et la planète.',
        },
    ];

    return (
        <div className="bg-neutral-900 py-24 text-white">
            <div className="mx-auto grid max-w-7xl items-center gap-16 px-4 sm:px-6 lg:grid-cols-2 lg:px-8">
                <div>
                    <h2 className="mb-6 text-3xl font-bold md:text-4xl">
                        Pourquoi VIMAIZ est la référence
                    </h2>
                    <p className="mb-8 text-lg text-neutral-400">
                        Nous ne faisons pas que nettoyer ; nous prenons soin.
                        Notre processus rigoureux et notre engagement
                        garantissent un service premium à chaque fois.
                    </p>
                    <ul className="space-y-6">
                        {features.map((f, idx) => (
                            <li key={idx} className="flex gap-4">
                                <div className="mt-1 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-neutral-700">
                                    <CheckCircle className="h-4 w-4 text-white" />
                                </div>
                                <div>
                                    <h4 className="text-lg font-bold">
                                        {f.title}
                                    </h4>
                                    <p className="text-neutral-400">{f.desc}</p>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
                <div className="relative">
                    <div className="aspect-square overflow-hidden rounded-3xl border border-white/10 shadow-2xl">
                        <img
                            src="https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=1000&q=80"
                            alt="Nettoyage"
                            className="h-full w-full object-cover"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}

// Cinematic Section - Scale + Blur + Gradient Overlay
function CinematicSection() {
    const { scrollY } = useScroll();

    return (
        <div className="relative overflow-hidden bg-neutral-900 py-32">
            {/* Background Image with Scale & Blur */}
            <motion.div
                style={{
                    scale: useTransform(scrollY, [800, 1400], [1.2, 1]),
                    filter: useTransform(
                        scrollY,
                        [800, 1400],
                        ['blur(8px)', 'blur(0px)'],
                    ),
                }}
                className="absolute inset-0 opacity-40"
            >
                <div
                    className="h-full w-full bg-cover bg-center"
                    style={{
                        backgroundImage:
                            'url(https://images.unsplash.com/photo-1628177142898-93e36e4e3a50?auto=format&fit=crop&w=2000&q=80)',
                    }}
                />
            </motion.div>

            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-neutral-900/95 via-neutral-900/80 to-transparent" />

            {/* Content */}
            <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="max-w-3xl">
                    <motion.div
                        initial={{ opacity: 0, x: -30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8 }}
                    >
                        <h2 className="mb-6 text-4xl font-extrabold text-white md:text-5xl">
                            Une expérience de nettoyage{' '}
                            <span className="bg-gradient-to-r from-neutral-400 to-neutral-200 bg-clip-text text-transparent">
                                cinématique
                            </span>
                        </h2>
                        <p className="mb-8 text-xl leading-relaxed text-neutral-300">
                            Chaque intervention est orchestrée avec précision.
                            Nos agents utilisent des techniques professionnelles
                            et des produits premium pour transformer votre
                            espace en un environnement impeccable.
                        </p>
                        <div className="grid grid-cols-2 gap-6">
                            {[
                                {
                                    label: 'Satisfaction client',
                                    value: '99.8%',
                                },
                                {
                                    label: 'Interventions réussies',
                                    value: '50k+',
                                },
                                { label: 'Agents certifiés', value: '500+' },
                                { label: 'Villes couvertes', value: '25+' },
                            ].map((stat, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: i * 0.1 }}
                                    className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm"
                                >
                                    <div className="text-3xl font-bold text-neutral-400">
                                        {stat.value}
                                    </div>
                                    <div className="mt-1 text-sm text-neutral-300">
                                        {stat.label}
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
}

// Futuristic Section - Opacity + Animated Blobs + Gradient
function FuturisticSection() {
    return (
        <div className="relative overflow-hidden bg-neutral-950 py-32">
            {/* Animated Gradient Background */}
            <div className="absolute inset-0">
                <div className="absolute inset-0 bg-gradient-to-br from-neutral-900 via-neutral-950 to-neutral-900" />

                {/* Animated Blobs */}
                <motion.div
                    animate={{
                        x: [0, 100, -50, 0],
                        y: [0, -80, 40, 0],
                        scale: [1, 1.2, 0.9, 1],
                    }}
                    transition={{
                        duration: 20,
                        repeat: Infinity,
                        ease: 'easeInOut',
                    }}
                    className="absolute top-0 left-1/4 h-96 w-96 rounded-full bg-neutral-500/20 blur-3xl"
                    style={{ opacity: 0.6 }}
                />
                <motion.div
                    animate={{
                        x: [0, -120, 60, 0],
                        y: [0, 100, -50, 0],
                        scale: [1, 0.8, 1.3, 1],
                    }}
                    transition={{
                        duration: 25,
                        repeat: Infinity,
                        ease: 'easeInOut',
                    }}
                    className="absolute right-1/4 bottom-0 h-[500px] w-[500px] rounded-full bg-neutral-600/20 blur-3xl"
                    style={{ opacity: 0.5 }}
                />
                <motion.div
                    animate={{
                        x: [0, 80, -40, 0],
                        y: [0, -60, 30, 0],
                    }}
                    transition={{
                        duration: 18,
                        repeat: Infinity,
                        ease: 'easeInOut',
                    }}
                    className="absolute top-1/2 right-1/3 h-80 w-80 rounded-full bg-neutral-400/20 blur-3xl"
                    style={{ opacity: 0.4 }}
                />
            </div>

            {/* Content */}
            <div className="relative z-10 mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8 }}
                >
                    <h2 className="mb-6 text-4xl font-extrabold text-white md:text-5xl">
                        Le futur du{' '}
                        <span className="bg-gradient-to-r from-neutral-200 via-neutral-400 to-neutral-200 bg-clip-text text-transparent">
                            nettoyage professionnel
                        </span>
                    </h2>
                    <p className="mx-auto mb-12 max-w-3xl text-xl text-neutral-300">
                        Technologie de pointe, transparence totale et service
                        irréprochable. VIMAIZ réinvente la mise en relation
                        entre clients et professionnels du nettoyage.
                    </p>

                    {/* Feature Cards */}
                    <div className="mt-16 grid gap-8 md:grid-cols-3">
                        {[
                            {
                                title: 'Réservation intelligente',
                                desc: 'Algorithme de matching qui trouve le meilleur agent selon vos besoins et disponibilités',
                                icon: '🤖',
                            },
                            {
                                title: 'Paiement sécurisé',
                                desc: 'Transactions cryptées avec protection acheteur et système de paiement fractionné',
                                icon: '🔒',
                            },
                            {
                                title: 'Suivi en temps réel',
                                desc: 'Notifications instantanées, chat intégré et historique complet de vos prestations',
                                icon: '📱',
                            },
                        ].map((feature, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.15 }}
                                className="group relative"
                            >
                                <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-neutral-500/10 to-neutral-500/10 blur-xl transition-all group-hover:blur-2xl" />
                                <div className="relative rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-md transition-all hover:border-white/20">
                                    <div className="mb-4 text-5xl">
                                        {feature.icon}
                                    </div>
                                    <h3 className="mb-3 text-xl font-bold text-white">
                                        {feature.title}
                                    </h3>
                                    <p className="leading-relaxed text-neutral-300">
                                        {feature.desc}
                                    </p>
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    {/* CTA */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.5 }}
                        className="mt-16"
                    >
                        <Link href={route('register')}>
                            <PrimaryButton
                                size="lg"
                                className="rounded-full px-10 py-8 text-xl shadow-2xl hover:scale-105"
                            >
                                Rejoindre VIMAIZ
                            </PrimaryButton>
                        </Link>
                    </motion.div>
                </motion.div>
            </div>
        </div>
    );
}

function Footer() {
    return (
        <footer className="border-t border-neutral-100 bg-white pt-16 pb-8">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="mb-12 grid grid-cols-2 gap-8 md:grid-cols-4">
                    <div className="col-span-2 md:col-span-1">
                        <div className="mb-4 flex items-center gap-2">
                            <div className="rounded-md bg-neutral-900 p-1">
                                <Sparkles className="h-4 w-4 text-white" />
                            </div>
                            <span className="text-xl font-bold text-neutral-900">
                                VIMAIZ
                            </span>
                        </div>
                        <p className="text-sm text-neutral-500">
                            Transformez vos espaces, un nettoyage à la fois.
                            Marketplace premium pour professionnels du
                            nettoyage.
                        </p>
                    </div>

                    <div>
                        <h4 className="mb-4 font-bold text-neutral-900">
                            Entreprise
                        </h4>
                        <ul className="space-y-2 text-sm text-neutral-500">
                            <li>
                                <a href="#" className="hover:text-neutral-900">
                                    À propos
                                </a>
                            </li>
                            <li>
                                <a href="#" className="hover:text-neutral-900">
                                    Carrières
                                </a>
                            </li>
                            <li>
                                <a href="#" className="hover:text-neutral-900">
                                    Presse
                                </a>
                            </li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="mb-4 font-bold text-neutral-900">
                            Support
                        </h4>
                        <ul className="space-y-2 text-sm text-neutral-500">
                            <li>
                                <a href="#" className="hover:text-neutral-900">
                                    Aide
                                </a>
                            </li>
                            <li>
                                <a href="#" className="hover:text-neutral-900">
                                    Sécurité
                                </a>
                            </li>
                            <li>
                                <a href="#" className="hover:text-neutral-900">
                                    Conditions
                                </a>
                            </li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="mb-4 font-bold text-neutral-900">
                            Social
                        </h4>
                        <ul className="space-y-2 text-sm text-neutral-500">
                            <li>
                                <a href="#" className="hover:text-neutral-900">
                                    Instagram
                                </a>
                            </li>
                            <li>
                                <a href="#" className="hover:text-neutral-900">
                                    Twitter
                                </a>
                            </li>
                            <li>
                                <a href="#" className="hover:text-neutral-900">
                                    LinkedIn
                                </a>
                            </li>
                        </ul>
                    </div>
                </div>
                <div className="flex flex-col items-center justify-between gap-4 border-t border-neutral-100 pt-8 md:flex-row">
                    <p className="text-sm text-neutral-400">
                        © 2025 VIMAIZ. Tous droits réservés.
                    </p>
                    <div className="flex gap-6 text-sm text-neutral-400">
                        <a href="#" className="hover:text-neutral-600">
                            Confidentialité
                        </a>
                        <a href="#" className="hover:text-neutral-600">
                            Conditions
                        </a>
                        <a href="#" className="hover:text-neutral-600">
                            Plan du site
                        </a>
                    </div>
                </div>
            </div>
        </footer>
    );
}
