import { home } from '@/routes';
import { Link } from '@inertiajs/react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { type PropsWithChildren } from 'react';
import { Crown, Shield, Clock, CheckCircle } from 'lucide-react';
import logoImage from '@/../assets/images/logo.png';
import AppearanceToggleDropdown from '@/components/appearance-dropdown';

interface AuthLayoutProps {
    title?: string;
    description?: string;
    reverse?: boolean;
}

const LOGO_FILTER =
    'brightness(0) saturate(100%) invert(48%) sepia(79%) saturate(2476%) hue-rotate(166deg) brightness(98%) contrast(101%)';

export default function AuthSplitLayout({
    children,
    title,
    description,
    reverse = true,
}: PropsWithChildren<AuthLayoutProps>) {
    return (
        <div className="relative grid min-h-svh bg-white dark:bg-slate-900 lg:grid-cols-2">
            {/* Form Column */}
            <div
                className={cn(
                    'relative flex min-h-svh w-full flex-col bg-white dark:bg-slate-900',
                    'justify-start lg:justify-center',
                    reverse ? 'order-1' : 'order-2',
                )}
            >
                <div className="absolute top-3 right-3 z-30 sm:top-4 sm:right-4">
                    <AppearanceToggleDropdown />
                </div>

                <div className="mx-auto flex w-full max-w-[450px] flex-col px-4 pt-14 pb-8 sm:px-6 sm:py-10 lg:p-8">
                    <Link
                        href={home()}
                        className="relative z-20 mb-5 flex items-center justify-center lg:hidden"
                    >
                        <img
                            src={logoImage}
                            alt="VIMAIZ"
                            className="h-10 w-auto max-w-[200px] object-contain sm:h-12"
                            style={{ filter: LOGO_FILTER }}
                        />
                    </Link>

                    <div className="mb-5 flex flex-col items-center gap-1.5 text-center sm:mb-6 sm:gap-2">
                        <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl dark:text-white">
                            {title}
                        </h1>
                        {description && (
                            <p className="max-w-[340px] text-sm text-slate-500 sm:text-base dark:text-slate-400">
                                {description}
                            </p>
                        )}
                    </div>

                    <div className="w-full">{children}</div>
                </div>
            </div>

            {/* Image/Decoration Column — desktop only */}
            <div
                className={cn(
                    'relative hidden min-h-svh flex-col p-8 xl:p-10 text-white lg:flex',
                    reverse ? 'order-2' : 'order-1',
                )}
            >
                <div className="absolute inset-0 overflow-hidden bg-gradient-to-br from-sky-500 via-sky-600 to-cyan-600">
                    <div className="absolute -top-20 -right-20 h-96 w-96 rounded-full bg-white/10 blur-3xl" />
                    <div className="absolute -bottom-20 -left-20 h-80 w-80 rounded-full bg-cyan-400/20 blur-3xl" />
                    <div className="absolute top-1/2 left-1/2 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-sky-400/10 blur-3xl" />
                </div>

                <Link href={home()} className="relative z-20 flex items-center">
                    <img
                        src={logoImage}
                        alt="VIMAIZ"
                        className="h-11 w-auto max-w-[220px] object-contain xl:h-12"
                    />
                </Link>

                <div className="relative z-20 mt-10 flex flex-1 flex-col justify-center space-y-6 pb-4 xl:mt-14 xl:space-y-8">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                    >
                        <h2 className="mb-3 text-3xl font-bold leading-tight xl:mb-4 xl:text-4xl">
                            Le ménage professionnel
                            <br />
                            à portée de clic
                        </h2>
                        <p className="max-w-md text-base text-white/80 xl:text-lg">
                            Réservez votre agent de ménage en quelques minutes et
                            profitez d&apos;un intérieur impeccable.
                        </p>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        className="grid grid-cols-2 gap-3 xl:gap-4"
                    >
                        <div className="rounded-xl border border-white/20 bg-white/10 p-3 backdrop-blur-md xl:p-4">
                            <Shield className="mb-2 h-5 w-5 text-white/90 xl:h-6 xl:w-6" />
                            <p className="text-sm font-medium">Agents vérifiés</p>
                        </div>
                        <div className="rounded-xl border border-white/20 bg-white/10 p-3 backdrop-blur-md xl:p-4">
                            <Clock className="mb-2 h-5 w-5 text-white/90 xl:h-6 xl:w-6" />
                            <p className="text-sm font-medium">Réservation rapide</p>
                        </div>
                        <div className="rounded-xl border border-white/20 bg-white/10 p-3 backdrop-blur-md xl:p-4">
                            <CheckCircle className="mb-2 h-5 w-5 text-white/90 xl:h-6 xl:w-6" />
                            <p className="text-sm font-medium">Satisfaction garantie</p>
                        </div>
                        <div className="rounded-xl border border-white/20 bg-white/10 p-3 backdrop-blur-md xl:p-4">
                            <Crown className="mb-2 h-5 w-5 text-white/90 xl:h-6 xl:w-6" />
                            <p className="text-sm font-medium">Service premium</p>
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
}
