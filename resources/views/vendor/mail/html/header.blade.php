@props(['url'])
<tr>
<td class="header" style="background-color: #0284c7; padding: 36px 0; text-align: center;">
<a href="{{ $url }}" style="display: inline-block;">
<img
    src="{{ rtrim(config('app.url'), '/') }}/vimaiz-logo-email-white.png"
    class="logo"
    alt="Vimaiz"
    width="96"
    height="96"
    style="height: 96px; width: 96px; max-height: 96px; border: 0; display: block; margin: 0 auto;"
>
</a>
</td>
</tr>
