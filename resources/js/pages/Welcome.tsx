import PublicLayout from '@/components/public/public-layout';
import { type SharedData } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { BellRing, Calendar, ChevronDown, ClipboardCheck, UserCheck } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

const TYPE_OPTIONS = ['Appartement', 'Maison', 'Villa', 'Chalet', 'Gîte'] as const;

/** Tarif ménage interne — non affiché au public */
const PRICE_PER_M2 = 1.7;
const DEFAULT_SURFACE = 50;

const CLIENT_FAQS = [
    {
        question: 'Qu’est-ce que Vimaiz ?',
        answer: [
            'Vimaiz est une plateforme d’organisation et de suivi des interventions pour les logements en location saisonnière.',
            'Elle permet aux propriétaires qui ne peuvent pas être sur place de programmer leurs interventions et de suivre leur déroulement depuis leur espace.',
        ],
    },
    {
        question: 'À qui s’adresse Vimaiz ?',
        answer: [
            'Vimaiz s’adresse principalement aux propriétaires de logements en location saisonnière qui vivent loin de leur bien et souhaitent pouvoir organiser et suivre les interventions à distance.',
        ],
    },
    {
        question: 'Comment fonctionne une intervention ?',
        answer: [
            'Vous programmez votre intervention depuis votre espace Vimaiz. Un intervenant disponible reçoit la mission et choisit de l’accepter.',
            'Une fois la mission réalisée, vous recevez les informations et le compte rendu de l’intervention.',
        ],
    },
    {
        question: 'Puis-je suivre mon intervention à distance ?',
        answer: [
            'Oui.',
            'Vimaiz vous permet de suivre les principales étapes de l’intervention, notamment l’arrivée de l’intervenant, le début et la fin de la mission ainsi que sa durée.',
        ],
    },
    {
        question: 'Comment Vimaiz sait-il que l’intervenant est arrivé ?',
        answer: [
            'Le système utilise la géolocalisation du bien pour enregistrer l’arrivée de l’intervenant lorsqu’il se trouve à proximité du logement.',
            'Les différentes étapes de l’intervention sont ensuite enregistrées dans votre espace.',
        ],
    },
    {
        question: 'Que contient le compte rendu d’une intervention ?',
        answer: [
            'À la fin de chaque intervention, l’intervenant peut signaler les éventuelles anomalies constatées dans le logement.',
            'Vous recevez ensuite un compte rendu vous permettant de garder une vision claire de l’état du bien.',
        ],
    },
    {
        question: 'Que se passe-t-il si je ne suis pas satisfait de l’intervention ?',
        answer: [
            'Vous disposez de 48 heures après l’intervention pour signaler un problème et demander un nouveau passage.',
            'L’intervention peut ensuite être validée définitivement lorsque vous êtes satisfait.',
        ],
    },
    {
        question: 'Puis-je choisir moi-même mon intervenant ?',
        answer: [
            'Non.',
            'Vimaiz assigne automatiquement un intervenant disponible à votre mission. Cela permet de centraliser la recherche et la coordination des interventions, sans que vous ayez à contacter plusieurs intervenants vous-même.',
        ],
    },
    {
        question: 'Puis-je échanger avec l’intervenant ?',
        answer: [
            'Oui.',
            'Un espace de conversation permet au propriétaire et à l’intervenant assigné d’échanger au sujet de la mission. Les échanges restent encadrés par Vimaiz.',
        ],
    },
    {
        question: 'Puis-je gérer plusieurs logements avec Vimaiz ?',
        answer: [
            'Oui.',
            'Vimaiz permet de centraliser l’organisation et le suivi des interventions de plusieurs logements depuis un même espace.',
        ],
    },
    {
        question: 'Comment fonctionne le paiement ?',
        answer: [
            'Le montant de l’intervention est indiqué avant sa réalisation.',
            'Le paiement est géré via la plateforme afin de centraliser et simplifier la gestion de chaque intervention.',
        ],
    },
    {
        question: 'Dois-je habiter à une certaine distance de mon logement pour utiliser Vimaiz ?',
        answer: [
            'Non.',
            'Vimaiz est particulièrement adapté aux propriétaires qui ne peuvent pas facilement être présents sur place, quelle que soit la distance. L’objectif est de vous permettre de garder une vision claire de votre logement à distance.',
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
            title="VIMAIZ — Vous habitez loin. Vimaiz veille sur votre logement."
            description="Vous habitez loin. Vimaiz veille sur votre logement."
        >
            <section className="hero wrap">
                <div className="hero-grid">
                    <div>
                        {/* <span className="eyebrow rise-1">Plateforme de préparation des logements</span> */}
                        <h1 className="rise-2">
                            Vous habitez loin.
                            <span className="accent"> Vimaiz veille sur votre logement.</span>
                        </h1>
                        <p className="hero-sub rise-3">
                            Vous louez votre logement à distance ? Vimaiz coordonne les
                            interventions et vous permet de suivre ce qui s&apos;y passe,
                            même lorsque vous n&apos;êtes pas sur place.
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
                                Vous programmez
                            </span>
                            <span>
                                <CheckIcon />
                                Vimaiz assigne
                            </span>
                            <span>
                                <CheckIcon />
                                L&apos;intervention est suivie
                            </span>
                            <span>
                                <CheckIcon />
                                Vous êtes informé
                            </span>
                        </div>

                        <div className="why-vimaiz">
                            <div className="sec-eyebrow">Pourquoi Vimaiz ?</div>
                            <h3>Gérer un logement à distance ne devrait pas être une source de stress.</h3>
                            <p>
                                Quand vous ne pouvez pas être sur place, chaque intervention doit
                                être organisée, suivie et fiable. Vimaiz vous permet de garder une
                                vision claire de ce qui se passe dans votre logement, même à
                                distance.
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
                            Un intervenant disponible reçoit la mission et choisit de
                            l&apos;accepter ou de la refuser. En cas de refus, la mission est
                            automatiquement proposée à un autre intervenant disponible.
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
                                Être loin de son logement ne devrait pas signifier perdre le
                                contrôle
                            </h2>
                            <p>
                                Nous pensons qu&apos;une bonne organisation permet aux propriétaires
                                de gérer leurs logements à distance avec plus de sérénité, sans
                                avoir à être présents à chaque intervention.
                            </p>
                        </article>
                        <article id="agent" className="split-card split-card-cta rise-3">
                            <div className="sec-eyebrow">Réseau Vimaiz</div>
                            <h2>Devenir intervenant ?</h2>
                            <p>
                                Vimaiz vous aide à développer votre activité en vous proposant des
                                interventions selon vos disponibilités. Numéro de SIRET obligatoire.
                            </p>
                            <div className="hero-ctas">
                                <Link
                                    className="btn btn-primary"
                                    href={route('professionals.index')}
                                >
                                    Devenir intervenant
                                </Link>
                                <a
                                    className="btn btn-ghost"
                                    href="/guides/intervenant/"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    Voir le guide
                                </a>
                            </div>
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
                                Chez Vimaiz, nous sommes partis d&apos;un constat simple :
                            </p>
                            <p>
                                gérer un logement en location saisonnière devient beaucoup plus
                                compliqué lorsque l&apos;on ne peut pas être sur place.
                            </p>
                            <ul className="about-list">
                                <li>Un intervenant absent.</li>
                                <li>Une intervention annulée.</li>
                                <li>Un logement qui n&apos;est pas prêt.</li>
                                <li>Une anomalie découverte trop tard.</li>
                                <li>Un propriétaire qui doit gérer chaque imprévu à distance.</li>
                            </ul>
                            <p>
                                Nous avons créé Vimaiz pour simplifier cette organisation.
                            </p>
                            <p>
                                Vimaiz coordonne les interventions nécessaires à l&apos;entretien de
                                vos logements et vous permet de suivre leur déroulement depuis votre
                                espace, même lorsque vous êtes à plusieurs centaines de kilomètres.
                            </p>
                            <p>
                                Chaque intervention est organisée, assignée à un intervenant,
                                suivie et clôturée avec un compte rendu.
                            </p>
                            <p>
                                Notre objectif n&apos;est pas d&apos;ajouter un outil de plus.
                            </p>
                            <p>
                                Notre objectif est de permettre aux propriétaires qui ne peuvent
                                pas être sur place de garder une vision claire de ce qui se passe
                                dans leurs logements.
                            </p>
                            <p>
                                Parce qu&apos;une bonne organisation devrait vous permettre de gérer
                                votre bien à distance sans avoir à être physiquement présent à
                                chaque étape.
                            </p>
                            <p>
                                <strong>Vimaiz — Votre logement est loin. Vimaiz veille sur lui.</strong>
                            </p>
                        </div>
                        <div className="about-cards">
                            <div className="about-card">
                                <div className="type-icon">
                                    <Calendar width="19" height="19" strokeWidth={1.6} aria-hidden="true" />
                                </div>
                                <h3>Vous programmez</h3>
                                <p>Choisissez votre logement, la date et l&apos;intervention.</p>
                            </div>
                            <div className="about-card">
                                <div className="type-icon">
                                    <UserCheck width="19" height="19" strokeWidth={1.6} aria-hidden="true" />
                                </div>
                                <h3>Vimaiz assigne</h3>
                                <p>Un intervenant disponible reçoit la mission et choisit de l&apos;accepter ou de refuser.</p>
                            </div>
                            <div className="about-card">
                                <div className="type-icon">
                                    <ClipboardCheck width="19" height="19" strokeWidth={1.6} aria-hidden="true" />
                                </div>
                                <h3>L&apos;intervention est suivie</h3>
                                <p>
                                    Arrivée, début, durée, checklist et éventuelles anomalies sont
                                    enregistrés.
                                </p>
                            </div>
                            <div className="about-card">
                                <div className="type-icon">
                                    <BellRing width="19" height="19" strokeWidth={1.6} aria-hidden="true" />
                                </div>
                                <h3>Vous êtes informé</h3>
                                <p>
                                    Recevez le compte rendu et validez l&apos;intervention ou
                                    demandez un nouveau passage.
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
                        <p className="sec-sub">
                            Vous habitez loin de votre logement → Vimaiz vous permet de garder le
                            contrôle à distance.
                        </p>
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
