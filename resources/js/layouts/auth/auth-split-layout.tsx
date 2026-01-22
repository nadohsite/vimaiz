import { home } from '@/routes';
import { Link } from '@inertiajs/react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { type PropsWithChildren } from 'react';
import { Crown, Shield, Clock, CheckCircle } from 'lucide-react';
import logoImage from '@/../assets/images/logo.png';

interface AuthLayoutProps {
    title?: string;
    description?: string;
    reverse?: boolean;
}

export default function AuthSplitLayout({
    children,
    title,
    description,
    reverse = true,
}: PropsWithChildren<AuthLayoutProps>) {
    return (
        <div className="relative grid min-h-svh flex-col items-center justify-center sm:px-0 lg:max-w-none lg:grid-cols-2 lg:px-0 bg-white">
            {/* Form Column */}
            <div className={cn(
                "w-full lg:p-8 flex flex-col justify-center min-h-svh bg-white",
                reverse ? "order-1" : "order-2"
            )}>
                <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[450px] p-6">
                    <Link
                        href={home()}
                        className="relative z-20 flex items-center justify-center lg:hidden mb-6"
                    >
                        <img 
                            src={logoImage} 
                            alt="VIMAIZ" 
                            className="h-22 object-contain" 
                            style={{ filter: 'brightness(0) saturate(100%) invert(48%) sepia(79%) saturate(2476%) hue-rotate(166deg) brightness(98%) contrast(101%)' }}
                        />
                    </Link>
                    <div className="flex flex-col items-start gap-2 text-left sm:items-center sm:text-center mb-4">
                        <h1 className="text-3xl font-bold tracking-tight text-slate-900">{title}</h1>
                        <p className="text-base text-slate-500 max-w-[350px]">
                            {description}
                        </p>
                    </div>
                    {children}
                </div>
            </div>

            {/* Image/Decoration Column */}
            <div className={cn(
                "relative hidden h-full flex-col p-10 text-white lg:flex",
                reverse ? "order-2" : "order-1"
            )}>
                <div className="absolute inset-0 bg-gradient-to-br from-sky-500 via-sky-600 to-cyan-600 overflow-hidden">
                    {/* Decorative circles */}
                    <div className="absolute -top-20 -right-20 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
                    <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-cyan-400/20 rounded-full blur-3xl" />
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-sky-400/10 rounded-full blur-3xl" />
                </div>
                
                <Link
                    href={home()}
                    className="relative z-20 flex items-center"
                >
                    <img src={logoImage} alt="VIMAIZ" className="h-24 object-contain" />
                </Link>

                <div className="relative z-20 mt-auto mb-10 space-y-8">
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                    >
                        <h2 className="text-4xl font-bold leading-tight mb-4">
                            Le ménage professionnel<br />à portée de clic
                        </h2>
                        <p className="text-lg text-white/80 max-w-md">
                            Réservez votre agent de ménage en quelques minutes et profitez d'un intérieur impeccable.
                        </p>
                    </motion.div>

                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        className="grid grid-cols-2 gap-4"
                    >
                        <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20">
                            <Shield className="h-6 w-6 mb-2 text-white/90" />
                            <p className="text-sm font-medium">Agents vérifiés</p>
                        </div>
                        <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20">
                            <Clock className="h-6 w-6 mb-2 text-white/90" />
                            <p className="text-sm font-medium">Réservation rapide</p>
                        </div>
                        <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20">
                            <CheckCircle className="h-6 w-6 mb-2 text-white/90" />
                            <p className="text-sm font-medium">Satisfaction garantie</p>
                        </div>
                        <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20">
                            <Crown className="h-6 w-6 mb-2 text-white/90" />
                            <p className="text-sm font-medium">Service premium</p>
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
}
