import PublicLayout from '@/components/public/public-layout';
import { type SharedData } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { useEffect, useRef, useState } from 'react';

const TYPE_OPTIONS = ['Appartement', 'Maison', 'Villa', 'Chalet'] as const;

/** Tarif ménage : 1,40 € / m² */
const PRICE_PER_M2 = 1.4;
const DEFAULT_SURFACE = 50;

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
    availableAgentsCount = 0,
}: {
    availableAgentsCount?: number;
}) {
    const { auth } = usePage<SharedData>().props;
    const isLoggedIn = Boolean(auth.user);
    const ctaHref = isLoggedIn ? route('dashboard') : route('register');

    const [typeValue, setTypeValue] = useState<(typeof TYPE_OPTIONS)[number]>('Appartement');
    const [surfaceValue, setSurfaceValue] = useState(DEFAULT_SURFACE);
    const [dateValue, setDateValue] = useState(todayIso);
    const [timeValue, setTimeValue] = useState('10:00');
    const initialTotal = Math.round(DEFAULT_SURFACE * PRICE_PER_M2);
    const [displayEstimate, setDisplayEstimate] = useState(initialTotal);
    const [flash, setFlash] = useState(false);
    const estimateRef = useRef(initialTotal);

    const surface = Math.max(0, surfaceValue);
    const total = Math.round(surface * PRICE_PER_M2);
    const agentCount = availableAgentsCount;

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
        <PublicLayout title="VIMAIZ — Le ménage de vos locations saisonnières, organisé">
            <section className="hero wrap">
                    <div className="hero-grid">
                        <div>
                            <span className="eyebrow rise-1">Service de ménage professionnel</span>
                            <h1 className="rise-2">
                                Le ménage de vos locations,
                                <br />
                                casé entre deux voyageurs
                                <span className="accent">, sans y penser.</span>
                            </h1>
                            <p className="hero-sub rise-3">
                                Vimaiz relie conciergeries et propriétaires Airbnb à des agents de
                                ménage vérifiés, et suit chaque intervention du début à la fin —
                                même à distance.
                            </p>
                            <div className="hero-ctas rise-4">
                                <a className="btn btn-primary" href="#service">
                                    Demander un ménage →
                                </a>
                                <a className="btn btn-ghost" href="#steps">
                                    Comment ça marche
                                </a>
                            </div>
                            <div className="trust-row">
                                <span>
                                    <CheckIcon />
                                    Paiement sécurisé
                                </span>
                                <span>
                                    <CheckIcon />
                                    Agents vérifiés SIRET
                                </span>
                                <span>
                                    <CheckIcon />
                                    Réponse sous 24h
                                </span>
                            </div>

                            <div className="dial">
                                <div className="dial-label">
                                    Une fenêtre de ménage, gérée de bout en bout
                                </div>
                                <div className="dial-track">
                                    <div className="dial-line" aria-hidden="true" />
                                    <div className="dial-point">
                                        <div className="dial-time">11:00</div>
                                        <div className="dial-tag">Départ voyageur</div>
                                    </div>
                                    <div className="dial-mid">Agent Vimaiz sur place</div>
                                    <div className="dial-point">
                                        <div className="dial-time">15:00</div>
                                        <div className="dial-tag">Arrivée voyageur</div>
                                    </div>
                                </div>
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
                                        Agents dispo aujourd&apos;hui
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
                                        <strong>
                                            {agentCount} agent{agentCount > 1 ? 's' : ''}
                                        </strong>{' '}
                                        disponible{agentCount > 1 ? 's' : ''} pour ce créneau
                                    </span>
                                </div>

                                <div className="estimate-box">
                                    <div className="estimate-top">
                                        <span className="estimate-label">
                                            Estimation de la mission
                                        </span>
                                        <span
                                            className={`estimate-value${flash ? ' flash' : ''}`}
                                        >
                                            {displayEstimate} €
                                        </span>
                                    </div>
                                    <div className="estimate-breakdown">
                                        <span>
                                            {typeValue} · {surface || 0} m² × 1,40 € ·{' '}
                                            {timeValue}
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
                            <h2>Comment ça marche</h2>
                            <p className="sec-sub">
                                Un processus en quatre temps, du même rythme qu&apos;une rotation de
                                logement.
                            </p>
                        </div>
                        <div className="steps">
                            <div className="step">
                                <div className="step-stamp">01</div>
                                <div>
                                    <h3>Ajoutez votre logement</h3>
                                    <p>
                                        Appartement, maison, villa ou chalet — renseignez ses
                                        spécificités une fois pour toutes.
                                    </p>
                                </div>
                            </div>
                            <div className="step">
                                <div className="step-stamp">02</div>
                                <div>
                                    <h3>Planifiez le créneau</h3>
                                    <p>
                                        Calez la date, l&apos;heure et la durée en fonction du départ
                                        et de l&apos;arrivée du voyageur.
                                    </p>
                                </div>
                            </div>
                            <div className="step">
                                <div className="step-stamp">03</div>
                                <div>
                                    <h3>Validez et payez</h3>
                                    <p>
                                        Recevez un devis, acceptez-le et réglez en ligne avant
                                        l&apos;intervention.
                                    </p>
                                </div>
                            </div>
                            <div className="step">
                                <div className="step-stamp">04</div>
                                <div>
                                    <h3>C&apos;est fait</h3>
                                    <p>
                                        Un agent qualifié intervient chez vous : son arrivée sur
                                        place est vérifiée par géolocalisation et chaque mission est
                                        horodatée.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="welcome-section">
                    <div className="wrap">
                        <div className="sec-head">
                            <div className="sec-eyebrow">Ce que Vimaiz couvre</div>
                            <h2>Quatre types de logements, un seul standard</h2>
                            <p className="sec-sub">
                                Vimaiz intervient exclusivement sur ces types de propriétés.
                            </p>
                        </div>
                        <div className="types">
                            {[
                                {
                                    title: 'Appartement',
                                    description: 'Élégance et confort au cœur du quotidien.',
                                    features: ['Grands appartements', 'Petites surfaces', 'Résidences'],
                                },
                                {
                                    title: 'Maison',
                                    description: 'Entretien complet de votre maison individuelle.',
                                    features: ['Toutes surfaces', 'Intérieur complet', 'Espaces de vie'],
                                },
                                {
                                    title: 'Villa',
                                    description: 'Service premium pour villas et grandes propriétés.',
                                    features: [
                                        'Grandes surfaces',
                                        'Multiples pièces',
                                        'Finitions soignées',
                                    ],
                                },
                                {
                                    title: 'Chalet',
                                    description: 'Spécialistes des chalets et résidences secondaires.',
                                    features: [
                                        'Zones montagnardes',
                                        'Bois et matériaux',
                                        'Accès spécifiques',
                                    ],
                                },
                            ].map((type) => (
                                <div className="type-card" key={type.title}>
                                    <div className="type-icon">
                                        <HomeIcon />
                                    </div>
                                    <h3>{type.title}</h3>
                                    <p>{type.description}</p>
                                    <ul>
                                        {type.features.map((feature) => (
                                            <li key={feature}>{feature}</li>
                                        ))}
                                    </ul>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                <section id="agent" className="welcome-section">
                    <div className="wrap">
                        <div className="agent-band">
                            <div>
                                <h2>Vous êtes professionnel du ménage ?</h2>
                                <p>
                                    Rejoignez le réseau Vimaiz et recevez des missions qualifiées.
                                    Nous trouvons les clients, vous vous concentrez sur votre métier.
                                </p>
                                <ul className="agent-list">
                                    <li>Auto-entrepreneur ou société — SIRET obligatoire</li>
                                    <li>Missions attribuées automatiquement</li>
                                    <li>Paiement garanti après chaque intervention</li>
                                </ul>
                                <Link
                                    className="btn btn-primary"
                                    href={route('professionals.index')}
                                >
                                    Devenir partenaire →
                                </Link>
                            </div>
                            <div className="agent-visual">
                                <div className="badge-num">24h</div>
                                <div className="badge-cap">Délai de réponse maximum</div>
                                <hr />
                                <div className="badge-num">5★</div>
                                <div className="badge-cap">Qualité exigée à chaque mission</div>
                            </div>
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
                                    Vimaiz met en relation les conciergeries et propriétaires Airbnb
                                    avec des professionnels du ménage qualifiés et disposant d&apos;un
                                    SIRET, tout en automatisant la gestion et le suivi des missions.
                                </p>
                                <p>
                                    Dans la location saisonnière, gérer les logements, les voyageurs
                                    et trouver des agents fiables est un défi quotidien. Le ménage
                                    reste l&apos;un des éléments les plus décisifs pour
                                    l&apos;expérience des voyageurs — et l&apos;un des plus
                                    difficiles à organiser.
                                </p>
                                <p>
                                    Vimaiz centralise le suivi des prestations, l&apos;organisation
                                    des missions et les échanges, pour faire gagner du temps aux
                                    conciergeries tout en travaillant avec des agents sélectionnés
                                    avec soin.
                                </p>
                                <div className="about-stats">
                                    <div>
                                        <div className="stat-num">100%</div>
                                        <div className="stat-cap">Sécurisé</div>
                                    </div>
                                    <div>
                                        <div className="stat-num">24h</div>
                                        <div className="stat-cap">Réponse max</div>
                                    </div>
                                    <div>
                                        <div className="stat-num">5★</div>
                                        <div className="stat-cap">Qualité</div>
                                    </div>
                                </div>
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
                                    <h3>Agents vérifiés</h3>
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
                                    <h3>Qualité garantie</h3>
                                    <p>
                                        Chaque mission est géolocalisée et horodatée : l&apos;agent
                                        démarre à proximité immédiate du logement.
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
                                        Un réseau national d&apos;agents, disponible où que vous
                                        soyez.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
        </PublicLayout>
    );
}
