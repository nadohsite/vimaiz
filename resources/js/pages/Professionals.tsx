import PublicLayout from '@/components/public/public-layout';
import { Link } from '@inertiajs/react';
import {
    Briefcase,
    ChevronDown,
    Clock,
    Euro,
    MapPin,
    Shield,
    Smartphone,
    Star,
    Users,
} from 'lucide-react';
import { useState } from 'react';

export default function Professionals() {
    const [openFaq, setOpenFaq] = useState<number | null>(null);

    const benefits = [
        {
            icon: Clock,
            title: 'Flexibilité totale',
            description: 'Choisissez vos horaires et les missions qui vous conviennent.',
        },
        {
            icon: Euro,
            title: 'Revenus liés à votre activité',
            description:
                'Vos revenus dépendent du nombre et du type de missions que vous réalisez.',
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
            text: "Grâce à VIMAIZ, j'organise mon emploi du temps comme je veux. Les paiements sont toujours à l'heure.",
            missions: 47,
        },
        {
            name: 'Sophie B.',
            location: 'Lyon',
            rating: 5,
            text: "L'application est super simple. Je reçois des missions près de chez moi.",
            missions: 32,
        },
        {
            name: 'Thomas M.',
            location: 'Bordeaux',
            rating: 5,
            text: "Excellent complément de revenus. L'équipe support est vraiment à l'écoute.",
            missions: 58,
        },
    ];

    const faqs = [
        {
            question: 'Quelles sont les conditions pour devenir agent ?',
            answer: "Être majeur, disposer d'un numéro SIRET (auto-entrepreneur ou société) et être autonome dans ses déplacements.",
        },
        {
            question: 'Comment suis-je payé ?',
            answer: "Vos gains sont versés automatiquement sur votre compte bancaire chaque semaine. Vous pouvez suivre vos revenus en temps réel dans l'application.",
        },
        {
            question: 'Dois-je fournir le matériel de ménage ?',
            answer: "Oui, vous devez disposer de votre propre matériel (aspirateur, produits, etc.). C'est un critère important pour les clients.",
        },
        {
            question: 'Puis-je refuser une mission ?',
            answer: "Absolument. Vous êtes libre d'accepter ou refuser chaque mission proposée. Aucune obligation.",
        },
        {
            question: 'Quelle est la zone de couverture ?',
            answer: 'VIMAIZ est disponible dans les principales villes de France : Paris, Lyon, Marseille, Bordeaux, Toulouse, et plus.',
        },
    ];

    return (
        <PublicLayout title="Devenir Agent VIMAIZ — Gagnez de l'argent avec le ménage">
            {/* HERO */}
            <section className="hero wrap">
                <div className="hero-grid">
                    <div>
                        <span className="eyebrow rise-1">Recrutement ouvert</span>
                        <h1 className="rise-2">
                            Devenez agent de ménage
                            <span className="accent"> Vimaiz.</span>
                        </h1>
                        <p className="hero-sub rise-3">
                            Travaillez régulièrement avec des clients vérifiés, selon vos
                            disponibilités. Vimaiz vous apporte des missions, vous restez maître
                            de votre emploi du temps.
                        </p>
                        <div className="hero-ctas rise-4">
                            <Link
                                className="btn btn-primary"
                                href={route('register') + '?role=agent'}
                            >
                                Commencer maintenant →
                            </Link>
                            <a className="btn btn-ghost" href="#comment-ca-marche">
                                Comment ça marche ?
                            </a>
                        </div>
                        <div className="trust-row">
                            <span>
                                <svg
                                    className="dot-check"
                                    viewBox="0 0 20 20"
                                    fill="none"
                                    aria-hidden="true"
                                >
                                    <circle
                                        cx="10"
                                        cy="10"
                                        r="9"
                                        stroke="currentColor"
                                        strokeWidth="1.5"
                                    />
                                    <path
                                        d="M6 10l2.5 2.5L14 7"
                                        stroke="currentColor"
                                        strokeWidth="1.6"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    />
                                </svg>
                                Inscription gratuite
                            </span>
                            <span>
                                <svg
                                    className="dot-check"
                                    viewBox="0 0 20 20"
                                    fill="none"
                                    aria-hidden="true"
                                >
                                    <circle
                                        cx="10"
                                        cy="10"
                                        r="9"
                                        stroke="currentColor"
                                        strokeWidth="1.5"
                                    />
                                    <path
                                        d="M6 10l2.5 2.5L14 7"
                                        stroke="currentColor"
                                        strokeWidth="1.6"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    />
                                </svg>
                                Paiement garanti
                            </span>
                        </div>
                    </div>
                    <div>
                        <div className="agent-visual" style={{ marginTop: 24 }}>
                            <div className="badge-num">€ / mission</div>
                            <div className="badge-cap">
                                Le montant dépend du type de logement, de la surface et de la
                                prestation.
                            </div>
                            <hr />
                            <div
                                style={{
                                    display: 'grid',
                                    gridTemplateColumns: '1fr 1fr',
                                    gap: 14,
                                }}
                            >
                                <div>
                                    <div className="badge-num">500+</div>
                                    <div className="badge-cap">Agents actifs</div>
                                </div>
                                <div>
                                    <div className="badge-num">10K+</div>
                                    <div className="badge-cap">Missions / mois</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* BENEFITS */}
            <section id="avantages" className="welcome-section">
                <div className="wrap">
                    <div className="sec-head">
                        <div className="sec-eyebrow">Les avantages</div>
                        <h2>Pourquoi rejoindre Vimaiz ?</h2>
                        <p className="sec-sub">
                            Une organisation simple pour vous concentrer sur votre travail.
                        </p>
                    </div>
                    <div className="grid-3">
                        {benefits.map((benefit) => (
                            <div className="type-card" key={benefit.title}>
                                <div className="type-icon">
                                    <benefit.icon size={19} />
                                </div>
                                <h3>{benefit.title}</h3>
                                <p style={{ marginBottom: 0 }}>{benefit.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* STEPS */}
            <section id="comment-ca-marche" className="welcome-section">
                <div className="wrap">
                    <div className="sec-head">
                        <div className="sec-eyebrow">Le parcours</div>
                        <h2>Comment ça marche ?</h2>
                        <p className="sec-sub">3 étapes simples pour commencer.</p>
                    </div>
                    <div className="grid-3">
                        {steps.map((step) => (
                            <div className="type-card" key={step.number}>
                                <div className="step-stamp" style={{ margin: '0 0 16px' }}>
                                    {step.number}
                                </div>
                                <h3>{step.title}</h3>
                                <p style={{ marginBottom: 0 }}>{step.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* TESTIMONIALS */}
            <section className="welcome-section">
                <div className="wrap">
                    <div className="sec-head">
                        <div className="sec-eyebrow">Témoignages</div>
                        <h2>Ils nous font confiance</h2>
                        <p className="sec-sub">Découvrez les témoignages de nos agents.</p>
                    </div>
                    <div className="grid-3">
                        {testimonials.map((t) => (
                            <div className="quote-card" key={t.name}>
                                <div className="quote-stars">
                                    {[...Array(t.rating)].map((_, i) => (
                                        <Star key={i} size={16} fill="currentColor" />
                                    ))}
                                </div>
                                <p className="quote-text">« {t.text} »</p>
                                <div className="quote-meta">
                                    <div>
                                        <div className="quote-name">{t.name}</div>
                                        <div className="quote-loc">
                                            <MapPin
                                                size={11}
                                                style={{
                                                    display: 'inline',
                                                    verticalAlign: '-1px',
                                                    marginRight: 3,
                                                }}
                                            />
                                            {t.location}
                                        </div>
                                    </div>
                                    <div className="quote-missions">
                                        {t.missions}
                                        <small>missions</small>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* FAQ */}
            <section id="faq" className="welcome-section">
                <div className="wrap" style={{ maxWidth: 760 }}>
                    <div className="sec-head">
                        <div className="sec-eyebrow">FAQ</div>
                        <h2>Questions fréquentes</h2>
                    </div>
                    {faqs.map((faq, index) => (
                        <div className="faq-item" key={faq.question} data-open={openFaq === index}>
                            <button
                                type="button"
                                className="faq-q"
                                onClick={() => setOpenFaq(openFaq === index ? null : index)}
                                aria-expanded={openFaq === index}
                            >
                                {faq.question}
                                <ChevronDown size={18} />
                            </button>
                            {openFaq === index && <div className="faq-a">{faq.answer}</div>}
                        </div>
                    ))}
                </div>
            </section>

            {/* CTA */}
            <section className="welcome-section">
                <div className="wrap">
                    <div className="agent-band" style={{ textAlign: 'center', display: 'block' }}>
                        <h2>Prêt à rejoindre l&apos;aventure ?</h2>
                        <p style={{ maxWidth: '52ch', margin: '10px auto 24px' }}>
                            Rejoignez plus de 500 agents Vimaiz et commencez à gagner de
                            l&apos;argent dès cette semaine.
                        </p>
                        <Link className="btn btn-primary" href={route('register') + '?role=agent'}>
                            Devenir agent maintenant →
                        </Link>
                    </div>
                </div>
            </section>
        </PublicLayout>
    );
}
