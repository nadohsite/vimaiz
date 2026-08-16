import PublicLayout from '@/components/public/public-layout';
import { type SharedData } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { ChevronDown } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

const TYPE_OPTIONS = ['Appartement', 'Maison', 'Villa', 'Chalet'] as const;

/** Tarif ménage interne — non affiché au public */
const PRICE_PER_M2 = 1.7;
const DEFAULT_SURFACE = 50;

const CLIENT_FAQS = [
    {
        question: 'Qu’est-ce que Vimaiz ?',
        answer: [
            'Vimaiz est une solution pensée pour simplifier l’organisation des prestations nécessaires à la préparation de vos logements.',
            'Nous permettons de centraliser vos demandes, suivre vos interventions et garder une vision claire de chaque étape, afin que vos logements soient toujours prêts au bon moment.',
        ],
    },
    {
        question: 'À qui s’adresse Vimaiz ?',
        answer: [
            'Vimaiz accompagne les professionnels qui souhaitent gagner en sérénité dans la gestion de leurs logements et de leurs arrivées voyageurs.',
            'Que vous gériez un seul logement ou plusieurs, Vimaiz vous aide à structurer votre organisation.',
        ],
    },
    {
        question: 'Comment Vimaiz garantit-il que mon logement sera prêt ?',
        answer: [
            'Chaque demande est organisée et suivie depuis votre espace Vimaiz.',
            'Vous gardez une visibilité sur les prestations prévues, leur avancement et les informations importantes liées à chaque intervention.',
        ],
    },
    {
        question: 'Est-ce que je peux suivre mes interventions ?',
        answer: [
            'Oui.',
            'Votre espace Vimaiz vous permet de retrouver facilement vos prestations, vos échanges, vos documents et l’historique de vos interventions.',
        ],
    },
    {
        question: 'Puis-je gérer plusieurs logements ?',
        answer: [
            'Oui.',
            'Vimaiz est conçu pour accompagner les besoins des utilisateurs qui souhaitent garder une organisation claire, même lorsque le nombre de logements augmente.',
        ],
    },
    {
        question: 'Comment fonctionne le paiement ?',
        answer: [
            'Chaque prestation est encadrée avant sa réalisation.',
            'Vous retrouvez les informations nécessaires directement depuis votre espace Vimaiz afin de garder une gestion simple et transparente.',
        ],
    },
    {
        question: 'Puis-je choisir les professionnels qui interviennent ?',
        answer: [
            'Vimaiz fonctionne avec un réseau de professionnels dont les profils sont vérifiés.',
            'L’objectif est de vous permettre de bénéficier d’une organisation fiable sans avoir à gérer toute la recherche et la coordination.',
        ],
    },
    {
        question: 'Que se passe-t-il en cas d’imprévu ?',
        answer: [
            'L’objectif de Vimaiz est justement de réduire les situations où un imprévu peut compromettre une arrivée.',
            'Grâce au suivi et à la centralisation des informations, vous disposez d’une meilleure visibilité sur votre organisation.',
        ],
    },
    {
        question: 'Pourquoi utiliser Vimaiz plutôt que gérer directement ses prestations ?',
        answer: [
            'Parce qu’une bonne organisation ne devrait pas dépendre de multiples échanges, fichiers ou rappels.',
            'Vimaiz rassemble les éléments essentiels pour vous permettre de garder le contrôle simplement.',
        ],
    },
    {
        question: 'Est-ce que Vimaiz remplace mon organisation actuelle ?',
        answer: [
            'Vimaiz s’adapte à votre fonctionnement.',
            'La plateforme vous accompagne pour structurer vos prestations et simplifier votre quotidien.',
        ],
    },
];

