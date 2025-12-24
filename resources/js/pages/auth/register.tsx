import GoogleLoginButton from '@/components/GoogleLoginButton';
import { login } from '@/routes';
import { useForm, Head } from '@inertiajs/react';

import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import AuthLayout from '@/layouts/auth-layout';
import { AnimatePresence, motion } from 'framer-motion';
import { Check, ChevronRight, User, Briefcase, Ruler, Home } from 'lucide-react';
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
  const [role, setRole] = useState('client');
  const [step, setStep] = useState(1);

  const { data, setData, post, processing, errors, reset } = useForm({
    name: '',
    email: '',
    password: '',
    password_confirmation: '',
    role: 'client', // Will be updated by effect
    agent_type: 'individual',
    phone: '',
    experience_years: '',
    max_surface_area: 'medium',
    supported_property_types: [] as string[],
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
      // Simple validation for step 1 could be added here if needed
      if (!data.name || !data.email || !data.password) {
          // You might want to trigger validation or show error
          // For now, let's allow moving but backend will validate. 
          // Better: We can check if fields are filled.
          // But errors are coming from backend usually.
      }
      setStep(2);
  };
  const prevStep = () => setStep(1);

  return (
    <AuthLayout
      title={step === 1 ? "Créer un compte" : "Dites-en plus sur vous"}
      description={step === 1 ? "Entrez vos coordonnées pour commencer" : "Ces informations nous aideront à vous mettre en avant auprès des clients"}
    >
      <Head title="Inscription" />
      
      {/* Progress Bar (Visible only for Agents) */}
      {role === 'agent' && (
        <div className="mb-8 flex items-center justify-center gap-4">
          <div className={cn(
            "flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold transition-colors",
            step === 1 ? "bg-black text-white" : "bg-neutral-100 text-neutral-400"
          )}>1</div>
          <div className="h-px w-10 bg-neutral-100" />
          <div className={cn(
            "flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold transition-colors",
            step === 2 ? "bg-black text-white" : "bg-neutral-100 text-neutral-400"
          )}>2</div>
        </div>
      )}

      <form onSubmit={submit} className="flex flex-col gap-6">
        {/* ({ processing, errors, data, setData }) => ( */}
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
                      <Label htmlFor="name">Nom complet</Label>
                      <Input
                        id="name"
                        type="text"
                        required
                        name="name"
                        value={data.name}
                        onChange={(e) => setData('name', e.target.value)}
                        placeholder="Prénom et Nom"
                        className="bg-neutral-50 border-neutral-200 focus:bg-white transition-colors"
                      />
                      <InputError message={errors.name} />
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="email">Adresse email</Label>
                      <Input
                        id="email"
                        type="email"
                        required
                        name="email"
                        value={data.email}
                        onChange={(e) => setData('email', e.target.value)}
                        placeholder="email@exemple.com"
                        className="bg-neutral-50 border-neutral-200 focus:bg-white transition-colors"
                      />
                      <InputError message={errors.email} />
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="password">Mot de passe</Label>
                      <Input
                        id="password"
                        type="password"
                        required
                        name="password"
                        placeholder="••••••••"
                        className="bg-neutral-50 border-neutral-200 focus:bg-white transition-colors"
                      />
                      <InputError message={errors.password} />
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="password_confirmation">Confirmation</Label>
                      <Input
                        id="password_confirmation"
                        type="password"
                        required
                        name="password_confirmation"
                        placeholder="••••••••"
                        className="bg-neutral-50 border-neutral-200 focus:bg-white transition-colors"
                      />
                      <InputError message={errors.password_confirmation} />
                    </div>
                  </div>

                  <div className="grid gap-2">
                    <Label>Je souhaite m’inscrire en tant que</Label>
                    <div className="grid grid-cols-2 gap-4">
                      <button
                        type="button"
                        onClick={() => setRole('client')}
                        className={cn(
                          "flex flex-col items-center gap-3 rounded-xl border-2 p-4 transition-all text-center",
                          role === 'client' 
                            ? "border-black bg-neutral-50 text-black shadow-sm" 
                            : "border-neutral-100 bg-white text-neutral-400 hover:border-neutral-200"
                        )}
                      >
                        <User className={cn("h-6 w-6", role === 'client' ? "text-black" : "text-neutral-300")} />
                        <div className="text-xs font-bold uppercase tracking-widest">Client</div>
                      </button>
                      
                      <button
                        type="button"
                        onClick={() => setRole('agent')}
                        className={cn(
                          "flex flex-col items-center gap-3 rounded-xl border-2 p-4 transition-all text-center",
                          role === 'agent' 
                            ? "border-black bg-neutral-50 text-black shadow-sm" 
                            : "border-neutral-100 bg-white text-neutral-400 hover:border-neutral-200"
                        )}
                      >
                        <Briefcase className={cn("h-6 w-6", role === 'agent' ? "text-black" : "text-neutral-300")} />
                        <div className="text-xs font-bold uppercase tracking-widest">Agent</div>
                      </button>
                      <input type="hidden" name="role" value={role} />
                    </div>
                    <InputError message={errors.role} />
                  </div>

                  {role === 'client' ? (
                    <Button type="submit" className="w-full bg-black hover:bg-neutral-800 text-white h-12 rounded-xl text-base font-bold shadow-lg shadow-black/10 transition-all hover:translate-y-[-2px] active:translate-y-0">
                      {processing && <Spinner className="mr-2" />}
                      Créer mon compte client
                    </Button>
                  ) : (
                    <Button type="button" onClick={nextStep} className="w-full bg-black hover:bg-neutral-800 text-white h-12 rounded-xl text-base font-bold shadow-lg shadow-black/10 transition-all hover:translate-y-[-2px] active:translate-y-0">
                      Continuer
                      <ChevronRight className="ml-2 h-4 w-4" />
                    </Button>
                  )}

                  <div className="relative py-2">
                    <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-neutral-100" /></div>
                    <div className="relative flex justify-center text-xs uppercase tracking-widest"><span className="bg-white px-4 text-neutral-400 font-bold">Ou</span></div>
                  </div>

                  <GoogleLoginButton text="Continuer avec Google" role={role} />

                  <div className="text-center text-sm text-neutral-500 mt-4">
                    Déjà membre ? <TextLink href={login()} className="font-bold text-black border-b-2 border-black/10 hover:border-black transition-colors">Se connecter</TextLink>
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
                        <Label>Type d’agent</Label>
                        <Select 
                          name="agent_type" 
                          defaultValue={data.agent_type || "individual"}
                          onValueChange={(val) => setData('agent_type', val)}
                        >
                          <SelectTrigger className="bg-neutral-50 border-neutral-200 h-11 rounded-xl">
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
                        <Label htmlFor="phone">Téléphone professionnel</Label>
                        <Input
                          id="phone"
                          type="tel"
                          value={data.phone}
                          onChange={(e) => setData('phone', e.target.value)}
                          placeholder="+212 600 000 000"
                          className="bg-neutral-50 border-neutral-200 h-11 rounded-xl"
                        />
                        <InputError message={errors.phone} />
                      </div>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="grid gap-2">
                        <Label htmlFor="experience_years">Expérience (Années)</Label>
                        <Input
                          id="experience_years"
                          type="number"
                          min="0"
                          required
                          value={data.experience_years}
                          onChange={(e) => setData('experience_years', e.target.value)}
                          placeholder="Ex: 5"
                          className="bg-neutral-50 border-neutral-200 h-11 rounded-xl"
                        />
                        <InputError message={errors.experience_years} />
                      </div>

                      <div className="grid gap-2">
                        <Label>Surface maximale supportée</Label>
                        <Select 
                          name="max_surface_area" 
                          defaultValue={data.max_surface_area || "medium"}
                          onValueChange={(val) => setData('max_surface_area', val)}
                        >
                          <SelectTrigger className="bg-neutral-50 border-neutral-200 h-11 rounded-xl">
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
                      <Label>Types de biens supportés</Label>
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
                              className="border-neutral-300"
                            />
                            <Label htmlFor={`property-${type}`} className="text-xs font-medium capitalize text-neutral-600 cursor-pointer">
                              {type}
                            </Label>
                          </div>
                        ))}
                      </div>
                      <InputError message={errors.supported_property_types} />
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <Button type="button" onClick={prevStep} variant="outline" className="flex-1 h-12 rounded-xl text-neutral-500 font-bold border-neutral-200 hover:bg-neutral-50 transition-all">
                      Retour
                    </Button>
                    <Button type="submit" className="flex-[2] bg-black hover:bg-neutral-800 text-white h-12 rounded-xl text-base font-bold shadow-lg shadow-black/10 transition-all hover:translate-y-[-2px] active:translate-y-0">
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
