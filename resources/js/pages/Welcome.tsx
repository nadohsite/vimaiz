import PublicLayout from '@/components/public/public-layout';
import { type SharedData } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { ChevronDown, ShieldCheck, UserCheck } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import {
    ANNEXES,
    MAX_OPTION_QUANTITY,
    MIN_SURFACE,
    OPTIONS,
    annexLabel,
    estimate,
    formatEuro,
    optionsSummary,
    type Annex,
    type AnnexKey,
    type OptionQuantities,
} from '@/lib/tarification';

const TYPE_OPTIONS = ['Appartement', 'Maison', 'Villa', 'Chalet', 'Gîte'] as const;

/**
 * Tarifs, annexes, options et taille d'équipe : voir resources/js/lib/tarification.ts
 * (même grille que app/Support/Tarification.php). Seuil minimal : 200 m²
 * (Volet 6.1 du cahier des charges « grands espaces »).
 */
const DEFAULT_SURFACE = MIN_SURFACE;

const PROPRIETAIRE_FAQS = [
    {
        question: 'Qu’est-ce que Vimaiz ?',
        answer: [
            'Vimaiz est une plateforme de suivi opérationnel destinée aux propriétaires de biens de 200 m² minimum proposés en location courte durée. Elle leur permet de suivre à distance le déroulement des interventions et de garder une visibilité sur leur propriété.',
        ],
    },
    {
        question: 'À qui s’adresse Vimaiz ?',
        answer: [
            'Vimaiz s’adresse exclusivement aux propriétaires de propriétés d’au moins 200 m², proposées en location courte durée, qui vivent à distance de leur bien et souhaitent en suivre les interventions sans être sur place.',
        ],
    },
    {
        question: 'Comment une intervention est-elle organisée ?',
        answer: [
            'Vous indiquez vos dates, vos besoins et les exigences de votre propriété. Vimaiz organise ensuite l’intervention en co-assignant plusieurs intervenants professionnels indépendants selon la superficie et la charge de travail. L’intervention ne repose donc pas sur une personne seule.',
        ],
    },
    {
        question: 'Comment suis-je informé du déroulement de l’intervention ?',
        answer: [
            'L’arrivée de chaque intervenant est validée par géolocalisation. Vous pouvez consulter les horaires et suivre le déroulement de l’intervention depuis votre espace Vimaiz.',
        ],
    },
    {
        question: 'Que contient le compte rendu d’une intervention ?',
        answer: [
            'Vous retrouvez la validation de la liste de contrôle et la confirmation de fin d’intervention. Des photos sont ajoutées uniquement lorsqu’une anomalie ou une dégradation est constatée.',
        ],
    },
    {
        question: 'Que se passe-t-il si je constate un problème après une intervention ?',
        answer: [
            'Vous disposez de 48 heures après la clôture pour consulter le compte rendu et signaler une éventuelle non-conformité. Selon la situation, un nouveau passage ciblé peut être demandé.',
        ],
    },
    {
        question: 'Puis-je échanger avec les intervenants ?',
        answer: [
            'Oui. Un espace de conversation privé est accessible depuis votre compte Vimaiz. Les échanges avec les intervenants professionnels indépendants affectés à votre propriété sont encadrés par la plateforme.',
        ],
    },
    {
        question: 'Puis-je suivre plusieurs propriétés depuis mon compte ?',
        answer: [
            'Oui. Vous pouvez centraliser vos différentes propriétés et consulter leur suivi depuis une seule interface Vimaiz, à condition qu’elles répondent à nos critères d’éligibilité.',
        ],
    },
    {
        question: 'Comment les professionnels intervenant dans ma propriété sont-ils sélectionnés ?',
        answer: [
            'Les intervenants professionnels intervenant via Vimaiz sont des prestataires indépendants. Les éléments relatifs à leur statut professionnel et à leur assurance sont vérifiés selon les procédures de la plateforme.',
        ],
    },
];