const PARCOURS_STEPS = [
    {
        title: 'Renseignez vos biens',
        description:
            'Centralisez vos logements et leurs spécificités une fois pour toutes — une base claire pour chaque arrivée voyageur.',
    },
    {
        title: 'Planifiez votre créneau',
        description:
            'Choisissez la date et l’heure en fonction du départ et de l’arrivée des voyageurs.',
    },
    {
        title: 'Confirmez et réglez',
        description:
            'Recevez le devis, validez-le et payez en ligne en toute sécurité avant l’intervention.',
    },
    {
        title: 'Suivez l’intervention',
        description:
            'Notifications, échanges et suivi en direct : vous gardez une vision claire à chaque étape.',
    },
    {
        title: 'Retrouvez tout',
        description:
            'Factures, historiques et documents centralisés dans votre espace, prêts quand vous en avez besoin.',
    },
];

function todayIso() {
    return new Date().toISOString().split('T')[0];
}

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

function HomeIcon() {
    return (
        <svg width="19" height="19" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path
                d="M3 11l9-7 9 7"
                stroke="currentColor"
                strokeWidth="1.7"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            <path
                d="M5 10v9a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-9"
                stroke="currentColor"
                strokeWidth="1.7"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    );
}

export default function Welcome({
    availableAgentsCount: _availableAgentsCount = 0,
}: {
    availableAgentsCount?: number;
}) {
    const { auth } = usePage<SharedData>().props;
    const isLoggedIn = Boolean(auth.user);
    const ctaHref = isLoggedIn ? route('dashboard') : route('register');

    const [typeValue, setTypeValue] = useState<(typeof TYPE_OPTIONS)[number]>('Appartement');
    const [surfaceValue, setSurfaceValue] = useState(DEFAULT_SURFACE);
    const [extraType, setExtraType] = useState('');
    const [extraQty, setExtraQty] = useState(0);
    const [extraSurface, setExtraSurface] = useState(0);
    const [dateValue, setDateValue] = useState(todayIso);
    const [timeValue, setTimeValue] = useState('10:00');
    const [openFaq, setOpenFaq] = useState<number | null>(null);

    const surface = Math.max(0, surfaceValue);
    const extraTotalSurface =
        extraQty > 0 && extraSurface > 0 ? extraQty * Math.max(0, extraSurface) : 0;
    const billableSurface = surface + extraTotalSurface;
    const total = Math.round(billableSurface * PRICE_PER_M2);
    const initialTotal = Math.round(DEFAULT_SURFACE * PRICE_PER_M2);
    const [displayEstimate, setDisplayEstimate] = useState(initialTotal);
    const [flash, setFlash] = useState(false);
    const estimateRef = useRef(initialTotal);
    const hasExtra = extraTotalSurface > 0;

    useEffect(() => {
        let frame = 0;
        let startTime: number | null = null;
        const start = estimateRef.current;
        const target = total;

        if (start === target) {
            return;
        }

        setFlash(true);
        const flashTimeout = window.setTimeout(() => setFlash(false), 180);

        const step = (ts: number) => {
            if (startTime === null) {
                startTime = ts;
            }
            const progress = Math.min((ts - startTime) / 320, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            const value = Math.round(start + (target - start) * eased);
            estimateRef.current = value;
            setDisplayEstimate(value);
            if (progress < 1) {
                frame = requestAnimationFrame(step);
            }
        };

        frame = requestAnimationFrame(step);

        return () => {
            cancelAnimationFrame(frame);
            window.clearTimeout(flashTimeout);
        };
    }, [total]);

    return (
        <PublicLayout
            title="VIMAIZ — Dormez l'esprit Tranquille"
            description="Dormez l'esprit Tranquille. Vimaiz veille à ce que chacun de vos logements soit toujours prêt à accueillir les prochains voyageurs."
        >
            <section className="hero wrap">
                <div className="hero-grid">
                    <div>
                        {/* <span className="eyebrow rise-1">Plateforme de préparation des logements</span> */}
                        <h1 className="rise-2">
                            Dormez l&apos;esprit
                            <span className="accent"> Tranquille</span>
                        </h1>
                        <p className="hero-sub rise-3">
                            Vimaiz veille à ce que chacun de vos logements soit toujours prêt à
                            accueillir les prochains voyageurs.
                        </p>
                        <div className="hero-ctas rise-4">
                            <a className="btn btn-primary" href="#service">
                                Programmer une intervention
                            </a>
                            <a className="btn btn-ghost" href="#steps">
                                Comment ça fonctionne
                            </a>
                        </div>
                        <div className="trust-row trust-row-centered">
                            <span>
                                <CheckIcon />
                                Paiement sécurisé
                            </span>
                            <span>
                                <CheckIcon />
                                Intervenants vérifiés SIRET
                            </span>
                            <span>
                                <CheckIcon />
                                Suivi des prestations
                            </span>
                        </div>

                        <div className="why-vimaiz">
                            <div className="sec-eyebrow">Pourquoi Vimaiz ?</div>
                            <h3>Une location saisonnière ne se résume pas à seulement accueillir des voyageurs</h3>
                            <p>
                                Chaque arrivée demande une organisation précise, où le moindre
                                imprévu peut rapidement devenir une source de stress.
                            </p>
                        </div>
                    </div>

                    <div className="card-wrap">
                        <div className="float-badge" aria-hidden="true">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                                <path
                                    d="M13 2 4 14h6l-1 8 9-12h-6l1-8z"
                                    stroke="currentColor"
                                    strokeWidth="1.6"
                                    strokeLinejoin="round"
                                    strokeLinecap="round"
                                />
                            </svg>
                        </div>
                        <div className="card-request" id="service">
                            <div className="card-head">
                                <h3>Demande rapide</h3>
                                <span className="live-pill">
                                    <span className="live-dot" aria-hidden="true" />
                                    Intervenants dispo
                                </span>
                            </div>

                            <div className="req-row">
                                <div className="req-icon">
                                    <HomeIcon />
                                </div>
                                <div className="req-body">
                                    <div className="req-sub">Type de logement</div>
                                    <select
                                        className="req-field"
                                        aria-label="Type de logement"
                                        value={typeValue}
                                        onChange={(e) =>
                                            setTypeValue(
                                                e.target.value as (typeof TYPE_OPTIONS)[number],
                                            )
                                        }
                                    >
                                        {TYPE_OPTIONS.map((option) => (
                                            <option key={option} value={option}>
                                                {option}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div className="req-check on" aria-hidden="true">
                                    <svg width="11" height="11" viewBox="0 0 20 20" fill="none">
                                        <path
                                            d="M5 10l3.2 3.2L15 6.5"
                                            stroke="currentColor"
                                            strokeWidth="2"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                        />
                                    </svg>
                                </div>
                            </div>

                            <div className="req-row">
                                <div className="req-icon">
                                    <svg
                                        width="19"
                                        height="19"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        aria-hidden="true"
                                    >
                                        <rect
                                            x="4"
                                            y="5"
                                            width="16"
                                            height="15"
                                            rx="2"
                                            stroke="currentColor"
                                            strokeWidth="1.7"
                                        />
                                        <path
                                            d="M4 9h16M8 3v4M16 3v4"
                                            stroke="currentColor"
                                            strokeWidth="1.7"
                                            strokeLinecap="round"
                                        />
                                    </svg>
                                </div>
                                <div className="req-body">
                                    <div className="req-sub">Date et créneau</div>
                                    <div className="req-row-split">
                                        <input
                                            className="req-field"
                                            type="date"
                                            aria-label="Date de l'intervention"
                                            min={todayIso()}
                                            value={dateValue}
                                            onChange={(e) => setDateValue(e.target.value)}
                                        />
                                        <input
                                            className="req-field"
                                            type="time"
                                            aria-label="Heure de l'intervention"
                                            value={timeValue}
                                            onChange={(e) => setTimeValue(e.target.value)}
                                        />
                                    </div>
                                </div>
                                <div className="req-check on" aria-hidden="true">
                                    <svg width="11" height="11" viewBox="0 0 20 20" fill="none">
                                        <path
                                            d="M5 10l3.2 3.2L15 6.5"
                                            stroke="currentColor"
                                            strokeWidth="2"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                        />
                                    </svg>
                                </div>
                            </div>

                            <div className="req-row">
                                <div className="req-icon">
                                    <svg
                                        width="19"
                                        height="19"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        aria-hidden="true"
                                    >
                                        <path
                                            d="M4 20V4h16v16H4z"
                                            stroke="currentColor"
                                            strokeWidth="1.7"
                                        />
                                        <path
                                            d="M4 12h16M12 4v16"
                                            stroke="currentColor"
                                            strokeWidth="1.7"
                                        />
                                    </svg>
                                </div>
                                <div className="req-body">
                                    <div className="req-sub">Surface (m²)</div>
                                    <input
                                        className="req-field"
                                        type="number"
                                        min={1}
                                        step={1}
                                        inputMode="numeric"
                                        aria-label="Surface en m²"
                                        placeholder="ex. 50"
                                        value={surfaceValue || ''}
                                        onChange={(e) =>
                                            setSurfaceValue(
                                                e.target.value === ''
                                                    ? 0
                                                    : Math.max(0, Number(e.target.value)),
                                            )
                                        }
                                    />
                                </div>
                                <div className="req-check on" aria-hidden="true">
                                    <svg width="11" height="11" viewBox="0 0 20 20" fill="none">
                                        <path
                                            d="M5 10l3.2 3.2L15 6.5"
                                            stroke="currentColor"
                                            strokeWidth="2"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                        />
                                    </svg>
                                </div>
                            </div>

                            <div className="req-row req-row-extra">
                                <div className="req-icon">
                                    <svg
                                        width="19"
                                        height="19"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        aria-hidden="true"
                                    >
                                        <path
                                            d="M12 5v14M5 12h14"
                                            stroke="currentColor"
                                            strokeWidth="1.7"
                                            strokeLinecap="round"
                                        />
                                    </svg>
                                </div>
                                <div className="req-body">
                                    <div className="req-sub">Espace en plus (optionnel)</div>
                                    <input
                                        className="req-field"
                                        type="text"
                                        aria-label="Type d'espace en plus"
                                        placeholder="Type de bien (ex. garage, annexe)"
                                        value={extraType}
                                        onChange={(e) => setExtraType(e.target.value)}
                                    />
                                    <div className="req-row-split" style={{ marginTop: 8 }}>
                                        <input
                                            className="req-field"
                                            type="number"
                                            min={0}
                                            step={1}
                                            inputMode="numeric"
                                            aria-label="Nombre d'espaces en plus"
                                            placeholder="Quantité"
                                            value={extraQty || ''}
                                            onChange={(e) =>
                                                setExtraQty(
                                                    e.target.value === ''
                                                        ? 0
                                                        : Math.max(0, Number(e.target.value)),
                                                )
                                            }
                                        />
                                        <input
                                            className="req-field"
                                            type="number"
                                            min={0}
                                            step={1}
                                            inputMode="numeric"
                                            aria-label="Surface de l'espace en plus en m²"
                                            placeholder="Surface m²"
                                            value={extraSurface || ''}
                                            onChange={(e) =>
                                                setExtraSurface(
                                                    e.target.value === ''
                                                        ? 0
                                                        : Math.max(0, Number(e.target.value)),
                                                )
                                            }
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="req-row">
                                <div className="req-icon">
                                    <svg
                                        width="19"
                                        height="19"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        aria-hidden="true"
                                    >
                                        <rect
                                            x="3"
                                            y="6"
                                            width="18"
                                            height="13"
                                            rx="2"
                                            stroke="currentColor"
                                            strokeWidth="1.7"
                                        />
                                        <path
                                            d="M3 10h18"
                                            stroke="currentColor"
                                            strokeWidth="1.7"
                                        />
                                    </svg>
                                </div>
                                <div className="req-body">
                                    <div className="req-title">Paiement sécurisé</div>
                                    <div className="req-sub">
                                        Débité après validation, avant l&apos;intervention
                                    </div>
                                </div>
                            </div>

                            <div className="avatar-stack">
                                <div className="avatars">
                                    <div className="avatar">ML</div>
                                    <div className="avatar">KB</div>
                                    <div className="avatar">SR</div>
                                </div>
                                <span className="avatar-note">
                                    <strong>Plusieurs intervenants disponibles</strong>
                                </span>
                            </div>

                            <div className="estimate-box">
                                <div className="estimate-top">
                                    <span className="estimate-label">
                                        Estimation de l&apos;intervention
                                    </span>
                                    <span
                                        className={`estimate-value${flash ? ' flash' : ''}`}
                                    >
                                        {displayEstimate} €
                                    </span>
                                </div>
                                <div className="estimate-breakdown">
                                    <span>
                                        {typeValue} · {surface || 0} m²
                                        {hasExtra
                                            ? ` + ${extraQty}×${extraSurface} m²${extraType ? ` (${extraType})` : ''}`
                                            : ''}{' '}
                                        · {timeValue}
                                    </span>
                                    <span>{total} €</span>
                                </div>
                            </div>

                            <Link className="btn btn-primary" href={ctaHref}>
                                Réserver pour {total} €
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            <section id="steps" className="welcome-section">
                <div className="wrap">
                    <div className="sec-head">
                        <div className="sec-eyebrow">Le parcours</div>
                        <h2>Comment ça fonctionne</h2>
                        <p className="sec-sub">
                            Un processus en cinq temps, pour que chaque logement soit prêt au bon
                            moment.
                        </p>
                    </div>
                    <div className="steps steps-5">
                        {PARCOURS_STEPS.map((step, index) => (
                            <div className="step" key={step.title}>
                                <div className="step-stamp">
                                    {String(index + 1).padStart(2, '0')}
                                </div>
                                <div>
                                    <h3>{step.title}</h3>
                                    <p>{step.description}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <section className="welcome-section">
                <div className="wrap">
                    <div className="split-cards">
                        <article className="split-card split-card-conviction rise-2">
                            <div className="sec-eyebrow">Notre Conviction</div>
                            <h2>
                                Une location saisonnière devrait toujours être prête à accueillir
                                ses voyageurs
                            </h2>
                            <p>
                                La décoration attire le regard. La propreté inspire confiance.
                            </p>
                        </article>
                        <article id="agent" className="split-card split-card-cta rise-3">
                            <div className="sec-eyebrow">Réseau Vimaiz</div>
                            <h2>Devenir intervenant ?</h2>
                            <p>
                                Vimaiz vous aide à développer votre activité en vous proposant des
                                interventions selon vos disponibilités. Numéro de SIRET obligatoire.
                            </p>
                            <Link
                                className="btn btn-primary"
                                href={route('professionals.index')}
                            >
                                Devenir intervenant
                            </Link>
                        </article>
                    </div>
                </div>
            </section>

            <section id="about" className="welcome-section">
                <div className="wrap">
                    <div className="about-grid">
                        <div>
                            <div className="sec-eyebrow">La plateforme</div>
                            <h2 style={{ marginBottom: 16 }}>À propos de Vimaiz</h2>
                            <p>
                                Chez Vimaiz, nous croyons qu&apos;une location saisonnière devrait
                                toujours être prête à accueillir ses voyageurs.
                            </p>
                            <p>
                                Pourtant, derrière chaque arrivée se cache une organisation exigeante
                                où le moindre imprévu peut avoir des conséquences importantes.
                            </p>
                            <ul className="about-list">
                                <li>Un retard.</li>
                                <li>Une absence.</li>
                                <li>Une intervention annulée.</li>
                                <li>Une mauvaise expérience voyageur.</li>
                            </ul>
                            <p>
                                Nous avons créé Vimaiz pour apporter plus de sérénité aux
                                professionnels de la location saisonnière.
                            </p>
                            <p>
                                Notre objectif n&apos;est pas d&apos;ajouter un outil de plus.
                            </p>
                            <p>
                                Notre objectif est de simplifier toute l&apos;organisation qui
                                permet à un logement d&apos;être prêt au bon moment.
                            </p>
                            <p>
                                Nous croyons qu&apos;une bonne organisation est invisible.
                            </p>
                            <p>Lorsqu&apos;elle fonctionne, personne n&apos;y pense.</p>
                            <p>
                                Lorsqu&apos;elle manque, tout le monde en subit les conséquences.
                            </p>
                            <p>
                                C&apos;est cette tranquillité d&apos;esprit que nous voulons offrir
                                à chaque utilisateur de Vimaiz.
                            </p>
                        </div>
                        <div className="about-cards">
                            <div className="about-card">
                                <div className="type-icon">
                                    <svg
                                        width="19"
                                        height="19"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        aria-hidden="true"
                                    >
                                        <path
                                            d="M12 3l7 3v6c0 5-3.5 7.5-7 9-3.5-1.5-7-4-7-9V6l7-3z"
                                            stroke="currentColor"
                                            strokeWidth="1.6"
                                            strokeLinejoin="round"
                                        />
                                    </svg>
                                </div>
                                <h3>Intervenants vérifiés</h3>
                                <p>SIRET et documents contrôlés avant intégration au réseau.</p>
                            </div>
                            <div className="about-card">
                                <div className="type-icon">
                                    <svg
                                        width="19"
                                        height="19"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        aria-hidden="true"
                                    >
                                        <rect
                                            x="3"
                                            y="6"
                                            width="18"
                                            height="13"
                                            rx="2"
                                            stroke="currentColor"
                                            strokeWidth="1.6"
                                        />
                                        <path
                                            d="M3 10h18"
                                            stroke="currentColor"
                                            strokeWidth="1.6"
                                        />
                                    </svg>
                                </div>
                                <h3>Paiement sécurisé</h3>
                                <p>Débité avant chaque intervention, jamais avant validation.</p>
                            </div>
                            <div className="about-card">
                                <div className="type-icon">
                                    <svg
                                        width="19"
                                        height="19"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        aria-hidden="true"
                                    >
                                        <path
                                            d="M12 17.3l-5.4 3 1-6-4.4-4.3 6.1-.9L12 3l2.7 5.1 6.1.9-4.4 4.3 1 6z"
                                            stroke="currentColor"
                                            strokeWidth="1.6"
                                            strokeLinejoin="round"
                                        />
                                    </svg>
                                </div>
                                <h3>Organisation claire</h3>
                                <p>
                                    Suivi des prestations, échanges et historique centralisés dans
                                    un seul espace.
                                </p>
                            </div>
                            <div className="about-card">
                                <div className="type-icon">
                                    <svg
                                        width="19"
                                        height="19"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        aria-hidden="true"
                                    >
                                        <path
                                            d="M12 21s-7-6.3-7-11.5A7 7 0 0 1 12 2a7 7 0 0 1 7 7.5C19 14.7 12 21 12 21z"
                                            stroke="currentColor"
                                            strokeWidth="1.6"
                                            strokeLinejoin="round"
                                        />
                                        <circle
                                            cx="12"
                                            cy="9.5"
                                            r="2.4"
                                            stroke="currentColor"
                                            strokeWidth="1.6"
                                        />
                                    </svg>
                                </div>
                                <h3>Partout en France</h3>
                                <p>
                                    Un réseau national de professionnels, disponible où que vous
                                    soyez.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <section id="faq" className="welcome-section">
                <div className="wrap">
                    <div className="sec-head">
                        <div className="sec-eyebrow">FAQ</div>
                        <h2>Questions fréquentes</h2>
                    </div>
                    {CLIENT_FAQS.map((faq, index) => (
                        <div
                            className="faq-item"
                            key={faq.question}
                            data-open={openFaq === index}
                            style={{ animationDelay: `${Math.min(index, 6) * 40}ms` }}
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
                                    {faq.answer.map((paragraph) => (
                                        <p key={paragraph}>{paragraph}</p>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </section>
        </PublicLayout>
    );
}
