import { Head, Link } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { 
    CheckCircle, 
    Clock, 
    Euro, 
    Shield, 
    Smartphone, 
    Users, 
    Star,
    ArrowRight,
    MapPin,
    Briefcase,
    ChevronDown
} from 'lucide-react';
import { useState, useEffect } from 'react';
import logoImage from '@/../assets/images/logo.png';
import AppearanceToggleDropdown from '@/components/appearance-dropdown';
import { trackMetaEvent } from '@/lib/meta-pixel';

interface Props {
    success?: boolean;
}

export default function Professionals({ success }: Props) {
    const [openFaq, setOpenFaq] = useState<number | null>(null);

    useEffect(() => {
        trackMetaEvent('ViewContent', { content_category: 'agent_recruitment' });
    }, []);

    const benefits = [
        {
            icon: Clock,
            title: 'Flexibilité totale',
            description: 'Choisissez vos horaires et les missions qui vous conviennent.',
        },
        {
            icon: Euro,
            title: 'Revenus liés à votre activité',
            description: 'Vos revenus dépendent du nombre et du type de missions que vous réalisez.',
        },
        {
            icon: Shield,
            title: 'Assurance incluse',
            description: 'Vous êtes couvert pendant toutes vos missions.',
        },
        {
            icon: Smartphone,
            title: 'Application simple',
            description: 'Gérez tout depuis votre smartphone.',
        },
        {
            icon: Users,
            title: 'Support dédié',
            description: 'Une équipe à votre écoute au quotidien.',
        },
        {
            icon: Briefcase,
            title: 'Missions régulières',
            description: 'Des clients fidèles et des missions récurrentes.',
        },
    ];

    const steps = [
        {
            number: '01',
            title: 'Inscrivez-vous',
            description: 'Créez votre compte et téléchargez vos documents.',
        },
        {
            number: '02',
            title: 'Validation',
            description: 'Notre équipe vérifie votre profil sous 48h.',
        },
        {
            number: '03',
            title: 'Commencez',
            description: 'Recevez vos premières missions !',
        },
    ];

    const testimonials = [
        {
            name: 'Marie L.',
            location: 'Paris',
            rating: 5,
            text: 'Grâce à VIMAIZ, j\'organise mon emploi du temps comme je veux. Les paiements sont toujours à l\'heure.',
            missions: 47,
        },
        {
            name: 'Sophie B.',
            location: 'Lyon',
            rating: 5,
            text: 'L\'application est super simple. Je reçois des missions près de chez moi.',
            missions: 32,
        },
        {
            name: 'Thomas M.',
            location: 'Bordeaux',
            rating: 5,
            text: 'Excellent complément de revenus. L\'équipe support est vraiment à l\'écoute.',
            missions: 58,
        },
    ];

    const faqs = [
        {
            question: 'Quelles sont les conditions pour devenir agent ?',
            answer: 'Être majeur, disposer d\'un numéro SIRET (auto-entrepreneur ou société) et être autonome dans ses déplacements.',
        },
        {
            question: 'Comment suis-je payé ?',
            answer: 'Vos gains sont versés automatiquement sur votre compte bancaire chaque semaine. Vous pouvez suivre vos revenus en temps réel dans l\'application.',
        },
        {
            question: 'Dois-je fournir le matériel de ménage ?',
            answer: 'Oui, vous devez disposer de votre propre matériel (aspirateur, produits, etc.). C\'est un critère important pour les clients.',
        },
        {
            question: 'Puis-je refuser une mission ?',
            answer: 'Absolument. Vous êtes libre d\'accepter ou refuser chaque mission proposée. Aucune obligation.',
        },
        {
            question: 'Quelle est la zone de couverture ?',
            answer: 'VIMAIZ est disponible dans les principales villes de France : Paris, Lyon, Marseille, Bordeaux, Toulouse, et plus.',
        },
    ];

    return (
        <div className="min-h-screen bg-white dark:bg-slate-900 font-sans text-slate-900 dark:text-white flex flex-col">
            <Head title="Devenir Agent VIMAIZ - Gagnez de l'argent avec le ménage" />

            {/* NAV - Same as Welcome */}
            <nav className="fixed z-50 w-full bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm border-b border-slate-100 dark:border-slate-800">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="flex h-16 items-center justify-between">
                        <div className="flex items-center gap-8">
                            <Link href="/" className="flex items-center">
                                <img 
                                    src={logoImage} 
                                    alt="VIMAIZ" 
                                    className="h-22 object-contain" 
                                    style={{ filter: 'brightness(0) saturate(100%) invert(48%) sepia(79%) saturate(2476%) hue-rotate(166deg) brightness(98%) contrast(101%)' }}
                                />
                            </Link>
                            <div className="hidden items-center space-x-6 md:flex">
                                <a href="#avantages" className="text-sm font-medium text-slate-600 dark:text-slate-300 transition-colors hover:text-primary">
                                    Avantages
                                </a>
                                <a href="#comment-ca-marche" className="text-sm font-medium text-slate-600 dark:text-slate-300 transition-colors hover:text-primary">
                                    Comment ça marche
                                </a>
                                <a href="#faq" className="text-sm font-medium text-slate-600 dark:text-slate-300 transition-colors hover:text-primary">
                                    FAQ
                                </a>
                            </div>
                        </div>

                        <div className="flex items-center space-x-3">
                            <AppearanceToggleDropdown />
                            <Link href={route('login')}>
                                <Button variant="ghost" size="sm">
                                    Connexion
                                </Button>
                            </Link>
                            <Link href={route('register') + '?role=agent'}>
                                <Button size="sm" className="bg-sky-500 hover:bg-sky-600">
                                    Devenir agent
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="pt-28 pb-20 bg-gradient-to-br from-sky-50 via-white to-emerald-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid lg:grid-cols-2 gap-12 items-center">
                        <div>
                            <span className="inline-block px-4 py-2 bg-sky-100 dark:bg-sky-900/50 text-sky-700 dark:text-sky-300 rounded-full text-sm font-medium mb-6">
                                🎉 Recrutement ouvert
                            </span>
                            <h1 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-6 leading-tight">
                                Devenez agent de ménage <span className="text-sky-600 dark:text-sky-400">VIMAIZ</span>
                            </h1>
                            <p className="text-base text-slate-600 dark:text-slate-300 mb-8">
                                Travaillez régulièrement avec des clients vérifiés, selon vos disponibilités.
                                <br />
                                <strong className="text-slate-900 dark:text-white">Vimaiz vous apporte des missions</strong>, vous restez maître de votre emploi du temps.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4">
                                <Link href={route('register') + '?role=agent'}>
                                    <Button size="lg" className="bg-sky-500 hover:bg-sky-600 text-lg px-8 w-full sm:w-auto">
                                        Commencer maintenant
                                        <ArrowRight className="ml-2 h-5 w-5" />
                                    </Button>
                                </Link>
                                <a href="#comment-ca-marche">
                                    <Button size="lg" variant="outline" className="text-lg px-8 w-full sm:w-auto dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-800">
                                        Comment ça marche ?
                                    </Button>
                                </a>
                            </div>
                            <div className="flex items-center gap-8 mt-8 text-sm text-slate-500 dark:text-slate-400">
                                <div className="flex items-center gap-2">
                                    <CheckCircle className="h-5 w-5 text-green-500" />
                                    <span>Inscription gratuite</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <CheckCircle className="h-5 w-5 text-green-500" />
                                    <span>Paiement garanti</span>
                                </div>
                            </div>
                        </div>
                        <div className="relative">
                            <div className="bg-gradient-to-br from-sky-500 to-cyan-500 rounded-3xl p-8 text-white shadow-2xl">
                                <div className="text-center">
                                    <div className="text-3xl font-bold mb-2">Rémunération par mission (€)</div>
                                    <div className="text-base opacity-90">Le montant dépend du type de logement, de la surface et de la prestation.</div>
                                </div>
                                <div className="grid grid-cols-2 gap-4 mt-8">
                                    <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 text-center">
                                        <div className="text-2xl font-bold">500+</div>
                                        <div className="text-sm opacity-90">Agents actifs</div>
                                    </div>
                                    <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 text-center">
                                        <div className="text-2xl font-bold">10K+</div>
                                        <div className="text-sm opacity-90">Missions/mois</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Benefits Section */}
            <section id="avantages" className="py-20 bg-white dark:bg-slate-900">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4">
                            Pourquoi rejoindre VIMAIZ ?
                        </h2>
                        <p className="text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
                            {/* Des avantages concrets pour vous simplifier la vie */}
                            Une organisation simple pour vous concentrer sur votre travail
                        </p>
                    </div>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {benefits.map((benefit, index) => (
                            <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-shadow bg-white dark:bg-slate-800 dark:border-slate-700">
                                <CardContent className="p-6">
                                    <div className="h-12 w-12 bg-sky-100 dark:bg-sky-900/50 rounded-xl flex items-center justify-center mb-4">
                                        <benefit.icon className="h-6 w-6 text-sky-600 dark:text-sky-400" />
                                    </div>
                                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">{benefit.title}</h3>
                                    <p className="text-slate-600 dark:text-slate-400 text-sm">{benefit.description}</p>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            </section>

            {/* How it works */}
            <section id="comment-ca-marche" className="py-20 bg-slate-50 dark:bg-slate-800">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4">
                            Comment ça marche ?
                        </h2>
                        <p className="text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
                            3 étapes simples pour commencer
                        </p>
                    </div>
                    <div className="grid md:grid-cols-3 gap-8">
                        {steps.map((step, index) => (
                            <div key={index} className="relative">
                                <div className="bg-white dark:bg-slate-900 rounded-2xl p-8 shadow-lg h-full border border-slate-100 dark:border-slate-700">
                                    <div className="text-5xl font-bold text-sky-100 dark:text-sky-900 mb-4">{step.number}</div>
                                    <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-3">{step.title}</h3>
                                    <p className="text-slate-600 dark:text-slate-400">{step.description}</p>
                                </div>
                                {index < steps.length - 1 && (
                                    <div className="hidden md:block absolute top-1/2 -right-4 transform -translate-y-1/2 z-10">
                                        <ArrowRight className="h-8 w-8 text-sky-300 dark:text-sky-600" />
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Testimonials */}
            <section className="py-20 bg-white dark:bg-slate-900">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4">
                            Ils nous font confiance
                        </h2>
                        <p className="text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
                            Découvrez les témoignages de nos agents
                        </p>
                    </div>
                    <div className="grid md:grid-cols-3 gap-8">
                        {testimonials.map((testimonial, index) => (
                            <Card key={index} className="border-0 shadow-lg bg-white dark:bg-slate-800 dark:border-slate-700">
                                <CardContent className="p-6">
                                    <div className="flex items-center gap-1 mb-4">
                                        {[...Array(testimonial.rating)].map((_, i) => (
                                            <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                                        ))}
                                    </div>
                                    <p className="text-slate-600 dark:text-slate-300 mb-6 italic">"{testimonial.text}"</p>
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="font-semibold text-slate-900 dark:text-white">{testimonial.name}</p>
                                            <p className="text-sm text-slate-500 dark:text-slate-400 flex items-center gap-1">
                                                <MapPin className="h-3 w-3" />
                                                {testimonial.location}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-2xl font-bold text-sky-600 dark:text-sky-400">{testimonial.missions}</p>
                                            <p className="text-xs text-slate-500 dark:text-slate-400">missions</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            </section>

            {/* FAQ */}
            <section id="faq" className="py-20 bg-slate-50 dark:bg-slate-800">
                <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4">
                            Questions fréquentes
                        </h2>
                    </div>
                    <div className="space-y-4">
                        {faqs.map((faq, index) => (
                            <div 
                                key={index} 
                                className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden"
                            >
                                <button
                                    onClick={() => setOpenFaq(openFaq === index ? null : index)}
                                    className="w-full flex items-center justify-between p-5 text-left"
                                >
                                    <h3 className="font-semibold text-slate-900 dark:text-white pr-4">{faq.question}</h3>
                                    <ChevronDown className={`h-5 w-5 text-slate-400 transition-transform ${openFaq === index ? 'rotate-180' : ''}`} />
                                </button>
                                {openFaq === index && (
                                    <div className="px-5 pb-5">
                                        <p className="text-slate-600 dark:text-slate-400">{faq.answer}</p>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Footer CTA */}
            <section className="py-20 bg-gradient-to-br from-sky-600 to-sky-800">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                        Prêt à rejoindre l'aventure ?
                    </h2>
                    <p className="text-sky-100 mb-8 max-w-2xl mx-auto text-lg">
                        Rejoignez plus de 500 agents VIMAIZ et commencez à gagner de l'argent dès cette semaine.
                    </p>
                    <Link href={route('register') + '?role=agent'}>
                        <Button size="lg" className="bg-white text-sky-600 hover:bg-sky-50 text-lg px-8 font-semibold">
                            Devenir agent maintenant
                            <ArrowRight className="ml-2 h-5 w-5" />
                        </Button>
                    </Link>
                </div>
            </section>

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
