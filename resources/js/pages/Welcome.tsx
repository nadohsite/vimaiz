import PublicLayout from '@/components/public/public-layout';
import { type SharedData } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { ChevronDown, ShieldCheck } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

const TYPE_OPTIONS = ['Appartement', 'Maison', 'Villa', 'Chalet', 'Gîte'] as const;

/** Tarif ménage interne — non affiché au public */
const PRICE_PER_M2 = 1.7;

/**
 * Seuil minimal de superficie accepté sur Vimaiz (Volet 6.1 du cahier des
 * charges "grands espaces" — octobre 2026) : techniquement impossible de
 * saisir une valeur inférieure sur ce simulateur.
 */
const MIN_SURFACE = 200;
const DEFAULT_SURFACE = MIN_SURFACE;

/**
 * Charge maximale par intervenant (décision du 14/10/2026 : 125 m², calculée
 * dynamiquement — pas de matrice fixe par palier). Le nombre d'intervenants
 * déployés est toujours le plus petit entier tel que superficie / n ≤ 125.
 */
const MAX_M2_PER_INTERVENANT = 125;

function intervenantsNeeded(surfaceM2: number): number {
    return Math.max(2, Math.ceil(surfaceM2 / MAX_M2_PER_INTERVENANT));
}

const PROPRIETAIRE_FAQS = [
    {
        question: 'Qu’est-ce que Vimaiz ?',
        answer: [
            'Vimaiz est une plateforme technologique conçue pour les propriétaires qui louent à distance leurs grandes résidences secondaires en location courte durée et qui ont du mal à suivre le bon déroulement des interventions de ménage.',
            'Vimaiz vous redonne des yeux là où vous n’en avez pas et vous permet de reprendre le contrôle de votre investissement immobilier, tout en préservant les précieux commentaires de vos voyageurs et vos excellentes notes sur vos différentes plateformes.',
        ],
    },
    {
        question: 'J’ai un appartement de 70 m² en location saisonnière à distance. Puis-je utiliser Vimaiz ?',
        answer: [
            'Non. Vimaiz a été développé selon un modèle d’ingénierie logistique conçu exclusivement pour répondre aux exigences des propriétés de plus de 200 m².',
            'Nos algorithmes de co-assignation sont calibrés uniquement pour les grands espaces et les domaines d’exception, afin d’offrir une traçabilité et une vitesse d’exécution adaptées aux grandes superficies.',
        ],
    },
    {
        question: 'À qui s’adresse Vimaiz ?',
        answer: [
            'Vimaiz a été pensé exclusivement pour vous si vous gérez à distance une grande résidence secondaire en location saisonnière et que cet éloignement génère une anxiété logistique.',
            'Si vous habitez à proximité mais que le temps ou le manque de visibilité vous empêchent de contrôler la qualité et la ponctualité des interventions dans vos grands espaces, Vimaiz devient vos yeux sur place pour vous délester de cette charge mentale invisible.',
        ],
    },
    {
        question: 'Comment fonctionne une intervention ?',
        answer: [
            'Vous planifiez le créneau en fonction des rotations de vos voyageurs et précisez vos demandes spécifiques.',
            'Les intervenants professionnels de notre réseau, sélectionnés avec rigueur et disponibles dans votre zone, acceptent l’intervention depuis leur espace. Dès que l’intervention commence, vous êtes alerté et pouvez suivre son déroulement jusqu’à la clôture.',
        ],
    },
    {
        question: 'Comment êtes-vous informé de l’arrivée des intervenants ?',
        answer: [
            'Notre technologie utilise la géolocalisation sécurisée du logement : l’arrivée sur place est enregistrée et validée avant que l’intervention puisse démarrer.',
            'Vous recevez une notification dans votre espace Vimaiz, ce qui vous permet de savoir en temps réel si le planning est respecté.',
        ],
    },
    {
        question: 'Comment Vimaiz me protège-t-il contre le risque de travail dissimulé ?',
        answer: [
            'Lorsque vous confiez les clés d’un grand patrimoine à distance, la sécurité juridique est essentielle. Un intervenant isolé face à un grand bien peut être tenté de faire appel à un proche non déclaré pour terminer à temps.',
            'Avec notre système de répartition en équipe, les intervenants présents dans votre logement sont des professionnels indépendants certifiés par Vimaiz, dont le statut, l’affiliation à l’URSSAF et l’assurance professionnelle sont vérifiés.',
        ],
    },
    {
        question: 'Que contient le compte rendu d’une intervention ?',
        answer: [
            'Une confirmation claire de la clôture de l’intervention. Chaque intervenant valide une liste de contrôle stricte et vous recevez une notification de fin d’intervention.',
            'Les seules photos intégrées au rapport sont celles des anomalies ou dégradations éventuellement constatées, laissées par les voyageurs précédents. En l’absence de signalement, le logement est déclaré prêt à accueillir vos prochains voyageurs.',
        ],
    },
    {
        question: 'Que se passe-t-il si je ne suis pas satisfait de l’intervention ?',
        answer: [
            'Vous disposez de 48 heures après la clôture de l’intervention pour examiner le rapport.',
            'En cas de non-conformité constatée, vous pouvez demander un nouveau passage ciblé.',
        ],
    },
    {
        question: 'Puis-je choisir moi-même les intervenants qui interviendront dans mon logement ?',
        answer: [
            'Non, et c’est ce qui vous libère l’esprit. Notre algorithme attribue automatiquement l’intervention aux professionnels certifiés les plus qualifiés et disponibles dans votre secteur.',
            'Vous n’avez plus à perdre des heures à chercher, contacter ou relancer plusieurs prestataires.',
        ],
    },
    {
        question: 'Puis-je échanger avec les intervenants ?',
        answer: [
            'Oui. Un espace de conversation privé et sécurisé, accessible depuis votre espace Vimaiz, vous permet d’échanger directement avec les intervenants assignés à votre logement.',
        ],
    },
    {
        question: 'Puis-je gérer plusieurs logements avec Vimaiz ?',
        answer: [
            'Oui. Votre espace Vimaiz est un véritable tableau de bord patrimonial : vous pouvez y centraliser et suivre les interventions de l’ensemble de vos grands logements depuis une seule interface.',
        ],
    },
    {
        question: 'Comment fonctionne le paiement ?',
        answer: [
            'En toute transparence. Le montant forfaitaire de l’intervention est calculé et indiqué avant sa réalisation — aucun frais caché.',
            'Le règlement est sécurisé directement via la plateforme.',
        ],
    },
];

