import PublicLayout from '@/components/public/public-layout';
import { Link } from '@inertiajs/react';
import {
    Briefcase,
    Calendar,
    ChevronDown,
    LayoutDashboard,
    Shield,
    Sparkles,
} from 'lucide-react';
import { useState } from 'react';

function CheckIcon() {
    return (
        <svg className="dot-check" viewBox="0 0 20 20" fill="none" aria-hidden="true">
            <circle cx="10" cy="10" r="9" stroke="currentColor" strokeWidth="1.5" />
            <path
                d="M6 10l2.5 2.5L14 7"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    );
}

type FaqAnswer = string | { paragraphs: string[]; list?: string[]; afterList?: string[] };

const benefits = [
    {
        icon: Sparkles,
        title: 'Développez votre activité.',
        description: 'Recevez des propositions d’interventions.',
    },
    {
        icon: Calendar,
        title: 'Choisissez vos disponibilités.',
        description:
            'Vous restez libre d’accepter uniquement les interventions qui correspondent à votre planning.',
    },
    {
        icon: LayoutDashboard,
        title: 'Centralisez votre activité.',
        description:
            'Retrouvez vos interventions, vos échanges et le suivi de vos prestations depuis votre espace Vimaiz.',
    },
    {
        icon: Shield,
        title: 'Travaillez avec des clients vérifiés.',
        description:
            'Toutes les demandes passent par la plateforme afin de faciliter votre organisation.',
    },
    {
        icon: Briefcase,
        title: 'Une plateforme pensée pour les professionnels.',
        description:
            'Nous simplifions votre quotidien afin que vous puissiez vous concentrer sur votre savoir-faire.',
    },
];

const steps = [
    {
        number: '01',
        title: 'Rejoignez Vimaiz.',
        description:
            'Créez votre compte et complétez votre profil professionnel en quelques minutes.',
    },
    {
        number: '02',
        title: 'Nous vérifions votre profil.',
        description:
            'Chaque profil est vérifié afin de garantir un réseau de professionnels fiables et de qualité.',
    },
    {
        number: '03',
        title: 'Développez votre activité.',
        description:
            'Consultez les nouvelles interventions, acceptez celles qui correspondent à vos disponibilités et développez votre activité à votre rythme.',
    },
];

const faqs: { question: string; answer: FaqAnswer }[] = [
    {
        question: 'Qui peut rejoindre Vimaiz ?',
        answer: {
            paragraphs: [
                'Vimaiz est ouvert aux professionnels du ménage et de la propreté exerçant légalement leur activité.',
                'Pour rejoindre le réseau Vimaiz, il est obligatoire de disposer d’une entreprise déclarée (micro-entreprise, société ou tout autre statut professionnel autorisé). Cette condition garantit un réseau de professionnels sérieux et conformes aux exigences réglementaires.',
                'Chaque profil est vérifié avant son intégration afin d’assurer la qualité et la fiabilité du réseau.',
            ],
        },
    },
    {
        question:
            'Dois-je être en auto-entreprise ou en société pour devenir un intervenant Vimaiz ?',
        answer: {
            paragraphs: [
                'Oui. Il est obligatoire d’avoir une entreprise déclarée pour devenir intervenant partenaire de Vimaiz.',
                'Vous pouvez exercer sous différents statuts professionnels, notamment en micro-entreprise ou en société, à condition que votre activité soit officiellement déclarée.',
            ],
        },
    },
    {
        question: 'Quels documents sont demandés pour m’inscrire sur Vimaiz ?',
        answer: {
            paragraphs: [
                'Afin de valider votre inscription sur Vimaiz, plusieurs documents sont nécessaires :',
            ],
            list: [
                'Une pièce d’identité recto-verso en cours de validité ;',
                'Une facture de moins de 3 mois justifiant votre adresse ;',
                'Le Kbis de votre société (ou justificatif d’immatriculation selon votre statut) ;',
                'Une assurance responsabilité professionnelle.',
            ],
            afterList: [
                'L’assurance responsabilité professionnelle est fortement recommandée lors de votre inscription et deviendra obligatoire dans un délai maximum de 3 mois après votre intégration au réseau Vimaiz.',
            ],
        },
    },
    {
        question: 'Comment fonctionnent les interventions ?',
        answer: {
            paragraphs: [
                'Lorsqu’une nouvelle intervention est publiée, les intervenants disponibles sont immédiatement notifiés.',
                'Le premier intervenant à accepter l’intervention en devient responsable et retrouve toutes les informations nécessaires depuis son espace Vimaiz.',
            ],
        },
    },
    {
        question: 'Suis-je libre d’accepter ou de refuser une intervention ?',
        answer: {
            paragraphs: [
                'Oui. Vous restez entièrement libre d’accepter ou de refuser chaque intervention selon vos disponibilités, vos secteurs d’intervention et votre organisation.',
            ],
        },
    },
    {
        question: 'Comment suis-je rémunéré ?',
        answer: {
            paragraphs: [
                'Avant d’accepter une intervention, le montant de votre rémunération est indiqué en toute transparence.',
                'Une fois la prestation réalisée et validée, votre paiement est effectué selon les modalités prévues par Vimaiz.',
            ],
        },
    },
    {
        question: 'Quelle est la commission de Vimaiz ?',
        answer: {
            paragraphs: [
                'Vimaiz prélève une commission de 20 % sur chaque intervention réalisée.',
                'Cette commission permet de financer le développement de la plateforme, le support professionnel, la sécurisation des paiements ainsi que les outils mis à votre disposition.',
                'Le montant affiché avant l’acceptation d’une intervention correspond toujours à la rémunération que vous percevrez.',
            ],
        },
    },
    {
        question: 'Dois-je fournir mon propre matériel ?',
        answer: {
            paragraphs: [
                'Oui. Chaque intervenant intervient avec son propre matériel et ses produits d’entretien, sauf indication contraire précisée dans les informations de l’intervention.',
            ],
        },
    },
    {
        question: 'Puis-je choisir les zones où j’interviens ?',
        answer: {
            paragraphs: [
                'Oui. Vous définissez les secteurs géographiques dans lesquels vous souhaitez intervenir et restez libre d’accepter uniquement les interventions qui correspondent à vos disponibilités.',
            ],
        },
    },
    {
        question: 'Comment suivre mes interventions ?',
        answer: {
            paragraphs: [
                'Depuis votre espace Vimaiz, vous retrouvez l’ensemble de vos interventions, leur statut, vos échanges, votre historique ainsi que toutes les informations utiles à votre activité.',
            ],
        },
    },
    {
        question: 'Pourquoi rejoindre Vimaiz ?',
        answer: {
            paragraphs: [
                'Vimaiz vous permet de développer votre activité sans avoir à rechercher constamment de nouveaux clients.',
                'Vous restez libre d’organiser votre emploi du temps, de choisir vos interventions et de gérer votre activité depuis un seul espace dédié aux intervenants.',
            ],
        },
    },
];

