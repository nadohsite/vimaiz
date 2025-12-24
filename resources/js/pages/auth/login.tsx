import GoogleLoginButton from '@/components/GoogleLoginButton';
import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
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
                                <Label htmlFor="email" className="text-sm font-semibold text-neutral-700">Adresse email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    name="email"
                                    required
                                    autoFocus
                                    tabIndex={1}
                                    autoComplete="email"
                                    placeholder="email@exemple.com"
                                    className="h-11 rounded-xl bg-neutral-50 border-neutral-200 focus:bg-white transition-all"
                                />
                                <InputError message={errors.email} />
                            </div>

                            <div className="grid gap-2">
                                <div className="flex items-center">
                                    <Label htmlFor="password" className="text-sm font-semibold text-neutral-700">Mot de passe</Label>
                                    {canResetPassword && (
                                        <TextLink
                                            href={request()}
                                            className="ml-auto text-xs font-bold text-neutral-400 hover:text-black transition-colors"
                                            tabIndex={5}
                                        >
                                            Oublié ?
                                        </TextLink>
                                    )}
                                </div>
                                <Input
                                    id="password"
                                    type="password"
                                    name="password"
                                    required
                                    tabIndex={2}
                                    autoComplete="current-password"
                                    placeholder="••••••••"
                                    className="h-11 rounded-xl bg-neutral-50 border-neutral-200 focus:bg-white transition-all"
                                />
                                <InputError message={errors.password} />
                            </div>

                            <div className="flex items-center space-x-3">
                                <Checkbox
                                    id="remember"
                                    name="remember"
                                    tabIndex={3}
                                    className="border-neutral-200"
                                />
                                <Label htmlFor="remember" className="text-sm text-neutral-500 cursor-pointer">Se souvenir de moi</Label>
                            </div>

                            <Button
                                type="submit"
                                className="mt-2 w-full bg-black hover:bg-neutral-800 text-white h-12 rounded-xl text-base font-bold shadow-lg shadow-black/10 transition-all hover:translate-y-[-2px] active:translate-y-0"
                                tabIndex={4}
                                disabled={processing}
                                data-test="login-button"
                            >
                                {processing && <Spinner className="mr-2" />}
                                Se connecter
                            </Button>

                            <div className="relative py-2">
                                <div className="absolute inset-0 flex items-center">
                                    <span className="w-full border-t border-neutral-100" />
                                </div>
                                <div className="relative flex justify-center text-xs uppercase tracking-widest">
                                    <span className="bg-white px-4 text-neutral-400 font-bold">
                                        Ou
                                    </span>
                                </div>
                            </div>

                            <GoogleLoginButton text="Continuer avec Google" />
                        </div>

                        {canRegister && (
                            <div className="text-center text-sm text-neutral-500 mt-4">
                                Pas encore de compte ?{' '}
                                <TextLink href={register()} tabIndex={5} className="font-bold text-black border-b-2 border-black/10 hover:border-black transition-colors">
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
