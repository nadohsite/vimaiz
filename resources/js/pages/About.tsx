import PublicLayout from '@/components/public/public-layout';
import { Link } from '@inertiajs/react';
import { ArrowRight, LayoutDashboard, MapPin, Percent, Shield, Wallet } from 'lucide-react';

const pillars = [
    {
        icon: Shield,
        title: 'Intervenants certifiés',
        description:
            'SIRET, URSSAF et assurance professionnelle vérifiés avant intégration au réseau — la meilleure protection contre le travail dissimulé.',
    },
    {
        icon: Wallet,
        title: 'Paiement sécurisé',
        description:
            'Réglé en ligne avant l’intervention, reversé aux intervenants seulement après votre validation finale.',
    },
    {
        icon: LayoutDashboard,
        title: 'Suivi en temps réel',
        description:
            'Arrivée géolocalisée, rapport de clôture et historique centralisés dans votre espace, même à des milliers de kilomètres.',
    },
    {
        icon: MapPin,
        title: 'Un réseau de brigades',
        description:
            'Co-assignation automatique de plusieurs intervenants certifiés selon la superficie de votre bien, pour ne jamais dépasser 125 m² de charge chacun.',
    },
];

export default function About() {
    return (
        <PublicLayout
            title="À propos"
            description="Vimaiz, pensé pour les grandes résidences secondaires gérées à distance : l'histoire et la mission de la plateforme."
        >
            <section className="welcome-section">
                <div className="wrap">
                    <div className="page-hero">
                        <div className="sec-eyebrow">Notre histoire</div>
                        <h1>À propos de Vimaiz</h1>
                        <p>
                            Chez Vimaiz, nous croyons que l&apos;éloignement ne doit jamais
                            justifier la perte de contrôle sur votre grand patrimoine.
                        </p>
                    </div>
                </div>
            </section>

            <section className="welcome-section" style={{ paddingTop: 0 }}>
                <div className="wrap">
                    <div className="about-grid">
                        <div>
                            <p>Tout est parti d&apos;un constat, fait au fil de nombreux voyages entre la France et l&apos;Espagne.</p>
                            <p>
                                En observant le lien touristique qui unit ces deux pays, j&apos;ai
                                réalisé combien de propriétaires possèdent une résidence
                                secondaire qu&apos;ils ne peuvent pas surveiller eux-mêmes — trop
                                loin, trop occupés, ou simplement de l&apos;autre côté d&apos;une
                                frontière.
                            </p>
                            <p>
                                <em>Vivienda</em>, en espagnol, c&apos;est le logement.{' '}
                                <em>Maison</em>, en français, dit la même chose. J&apos;ai fusionné
                                les deux mots, remplacé le « s » par un « z » : Vimaiz était né.
                            </p>
                            <p>
                                Pour l&apos;instant, Vimaiz est déployée uniquement sur le marché
                                français. Mais l&apos;ambition ne s&apos;arrête pas à nos
                                frontières : l&apos;Espagne, puis le reste de l&apos;Europe, sont
                                les prochaines étapes — c&apos;est aussi pour cela que le nom, et
                                le .com, ont été pensés dès le départ à l&apos;international.
                            </p>
                            <p>
                                Plus notre réseau grandissait, plus un constat s&apos;imposait : un
                                bien de 70 m² et un domaine de 400 m² n&apos;ont rien à voir. Le
                                second exige une coordination que personne, sur le marché,
                                n&apos;avait pensée à cette échelle.
                            </p>
                            <p>
                                Nous avons donc fait un choix : nous concentrer exclusivement sur
                                les grandes résidences secondaires, celles de plus de 200 m², et
                                construire pour elles l&apos;organisation qu&apos;elles méritent —
                                des brigades de plusieurs intervenants certifiés, coordonnées comme
                                une seule équipe, suivies du début à la fin.
                            </p>
                            <p>Notre mission tient en une phrase :</p>
                            <p>
                                <strong>Être vos yeux là où vous n&apos;en avez pas.</strong>
                            </p>
                            <p style={{ marginTop: 24 }}>
                                MBARGA JEAN
                                <br />
                                Fondateur de Vimaiz
                            </p>
                            <div style={{ marginTop: 24 }}>
                                <Link href={route('register')} className="btn btn-primary">
                                    S&apos;inscrire
                                </Link>
                            </div>
                        </div>
                        <div className="about-cards">
                            {pillars.map(({ icon: Icon, title, description }) => (
                                <div className="about-card" key={title}>
                                    <div className="type-icon">
                                        <Icon size={19} />
                                    </div>
                                    <h3>{title}</h3>
                                    <p>{description}</p>
                                </div>
                            ))}
                            <div className="about-card about-card-wide">
                                <div className="type-icon">
                                    <Percent size={19} />
                                </div>
                                <h3>Rémunération et transparence</h3>
                                <p>
                                    75 % du montant de chaque intervention revient directement à
                                    l&apos;intervenant. Découvrez comment les 25 % prélevés par la
                                    plateforme se traduisent en clients garantis et en trésorerie
                                    sécurisée.
                                </p>
                                <Link href={route('remuneration-transparence')} className="about-card-link">
                                    En savoir plus <ArrowRight size={14} />
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </PublicLayout>
    );
}