const PARCOURS_STEPS = [
    {
        title: 'Enregistrez votre propriété',
        description:
            'Renseignez sa superficie, ses équipements et ses spécificités pour préparer les interventions.',
    },
    {
        title: 'Planifiez vos interventions',
        description:
            'Indiquez les dates et horaires souhaités selon le calendrier de vos voyageurs.',
    },
    {
        title: 'Précisez vos besoins et validez le devis',
        description:
            'Ajoutez vos consignes particulières et découvrez le tarif forfaitaire avant validation.',
    },
    {
        title: 'Suivez chaque intervention',
        description:
            'Consultez son déroulement, de l’arrivée au départ des intervenants.',
    },
    {
        title: 'Retrouvez vos documents en un clic',
        description:
            'Rapports de fin d’intervention, historiques et factures : tous les documents de votre propriété, archivés et prêts à être consultés.',
    },
];

/** Exemple de suivi affiché sur l'accueil (maquette illustrative). */
const SUIVI_EXEMPLE: {
    time: string;
    title: string;
    detail: string;
    state?: 'done' | 'flag';
}[] = [
    {
        time: '09:02',
        title: 'Arrivée de l’équipe confirmée',
        detail: 'Géolocalisation validée à l’entrée du logement',
    },
    {
        time: '09:05',
        title: 'Intervention démarrée',
        detail: '3 intervenants co-assignés pour 340 m²',
    },
    {
        time: '11:48',
        title: 'Liste de contrôle : 41 points validés sur 48',
        detail: 'Chambres, salles d’eau et cuisine terminées',
    },
    {
        time: '12:20',
        title: 'Anomalie signalée',
        detail: 'Transat endommagé en terrasse, photo jointe au rapport',
        state: 'flag',
    },
    {
        time: '13:10',
        title: 'Logement prêt pour vos voyageurs',
        detail: 'Rapport disponible, 48 h pour le valider',
        state: 'done',
    },
];

function LiveReport() {
    const ref = useRef<HTMLDivElement>(null);
    const [play, setPlay] = useState<'idle' | 'ready' | 'on'>('idle');

    useEffect(() => {
        const node = ref.current;
        if (!node || typeof IntersectionObserver === 'undefined') {
            return;
        }
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            return;
        }
        setPlay('ready');
        const observer = new IntersectionObserver(
            (entries) => {
                if (entries.some((entry) => entry.isIntersecting)) {
                    setPlay('on');
                    observer.disconnect();
                }
            },
            { threshold: 0.35 },
        );
        observer.observe(node);
        return () => observer.disconnect();
    }, []);

    return (
        <div
            className="live-report"
            ref={ref}
            data-play={play}
            aria-label="Exemple de suivi d’une intervention en temps réel"
        >
            <div className="live-report-head">
                <div>
                    <div className="live-report-place">Villa de 340 m², Pays basque</div>
                    <div className="live-report-meta">Intervention du samedi, entre deux séjours</div>
                </div>
                <span className="live-report-tag">Exemple de suivi</span>
            </div>
            <ol className="timeline">
                {SUIVI_EXEMPLE.map((item) => (
                    <li
                        key={item.time}
                        className={`timeline-item${item.state ? ` is-${item.state}` : ''}`}
                    >
                        <span className="timeline-time">{item.time}</span>
                        <span className="timeline-mark" aria-hidden="true">
                            <span className="timeline-dot" />
                        </span>
                        <span>
                            <span className="timeline-title">{item.title}</span>
                            <span className="timeline-detail" style={{ display: 'block' }}>
                                {item.detail}
                            </span>
                        </span>
                    </li>
                ))}
            </ol>
            <div className="live-report-foot">
                Vous recevez chaque étape en notification, depuis votre espace Vimaiz.
            </div>
        </div>
    );
}

/**
 * Photos libres de droits (licence Unsplash, usage commercial autorisé).
 * Servies depuis le CDN Unsplash ; à rapatrier dans /public/images avant
 * la mise en production si l'on veut s'affranchir du CDN.
 */
const unsplash = (id: string, w: number, h: number) =>
    `https://images.unsplash.com/photo-${id}?w=${w}&h=${h}&fit=crop&auto=format&q=72`;

const PHOTOS = {
    hero: unsplash('1596178067639-5c6e68aea6dc', 1100, 900), // The Anam
    interieur: unsplash('1780391592801-5e8867523492', 1100, 820), // Valentin Ducrettet
    manifeste: unsplash('1543489822-c49534f3271f', 1800, 900), // big.tiny.belly
    heroSalon: unsplash('1721222203415-69033eaf3bd1', 600, 760), // Sanju Pandita
    heroJardin: unsplash('1582610116397-edb318620f90', 520, 400), // Dinuka Lankaloka
};

