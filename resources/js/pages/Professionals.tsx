import { Head, Link, useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
    CheckCircle, 
    Clock, 
    DollarSign, 
    Shield, 
    Smartphone, 
    Users, 
    Star,
    ArrowRight,
    Calendar,
    MapPin,
    Briefcase
} from 'lucide-react';
import { useState } from 'react';
import AppLogoIcon from '@/components/app-logo-icon';

interface Props {
    success?: boolean;
}

export default function Professionals({ success }: Props) {
    const [submitted, setSubmitted] = useState(success || false);

    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        email: '',
        phone: '',
        city: '',
        experience: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('professionals.register'), {
            onSuccess: () => {
                setSubmitted(true);
                reset();
            },
        });
    };

    const benefits = [
        {
            icon: Clock,
            title: 'Flexibilité totale',
            description: 'Choisissez vos horaires et les missions qui vous conviennent. Travaillez quand vous voulez.',
        },
        {
            icon: DollarSign,
            title: 'Revenus attractifs',
            description: 'Jusqu\'à 20€/h net. Paiement rapide et sécurisé sur votre compte.',
        },
        {
            icon: Shield,
            title: 'Assurance incluse',
            description: 'Vous êtes couvert pendant toutes vos missions. Travaillez l\'esprit tranquille.',
        },
        {
            icon: Smartphone,
            title: 'Application simple',
            description: 'Gérez vos missions, photos et paiements depuis votre smartphone.',
        },
        {
            icon: Users,
            title: 'Support dédié',
            description: 'Une équipe à votre écoute pour vous accompagner au quotidien.',
        },
        {
            icon: Briefcase,
            title: 'Missions régulières',
            description: 'Des propriétaires de confiance avec des missions récurrentes.',
        },
    ];

    const steps = [
        {
            number: '01',
            title: 'Inscrivez-vous',
            description: 'Remplissez le formulaire et téléchargez vos documents (pièce d\'identité, justificatif).',
        },
        {
            number: '02',
            title: 'Validation',
            description: 'Notre équipe vérifie votre profil sous 48h. Vous recevez un email de confirmation.',
        },
        {
            number: '03',
            title: 'Commencez',
            description: 'Recevez vos premières missions et commencez à gagner de l\'argent !',
        },
    ];

    const testimonials = [
        {
            name: 'Marie L.',
            location: 'Casablanca',
            rating: 5,
            text: 'Grâce à VIMAIZ, j\'organise mon emploi du temps comme je veux. Les paiements sont toujours à l\'heure.',
            missions: 47,
        },
        {
            name: 'Fatima B.',
            location: 'Marrakech',
            rating: 5,
            text: 'L\'application est super simple. Je reçois des missions près de chez moi et je peux refuser si je ne suis pas disponible.',
            missions: 32,
        },
        {
            name: 'Karim M.',
            location: 'Rabat',
            rating: 5,
            text: 'Excellent complément de revenus. L\'équipe support est vraiment à l\'écoute.',
            missions: 58,
        },
    ];

    const faqs = [
        {
            question: 'Quelles sont les conditions pour devenir agent VIMAIZ ?',
            answer: 'Vous devez être majeur, avoir une pièce d\'identité valide, et être motivé pour offrir un service de qualité. Aucune expérience préalable n\'est requise.',
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
            answer: 'VIMAIZ est disponible dans les principales villes du Maroc : Casablanca, Rabat, Marrakech, Tanger, Agadir, et plus.',
        },
    ];

    return (
        <>
            <Head title="Devenir Agent VIMAIZ - Gagnez de l'argent avec le ménage" />

            {/* Header */}
            <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <Link href="/" className="flex items-center gap-2">
                            <AppLogoIcon className="h-8 w-8" />
                            <span className="font-bold text-xl text-sky-600">VIMAIZ</span>
                        </Link>
                        <div className="flex items-center gap-4">
                            <Link href={route('login')}>
                                <Button variant="ghost">Connexion</Button>
                            </Link>
                            <a href="#inscription">
                                <Button className="bg-sky-500 hover:bg-sky-600">
                                    Devenir agent
                                </Button>
                            </a>
                        </div>
                    </div>
                </div>
            </header>

            {/* Hero Section */}
            <section className="pt-24 pb-16 bg-gradient-to-br from-sky-50 via-white to-emerald-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid lg:grid-cols-2 gap-12 items-center">
                        <div>
                            <span className="inline-block px-4 py-2 bg-sky-100 text-sky-700 rounded-full text-sm font-medium mb-6">
                                🎉 Recrutement ouvert
                            </span>
                            <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6 leading-tight">
                                Devenez agent de ménage <span className="text-sky-600">VIMAIZ</span>
                            </h1>
                            <p className="text-xl text-slate-600 mb-8">
                                Gagnez jusqu'à <strong>4000 MAD/mois</strong> en travaillant à votre rythme. 
                                Choisissez vos missions, fixez vos horaires.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4">
                                <a href="#inscription">
                                    <Button size="lg" className="bg-sky-500 hover:bg-sky-600 text-lg px-8">
                                        Commencer maintenant
                                        <ArrowRight className="ml-2 h-5 w-5" />
                                    </Button>
                                </a>
                                <a href="#comment-ca-marche">
                                    <Button size="lg" variant="outline" className="text-lg px-8">
                                        Comment ça marche ?
                                    </Button>
                                </a>
                            </div>
                            <div className="flex items-center gap-8 mt-8 text-sm text-slate-500">
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
                            <div className="bg-gradient-to-br from-sky-400 to-emerald-400 rounded-3xl p-8 text-white">
                                <div className="text-center">
                                    <div className="text-6xl font-bold mb-2">20€</div>
                                    <div className="text-xl opacity-90">par heure en moyenne</div>
                                </div>
                                <div className="grid grid-cols-2 gap-4 mt-8">
                                    <div className="bg-white/20 rounded-xl p-4 text-center">
                                        <div className="text-2xl font-bold">500+</div>
                                        <div className="text-sm opacity-90">Agents actifs</div>
                                    </div>
                                    <div className="bg-white/20 rounded-xl p-4 text-center">
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
            <section className="py-20 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
                            Pourquoi rejoindre VIMAIZ ?
                        </h2>
                        <p className="text-xl text-slate-600 max-w-2xl mx-auto">
                            Des avantages concrets pour vous simplifier la vie
                        </p>
                    </div>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {benefits.map((benefit, index) => (
                            <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-shadow">
                                <CardContent className="p-6">
                                    <div className="h-12 w-12 bg-sky-100 rounded-xl flex items-center justify-center mb-4">
                                        <benefit.icon className="h-6 w-6 text-sky-600" />
                                    </div>
                                    <h3 className="text-xl font-semibold text-slate-900 mb-2">{benefit.title}</h3>
                                    <p className="text-slate-600">{benefit.description}</p>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            </section>

            {/* How it works */}
            <section id="comment-ca-marche" className="py-20 bg-slate-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
                            Comment ça marche ?
                        </h2>
                        <p className="text-xl text-slate-600 max-w-2xl mx-auto">
                            3 étapes simples pour commencer à gagner de l'argent
                        </p>
                    </div>
                    <div className="grid md:grid-cols-3 gap-8">
                        {steps.map((step, index) => (
                            <div key={index} className="relative">
                                <div className="bg-white rounded-2xl p-8 shadow-lg h-full">
                                    <div className="text-5xl font-bold text-sky-100 mb-4">{step.number}</div>
                                    <h3 className="text-xl font-semibold text-slate-900 mb-3">{step.title}</h3>
                                    <p className="text-slate-600">{step.description}</p>
                                </div>
                                {index < steps.length - 1 && (
                                    <div className="hidden md:block absolute top-1/2 -right-4 transform -translate-y-1/2">
                                        <ArrowRight className="h-8 w-8 text-sky-300" />
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Testimonials */}
            <section className="py-20 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
                            Ils nous font confiance
                        </h2>
                        <p className="text-xl text-slate-600 max-w-2xl mx-auto">
                            Découvrez les témoignages de nos agents
                        </p>
                    </div>
                    <div className="grid md:grid-cols-3 gap-8">
                        {testimonials.map((testimonial, index) => (
                            <Card key={index} className="border-0 shadow-lg">
                                <CardContent className="p-6">
                                    <div className="flex items-center gap-1 mb-4">
                                        {[...Array(testimonial.rating)].map((_, i) => (
                                            <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                                        ))}
                                    </div>
                                    <p className="text-slate-600 mb-6 italic">"{testimonial.text}"</p>
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="font-semibold text-slate-900">{testimonial.name}</p>
                                            <p className="text-sm text-slate-500 flex items-center gap-1">
                                                <MapPin className="h-3 w-3" />
                                                {testimonial.location}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-2xl font-bold text-sky-600">{testimonial.missions}</p>
                                            <p className="text-xs text-slate-500">missions</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            </section>

            {/* Registration Form */}
            <section id="inscription" className="py-20 bg-gradient-to-br from-sky-600 to-sky-800">
                <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                            Prêt à commencer ?
                        </h2>
                        <p className="text-xl text-sky-100">
                            Inscrivez-vous maintenant et recevez vos premières missions
                        </p>
                    </div>

                    {submitted ? (
                        <Card className="border-0 shadow-2xl">
                            <CardContent className="p-12 text-center">
                                <div className="h-16 w-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                    <CheckCircle className="h-8 w-8 text-green-600" />
                                </div>
                                <h3 className="text-2xl font-bold text-slate-900 mb-4">
                                    Inscription reçue !
                                </h3>
                                <p className="text-slate-600 mb-6">
                                    Merci pour votre intérêt ! Notre équipe va examiner votre demande 
                                    et vous contacter sous 48h pour finaliser votre inscription.
                                </p>
                                <Link href={route('register')}>
                                    <Button className="bg-sky-500 hover:bg-sky-600">
                                        Créer mon compte maintenant
                                    </Button>
                                </Link>
                            </CardContent>
                        </Card>
                    ) : (
                        <Card className="border-0 shadow-2xl">
                            <CardHeader>
                                <CardTitle>Pré-inscription agent</CardTitle>
                                <CardDescription>
                                    Remplissez ce formulaire pour recevoir plus d'informations
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={handleSubmit} className="space-y-6">
                                    <div className="grid md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <Label htmlFor="name">Nom complet *</Label>
                                            <Input
                                                id="name"
                                                value={data.name}
                                                onChange={(e) => setData('name', e.target.value)}
                                                placeholder="Votre nom"
                                                required
                                            />
                                            {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="email">Email *</Label>
                                            <Input
                                                id="email"
                                                type="email"
                                                value={data.email}
                                                onChange={(e) => setData('email', e.target.value)}
                                                placeholder="votre@email.com"
                                                required
                                            />
                                            {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
                                        </div>
                                    </div>
                                    <div className="grid md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <Label htmlFor="phone">Téléphone *</Label>
                                            <Input
                                                id="phone"
                                                type="tel"
                                                value={data.phone}
                                                onChange={(e) => setData('phone', e.target.value)}
                                                placeholder="06 XX XX XX XX"
                                                required
                                            />
                                            {errors.phone && <p className="text-sm text-red-500">{errors.phone}</p>}
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="city">Ville *</Label>
                                            <Input
                                                id="city"
                                                value={data.city}
                                                onChange={(e) => setData('city', e.target.value)}
                                                placeholder="Casablanca, Rabat..."
                                                required
                                            />
                                            {errors.city && <p className="text-sm text-red-500">{errors.city}</p>}
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="experience">Expérience en ménage</Label>
                                        <Input
                                            id="experience"
                                            value={data.experience}
                                            onChange={(e) => setData('experience', e.target.value)}
                                            placeholder="Ex: 2 ans chez particuliers, hôtellerie..."
                                        />
                                    </div>
                                    <Button
                                        type="submit"
                                        disabled={processing}
                                        className="w-full bg-sky-500 hover:bg-sky-600 text-lg py-6"
                                    >
                                        {processing ? 'Envoi en cours...' : 'Envoyer ma candidature'}
                                    </Button>
                                    <p className="text-xs text-center text-slate-500">
                                        En soumettant ce formulaire, vous acceptez d'être contacté par VIMAIZ.
                                    </p>
                                </form>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </section>

            {/* FAQ */}
            <section className="py-20 bg-white">
                <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
                            Questions fréquentes
                        </h2>
                    </div>
                    <div className="space-y-6">
                        {faqs.map((faq, index) => (
                            <Card key={index} className="border">
                                <CardContent className="p-6">
                                    <h3 className="font-semibold text-slate-900 mb-2">{faq.question}</h3>
                                    <p className="text-slate-600">{faq.answer}</p>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            </section>

            {/* Footer CTA */}
            <section className="py-16 bg-slate-900">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h2 className="text-3xl font-bold text-white mb-4">
                        Prêt à rejoindre l'aventure ?
                    </h2>
                    <p className="text-slate-400 mb-8 max-w-2xl mx-auto">
                        Rejoignez plus de 500 agents VIMAIZ et commencez à gagner de l'argent dès cette semaine.
                    </p>
                    <a href="#inscription">
                        <Button size="lg" className="bg-sky-500 hover:bg-sky-600 text-lg px-8">
                            Devenir agent maintenant
                            <ArrowRight className="ml-2 h-5 w-5" />
                        </Button>
                    </a>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-8 bg-slate-950 text-slate-400">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                        <div className="flex items-center gap-2">
                            <AppLogoIcon className="h-6 w-6" />
                            <span className="font-semibold text-white">VIMAIZ</span>
                        </div>
                        <p className="text-sm">© 2026 VIMAIZ. Tous droits réservés.</p>
                        <div className="flex gap-6 text-sm">
                            <Link href="/mentions-legales" className="hover:text-white">Mentions légales</Link>
                            <Link href="/confidentialite" className="hover:text-white">Confidentialité</Link>
                            <Link href="/contact" className="hover:text-white">Contact</Link>
                        </div>
                    </div>
                </div>
            </footer>
        </>
    );
}
