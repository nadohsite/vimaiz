import PublicLayout from '@/components/public/public-layout';
import { Link } from '@inertiajs/react';
import { ArrowRight, LayoutDashboard, MapPin, Percent, Shield, Wallet } from 'lucide-react';

const pillars = [
    {
        icon: Shield,
        title: 'Intervenants vérifiés',
        description: 'SIRET et documents contrôlés avant intégration au réseau.',
    },
    {
        icon: Wallet,
        title: 'Paiement sécurisé',
        description: 'Débité avant chaque intervention, jamais avant validation.',
    },
    {
        icon: LayoutDashboard,
        title: 'Organisation claire',
        description:
            'Suivi des prestations, échanges et historique centralisés dans un seul espace.',
    },
    {
        icon: MapPin,
        title: 'Partout en France',
        description: 'Un réseau national de professionnels, disponible où que vous soyez.',
    },
];

export default function About() {
    return (
        <PublicLayout
            title="À propos"
            description="Découvrez VIMAIZ, la plateforme qui simplifie l'organisation des interventions pour vos locations saisonnières."
        >
            <section className="welcome-section">
                <div className="wrap">
                    <div className="page-hero">
                        <div className="sec-eyebrow">La plateforme</div>
                        <h1>À propos de Vimaiz</h1>
                        <p>
                            Chez Vimaiz, nous croyons qu&apos;une location saisonnière devrait
                            toujours être prête à accueillir ses voyageurs.
                        </p>
                    </div>
                </div>
            </section>

            <section className="welcome-section" style={{ paddingTop: 0 }}>
                <div className="wrap">
                    <div className="about-grid">
                        <div>
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
                            <p>Notre objectif n&apos;est pas d&apos;ajouter un outil de plus.</p>
                            <p>
                                Notre objectif est de simplifier toute l&apos;organisation qui
                                permet à un logement d&apos;être prêt au bon moment.
                            </p>
                            <p>Nous croyons qu&apos;une bonne organisation est invisible.</p>
                            <p>Lorsqu&apos;elle fonctionne, personne n&apos;y pense.</p>
                            <p>
                                Lorsqu&apos;elle manque, tout le monde en subit les conséquences.
                            </p>
                            <p>
                                C&apos;est cette tranquillité d&apos;esprit que nous voulons offrir
                                à chaque utilisateur de Vimaiz.
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