/**
 * Vidéo du héros : renseigner le chemin (ex. '/videos/vimaiz.mp4', fichier
 * placé dans public/videos) pour remplacer la photo principale par la vidéo.
 * La photo reste affichée en image d'attente (poster).
 */
const HERO_VIDEO: string | null = null;

/**
 * Avis Google RÉELS de la fiche Vimaiz, recopiés depuis Google Business dans
 * Admin > Gestion des Avis > Avis Google, et transmis par la route « / ».
 * Seuls les avis 4 et 5 étoiles sont affichés ; la section reste masquée en
 * production tant qu'aucun avis n'a été récupéré.
 */
type GoogleReview = {
    author: string;
    rating: number;
    text: string;
    date: string; // ex. « septembre 2026 »
};

type GoogleSummary = { rating: number; count: number; url: string | null };

/**
 * AVIS DE TEST — fictifs, uniquement pour visualiser le bandeau.
 * Ils ne s'affichent qu'en local (localhost / 127.0.0.1 / *.test), avec la
 * mention « Avis de test », et jamais lorsque de vrais avis Google existent.
 */
const TEST_REVIEWS: GoogleReview[] = [
    {
        author: 'Client test A',
        rating: 5,
        text: 'Texte de test. Suivi très clair : j’ai reçu l’arrivée de l’équipe puis la fin de l’intervention sans avoir à appeler qui que ce soit.',
        date: 'test',
    },
    {
        author: 'Client test B',
        rating: 5,
        text: 'Texte de test. Trois intervenants pour notre maison de 380 m², tout était prêt avant l’arrivée des voyageurs.',
        date: 'test',
    },
    {
        author: 'Client test C',
        rating: 4,
        text: 'Texte de test. Le rapport signalait une anomalie en terrasse avec photo, très pratique quand on est à 800 km.',
        date: 'test',
    },
    {
        author: 'Client test D',
        rating: 5,
        text: 'Texte de test. Devis clair avant l’intervention, paiement en ligne, et un tableau de bord pour mes deux propriétés.',
        date: 'test',
    },
    {
        author: 'Client test E',
        rating: 3,
        text: 'Texte de test à 3 étoiles : il ne doit PAS apparaître (filtre 4 et 5 étoiles).',
        date: 'test',
    },
];

function isLocalHost() {
    if (typeof window === 'undefined') {
        return false;
    }
    const host = window.location.hostname;
    return host === 'localhost' || host === '127.0.0.1' || host.endsWith('.test');
}

const TRUST_ITEMS = [
    'Vous programmez',
    'Vimaiz co-assigne une équipe',
    'L’intervention est suivie',
    'Vous êtes informé',
];

function Stars({ rating }: { rating: number }) {
    return (
        <span className="review-stars" aria-label={`${rating} étoiles sur 5`}>
            {[1, 2, 3, 4, 5].map((n) => (
                <svg
                    key={n}
                    width="15"
                    height="15"
                    viewBox="0 0 20 20"
                    aria-hidden="true"
                    className={n <= rating ? 'on' : undefined}
                >
                    <path d="M10 1.6l2.6 5.3 5.8.8-4.2 4.1 1 5.8L10 14.9l-5.2 2.7 1-5.8L1.6 7.7l5.8-.8z" />
                </svg>
            ))}
        </span>
    );
}

