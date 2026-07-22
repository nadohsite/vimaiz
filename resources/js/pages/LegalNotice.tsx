import PublicLayout from '@/components/public/public-layout';
import { Link } from '@inertiajs/react';

export default function LegalNotice() {
    return (
        <PublicLayout title="Mentions Légales — VIMAIZ">
            <section className="welcome-section">
                <div className="wrap">
                    <div className="legal-card">
                        <div className="sec-eyebrow">Légal</div>
                        <h1>Mentions Légales</h1>

                        <section>
                            <h2>1. Éditeur du site</h2>
                            <p>Le site VIMAIZ est édité par :</p>
                            <ul>
                                <li>
                                    <span>
                                        <strong>Raison sociale :</strong> VIMAIZ (anciennement
                                        Nettolia)
                                    </span>
                                </li>
                                <li>
                                    <span>
                                        <strong>Forme juridique :</strong> Auto-entrepreneur
                                        (Entreprise Individuelle)
                                    </span>
                                </li>
                                <li>
                                    <span>
                                        <strong>Siège social :</strong> 12 rue porte de la ville,
                                        73330 Le Pont de Beauvoisin, France
                                    </span>
                                </li>
                                <li>
                                    <span>
                                        <strong>SIRET :</strong> 832 759 294 00032
                                    </span>
                                </li>
                                <li>
                                    <span>
                                        <strong>Email :</strong> contact@vimaiz.com
                                    </span>
                                </li>
                            </ul>
                        </section>

                        <section>
                            <h2>2. Directeur de la publication</h2>
                            <p>
                                Le directeur de la publication est : Jean Bernard Stephane Mbarga
                                Bilounga
                            </p>
                        </section>

                        <section>
                            <h2>3. Hébergement</h2>
                            <p>Le site est hébergé par :</p>
                            <ul>
                                <li>
                                    <span>
                                        <strong>Nom de l&apos;hébergeur :</strong> OVHcloud
                                    </span>
                                </li>
                                <li>
                                    <span>
                                        <strong>Adresse :</strong> 2 rue Kellermann, 59100 Roubaix,
                                        France
                                    </span>
                                </li>
                                <li>
                                    <span>
                                        <strong>Site web :</strong>{' '}
                                        <a
                                            href="https://www.ovhcloud.com/fr/"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                        >
                                            https://www.ovhcloud.com/fr/
                                        </a>
                                    </span>
                                </li>
                            </ul>
                        </section>

                        <section>
                            <h2>4. Propriété intellectuelle</h2>
                            <p>
                                L&apos;ensemble du contenu présent sur le site VIMAIZ (textes,
                                images, vidéos, logos, marques, etc.) est la propriété exclusive de
                                VIMAIZ ou de ses partenaires. Toute reproduction, représentation,
                                modification, publication ou adaptation de tout ou partie des
                                éléments du site, quel que soit le moyen ou le procédé utilisé, est
                                interdite sans l&apos;autorisation écrite préalable de VIMAIZ.
                            </p>
                        </section>

                        <section>
                            <h2>5. Données personnelles</h2>
                            <p>
                                VIMAIZ s&apos;engage à respecter la confidentialité des données
                                personnelles collectées sur son site. Pour plus d&apos;informations
                                sur le traitement de vos données personnelles, veuillez consulter
                                notre{' '}
                                <Link href="/confidentialite">Politique de confidentialité</Link>.
                            </p>
                        </section>

                        <section>
                            <h2>6. Cookies</h2>
                            <p>
                                Le site VIMAIZ utilise des cookies pour améliorer l&apos;expérience
                                utilisateur et établir des statistiques de fréquentation. En
                                poursuivant votre navigation sur ce site, vous acceptez
                                l&apos;utilisation de cookies.
                            </p>
                        </section>

                        <section>
                            <h2>7. Responsabilité</h2>
                            <p>
                                VIMAIZ s&apos;efforce d&apos;assurer l&apos;exactitude et la mise à
                                jour des informations diffusées sur son site. Cependant, VIMAIZ ne
                                peut garantir l&apos;exactitude, la précision ou l&apos;exhaustivité
                                des informations mises à disposition sur ce site.
                            </p>
                            <p>
                                VIMAIZ décline toute responsabilité en cas de dommages directs ou
                                indirects causés aux utilisateurs du site, quelle qu&apos;en soit la
                                nature, résultant de l&apos;accès ou de l&apos;utilisation du site.
                            </p>
                        </section>

                        <section>
                            <h2>8. Droit applicable</h2>
                            <p>
                                Les présentes mentions légales sont régies par le droit français.
                                Tout litige relatif à l&apos;utilisation du site VIMAIZ sera soumis
                                à la compétence exclusive des tribunaux français.
                            </p>
                        </section>

                        <section>
                            <h2>9. Contact</h2>
                            <p>
                                Pour toute question concernant ces mentions légales, vous pouvez
                                nous contacter à l&apos;adresse suivante :{' '}
                                <a href="mailto:contact@vimaiz.com">contact@vimaiz.com</a>
                            </p>
                        </section>

                        <div className="legal-updated">
                            Dernière mise à jour :{' '}
                            {new Date().toLocaleDateString('fr-FR', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                            })}
                        </div>
                    </div>
                </div>
            </section>
        </PublicLayout>
    );
}
