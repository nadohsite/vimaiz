import GoogleLoginButton from '@/components/GoogleLoginButton';
import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { PasswordInput } from '@/components/ui/password-input';
import AuthLayout from '@/layouts/auth-layout';
import { register } from '@/routes';
import { store } from '@/routes/login';
import { request } from '@/routes/password';
import { Form, Head } from '@inertiajs/react';

interface LoginProps {
    status?: string;
    canResetPassword: boolean;
    canRegister: boolean;
}

export default function Login({
    status,
    canResetPassword,
    canRegister,
}: LoginProps) {
    return (
        <AuthLayout
            title="Bienvenue chez VIMAIZ"
            description="Connectez-vous pour accéder à votre espace personnalisé"
        >
            <Head title="Connexion" />

            <Form
                {...store.form()}
                resetOnSuccess={['password']}
                className="flex flex-col gap-6"
            >
                {({ processing, errors }) => (
                    <>
                        <div className="grid gap-6">
                            <div className="grid gap-2">
                                <Label htmlFor="email" className="text-sm font-semibold text-slate-700">Adresse email</Label>
                                <input
                                    id="email"
                                    type="email"
                                    name="email"
                                    required
                                    autoFocus
                                    tabIndex={1}
                                    autoComplete="email"
                                    placeholder="email@exemple.com"
                                    className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-base text-slate-900 shadow-sm transition-all placeholder:text-slate-400 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/20"
                                />
                                <InputError message={errors.email} />
                            </div>

                            <div className="grid gap-2">
                                <div className="flex items-center">
                                    <Label htmlFor="password" className="text-sm font-semibold text-slate-700">Mot de passe</Label>
                                    {canResetPassword && (
                                        <TextLink
                                            href={request()}
                                            className="ml-auto text-xs font-bold text-sky-500 hover:text-sky-600 transition-colors"
                                            tabIndex={5}
                                        >
                                            Oublié ?
                                        </TextLink>
                                    )}
                                </div>
                                <PasswordInput
                                    id="password"
                                    name="password"
                                    required
                                    tabIndex={2}
                                    autoComplete="current-password"
                                    placeholder="Entrez votre mot de passe"
                                />
                                <InputError message={errors.password} />
                            </div>

                            <div className="flex items-center space-x-3">
                                <Checkbox
                                    id="remember"
                                    name="remember"
                                    tabIndex={3}
                                    className="border-slate-300 data-[state=checked]:bg-sky-500 data-[state=checked]:border-sky-500"
                                />
                                <Label htmlFor="remember" className="text-sm text-slate-600 cursor-pointer">Se souvenir de moi</Label>
                            </div>

                            <Button
                                type="submit"
                                className="mt-2 w-full bg-gradient-to-r from-sky-500 to-sky-600 hover:from-sky-600 hover:to-sky-700 text-white h-12 rounded-xl text-base font-bold shadow-lg shadow-sky-500/30 transition-all hover:translate-y-[-2px] active:translate-y-0"
                                tabIndex={4}
                                disabled={processing}
                                data-test="login-button"
                            >
                                {processing && <Spinner className="mr-2" />}
                                Se connecter
                            </Button>

                            <div className="relative py-2">
                                <div className="absolute inset-0 flex items-center">
                                    <span className="w-full border-t border-slate-200" />
                                </div>
                                <div className="relative flex justify-center text-xs uppercase tracking-widest">
                                    <span className="bg-white px-4 text-slate-400 font-medium">
                                        Ou
                                    </span>
                                </div>
                            </div>

                            <GoogleLoginButton text="Continuer avec Google" />
                        </div>

                        {canRegister && (
                            <div className="text-center text-sm text-slate-500 mt-4">
                                Pas encore de compte ?{' '}
                                <TextLink href={register()} tabIndex={5} className="font-bold text-sky-600 hover:text-sky-700 transition-colors">
                                    S'inscrire
                                </TextLink>
                            </div>
                        )}
                    </>
                )}
            </Form>

            {status && (
                <div className="mt-6 text-center text-sm font-medium text-green-600 bg-green-50 p-3 rounded-lg border border-green-100 animate-in fade-in slide-in-from-top-4">
                    {status}
                </div>
            )}
        </AuthLayout>
    );
}