const INTERVENANT_FAQS = [
    {
        question: 'Les propriétés de grande superficie demandent une charge de travail importante. Vais-je me retrouver seul(e) ?',
        answer: [
            'Non. Votre santé physique et la sérénité de votre métier sont nos priorités.',
            'Notre algorithme applique une règle stricte : aucun intervenant ne prend en charge plus de 125 m² lors d’une intervention. Vimaiz co-assigne automatiquement d’autres professionnels indépendants certifiés de votre secteur dès que la superficie du bien le nécessite.',
            'Vous travaillez en synergie, vous terminez dans les délais sans vous épuiser, et vous percevez l’intégralité de votre part du forfait, soit 75 % du montant de l’intervention.',
        ],
    },
];

const PARCOURS_STEPS = [
    {
        title: 'Enregistrez votre bien et ses exigences',
        description:
            'Centralisez les spécificités de votre grande résidence — la feuille de route permanente de nos intervenants.',
    },
    {
        title: 'Planifiez selon votre calendrier',
        description:
            'Indiquez la date et l’heure de l’intervention en fonction des rotations de vos voyageurs, depuis votre espace Vimaiz.',
    },
    {
        title: 'Précisez vos demandes et validez le devis',
        description:
            'Ajoutez une consigne spécifique si nécessaire. Vous recevez un devis forfaitaire transparent, à vérifier et valider avant de régler en ligne.',
    },
    {
        title: 'Suivez le déroulement en direct',
        description:
            'Ne devinez plus ce qui se passe chez vous. De l’arrivée au départ des intervenants, vous êtes informé en temps réel.',
    },
    {
        title: 'Retrouvez vos documents en un clic',
        description:
            'Rapports de fin d’intervention, historiques et factures : tous les documents de votre patrimoine, archivés et prêts à être consultés.',
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
};

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
    const [extraType, setExtraType] = useState('');
    const [extraQty, setExtraQty] = useState(0);
    const [extraSurface, setExtraSurface] = useState(0);
    const [dateValue, setDateValue] = useState(todayIso);
    const [timeValue, setTimeValue] = useState('10:00');
    const [openFaq, setOpenFaq] = useState<string | null>(null);

    const surface = Math.max(MIN_SURFACE, surfaceValue);
    const extraTotalSurface =
        extraQty > 0 && extraSurface > 0 ? extraQty * Math.max(0, extraSurface) : 0;
    const billableSurface = surface + extraTotalSurface;
    const total = Math.round(billableSurface * PRICE_PER_M2);
    const initialTotal = Math.round(DEFAULT_SURFACE * PRICE_PER_M2);
    const [displayEstimate, setDisplayEstimate] = useState(initialTotal);
    const [flash, setFlash] = useState(false);
    const estimateRef = useRef(initialTotal);
    const hasExtra = extraTotalSurface > 0;
    const teamSize = intervenantsNeeded(surface);

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
            title="VIMAIZ — Vous louez à distance votre grande résidence ? Ne stressez plus."
            description="Suivez chaque intervention de ménage en temps réel depuis votre espace Vimaiz et préservez la réputation de votre grand patrimoine."
        >
            {/* Volet 1 — Header / bloc héros */}
            <section
                className="hero wrap"
                id="estimateur"
                style={{ ['--hero-photo' as string]: `url(${PHOTOS.hero})` }}
            >
                <div className="hero-grid">
                    <div>
                        <h1 className="rise-2">
                            Vous louez à distance votre grande résidence secondaire en
                            location courte durée ?
                            <span className="accent"> Ne stressez plus.</span>
                        </h1>
                        <p className="hero-sub rise-3">
                            Suivez chaque intervention de ménage en temps réel depuis votre
                            espace Vimaiz et préservez la précieuse réputation de votre grand
                            patrimoine.
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

                    <div className="card-wrap">
                        <img
                            className="hero-photo"
                            src={PHOTOS.hero}
                            alt="Grande villa avec piscine entourée de palmiers"
                            width={1100}
                            height={900}
                            fetchPriority="high"
                        />
                        <div className="card-stack">
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
                                <h3>Estimation de votre grand logement</h3>
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
                                    open={extraQty > 0 || extraSurface > 0 || extraType !== ''}
                                >
                                    <summary className="req-sub">
                                        Ajouter un espace en plus (optionnel)
                                    </summary>
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
                                </details>
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
                                {/* Volet 9 — mention dynamique de sécurité, recalculée à chaque saisie */}
                                <div className="estimate-security">
                                    <ShieldCheck size={16} aria-hidden="true" />
                                    <span>
                                        Sécurité Vimaiz : pour {surface} m², notre algorithme
                                        déploie automatiquement {teamSize} intervenant
                                        {teamSize > 1 ? 's' : ''} certifié
                                        {teamSize > 1 ? 's' : ''} afin de garantir une exécution
                                        parfaite dans la journée, sans aucun surcoût logistique
                                        pour vous.
                                    </span>
                                </div>
                            </div>

                            <Link className="btn btn-primary" href={ctaHref}>
                                Réserver pour {total} €
                            </Link>
                        </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Volet 1.2 — Pourquoi Vimaiz */}
            <section id="pourquoi" className="night-band">
                <div className="wrap night-grid">
                    <div>
                        <h2>
                            Vous n&apos;avez plus besoin d&apos;être sur place pour vérifier
                            si le ménage a été bien réalisé dans les délais.
                        </h2>
                        <p className="sec-sub">
                            Vimaiz a été pensé exclusivement pour les propriétaires qui vivent
                            loin de leur logement de grande superficie proposé en location
                            courte durée. De l&apos;arrivée au départ de l&apos;intervenant,
                            vous suivez tout le déroulement de la prestation en temps réel, à
                            distance, depuis votre espace Vimaiz.
                        </p>
                        <ul className="night-points">
                            <li>Arrivée de l&apos;équipe validée par géolocalisation</li>
                            <li>Liste de contrôle validée par chaque intervenant</li>
                            <li>Photos uniquement en cas d&apos;anomalie constatée</li>
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
                        <h2>Un fonctionnement premium, sur mesure</h2>
                        <p className="sec-sub">
                            Reposant sur un devis transparent, pensé pour
                            les grandes résidences.
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
                            L&apos;éloignement ne doit jamais justifier la perte de contrôle.
                        </h2>
                    </div>
                    <div className="manifesto-body">
                        <p>
                            Nous croyons fermement que posséder une grande résidence secondaire
                            en location saisonnière à distance devrait être une source de
                            fierté, jamais d&apos;anxiété. Chez Vimaiz, la propreté d&apos;un
                            logement ne tolère aucun compromis ni aucune approximation.
                        </p>
                        <p>
                            C&apos;est pourquoi nous mettons la technologie au service de
                            l&apos;humain : Vimaiz vous redonne des yeux là où vous ne pouvez
                            pas être et vous garantit la traçabilité de chaque intervention de
                            ménage sur votre patrimoine, du début jusqu&apos;à la fin.
                        </p>
                    </div>
                    </div>

                    <div id="agent" className="pro-band">
                        <div>
                            <h3>Vous êtes intervenant de ménage ?</h3>
                            <p>
                                Vimaiz vous aide à développer votre activité en vous proposant
                                des interventions selon vos disponibilités. Numéro de SIRET
                                obligatoire.
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
                        <p className="sec-sub">
                            Les dernières objections : le modèle de répartition en équipe, la
                            sécurité juridique, et comment Vimaiz s&apos;adapte aux grands
                            espaces.
                        </p>
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

                    <div className="faq-group">
                    {INTERVENANT_FAQS.map((faq, index) => {
                        const key = `intervenant-${index}`;
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
        </PublicLayout>
    );
}
