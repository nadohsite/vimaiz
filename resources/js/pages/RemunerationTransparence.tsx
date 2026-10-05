import PublicLayout from '@/components/public/public-layout';
import { Link } from '@inertiajs/react';
import { ShieldCheck, Wallet } from 'lucide-react';

const benefits = [
    {
        icon: ShieldCheck,
        title: 'Clients garantis',
        description:
            "Nos budgets marketing vous apportent des clients premium toute l'année sans que vous n'ayez à investir personnellement dans le marketing.",
    },
    {
        icon: Wallet,
        title: 'Trésorerie sécurisée',
        description:
            'Nous gérons les encaissements à distance auprès des propriétaires et vous versons vos gains de manière sécurisée sous 48 heures.',
    },
];

export default function RemunerationTransparence() {
    return (
        <PublicLayout
            title="Rémunération et transparence"
            description="Comprenez comment se répartit le montant de chaque intervention Vimaiz : 75 % pour l'intervenant, 25 % pour la plateforme."
        >
            <section className="welcome-section">
                <div className="wrap">
                    <div className="page-hero">
                        <div className="sec-eyebrow">Intervenants</div>
                        <h1>Rémunération et transparence</h1>
                        <p>
                            Chez Vimaiz, nous valorisons votre expertise en vous connectant
                            exclusivement à des propriétés de standing. Pour chaque forfait fixe,
                            vous percevez 75 % du montant total de l&apos;intervention.
                        </p>
                    </div>
                </div>
            </section>

            <section className="welcome-section" style={{ paddingTop: 0 }}>
                <div className="wrap">
                    <div className="legal-card">
                        <p>
                            Les 25 % prélevés par la plateforme servent de réinvestissement
                            marketing, d&apos;amélioration continue et de sécurisation des
                            données.
                        </p>
                        <p>Ils se traduisent pour vous par des avantages concrets.</p>
                    </div>

                    <div className="about-cards" style={{ marginTop: 32 }}>
                        {benefits.map(({ icon: Icon, title, description }) => (
                            <div className="about-card" key={title}>
                                <div className="type-icon">
                                    <Icon size={19} />
                                </div>
                                <h3>{title}</h3>
                                <p>{description}</p>
                            </div>
                        ))}
                    </div>

                    <div style={{ marginTop: 32 }}>
                        <Link href={route('professionals.index')} className="btn btn-primary">
                            Devenir intervenant
                        </Link>
                    </div>
                </div>
            </section>
        </PublicLayout>
    );
}
