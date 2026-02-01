# Configuration du Système de Chat VIMAIZ

## 📋 Statut actuel

Le système de chat est **fonctionnel** et prêt à l'emploi. Il fonctionne en mode "refresh" (les nouveaux messages apparaissent au rechargement de la page).

---

## 🏗️ Architecture

### Backend (Laravel)

| Fichier | Description |
|---------|-------------|
| `app/Http/Controllers/ConversationController.php` | Controller principal (index, show, store, sendMessage) |
| `app/Models/Conversation.php` | Modèle conversation (client_id, agent_id, booking_id) |
| `app/Models/Message.php` | Modèle message (sender_id, message, is_read) |
| `app/Notifications/NewMessageNotification.php` | Notification automatique nouveau message |

### Frontend (React/Inertia)

| Fichier | Description |
|---------|-------------|
| `resources/js/pages/Messages/Index.tsx` | Liste des conversations |
| `resources/js/pages/Messages/Show.tsx` | Interface chat (envoi/réception messages) |

### Routes

```php
Route::get('/messages', [ConversationController::class, 'index'])->name('messages.index');
Route::get('/messages/{conversation}', [ConversationController::class, 'show'])->name('messages.show');
Route::post('/messages', [ConversationController::class, 'store'])->name('messages.store');
Route::post('/messages/{conversation}/send', [ConversationController::class, 'sendMessage'])->name('messages.send');
```

---

## 🧪 Tester le système de chat

### 1. Créer une conversation de test

```bash
php artisan tinker
```

```php
// Créer une conversation entre un client et un agent
$conversation = \App\Models\Conversation::create([
    'client_id' => 1,  // Remplacer par l'ID d'un utilisateur client
    'agent_id' => 2,   // Remplacer par l'ID d'un utilisateur agent
]);

// Ajouter un message initial
\App\Models\Message::create([
    'conversation_id' => $conversation->id,
    'sender_id' => 1,  // ID de l'expéditeur
    'message' => 'Bonjour, j\'ai une question concernant ma réservation.',
]);
```

### 2. Accéder au chat

- **Client** : Se connecter et aller sur `/messages`
- **Agent** : Se connecter et aller sur `/messages`

---

## ⚡ Option : Temps réel avec Laravel Reverb

Pour avoir les messages en temps réel (sans recharger la page), suivez ces étapes :

### Étape 1 : Installer Laravel Reverb

```bash
composer require laravel/reverb
php artisan reverb:install
```

### Étape 2 : Configurer `.env`

```env
BROADCAST_CONNECTION=reverb

REVERB_APP_ID=vimaiz-chat
REVERB_APP_KEY=votre-cle-reverb
REVERB_APP_SECRET=votre-secret-reverb
REVERB_HOST=localhost
REVERB_PORT=8080
REVERB_SCHEME=http

VITE_REVERB_APP_KEY="${REVERB_APP_KEY}"
VITE_REVERB_HOST="${REVERB_HOST}"
VITE_REVERB_PORT="${REVERB_PORT}"
VITE_REVERB_SCHEME="${REVERB_SCHEME}"
```

### Étape 3 : Créer l'événement de broadcast

Créer `app/Events/NewMessageEvent.php` :

```php
<?php

namespace App\Events;

use App\Models\Message;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class NewMessageEvent implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(public Message $message) {}

    public function broadcastOn(): array
    {
        return [
            new PrivateChannel('conversation.' . $this->message->conversation_id),
        ];
    }

    public function broadcastWith(): array
    {
        return [
            'id' => $this->message->id,
            'message' => $this->message->message,
            'sender_id' => $this->message->sender_id,
            'sender_name' => $this->message->sender->name,
            'created_at' => $this->message->created_at->toISOString(),
        ];
    }
}
```

### Étape 4 : Configurer les canaux

Dans `routes/channels.php` :

```php
Broadcast::channel('conversation.{conversationId}', function ($user, $conversationId) {
    $conversation = \App\Models\Conversation::find($conversationId);
    return $conversation && 
           ($conversation->client_id === $user->id || $conversation->agent_id === $user->id);
});
```

### Étape 5 : Dispatcher l'événement

Dans `app/Models/Message.php`, modifier le boot :

```php
static::created(function ($message) {
    // ... code existant ...
    
    // Broadcast l'événement
    event(new \App\Events\NewMessageEvent($message));
});
```

### Étape 6 : Installer Echo côté frontend

```bash
npm install laravel-echo pusher-js
```

Dans `resources/js/bootstrap.js` :

```javascript
import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

window.Pusher = Pusher;

window.Echo = new Echo({
    broadcaster: 'reverb',
    key: import.meta.env.VITE_REVERB_APP_KEY,
    wsHost: import.meta.env.VITE_REVERB_HOST,
    wsPort: import.meta.env.VITE_REVERB_PORT,
    wssPort: import.meta.env.VITE_REVERB_PORT,
    forceTLS: (import.meta.env.VITE_REVERB_SCHEME ?? 'https') === 'https',
    enabledTransports: ['ws', 'wss'],
});
```

### Étape 7 : Écouter dans le composant React

Dans `Messages/Show.tsx`, ajouter :

```typescript
useEffect(() => {
    const channel = window.Echo.private(`conversation.${conversation.id}`);
    
    channel.listen('NewMessageEvent', (e: any) => {
        // Ajouter le nouveau message à la liste
        setMessages(prev => [...prev, e]);
    });

    return () => {
        channel.stopListening('NewMessageEvent');
    };
}, [conversation.id]);
```

### Étape 8 : Lancer les serveurs

```bash
# Terminal 1 - Serveur Laravel
php artisan serve

# Terminal 2 - Serveur Reverb (WebSocket)
php artisan reverb:start

# Terminal 3 - Vite
npm run dev

# Terminal 4 - Queue (pour les notifications)
php artisan queue:work
```

---

## 🔒 Sécurité

- Les conversations sont protégées : seuls le client et l'agent participants peuvent y accéder
- Les messages sont validés côté serveur (max 5000 caractères)
- Les notifications sont envoyées uniquement au destinataire

---

## 📱 Fonctionnalités disponibles

- [x] Liste des conversations avec compteur de messages non lus
- [x] Affichage des messages avec bulles (style messenger)
- [x] Envoi de messages texte
- [x] Marquage automatique comme lu
- [x] Notifications en base de données
- [x] Navigation dans sidebar (client + agent)

## 🚀 Fonctionnalités à ajouter (optionnel)

- [ ] Temps réel avec Reverb
- [ ] Envoi de pièces jointes
- [ ] Indicateur "en train d'écrire..."
- [ ] Notifications push mobile
- [ ] Recherche dans les messages
