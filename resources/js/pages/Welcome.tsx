import PublicLayout from '@/components/public/public-layout';
import { type SharedData } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { BellRing, Calendar, ChevronDown, ClipboardCheck, ShieldCheck, UserCheck } from 'lucide-react';
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
            <section className="hero wrap">
                <div className="hero-grid hero-grid-solo">
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
                        <div className="trust-row trust-row-centered">
                            <span>
                                <CheckIcon />
                                Vous programmez
                            </span>
                            <span>
                                <CheckIcon />
                                Vimaiz co-assigne une équipe
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
                    </div>
                </div>
            </section>

            {/* Volet 1.2 — Pourquoi Vimaiz */}
            <section id="pourquoi" className="welcome-section">
                <div className="wrap">
                    <div className="sec-head">
                        <div className="sec-eyebrow">Pourquoi Vimaiz</div>
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
                    </div>
                </div>
            </section>

            {/* Volet 3 — Le Parcours */}
            <section id="steps" className="welcome-section">
                <div className="wrap">
                    <div className="sec-head">
                        <div className="sec-eyebrow">Le parcours</div>
                        <h2>Un fonctionnement premium, sur mesure</h2>
                        <p className="sec-sub">
                            Un fonctionnement reposant sur un devis transparent, pensé pour
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
                </div>
            </section>

            {/* Volet 4 — Notre Conviction (manifeste de marque) */}
            <section className="welcome-section">
                <div className="wrap">
                    <div className="split-cards">
                        <article className="split-card split-card-conviction rise-2">
                            <div className="sec-eyebrow">Notre Conviction</div>
                            <h2>L&apos;éloignement ne doit jamais justifier la perte de contrôle</h2>
                            <p>
                                Nous croyons fermement que posséder une grande résidence
                                secondaire en location saisonnière à distance devrait être une
                                source de fierté, jamais d&apos;anxiété. Chez Vimaiz, la
                                propreté d&apos;un logement ne tolère aucun compromis ni aucune
                                approximation.
                            </p>
                            <p>
                                C&apos;est pourquoi nous mettons la technologie au service de
                                l&apos;humain : Vimaiz vous redonne des yeux là où vous ne
                                pouvez pas être et vous garantit la traçabilité de chaque
                                intervention de ménage sur votre patrimoine, du début jusqu&apos;à
                                la fin.
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

            {/* Volet 5 — À propos (storytelling) */}
            <section id="about" className="welcome-section">
                <div className="wrap">
                    <div className="about-grid">
                        <div>
                            <div className="sec-eyebrow">L&apos;origine de Vimaiz</div>
                            <h2 style={{ marginBottom: 16 }}>À propos de Vimaiz</h2>
                            <p>
                                Vimaiz est née tout simplement d&apos;un constat de ma part.
                                Après quelques voyages en Espagne, j&apos;ai constaté que nos
                                deux pays incarnaient les véritables poumons du tourisme en
                                Europe. De nombreux Espagnols possèdent des résidences
                                secondaires en France, et c&apos;est exactement le même schéma
                                pour les Français en Espagne.
                            </p>
                            <p>
                                Louer et entretenir une grande résidence à distance sur ce
                                marché représente un défi quotidien pour les propriétaires
                                éloignés. C&apos;est pour répondre à cette problématique et
                                leur permettre de suivre sereinement leurs interventions de
                                ménage que j&apos;ai créé cette plateforme.
                            </p>
                            <p>
                                Pour l&apos;instant, Vimaiz est déployée uniquement sur le
                                marché français. Cependant, pour anticiper et renforcer cette
                                relation touristique unique entre nos deux pays, j&apos;ai
                                décidé d&apos;appeler la plateforme Vimaiz : la fusion naturelle
                                entre <em>Vivienda</em> (qui signifie « logement » en espagnol)
                                et « maison » en français — le « S » remplacé par un « Z » pour
                                une identité plus moderne et technologique. Ce nom en .com
                                porte notre ambition : nous développer à l&apos;avenir en
                                Espagne, puis dans d&apos;autres pays européens.
                            </p>
                            <p>
                                Vimaiz n&apos;a pas été conçu pour être un outil de gestion
                                supplémentaire. Notre mission actuelle en France est d&apos;être
                                vos yeux là où vous n&apos;en avez pas.
                            </p>
                            <p>
                                De l&apos;arrivée au départ de l&apos;intervenant de ménage,
                                vous suivez tout le déroulement de la prestation en temps réel,
                                à distance, depuis votre espace Vimaiz, afin de préserver la
                                réputation de votre grand patrimoine.
                            </p>
                            <p>
                                <strong>MBARGA JEAN</strong>
                                <br />
                                Fondateur de Vimaiz
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
                                <h3>Vimaiz co-assigne</h3>
                                <p>Les intervenants certifiés disponibles reçoivent la mission et l&apos;acceptent.</p>
                            </div>
                            <div className="about-card">
                                <div className="type-icon">
                                    <ClipboardCheck width="19" height="19" strokeWidth={1.6} aria-hidden="true" />
                                </div>
                                <h3>L&apos;intervention est suivie</h3>
                                <p>
                                    Arrivée géolocalisée, début, durée, checklist et éventuelles
                                    anomalies sont enregistrés.
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

            {/* Volet 7 — FAQ */}
            <section id="faq" className="welcome-section">
                <div className="wrap">
                    <div className="sec-head">
                        <div className="sec-eyebrow">FAQ</div>
                        <h2>Questions fréquentes</h2>
                        <p className="sec-sub">
                            Les dernières objections : le modèle de répartition en équipe, la
                            sécurité juridique, et comment Vimaiz s&apos;adapte aux grands
                            espaces.
                        </p>
                    </div>

                    <div className="faq-group-label">Espace propriétaires</div>
                    {PROPRIETAIRE_FAQS.map((faq, index) => {
                        const key = `proprietaire-${index}`;
                        return (
                            <div
                                className="faq-item"
                                key={key}
                                data-open={openFaq === key}
                                style={{ animationDelay: `${Math.min(index, 6) * 40}ms` }}
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

                    <div className="faq-group-label" style={{ marginTop: 32 }}>
                        Espace intervenants
                    </div>
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
            </section>

            {/* Volet 2 (règle de transition) + Volet 9 — L'estimateur, tout en bas */}
            <section id="estimateur" className="welcome-section">
                <div className="wrap">
                    <p className="estimateur-transition">
                        Vous connaissez désormais notre exigence et notre philosophie.
                        Voyons maintenant comment Vimaiz s&apos;adapte précisément à la
                        superficie et aux besoins uniques de votre grand logement.
                    </p>

                    <div className="card-wrap card-wrap-centered">
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
            </section>
        </PublicLayout>
    );
}