function GoogleReviews({
    googleReviews,
    summary,
}: {
    googleReviews: GoogleReview[];
    summary: GoogleSummary | null;
}) {
    const [local, setLocal] = useState(false);
    useEffect(() => setLocal(isLocalHost()), []);

    const isTest = googleReviews.length === 0;
    if (isTest && !local) {
        return null;
    }
    const GOOGLE_SUMMARY = isTest ? null : summary;
    const reviews = (isTest ? TEST_REVIEWS : googleReviews).filter(
        (review) => review.rating >= 4,
    );
    if (reviews.length === 0) {
        return null;
    }
    const loop = [...reviews, ...reviews];

    return (
        <div className="reviews">
            <div className="reviews-head">
                <h3>
                    Ils nous font confiance
                    {isTest && <span className="reviews-test-badge">Avis de test, visibles en local uniquement</span>}
                </h3>
                {GOOGLE_SUMMARY && GOOGLE_SUMMARY.url && (
                    <a
                        className="reviews-summary"
                        href={GOOGLE_SUMMARY.url}
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        <Stars rating={Math.round(GOOGLE_SUMMARY.rating)} />
                        <span>
                            {GOOGLE_SUMMARY.rating.toFixed(1).replace('.', ',')} sur Google (
                            {GOOGLE_SUMMARY.count} avis)
                        </span>
                    </a>
                )}
            </div>
            <div className="reviews-marquee">
                <ul
                    className="reviews-track"
                    style={{ animationDuration: `${Math.max(30, reviews.length * 9)}s` }}
                >
                    {loop.map((review, index) => (
                        <li
                            className="review-card"
                            key={`${review.author}-${index}`}
                            aria-hidden={index >= reviews.length ? true : undefined}
                        >
                            <Stars rating={review.rating} />
                            <p className="review-text">« {review.text} »</p>
                            <div className="review-meta">
                                <span className="review-author">{review.author}</span>
                                <span className="review-source">
                                    {isTest ? 'Avis de test' : `Avis Google, ${review.date}`}
                                </span>
                            </div>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
}

/** Lien Google « laisser un avis », défini dans .env (VITE_GOOGLE_REVIEW_URL). */
const GOOGLE_REVIEW_URL: string = (import.meta.env.VITE_GOOGLE_REVIEW_URL ?? '').trim();

function ReviewInvite() {
    if (!GOOGLE_REVIEW_URL) {
        return null;
    }

    return (
        <div className="review-invite">
            <div className="review-invite-copy">
                <Stars rating={5} />
                <div>
                    <p className="review-invite-title">Vous avez fait appel à Vimaiz ?</p>
                    <p className="review-invite-text">
                        Votre avis aide d’autres propriétaires à nous faire confiance. Une
                        minute suffit, directement sur Google.
                    </p>
                </div>
            </div>
            <a
                className="btn btn-primary"
                href={GOOGLE_REVIEW_URL}
                target="_blank"
                rel="noopener noreferrer"
            >
                Laisser un avis
            </a>
        </div>
    );
}

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
    googleReviews = [],
    googleSummary = null,
}: {
    availableAgentsCount?: number;
    googleReviews?: GoogleReview[];
    googleSummary?: GoogleSummary | null;
}) {
    const { auth } = usePage<SharedData>().props;
    const isLoggedIn = Boolean(auth.user);
    const ctaHref = isLoggedIn ? route('dashboard') : route('register');

    const [typeValue, setTypeValue] = useState<(typeof TYPE_OPTIONS)[number]>('Villa');
    const [surfaceValue, setSurfaceValue] = useState(DEFAULT_SURFACE);
    const [annexes, setAnnexes] = useState<Annex[]>([]);
    const [options, setOptions] = useState<OptionQuantities>({});
    const [dateValue, setDateValue] = useState(todayIso);
    const [timeValue, setTimeValue] = useState('10:00');
    const [openFaq, setOpenFaq] = useState<string | null>(null);

    const surface = Math.max(MIN_SURFACE, surfaceValue);
    // Brief « Estimateur » : surface totale cumulée (principale + annexes),
    // tarif au m² selon le palier, puis options ajoutées au forfait.
    const pricing = estimate(surface, annexes, options);
    const total = pricing.total;
    const initialTotal = estimate(DEFAULT_SURFACE, [], {}).total;
    const [displayEstimate, setDisplayEstimate] = useState(initialTotal);
    const [flash, setFlash] = useState(false);
    const estimateRef = useRef(initialTotal);
    const teamSize = pricing.teamSize;
    const usedAnnexTypes = annexes.map((annex) => annex.type);
    const nextAnnexType = ANNEXES.find((annex) => !usedAnnexTypes.includes(annex.key))?.key;
    const selectedOptionsCount = Object.values(options).reduce((sum, qty) => sum + (qty ?? 0), 0);
    const summaryParts = [
        typeValue,
        [
            `${surface || 0} m²`,
            ...pricing.annexes.map((annex) => `${annex.surface} m² (${annexLabel(annex.type)})`),
        ].join(' + '),
        timeValue,
        ...optionsSummary(options),
    ];

    const updateAnnex = (index: number, patch: Partial<Annex>) =>
        setAnnexes((current) =>
            current.map((annex, i) => (i === index ? { ...annex, ...patch } : annex)),
        );

    const setOptionQuantity = (key: keyof OptionQuantities, quantity: number) =>
        setOptions((current) => ({
            ...current,
            [key]: Math.min(MAX_OPTION_QUANTITY, Math.max(0, quantity)),
        }));

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
            const value = Math.round((start + (target - start) * eased) * 100) / 100;
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
            title="VIMAIZ — Votre propriété fait 200 m² ou plus et vous la louez à distance ?"
            description="Gardez le contrôle, même lorsque vous êtes loin. Avec Vimaiz, suivez chaque intervention depuis votre espace personnel."
        >
            {/* Volet 1 — Header / bloc héros */}
            <section
                className="hero wrap"
                style={{ ['--hero-photo' as string]: `url(${PHOTOS.hero})` }}
            >
                <div className="hero-grid">
                    <div>
                        <h1 className="rise-2 hero-title">
                            {/* Deux lignes fixes sur ordinateur et tablette */}
                            <span className="hero-line">
                                Votre propriété fait <span className="hero-hl">200&nbsp;m² ou plus</span>
                            </span>{' '}
                            <span className="hero-line">et vous la louez à distance&nbsp;?</span>
                        </h1>
                        <p className="hero-sub rise-3">
                            Gardez le contrôle, même lorsque vous êtes loin. Avec Vimaiz, suivez
                            chaque intervention depuis votre espace personnel.
                        </p>
                        <div className="hero-ctas rise-4">
                            <a className="btn btn-primary" href="#estimateur">
                                Programmer une intervention
                            </a>
                            <a className="btn btn-ghost" href="#steps">
                                Comment ça fonctionne
                            </a>
                        </div>
                        <div className="trust-row trust-marquee">
                            <div className="trust-track">
                                {[...TRUST_ITEMS, ...TRUST_ITEMS].map((item, index) => (
                                    <span
                                        key={`${item}-${index}`}
                                        className={index >= TRUST_ITEMS.length ? 'trust-dup' : undefined}
                                        aria-hidden={index >= TRUST_ITEMS.length ? true : undefined}
                                    >
                                        <CheckIcon />
                                        {item}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="hero-media rise-3" aria-label="Grandes résidences suivies par Vimaiz">
                        <div className="hero-media-main">
                            {HERO_VIDEO ? (
                                <video
                                    src={HERO_VIDEO}
                                    poster={PHOTOS.hero}
                                    autoPlay
                                    muted
                                    loop
                                    playsInline
                                    aria-label="Présentation de Vimaiz en vidéo"
                                />
                            ) : (
                                <img
                                    src={PHOTOS.hero}
                                    alt="Grande villa avec piscine entourée de palmiers"
                                    width={1100}
                                    height={900}
                                    fetchPriority="high"
                                />
                            )}
                        </div>
                        <img
                            className="hero-media-side"
                            src={PHOTOS.heroSalon}
                            alt="Salon spacieux et lumineux d'une grande résidence"
                            width={600}
                            height={760}
                            loading="lazy"
                            decoding="async"
                        />
                        <img
                            className="hero-media-top"
                            src={PHOTOS.heroJardin}
                            alt="Maison avec piscine et jardin"
                            width={520}
                            height={400}
                            loading="lazy"
                            decoding="async"
                        />
                        <div className="hero-chip hero-chip-arrival">
                            <span className="live-dot" aria-hidden="true" />
                            <span>
                                <strong>Arrivée confirmée</strong>
                                <small>Géolocalisation validée</small>
                            </span>
                        </div>
                        <div className="hero-chip hero-chip-team">
                            <span className="hero-chip-icon" aria-hidden="true">
                                <ShieldCheck size={18} />
                            </span>
                            <span>
                                <strong>Intervenants indépendants</strong>
                                <small>125 m² max par intervenant</small>
                            </span>
                        </div>
                    </div>
                </div>
            </section>

            {/* Volet 1.2 — Pourquoi Vimaiz */}
            <section id="pourquoi" className="night-band">
                <div className="wrap night-grid">
                    <div>
                        <h2>Plus besoin d&apos;être sur place pour suivre les interventions.</h2>
                        <p className="sec-sub">
                            Vimaiz accompagne exclusivement les propriétaires de biens de
                            200&nbsp;m² minimum proposés en location courte durée.
                        </p>
                        <p className="sec-sub">
                            De l&apos;arrivée au départ des intervenants, vous gardez une
                            visibilité sur chaque prestation.
                        </p>
                        <ul className="night-points">
                            <li>Arrivée de chaque intervenant validée par géolocalisation.</li>
                            <li>Liste de contrôle renseignée par les intervenants.</li>
                            <li>Photos transmises uniquement en cas d&apos;anomalie constatée.</li>
                        </ul>
                    </div>
                    <div className="report-stage">
                        <img
                            className="report-photo"
                            src={PHOTOS.interieur}
                            alt="Grand salon lumineux d'un chalet, avec poutres apparentes et baies vitrées"
                            width={1100}
                            height={820}
                            loading="lazy"
                            decoding="async"
                        />
                        <LiveReport />
                    </div>
                </div>
            </section>

            {/* Volet 3 — Le Parcours */}
            <section id="steps" className="welcome-section">
                <div className="wrap">
                    <div className="sec-head sec-head-center">
                        <h2>Un accompagnement premium, adapté à votre propriété.</h2>
                        <p className="sec-sub">
                            Chaque propriété a ses propres exigences. Vimaiz organise son suivi
                            autour de vos besoins, avec un devis forfaitaire transparent.
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
                    <GoogleReviews googleReviews={googleReviews} summary={googleSummary} />
                    <ReviewInvite />
                </div>
            </section>

            {/* Volet 4 — Notre Conviction (manifeste de marque) */}
            <section
                className="welcome-section manifesto"
                style={{ ['--manifesto-photo' as string]: `url(${PHOTOS.manifeste})` }}
            >
                <div className="wrap">
                    <div className="manifesto-grid">
                    <div className="manifesto-head">
                        <p className="sec-eyebrow manifesto-eyebrow">Notre conviction</p>
                        <h2 className="manifesto-quote">
                            L&apos;éloignement ne doit jamais signifier la perte de contrôle.
                        </h2>
                    </div>
                    <div className="manifesto-body">
                        <p>
                            Votre propriété mérite la même attention, que vous soyez sur place
                            ou à des centaines de kilomètres.
                        </p>
                        <p>
                            Chez Vimaiz, la technologie est au service d&apos;un suivi rigoureux
                            et structuré de chaque intervention.
                        </p>
                        <p className="manifesto-signature">
                            Vimaiz — Vos yeux là où vous ne pouvez pas être.
                        </p>
                    </div>
                    </div>

                    <div id="agent" className="pro-band">
                        <div>
                            <h3>
                                Vous êtes un intervenant professionnel indépendant du secteur de
                                l&apos;entretien&nbsp;?
                            </h3>
                            <p>
                                Rejoignez Vimaiz et accédez à des opportunités d&apos;intervention
                                au sein de propriétés de grande superficie.
                            </p>
                            <p>
                                Organisez vos disponibilités et recevez des propositions
                                d&apos;intervention adaptées à votre activité.
                            </p>
                            <p className="pro-band-note">
                                Professionnels indépendants déclarés — Numéro SIRET obligatoire.
                            </p>
                        </div>
                        <div className="pro-band-actions">
                            <Link className="btn btn-primary" href={route('professionals.index')}>
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
                    </div>
                </div>
            </section>

            {/* Volet 7 — FAQ */}
            <section id="faq" className="welcome-section">
                <div className="wrap faq-layout">
                    <div className="sec-head">
                        <h2>Questions fréquentes</h2>
                    </div>

                    <div>
                    <div className="faq-group">
                    {PROPRIETAIRE_FAQS.map((faq, index) => {
                        const key = `proprietaire-${index}`;
                        return (
                            <div
                                className="faq-item"
                                key={key}
                                data-open={openFaq === key}
                            >
                                <button
                                    type="button"
                                    className="faq-q"
                                    onClick={() => setOpenFaq(openFaq === key ? null : key)}
                                    aria-expanded={openFaq === key}
                                >
                                    {faq.question}
                                    <ChevronDown size={18} />
                                </button>
                                {openFaq === key && (
                                    <div className="faq-a">
                                        {faq.answer.map((paragraph) => (
                                            <p key={paragraph}>{paragraph}</p>
                                        ))}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                    </div>

                    </div>
                </div>
            </section>

            {/* Volet 9 — Estimateur (CTA final, juste après la FAQ) */}
            <section id="estimateur" className="welcome-section estimator-section">
                <div className="wrap">
                    <div className="sec-head sec-head-center">
                        <h2>Découvrez le tarif de l&apos;accompagnement Vimaiz pour votre propriété.</h2>
                        <p className="sec-sub">
                            Votre bien fait 200&nbsp;m² ou plus&nbsp;? Découvrez une première
                            estimation adaptée à sa superficie et à ses caractéristiques.
                        </p>
                        <p className="sec-sub">
                            Chaque accompagnement fait ensuite l&apos;objet d&apos;un devis
                            personnalisé.
                        </p>
                    </div>

                    <div className="estimator" id="service">
                        <div className="estimator-form">
                            <div className="card-head">
                                <h3>Votre logement</h3>
                                <span className="live-pill">
                                    <span className="live-dot" aria-hidden="true" />
                                    Intervenants professionnels disponibles
                                </span>
                            </div>
                            <div className="estimator-grid">
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
                                    <div className="req-sub">Surface (m² — 200 m² minimum)</div>
                                    <input
                                        className="req-field"
                                        type="number"
                                        min={MIN_SURFACE}
                                        step={1}
                                        inputMode="numeric"
                                        aria-label="Surface en m², 200 m² minimum"
                                        placeholder={`ex. ${MIN_SURFACE}`}
                                        value={surfaceValue || ''}
                                        onChange={(e) =>
                                            setSurfaceValue(
                                                e.target.value === ''
                                                    ? 0
                                                    : Math.max(0, Number(e.target.value)),
                                            )
                                        }
                                        onBlur={() =>
                                            setSurfaceValue((current) =>
                                                Math.max(MIN_SURFACE, current),
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
                                <details
                                    className="req-body req-extra"
                                    onToggle={(e) => {
                                        // Première ouverture : une ligne prête à remplir
                                        if (e.currentTarget.open && annexes.length === 0 && nextAnnexType) {
                                            setAnnexes([{ type: nextAnnexType, surface: 0 }]);
                                        }
                                    }}
                                >
                                    <summary className="req-sub">
                                        Ajouter un espace en plus (optionnel)
                                    </summary>
                                    <p className="extra-hint">
                                        Espaces annexes hors habitation principale. La surface
                                        s&apos;ajoute à celle du logement.
                                    </p>
                                    {annexes.map((annex, index) => (
                                        <div className="annex-row" key={index}>
                                            <select
                                                className="req-field annex-type"
                                                aria-label="Type d'espace en plus"
                                                value={annex.type}
                                                onChange={(e) =>
                                                    updateAnnex(index, {
                                                        type: e.target.value as AnnexKey,
                                                    })
                                                }
                                            >
                                                {ANNEXES.filter(
                                                    (option) =>
                                                        option.key === annex.type ||
                                                        !usedAnnexTypes.includes(option.key),
                                                ).map((option) => (
                                                    <option key={option.key} value={option.key}>
                                                        {option.label}
                                                    </option>
                                                ))}
                                            </select>
                                            <label className="annex-surface">
                                                <input
                                                    className="req-field"
                                                    type="number"
                                                    min={0}
                                                    step={1}
                                                    inputMode="numeric"
                                                    aria-label={`Surface de l'espace en plus (${annexLabel(annex.type)}) en m²`}
                                                    placeholder="0"
                                                    value={annex.surface || ''}
                                                    onChange={(e) =>
                                                        updateAnnex(index, {
                                                            surface: Math.max(
                                                                0,
                                                                Math.round(Number(e.target.value) || 0),
                                                            ),
                                                        })
                                                    }
                                                />
                                                <span>m²</span>
                                            </label>
                                            <button
                                                type="button"
                                                className="annex-remove"
                                                aria-label={`Retirer : ${annexLabel(annex.type)}`}
                                                onClick={() =>
                                                    setAnnexes((current) =>
                                                        current.filter((_, i) => i !== index),
                                                    )
                                                }
                                            >
                                                ×
                                            </button>
                                        </div>
                                    ))}
                                    {nextAnnexType && annexes.length > 0 && (
                                        <button
                                            type="button"
                                            className="annex-add"
                                            onClick={() =>
                                                setAnnexes((current) => [
                                                    ...current,
                                                    { type: nextAnnexType, surface: 0 },
                                                ])
                                            }
                                        >
                                            + Ajouter un autre espace
                                        </button>
                                    )}
                                </details>
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
                                            d="M4 7h10M18 7h2M4 17h4M12 17h8"
                                            stroke="currentColor"
                                            strokeWidth="1.7"
                                            strokeLinecap="round"
                                        />
                                        <circle cx="16" cy="7" r="2" stroke="currentColor" strokeWidth="1.7" />
                                        <circle cx="10" cy="17" r="2" stroke="currentColor" strokeWidth="1.7" />
                                    </svg>
                                </div>
                                <details className="req-body req-extra">
                                    <summary className="req-sub">
                                        Options &amp; équipements spécifiques (optionnel)
                                        {selectedOptionsCount > 0 ? ` · ${selectedOptionsCount}` : ''}
                                    </summary>
                                    <ul className="option-list">
                                        {OPTIONS.map((option) => {
                                            const quantity = options[option.key] ?? 0;
                                            return (
                                                <li className="option-row" key={option.key}>
                                                    <div className="option-text">
                                                        <span className="option-label">{option.label}</span>
                                                        {option.detail && (
                                                            <span className="option-detail">{option.detail}</span>
                                                        )}
                                                        <span className="option-price">
                                                            + {option.price} € / {option.unit}
                                                        </span>
                                                    </div>
                                                    <div className="stepper">
                                                        <button
                                                            type="button"
                                                            aria-label={`Retirer : ${option.label}`}
                                                            disabled={quantity === 0}
                                                            onClick={() =>
                                                                setOptionQuantity(option.key, quantity - 1)
                                                            }
                                                        >
                                                            −
                                                        </button>
                                                        <span aria-live="polite">{quantity}</span>
                                                        <button
                                                            type="button"
                                                            aria-label={`Ajouter : ${option.label}`}
                                                            onClick={() =>
                                                                setOptionQuantity(option.key, quantity + 1)
                                                            }
                                                        >
                                                            +
                                                        </button>
                                                    </div>
                                                </li>
                                            );
                                        })}
                                    </ul>
                                </details>
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
                        </div>

                        <aside className="estimator-summary" aria-live="polite">
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
                            <span className="estimator-kicker">Estimation forfaitaire</span>
                            <div className={`estimator-price${flash ? ' flash' : ''}`}>
                                {formatEuro(displayEstimate)}
                            </div>
                            <div className="estimator-detail">{summaryParts.join(' • ')}</div>

                            <div className="estimator-team">
                                <div className="estimator-team-icons" aria-hidden="true">
                                    {Array.from({ length: Math.min(teamSize, 8) }).map((_, index) => (
                                        <span key={index} className="team-dot">
                                            <UserCheck size={15} />
                                        </span>
                                    ))}
                                </div>
                                <span>
                                    <strong>
                                        {teamSize} intervenant{teamSize > 1 ? 's' : ''} professionnel
                                        {teamSize > 1 ? 's' : ''} indépendant{teamSize > 1 ? 's' : ''}
                                    </strong>{' '}
                                    mobilisé{teamSize > 1 ? 's' : ''} pour {pricing.totalSurface} m²
                                </span>
                            </div>

                            {/* Volet 9 — mention dynamique de sécurité, recalculée à chaque saisie */}
                            <div className="estimate-security">
                                <ShieldCheck size={16} aria-hidden="true" />
                                <span>
                                    Le nombre d&apos;intervenants professionnels indépendants mobilisés
                                    est adapté à la superficie et aux caractéristiques de votre
                                    propriété. Chaque intervention est organisée et coordonnée en
                                    amont.
                                </span>
                            </div>

                            <Link className="btn btn-primary estimator-cta" href={ctaHref}>
                                Réserver pour {formatEuro(total)}
                            </Link>
                        </aside>
                    </div>
                </div>
            </section>
        </PublicLayout>
    );
}
