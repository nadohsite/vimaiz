@php
    $logoSrc = \App\Support\EmailBranding::logoSrc($message ?? null);
@endphp
@if($logoSrc)
<a href="{{ config('app.url') }}" style="display:inline-block;text-decoration:none;line-height:0;">
    <img
        src="{{ $logoSrc }}"
        alt="Vimaiz"
        width="140"
        height="37"
        style="width:140px;height:auto;max-height:40px;border:0;display:block;margin:0 auto;"
    >
</a>
@endif
<p class="header-slogan" style="margin:10px 0 0;padding:0;color:#e0f2fe;font-size:13px;line-height:1.45;font-weight:400;text-align:center;">
    La décoration attire le regard.<br>
    La propreté inspire confiance.
</p>
