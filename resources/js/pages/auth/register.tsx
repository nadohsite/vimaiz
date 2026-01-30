import GoogleLoginButton from '@/components/GoogleLoginButton';
import { login } from '@/routes';
import { useForm, Head } from '@inertiajs/react';

import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { PasswordInput } from '@/components/ui/password-input';
import AuthLayout from '@/layouts/auth-layout';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronRight, User, Briefcase } from 'lucide-react';
import { useState, useEffect } from 'react';

import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';

export default function Register() {
  // Check URL params for pre-selected role (e.g., from Professionals page)
  const urlParams = new URLSearchParams(window.location.search);
  const initialRole = urlParams.get('role') === 'agent' ? 'agent' : 'client';
  
  const [role, setRole] = useState(initialRole);
  const [step, setStep] = useState(1);

  const { data, setData, post, processing, errors, reset } = useForm({
    name: '',
    email: '',
    password: '',
    password_confirmation: '',
    role: initialRole,
    agent_type: 'individual',
    phone: '',
    experience_years: '',
    max_surface_area: 'medium',
    supported_property_types: [] as string[],
    terms_accepted: false,
  });

  useEffect(() => {
    setData('role', role);
  }, [role]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    post(route('register'), {
      onFinish: () => reset('password', 'password_confirmation'),
    });
  };

  const nextStep = () => {
    setStep(2);
  };
  const prevStep = () => setStep(1);

  const inputStyles = "h-11 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 text-base text-slate-900 dark:text-white shadow-sm transition-all placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/20";

  return (
    <AuthLayout
      title={step === 1 ? "Créer un compte" : "Dites-en plus sur vous"}
      description={step === 1 ? "Entrez vos coordonnées pour commencer" : "Ces informations nous aideront à vous mettre en avant auprès des clients"}
    >
      <Head title="Inscription" />
      
      {role === 'agent' && (
        <div className="mb-8 flex items-center justify-center gap-4">
          <div className={cn(
            "flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold transition-colors",
            step === 1 ? "bg-sky-500 text-white" : "bg-slate-100 text-slate-400"
          )}>1</div>
          <div className="h-px w-10 bg-slate-200" />
          <div className={cn(
            "flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold transition-colors",
            step === 2 ? "bg-sky-500 text-white" : "bg-slate-100 text-slate-400"
          )}>2</div>
        </div>
      )}

      <form onSubmit={submit} className="flex flex-col gap-6">
        <div className="relative overflow-hidden min-h-[400px]">
          <AnimatePresence mode="wait">
            {step === 1 ? (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-6"
              >
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="grid gap-2">
                    <Label htmlFor="name" className="text-sm font-semibold text-slate-700 dark:text-slate-300">Nom complet</Label>
                    <input
                      id="name"
                      type="text"
                      required
                      name="name"
                      value={data.name}
                      onChange={(e) => setData('name', e.target.value)}
                      placeholder="Prénom et Nom"
                      className={inputStyles}
                    />
                    <InputError message={errors.name} />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="email" className="text-sm font-semibold text-slate-700 dark:text-slate-300">Adresse email</Label>
                    <input
                      id="email"
                      type="email"
                      required
                      name="email"
                      value={data.email}
                      onChange={(e) => setData('email', e.target.value)}
                      placeholder="email@exemple.com"
                      className={inputStyles}
                    />
                    <InputError message={errors.email} />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="password" className="text-sm font-semibold text-slate-700 dark:text-slate-300">Mot de passe</Label>
                    <PasswordInput
                      id="password"
                      required
                      name="password"
                      value={data.password}
                      onChange={(e) => setData('password', e.target.value)}
                      placeholder="Choisissez un mot de passe"
                    />
                    <InputError message={errors.password} />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="password_confirmation" className="text-sm font-semibold text-slate-700 dark:text-slate-300">Confirmation</Label>
                    <PasswordInput
                      id="password_confirmation"
                      required
                      name="password_confirmation"
                      value={data.password_confirmation}
                      onChange={(e) => setData('password_confirmation', e.target.value)}
                      placeholder="Confirmez le mot de passe"
                    />
                    <InputError message={errors.password_confirmation} />
                  </div>
                </div>

                <div className="grid gap-2">
                  <Label className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3 block">Je souhaite m'inscrire en tant que</Label>
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      type="button"
                      onClick={() => setRole('client')}
                      className={cn(
                        "flex flex-col items-center gap-3 rounded-xl border-2 p-4 transition-all text-center",
                        role === 'client' 
                          ? "border-sky-500 bg-sky-50 text-sky-700 shadow-sm" 
                          : "border-slate-200 bg-white text-slate-400 hover:border-slate-300"
                      )}
                    >
                      <User className={cn("h-6 w-6", role === 'client' ? "text-sky-600" : "text-slate-300")} />
                      <div className="text-xs font-bold uppercase tracking-widest">Client</div>
                    </button>
                    
                    <button
                      type="button"
                      onClick={() => setRole('agent')}
                      className={cn(
                        "flex flex-col items-center gap-3 rounded-xl border-2 p-4 transition-all text-center",
                        role === 'agent' 
                          ? "border-sky-500 bg-sky-50 text-sky-700 shadow-sm" 
                          : "border-slate-200 bg-white text-slate-400 hover:border-slate-300"
                      )}
                    >
                      <Briefcase className={cn("h-6 w-6", role === 'agent' ? "text-sky-600" : "text-slate-300")} />
                      <div className="text-xs font-bold uppercase tracking-widest">Agent</div>
                    </button>
                    <input type="hidden" name="role" value={role} />
                  </div>
                  <InputError message={errors.role} />
                </div>

                <div className="flex items-start gap-3">
                  <Checkbox 
                    id="terms_accepted"
                    checked={data.terms_accepted}
                    onCheckedChange={(checked) => setData('terms_accepted', checked as boolean)}
                    className="mt-1 border-slate-300 data-[state=checked]:bg-sky-500 data-[state=checked]:border-sky-500"
                    required
                  />
                  <Label htmlFor="terms_accepted" className="text-sm text-slate-600 dark:text-slate-400 cursor-pointer leading-relaxed">
                    J'accepte les{' '}
                    <a href="/mentions-legales" target="_blank" className="text-sky-600 hover:underline font-medium">
                      Mentions légales
                    </a>{' '}
                    et la{' '}
                    <a href="/confidentialite" target="_blank" className="text-sky-600 hover:underline font-medium">
                      Politique de confidentialité
                    </a>
                  </Label>
                </div>
                <InputError message={errors.terms_accepted} />

                {role === 'client' ? (
                  <Button type="submit" disabled={!data.terms_accepted} className="w-full bg-gradient-to-r from-sky-500 to-sky-600 hover:from-sky-600 hover:to-sky-700 text-white h-12 rounded-xl text-base font-bold shadow-lg shadow-sky-500/30 transition-all hover:translate-y-[-2px] active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0">
                    {processing && <Spinner className="mr-2" />}
                    Créer mon compte client
                  </Button>
                ) : (
                  <Button type="button" onClick={nextStep} disabled={!data.terms_accepted} className="w-full bg-gradient-to-r from-sky-500 to-sky-600 hover:from-sky-600 hover:to-sky-700 text-white h-12 rounded-xl text-base font-bold shadow-lg shadow-sky-500/30 transition-all hover:translate-y-[-2px] active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0">
                    Continuer
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                )}

                <div className="relative py-2">
                  <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-slate-200 dark:border-slate-700" /></div>
                  <div className="relative flex justify-center text-xs uppercase tracking-widest"><span className="bg-white dark:bg-slate-900 px-4 text-slate-400 font-medium">Ou</span></div>
                </div>

                <GoogleLoginButton text="Continuer avec Google" role={role} />

                <div className="text-center text-sm text-slate-500 dark:text-slate-400 mt-4">
                  Déjà membre ? <TextLink href={login()} className="font-bold text-sky-600 hover:text-sky-700 transition-colors">Se connecter</TextLink>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="grid gap-6">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="grid gap-2">
                      <Label className="text-sm font-semibold text-slate-700">Type d'agent</Label>
                      <Select 
                        name="agent_type" 
                        defaultValue={data.agent_type || "individual"}
                        onValueChange={(val) => setData('agent_type', val)}
                      >
                        <SelectTrigger className="h-11 rounded-xl border-slate-200 bg-white text-slate-900 focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20">
                          <SelectValue placeholder="Choix" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="individual">Indépendant</SelectItem>
                          <SelectItem value="company">Agence / Société</SelectItem>
                        </SelectContent>
                      </Select>
                      <InputError message={errors.agent_type} />
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="phone" className="text-sm font-semibold text-slate-700">Téléphone professionnel</Label>
                      <input
                        id="phone"
                        type="tel"
                        value={data.phone}
                        onChange={(e) => setData('phone', e.target.value)}
                        placeholder="+212 600 000 000"
                        className={inputStyles}
                      />
                      <InputError message={errors.phone} />
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="grid gap-2">
                      <Label htmlFor="experience_years" className="text-sm font-semibold text-slate-700">Expérience (Années)</Label>
                      <input
                        id="experience_years"
                        type="number"
                        min="0"
                        required
                        value={data.experience_years}
                        onChange={(e) => setData('experience_years', e.target.value)}
                        placeholder="Ex: 5"
                        className={inputStyles}
                      />
                      <InputError message={errors.experience_years} />
                    </div>

                    <div className="grid gap-2">
                      <Label className="text-sm font-semibold text-slate-700">Surface maximale supportée</Label>
                      <Select 
                        name="max_surface_area" 
                        defaultValue={data.max_surface_area || "medium"}
                        onValueChange={(val) => setData('max_surface_area', val)}
                      >
                        <SelectTrigger className="h-11 rounded-xl border-slate-200 bg-white text-slate-900 focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20">
                          <SelectValue placeholder="Surface max" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="small">Petite (- 50 m²)</SelectItem>
                          <SelectItem value="medium">Moyenne (- 100 m²)</SelectItem>
                          <SelectItem value="large">Grande (- 200 m²)</SelectItem>
                          <SelectItem value="extra">Illimitée (+ 200 m²)</SelectItem>
                        </SelectContent>
                      </Select>
                      <InputError message={errors.max_surface_area} />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Label className="text-sm font-semibold text-slate-700">Types de biens supportés</Label>
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                      {['appartement', 'maison', 'villa', 'bureau'].map((type) => (
                        <div key={type} className="flex items-center gap-2">
                          <Checkbox 
                            id={`property-${type}`}
                            checked={data.supported_property_types?.includes(type)}
                            onCheckedChange={(checked) => {
                              const current = data.supported_property_types || [];
                              const next = checked 
                                ? [...current, type]
                                : current.filter((t: string) => t !== type);
                              setData('supported_property_types', next);
                            }}
                            className="border-slate-300 data-[state=checked]:bg-sky-500 data-[state=checked]:border-sky-500"
                          />
                          <Label htmlFor={`property-${type}`} className="text-xs font-medium capitalize text-slate-600 cursor-pointer">
                            {type}
                          </Label>
                        </div>
                      ))}
                    </div>
                    <InputError message={errors.supported_property_types} />
                  </div>
                </div>

                <div className="flex gap-4">
                  <Button type="button" onClick={prevStep} variant="outline" className="flex-1 h-12 rounded-xl text-slate-500 font-bold border-slate-200 hover:bg-slate-50 transition-all">
                    Retour
                  </Button>
                  <Button type="submit" className="flex-[2] bg-gradient-to-r from-sky-500 to-sky-600 hover:from-sky-600 hover:to-sky-700 text-white h-12 rounded-xl text-base font-bold shadow-lg shadow-sky-500/30 transition-all hover:translate-y-[-2px] active:translate-y-0">
                    {processing && <Spinner className="mr-2" />}
                    Finaliser mon inscription
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </form>
    </AuthLayout>
  );
}
