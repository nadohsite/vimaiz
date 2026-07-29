import '../../../css/welcome.css';
import AppearanceToggleDropdown from '@/components/appearance-dropdown';
import { type SharedData } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
import { type ReactNode } from 'react';
import logoImage from '@/../assets/images/logo.png';

export const LOGO_FILTER =
    'brightness(0) saturate(100%) invert(48%) sepia(79%) saturate(2476%) hue-rotate(166deg) brightness(98%) contrast(101%)';

interface PublicLayoutProps {
    title: string;
    children: ReactNode;
}

export default function PublicLayout({ title, children }: PublicLayoutProps) {
    const { auth } = usePage<SharedData>().props;
    const isLoggedIn = Boolean(auth.user);

    return (
        <div className="welcome-page">
            <Head title={title}>
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
                <link
                    href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=IBM+Plex+Mono:wght@500&display=swap"
                    rel="stylesheet"
                />
            </Head>

            <header className="welcome-header">
                <nav className="wrap">
                    <Link href="/" className="logo">
                        <img src={logoImage} alt="Vimaiz" style={{ filter: LOGO_FILTER }} />
                    </Link>
                    <div className="navlinks">
                        <Link href="/#service">Faire le ménage</Link>
                        <Link href={route('professionals.index')}>Devenir agent</Link>
                        <Link href="/#about">À propos</Link>
                        <Link href={route('contact.index')}>Contact</Link>
                    </div>
                    <div className="navcta">
                        <AppearanceToggleDropdown />
                        {isLoggedIn ? (
                            <Link href={route('dashboard')} className="btn btn-primary">
                                Mon espace
                            </Link>
                        ) : (
                            <>
                                <Link href={route('login')} className="btn-link">
                                    Connexion
                                </Link>
                                <Link href={route('register')} className="btn btn-primary">
                                    Inscription
                                </Link>
                            </>
                        )}
                    </div>
                </nav>
            </header>

            <main>{children}</main>

            <footer id="contact" className="welcome-footer">
                <div className="wrap">
                    <div className="foot-grid">
                        <div className="foot-brand">
                            <div className="logo">
                                <img src={logoImage} alt="Vimaiz" style={{ filter: LOGO_FILTER }} />
                            </div>
                            <p>Planifiez votre ménage. Vimaiz s&apos;occupe du reste.</p>
                        </div>
                        <div className="foot-col">
                            <h4>À propos</h4>
                            <Link href="/#about">À propos de Vimaiz</Link>
                            <Link href="/#service">Service</Link>
                            <Link href="/#steps">Fonctionnement</Link>
                        </div>
                        <div className="foot-col">
                            <h4>Clients</h4>
                            <Link href={route('register')}>Inscription</Link>
                            <Link href={route('login')}>Connexion</Link>
                        </div>
                        <div className="foot-col">
                            <h4>Professionnels</h4>
                            <Link href={route('professionals.index')}>Devenir agent</Link>
                        </div>
                        <div className="foot-col">
                            <h4>Légal</h4>
                            <Link href={route('legal.notice')}>Mentions légales</Link>
                            <Link href={route('privacy')}>Confidentialité</Link>
                            <Link href={route('contact.index')}>Contact</Link>
                        </div>
                    </div>
                    <div className="foot-bottom">
                        <span>© {new Date().getFullYear()} Vimaiz. Tous droits réservés.</span>
                    </div>
                </div>
            </footer>
        </div>
    );
}
