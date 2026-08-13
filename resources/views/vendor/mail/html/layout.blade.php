<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" lang="{{ str_replace('_', '-', app()->getLocale()) }}">
<head>
<title>{{ config('app.name') }}</title>
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
<meta name="color-scheme" content="light">
<meta name="supported-color-schemes" content="light">
<meta name="format-detection" content="telephone=no,date=no,address=no,email=no">
<style>
:root {
color-scheme: light;
supported-color-schemes: light;
}

@media only screen and (max-width: 600px) {
.outer-gutter { padding: 16px 10px !important; }
.inner-body { width: 100% !important; }
.header { padding: 18px 16px 16px !important; }
.content-cell { padding: 24px 18px 22px !important; }
.content-cell h1 { font-size: 20px !important; }
.footer { padding: 20px 18px !important; }
.footer p { font-size: 12px !important; }
}

@media only screen and (max-width: 500px) {
.button {
display: block !important;
text-align: center !important;
}
}
</style>
{!! $head ?? '' !!}
</head>
<body style="margin:0;padding:0;background-color:#f8fafc;-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%;">

<table class="wrapper" width="100%" cellpadding="0" cellspacing="0" role="presentation" style="background-color:#f8fafc;-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%;">
<tr>
<td align="center" class="outer-gutter" style="padding: 32px 16px;">
<table class="inner-body" align="center" width="600" cellpadding="0" cellspacing="0" role="presentation" style="width:100%;max-width:600px;background-color:#ffffff;border-radius:12px;overflow:hidden;-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%;">
{!! $header ?? '' !!}

<!-- Email Body -->
<tr>
<td class="content-cell" align="left" style="padding:32px 28px 28px;text-align:left;color:#475569;">
{!! Illuminate\Mail\Markdown::parse($slot) !!}

{!! $subcopy ?? '' !!}
</td>
</tr>

{!! $footer ?? '' !!}
</table>
</td>
</tr>
</table>
</body>
</html>