function FaqBody({ answer }: { answer: FaqAnswer }) {
    if (typeof answer === 'string') {
        return <p>{answer}</p>;
    }

    return (
        <>
            {answer.paragraphs.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
            ))}
            {answer.list && (
                <ul>
                    {answer.list.map((item) => (
                        <li key={item}>{item}</li>
                    ))}
                </ul>
            )}
            {answer.afterList?.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
            ))}
        </>
    );
}

export default function Professionals() {
    const [openFaq, setOpenFaq] = useState<number | null>(null);

    return (
        <PublicLayout title="Devenir intervenant — Rejoindre le réseau Vimaiz">
            <section className="hero wrap hero-pros">
                <div className="hero-grid hero-grid-solo">
                    <div>
                        <span className="eyebrow rise-1">Réseau professionnel</span>
                        <h1 className="rise-2">
                            Rejoindre le réseau professionnel
                            <span className="accent"> Vimaiz</span>
                        </h1>
                        <p className="hero-sub rise-3">
                            Vous vous concentrez sur votre métier, nous simplifions le reste.
                        </p>
                        <div className="hero-ctas rise-4">
                            <Link
                                className="btn btn-primary"
                                href={route('register') + '?role=agent'}
                            >
                                Devenir intervenant
                            </Link>
                            <a className="btn btn-ghost" href="#comment-ca-marche">
                                Comment ça fonctionne
                            </a>
                        </div>
                        <div className="trust-row trust-row-centered">
                            <span>
                                <CheckIcon />
                                Inscription gratuite
                            </span>
                            <span>
                                <CheckIcon />
                                Paiement sécurisé
                            </span>
                            <span>
                                <CheckIcon />
                                Gestion simplifiée des interventions
                            </span>
                        </div>
                    </div>
                </div>
            </section>

            <section id="avantages" className="welcome-section">
                <div className="wrap">
                    <div className="sec-head">
                        <div className="sec-eyebrow">Les avantages</div>
                        <h2>Pourquoi rejoindre Vimaiz ?</h2>
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

            <section id="comment-ca-marche" className="welcome-section">
                <div className="wrap">
                    <div className="sec-head">
                        <div className="sec-eyebrow">Le parcours</div>
                        <h2>Comment ça fonctionne</h2>
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

            <section id="faq" className="welcome-section">
                <div className="wrap">
                    <div className="sec-head">
                        <div className="sec-eyebrow">FAQ</div>
                        <h2>Questions fréquentes – Intervenants Vimaiz</h2>
                    </div>
                    {faqs.map((faq, index) => (
                        <div
                            className="faq-item"
                            key={faq.question}
                            data-open={openFaq === index}
                        >
                            <button
                                type="button"
                                className="faq-q"
                                onClick={() => setOpenFaq(openFaq === index ? null : index)}
                                aria-expanded={openFaq === index}
                            >
                                {faq.question}
                                <ChevronDown size={18} />
                            </button>
                            {openFaq === index && (
                                <div className="faq-a">
                                    <FaqBody answer={faq.answer} />
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </section>
        </PublicLayout>
    );
}
