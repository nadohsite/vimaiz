@php
    $logoSrc = \App\Support\EmailBranding::logoSrc($message ?? null);
@endphp
<div class="header" style="background: linear-gradient(135deg, #0284c7 0%, #0369a1 100%); background-color: #0284c7; padding: 18px 24px 16px; text-align: center;">
    @if($logoSrc)
    <a href="{{ config('app.url') }}" class="logo" style="display: inline-block; text-decoration: none; line-height: 0;">
        <img
            src="{{ $logoSrc }}"
            alt="Vimaiz"
            width="140"
            height="37"
            style="width: 140px; height: auto; max-height: 40px; border: 0; display: block; margin: 0 auto;"
        >
    </a>
    @endif
    <p class="header-slogan" style="margin: 10px 0 0; padding: 0 8px; color: #e0f2fe; font-size: 14px; line-height: 1.4; font-weight: 400; text-align: center;">
        La décoration attire le regard. La propreté inspire confiance.
    </p>
</div>
