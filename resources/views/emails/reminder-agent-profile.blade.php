@extends('emails.layout')

@section('title', 'Complétez votre profil intervenant')

@section('content')
    <h1>Votre profil est presque prêt 🚀</h1>

    <p>Bonjour {{ $notifiable->preferredFirstName() ?: $notifiable->name }},</p>

    <p>
        Vous avez commencé votre inscription comme intervenant sur VIMAIZ,
        mais votre profil n'est pas encore complet. Tant qu'il ne l'est pas,
        <strong>vous ne pouvez pas recevoir d'interventions</strong> — et des clients
        cherchent des intervenants en ce moment même.
    </p>

    @if (!empty($missingItems))
        <div class="warning-box">
            <p><strong>Il vous manque :</strong></p>
            @foreach ($missingItems as $item)
                <p>• {{ $item }}</p>
            @endforeach
        </div>
    @endif

    <p>Quelques minutes suffisent pour finaliser votre profil et commencer à gagner de l'argent.</p>

    <p style="text-align: center;">
        <a href="{{ url('/agent/documents') }}" class="button">
            Compléter mon profil
        </a>
    </p>

    <p>
        Besoin d'aide ? Répondez simplement à cet email ou écrivez-nous à
        <a href="mailto:contact@vimaiz.com">contact@vimaiz.com</a>.
    </p>

    <p>L'équipe VIMAIZ</p>
@endsection
