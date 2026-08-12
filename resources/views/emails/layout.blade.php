<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <title>@yield('title') - VIMAIZ</title>
    <!--[if mso]>
    <style type="text/css">
        body, table, td, a { font-family: Arial, Helvetica, sans-serif !important; }
    </style>
    <![endif]-->
    <style>
        body {
            margin: 0 !important;
            padding: 0 !important;
            width: 100% !important;
            background-color: #f8fafc;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            line-height: 1.6;
            color: #334155;
            -webkit-text-size-adjust: 100%;
            -ms-text-size-adjust: 100%;
        }
        table { border-collapse: collapse; mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
        img { border: 0; outline: none; text-decoration: none; -ms-interpolation-mode: bicubic; }
        a { color: #0284c7; }
        .wrapper { width: 100%; background-color: #f8fafc; }
        .container { width: 100%; max-width: 600px; background-color: #ffffff; border-radius: 12px; overflow: hidden; }
        .header {
            background-color: #0284c7;
            background-image: linear-gradient(135deg, #0284c7 0%, #0369a1 100%);
            padding: 20px 24px 18px;
        }
        .header-slogan {
            margin: 10px 0 0;
            padding: 0;
            color: #e0f2fe !important;
            font-size: 13px;
            line-height: 1.45;
            font-weight: 400;
        }
        .content {
            padding: 32px 28px 28px;
            text-align: left;
            color: #475569;
        }
        .content h1 {
            margin: 0 0 16px;
            padding: 0;
            color: #0f172a !important;
            font-size: 22px;
            line-height: 1.3;
            font-weight: 700;
            text-align: left !important;
        }
        .content p {
            margin: 0 0 14px;
            padding: 0;
            color: #475569 !important;
            font-size: 15px;
            line-height: 1.6;
            text-align: left !important;
        }
        .content .cta {
            margin: 24px 0;
            text-align: center !important;
        }
        .button {
            display: inline-block;
            background-color: #0284c7;
            background-image: linear-gradient(135deg, #0284c7 0%, #0369a1 100%);
            color: #ffffff !important;
            padding: 14px 28px;
            border-radius: 8px;
            text-decoration: none;
            font-weight: 600;
            font-size: 15px;
        }
        .info-box,
        .success-box,
        .warning-box {
            padding: 14px 16px;
            margin: 16px 0;
            border-radius: 0 8px 8px 0;
            text-align: left !important;
        }
        .info-box {
            background-color: #f0f9ff;
            border-left: 4px solid #0284c7;
        }
        .success-box {
            background-color: #f0fdf4;
            border-left: 4px solid #22c55e;
        }
        .warning-box {
            background-color: #fffbeb;
            border-left: 4px solid #f59e0b;
        }
        .info-box p,
        .success-box p,
        .warning-box p {
            margin: 4px 0 !important;
            text-align: left !important;
        }
        .info-box p { color: #0369a1 !important; }
        .info-box strong { color: #0c4a6e !important; }
        .success-box p { color: #166534 !important; }
        .warning-box p { color: #92400e !important; }
        .footer {
            background-color: #f8fafc;
            padding: 24px 28px;
            border-top: 1px solid #e2e8f0;
            text-align: center;
        }
        .footer p {
            margin: 4px 0;
            font-size: 13px;
            color: #94a3b8 !important;
            text-align: center !important;
        }
        .footer a { color: #0284c7; text-decoration: none; }
        .footer .meta {
            margin-top: 14px !important;
            font-size: 11px !important;
        }
    </style>
</head>
<body style="margin:0;padding:0;background-color:#f8fafc;">
    <table role="presentation" class="wrapper" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#f8fafc;">
        <tr>
            <td align="center" style="padding: 32px 16px;">
                <table role="presentation" class="container" width="600" cellpadding="0" cellspacing="0" border="0" style="width:100%;max-width:600px;background-color:#ffffff;border-radius:12px;overflow:hidden;">
                    <tr>
                        <td align="center" class="header" style="background-color:#0284c7;background-image:linear-gradient(135deg,#0284c7 0%,#0369a1 100%);padding:20px 24px 18px;text-align:center;">
                            @include('emails.partials.brand-header')
                        </td>
                    </tr>
                    <tr>
                        <td class="content" align="left" style="padding:32px 28px 28px;text-align:left;color:#475569;">
                            @yield('content')
                        </td>
                    </tr>
                    <tr>
                        <td class="footer" align="center" style="background-color:#f8fafc;padding:24px 28px;border-top:1px solid #e2e8f0;text-align:center;">
                            <p style="margin:4px 0;font-size:13px;color:#94a3b8;text-align:center;">© {{ date('Y') }} Vimaiz - Tous droits réservés</p>
                            <p style="margin:4px 0;font-size:13px;color:#94a3b8;text-align:center;">
                                <a href="{{ config('app.url') }}" style="color:#0284c7;text-decoration:none;">vimaiz.com</a>
                                &nbsp;|&nbsp;
                                <a href="mailto:contact@vimaiz.com" style="color:#0284c7;text-decoration:none;">contact@vimaiz.com</a>
                            </p>
                            <p class="meta" style="margin:14px 0 0;font-size:11px;color:#94a3b8;text-align:center;">
                                Cet email a été envoyé à {{ $notifiable->email ?? $email ?? '' }}.<br>
                                Si vous n'avez pas demandé cet email, veuillez nous contacter.
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
