<x-mail::message>
# Bonjour {{ $contactMessage->name }},

Merci de nous avoir contacté. Voici notre réponse à votre message :

---

{!! nl2br(e($replyMessage)) !!}

---

**Votre message original :**
> **Sujet :** {{ $contactMessage->subject }}
> 
> {{ $contactMessage->message }}

Cordialement,<br>
L'équipe {{ config('app.name') }}

<x-mail::button :url="config('app.url')">
Visiter notre site
</x-mail::button>

</x-mail::message>
