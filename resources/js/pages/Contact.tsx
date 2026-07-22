import PublicLayout from '@/components/public/public-layout';
import { Link, useForm } from '@inertiajs/react';
import { CheckCircle, Mail, MapPin, Phone } from 'lucide-react';
import { useState } from 'react';

interface Props {
    success?: boolean;
}

export default function Contact({ success }: Props) {
    const [submitted, setSubmitted] = useState(success || false);

    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        email: '',
        subject: '',
        message: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('contact.send'), {
            onSuccess: () => {
                setSubmitted(true);
                reset();
            },
        });
    };

    return (
        <PublicLayout title="Nous contacter — VIMAIZ">
            <section className="welcome-section">
                <div className="wrap">
                    <div className="page-hero">
                        <div className="sec-eyebrow">Contact</div>
                        <h1>Contactez-nous</h1>
                        <p>
                            Une question ? Une suggestion ? Notre équipe est là pour vous
                            répondre.
                        </p>
                    </div>
                </div>
            </section>

            <section className="welcome-section" style={{ paddingTop: 0 }}>
                <div className="wrap">
                    <div className="grid-2">
                        <div>
                            <div className="info-card">
                                <div className="type-icon">
                                    <Mail size={19} />
                                </div>
                                <div>
                                    <h3>Email</h3>
                                    <a className="link" href="mailto:contact@vimaiz.com">
                                        contact@vimaiz.com
                                    </a>
                                    <p>Réponse sous 24h</p>
                                </div>
                            </div>
                            <div className="info-card">
                                <div className="type-icon">
                                    <Phone size={19} />
                                </div>
                                <div>
                                    <h3>Téléphone</h3>
                                    <p>Via email uniquement</p>
                                    <p>Lun-Ven : 9h-18h</p>
                                </div>
                            </div>
                            <div className="info-card">
                                <div className="type-icon">
                                    <MapPin size={19} />
                                </div>
                                <div>
                                    <h3>Adresse</h3>
                                    <p>
                                        12 rue porte de la ville
                                        <br />
                                        73330 Le Pont de Beauvoisin, France
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="panel panel-lg">
                            {submitted ? (
                                <div className="success-box">
                                    <div className="success-icon">
                                        <CheckCircle size={30} />
                                    </div>
                                    <h2 style={{ marginBottom: 10 }}>Message envoyé !</h2>
                                    <p className="sec-sub" style={{ marginBottom: 22 }}>
                                        Merci de nous avoir contactés. Notre équipe vous répondra
                                        dans les plus brefs délais.
                                    </p>
                                    <button
                                        type="button"
                                        className="btn btn-primary"
                                        onClick={() => setSubmitted(false)}
                                    >
                                        Envoyer un autre message
                                    </button>
                                </div>
                            ) : (
                                <>
                                    <h2 style={{ fontSize: 22, marginBottom: 4 }}>
                                        Envoyez-nous un message
                                    </h2>
                                    <p className="sec-sub" style={{ fontSize: 14.5, marginBottom: 22 }}>
                                        Remplissez le formulaire ci-dessous et nous vous répondrons
                                        rapidement.
                                    </p>
                                    <form onSubmit={handleSubmit}>
                                        <div className="field-grid">
                                            <div className="field">
                                                <label htmlFor="name">Nom complet *</label>
                                                <input
                                                    id="name"
                                                    value={data.name}
                                                    onChange={(e) => setData('name', e.target.value)}
                                                    placeholder="Votre nom"
                                                    required
                                                />
                                                {errors.name && (
                                                    <p className="field-error">{errors.name}</p>
                                                )}
                                            </div>
                                            <div className="field">
                                                <label htmlFor="email">Email *</label>
                                                <input
                                                    id="email"
                                                    type="email"
                                                    value={data.email}
                                                    onChange={(e) => setData('email', e.target.value)}
                                                    placeholder="votre@email.com"
                                                    required
                                                />
                                                {errors.email && (
                                                    <p className="field-error">{errors.email}</p>
                                                )}
                                            </div>
                                        </div>
                                        <div className="field">
                                            <label htmlFor="subject">Sujet *</label>
                                            <input
                                                id="subject"
                                                value={data.subject}
                                                onChange={(e) => setData('subject', e.target.value)}
                                                placeholder="L'objet de votre message"
                                                required
                                            />
                                            {errors.subject && (
                                                <p className="field-error">{errors.subject}</p>
                                            )}
                                        </div>
                                        <div className="field">
                                            <label htmlFor="message">Message *</label>
                                            <textarea
                                                id="message"
                                                value={data.message}
                                                onChange={(e) => setData('message', e.target.value)}
                                                placeholder="Décrivez votre demande en détail..."
                                                rows={6}
                                                required
                                            />
                                            {errors.message && (
                                                <p className="field-error">{errors.message}</p>
                                            )}
                                        </div>
                                        <button
                                            type="submit"
                                            className="btn btn-primary"
                                            style={{ width: '100%', padding: 14 }}
                                            disabled={processing}
                                        >
                                            {processing
                                                ? 'Envoi en cours...'
                                                : 'Envoyer le message'}
                                        </button>
                                    </form>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </section>
        </PublicLayout>
    );
}
