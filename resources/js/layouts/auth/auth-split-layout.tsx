import AppLogoIcon from '@/components/app-logo-icon';
import { home } from '@/routes';
import { type SharedData } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { type PropsWithChildren } from 'react';

interface AuthLayoutProps {
    title?: string;
    description?: string;
    reverse?: boolean;
}

export default function AuthSplitLayout({
    children,
    title,
    description,
    reverse = true, // Default to true as per user request: form left, image right
}: PropsWithChildren<AuthLayoutProps>) {
    const { name, quote } = usePage<SharedData>().props;

    return (
        <div className="relative grid min-h-svh flex-col items-center justify-center sm:px-0 lg:max-w-none lg:grid-cols-2 lg:px-0 bg-background">
            {/* Form Column */}
            <div className={cn(
                "w-full lg:p-8 flex flex-col justify-center min-h-svh",
                reverse ? "order-1" : "order-2"
            )}>
                <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[450px] p-6">
                    <Link
                        href={home()}
                        className="relative z-20 flex items-center justify-center lg:hidden mb-8"
                    >
                        <AppLogoIcon className="h-10 fill-current text-black" />
                    </Link>
                    <div className="flex flex-col items-start gap-2 text-left sm:items-center sm:text-center mb-4">
                        <h1 className="text-3xl font-bold tracking-tight text-neutral-900">{title}</h1>
                        <p className="text-base text-neutral-500 max-w-[350px]">
                            {description}
                        </p>
                    </div>
                    {children}
                </div>
            </div>

            {/* Image/Decoration Column */}
            <div className={cn(
                "relative hidden h-full flex-col bg-muted p-10 text-white lg:flex",
                reverse ? "order-2" : "order-1"
            )}>
                <div className="absolute inset-0 bg-neutral-900 overflow-hidden">
                    {/* Cinematic background with gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-tr from-black/80 via-black/20 to-transparent z-10" />
                    <img 
                        src="https://images.unsplash.com/photo-1600880212340-02d956381b2e?q=80&w=2070&auto=format&fit=crop" 
                        alt="Premium Interior"
                        className="h-full w-full object-cover opacity-60 scale-105 hover:scale-100 transition-transform duration-[10s]"
                    />
                </div>
                
                <Link
                    href={home()}
                    className="relative z-20 flex items-center text-xl font-bold tracking-tighter"
                >
                    <div className="mr-2 flex h-8 w-8 items-center justify-center rounded-lg bg-white/10 backdrop-blur-md border border-white/20">
                        <AppLogoIcon className="size-5 fill-current text-white" />
                    </div>
                    <span className="text-white drop-shadow-sm">{name}</span>
                </Link>

                {quote && (
                    <div className="relative z-20 mt-auto">
                        <motion.blockquote 
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="space-y-4 max-w-lg"
                        >
                            <p className="text-2xl font-light leading-snug text-white/90 italic">
                                &ldquo;{quote.message}&rdquo;
                            </p>
                            <footer className="flex items-center gap-3">
                                <div className="h-px w-12 bg-white/30" />
                                <span className="text-sm font-medium tracking-widest uppercase text-white/60">
                                    {quote.author}
                                </span>
                            </footer>
                        </motion.blockquote>
                    </div>
                )}
            </div>
        </div>
    );
}
