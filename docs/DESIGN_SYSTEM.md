# 🎨 DESIGN SYSTEM – VIMAIZ

## Philosophie Design

VIMAIZ adopte un design **moderne, épuré et professionnel** inspiré d'Uber. 
Le code couleur principal est un **bleu évoquant le ménage, la propreté et la fraîcheur**.

---

## Palette de Couleurs

### Couleurs Principales

| Nom | Hex | Usage |
|-----|-----|-------|
| **Primary Blue** | `#0EA5E9` | Actions principales, CTA, liens |
| **Primary Dark** | `#0284C7` | Hover, états actifs |
| **Primary Light** | `#38BDF8` | Backgrounds légers |
| **Primary 50** | `#F0F9FF` | Backgrounds très légers |

### Couleurs Secondaires

| Nom | Hex | Usage |
|-----|-----|-------|
| **Slate 900** | `#0F172A` | Texte principal |
| **Slate 700** | `#334155` | Texte secondaire |
| **Slate 500** | `#64748B` | Texte tertiaire |
| **Slate 200** | `#E2E8F0` | Bordures |
| **Slate 100** | `#F1F5F9` | Backgrounds |
| **White** | `#FFFFFF` | Fond principal |

### Couleurs de Statut

| Nom | Hex | Usage |
|-----|-----|-------|
| **Success** | `#10B981` | Confirmations, succès |
| **Warning** | `#F59E0B` | Alertes, attention |
| **Error** | `#EF4444` | Erreurs, danger |
| **Info** | `#3B82F6` | Informations |

---

## Typographie

### Police

**Inter** - Police système moderne, lisible et professionnelle.

```css
font-family: 'Inter', system-ui, -apple-system, sans-serif;
```

### Échelle Typographique

| Niveau | Taille | Poids | Usage |
|--------|--------|-------|-------|
| **H1** | 48px / 3rem | 700 | Titre hero |
| **H2** | 36px / 2.25rem | 600 | Titres sections |
| **H3** | 24px / 1.5rem | 600 | Sous-titres |
| **H4** | 20px / 1.25rem | 500 | Titres cards |
| **Body** | 16px / 1rem | 400 | Texte courant |
| **Small** | 14px / 0.875rem | 400 | Labels, notes |
| **XSmall** | 12px / 0.75rem | 400 | Métadonnées |

---

## Composants UI

### Boutons

```tsx
// Primary Button
<Button className="bg-sky-500 hover:bg-sky-600 text-white">
  Faire le ménage
</Button>

// Secondary Button
<Button variant="outline" className="border-sky-500 text-sky-500 hover:bg-sky-50">
  En savoir plus
</Button>

// Ghost Button
<Button variant="ghost" className="text-sky-500 hover:bg-sky-50">
  Annuler
</Button>
```

### Cards

```tsx
<Card className="border border-slate-200 rounded-xl shadow-sm hover:shadow-md transition-shadow">
  <CardHeader>
    <CardTitle>Votre logement</CardTitle>
  </CardHeader>
  <CardContent>
    {/* Contenu */}
  </CardContent>
</Card>
```

### Inputs

```tsx
<Input 
  className="border-slate-200 focus:border-sky-500 focus:ring-sky-500 rounded-lg"
  placeholder="Entrez votre email"
/>
```

### Badges de Statut

```tsx
// En attente
<Badge className="bg-amber-100 text-amber-800">En attente</Badge>

// Confirmé
<Badge className="bg-green-100 text-green-800">Confirmé</Badge>

// En cours
<Badge className="bg-sky-100 text-sky-800">En cours</Badge>

// Terminé
<Badge className="bg-slate-100 text-slate-800">Terminé</Badge>
```

---

## Layout

### Espacements

| Nom | Valeur | Usage |
|-----|--------|-------|
| **xs** | 4px | Marges minimales |
| **sm** | 8px | Entre éléments proches |
| **md** | 16px | Padding cards |
| **lg** | 24px | Sections |
| **xl** | 32px | Entre sections |
| **2xl** | 48px | Hero, grandes sections |
| **3xl** | 64px | Espaces majeurs |

### Breakpoints

| Nom | Valeur | Description |
|-----|--------|-------------|
| **sm** | 640px | Mobile landscape |
| **md** | 768px | Tablette |
| **lg** | 1024px | Desktop |
| **xl** | 1280px | Large desktop |
| **2xl** | 1536px | Extra large |

---

## Iconographie

Utilisation de **Lucide React** pour les icônes.

### Icônes Principales

```tsx
import { 
  Home,           // Logement
  Sparkles,       // Ménage/Propreté
  Calendar,       // Planning
  Clock,          // Horaire
  MapPin,         // Localisation
  User,           // Profil
  CheckCircle,    // Validation
  AlertCircle,    // Attention
  Camera,         // Photos
  CreditCard,     // Paiement
  Wallet,         // Wallet agent
  FileText,       // Devis
} from 'lucide-react';
```

---

## Animations

Utilisation de **Motion** (Framer Motion) pour les animations.

### Transitions Standard

```tsx
// Fade in
<motion.div
  initial={{ opacity: 0 }}
  animate={{ opacity: 1 }}
  transition={{ duration: 0.3 }}
>

// Slide up
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.4 }}
>

// Scale
<motion.div
  whileHover={{ scale: 1.02 }}
  whileTap={{ scale: 0.98 }}
>
```

---

## Structure des Pages

### Page d'Accueil (Hero)

```
┌─────────────────────────────────────────┐
│  Logo    Menu                   Connexion│
├─────────────────────────────────────────┤
│                                          │
│       Planifiez votre ménage.           │
│       VIMAIZ s'occupe du reste.         │
│                                          │
│         [Demander un ménage]            │
│                                          │
├─────────────────────────────────────────┤
│     Comment ça marche ?                 │
│  ┌────┐  ┌────┐  ┌────┐  ┌────┐        │
│  │ 1  │  │ 2  │  │ 3  │  │ 4  │        │
│  └────┘  └────┘  └────┘  └────┘        │
├─────────────────────────────────────────┤
│     Devenez partenaire VIMAIZ           │
│         [Professionnels]                │
├─────────────────────────────────────────┤
│  Footer - À propos - Service - Contact  │
└─────────────────────────────────────────┘
```

### Dashboard Client

```
┌─────────────────────────────────────────┐
│  Logo     Dashboard      Profil  Logout │
├─────────────────────────────────────────┤
│  ┌──────────────────┐  ┌──────────────┐ │
│  │  Mes logements   │  │ Mes demandes │ │
│  │  [+ Ajouter]     │  │ [+ Nouveau]  │ │
│  └──────────────────┘  └──────────────┘ │
│                                          │
│  Dernières missions                      │
│  ┌─────────────────────────────────────┐│
│  │ Mission #1234 - Villa - Terminée   ││
│  │ Mission #1235 - Maison - En cours  ││
│  └─────────────────────────────────────┘│
└─────────────────────────────────────────┘
```

---

## Tailwind Configuration

```js
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#F0F9FF',
          100: '#E0F2FE',
          200: '#BAE6FD',
          300: '#7DD3FC',
          400: '#38BDF8',
          500: '#0EA5E9',  // Main
          600: '#0284C7',
          700: '#0369A1',
          800: '#075985',
          900: '#0C4A6E',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
};
```

---

## Accessibilité

- **Contraste** : Minimum 4.5:1 pour texte normal, 3:1 pour grand texte
- **Focus** : États focus visibles sur tous les éléments interactifs
- **ARIA** : Labels appropriés sur tous les formulaires
- **Navigation clavier** : Tous les éléments accessibles au clavier
