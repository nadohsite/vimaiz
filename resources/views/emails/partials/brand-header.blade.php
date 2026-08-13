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
<p class="header-slogan" style="margin:10px 0 0;padding:0 8px;color:#e0f2fe;font-size:14px;line-height:1.4;font-weight:400;text-align:center;-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
    {{ \App\Support\EmailBranding::SLOGAN }}
</p>
