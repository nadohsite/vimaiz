import { Head, Link, useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Mail, Phone, MapPin, CheckCircle } from 'lucide-react';
import { useState } from 'react';
import AppearanceToggleDropdown from '@/components/appearance-dropdown';
import logoImage from '@/../assets/images/logo.png';

interface Props {
    success?: boolean;
}

export default function Contact({ success }: Props) {
    const [submitted, setSubmitted] = useState(success || false);

    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        email: '',
        subject: '',
        message: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('contact.send'), {
            onSuccess: () => {
                setSubmitted(true);
                reset();
            },
        });
    };

    return (
        <div className="min-h-screen bg-white dark:bg-slate-900 font-sans text-slate-900 dark:text-white flex flex-col">
            <Head title="Nous contacter - VIMAIZ" />

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
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-4">Contactez-nous</h1>
                        <p className="text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
                            Une question ? Une suggestion ? Notre équipe est là pour vous répondre.
                        </p>
                    </div>

                    <div className="grid lg:grid-cols-3 gap-8">
                        {/* Contact Info */}
                        <div className="lg:col-span-1 space-y-6">
                            <Card className="border-0 shadow-lg dark:bg-slate-800 dark:border-slate-700">
                                <CardContent className="p-6">
                                    <div className="flex items-start gap-4">
                                        <div className="h-12 w-12 bg-sky-100 rounded-xl flex items-center justify-center flex-shrink-0">
                                            <Mail className="h-6 w-6 text-sky-600" />
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-slate-900 dark:text-white mb-1">Email</h3>
                                            <a href="mailto:contact@vimaiz.com" className="text-sky-600 hover:underline">
                                                contact@vimaiz.com
                                            </a>
                                            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                                                Réponse sous 24h
                                            </p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="border-0 shadow-lg dark:bg-slate-800 dark:border-slate-700">
                                <CardContent className="p-6">
                                    <div className="flex items-start gap-4">
                                        <div className="h-12 w-12 bg-sky-100 rounded-xl flex items-center justify-center flex-shrink-0">
                                            <Phone className="h-6 w-6 text-sky-600" />
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-slate-900 dark:text-white mb-1">Téléphone</h3>
                                            <span className="text-slate-600 dark:text-slate-300">
                                                Via email uniquement
                                            </span>
                                            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                                                Lun-Ven : 9h-18h
                                            </p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="border-0 shadow-lg dark:bg-slate-800 dark:border-slate-700">
                                <CardContent className="p-6">
                                    <div className="flex items-start gap-4">
                                        <div className="h-12 w-12 bg-sky-100 rounded-xl flex items-center justify-center flex-shrink-0">
                                            <MapPin className="h-6 w-6 text-sky-600" />
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-slate-900 dark:text-white mb-1">Adresse</h3>
                                            <p className="text-slate-600 dark:text-slate-300">
                                                12 rue porte de la ville<br />
                                                73330 Le Pont de Beauvoisin, France
                                            </p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Contact Form */}
                        <div className="lg:col-span-2">
                            {submitted ? (
                                <Card className="border-0 shadow-lg dark:bg-slate-800 dark:border-slate-700">
                                    <CardContent className="p-12 text-center">
                                        <div className="h-16 w-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                            <CheckCircle className="h-8 w-8 text-green-600" />
                                        </div>
                                        <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
                                            Message envoyé !
                                        </h3>
                                        <p className="text-slate-600 dark:text-slate-300 mb-6">
                                            Merci de nous avoir contactés. Notre équipe vous répondra dans les plus brefs délais.
                                        </p>
                                        <Button
                                            onClick={() => setSubmitted(false)}
                                            className="bg-sky-500 hover:bg-sky-600"
                                        >
                                            Envoyer un autre message
                                        </Button>
                                    </CardContent>
                                </Card>
                            ) : (
                                <Card className="border-0 shadow-lg dark:bg-slate-800 dark:border-slate-700">
                                    <CardHeader>
                                        <CardTitle>Envoyez-nous un message</CardTitle>
                                        <CardDescription>
                                            Remplissez le formulaire ci-dessous et nous vous répondrons rapidement.
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
                                            <div className="space-y-2">
                                                <Label htmlFor="subject">Sujet *</Label>
                                                <Input
                                                    id="subject"
                                                    value={data.subject}
                                                    onChange={(e) => setData('subject', e.target.value)}
                                                    placeholder="L'objet de votre message"
                                                    required
                                                />
                                                {errors.subject && <p className="text-sm text-red-500">{errors.subject}</p>}
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="message">Message *</Label>
                                                <Textarea
                                                    id="message"
                                                    value={data.message}
                                                    onChange={(e) => setData('message', e.target.value)}
                                                    placeholder="Décrivez votre demande en détail..."
                                                    rows={6}
                                                    required
                                                />
                                                {errors.message && <p className="text-sm text-red-500">{errors.message}</p>}
                                            </div>
                                            <Button
                                                type="submit"
                                                disabled={processing}
                                                className="w-full bg-sky-500 hover:bg-sky-600 text-lg py-6"
                                            >
                                                {processing ? 'Envoi en cours...' : 'Envoyer le message'}
                                            </Button>
                                        </form>
                                    </CardContent>
                                </Card>
                            )}
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
