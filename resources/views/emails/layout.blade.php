<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>@yield('title') - VIMAIZ</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            line-height: 1.6;
            color: #334155;
            background-color: #f8fafc;
            margin: 0;
            padding: 0;
        }
        .wrapper {
            max-width: 600px;
            margin: 0 auto;
            padding: 40px 20px;
        }
        .container {
            background-color: #ffffff;
            border-radius: 12px;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
            overflow: hidden;
        }
        .header {
            background: linear-gradient(135deg, #0284c7 0%, #0369a1 100%);
            padding: 30px;
            text-align: center;
        }
        .logo {
            color: #ffffff;
            font-size: 28px;
            font-weight: bold;
            text-decoration: none;
        }
        .content {
            padding: 40px 30px;
        }
        h1 {
            color: #0f172a;
            font-size: 24px;
            margin: 0 0 20px 0;
        }
        p {
            margin: 0 0 16px 0;
            color: #475569;
        }
        .button {
            display: inline-block;
            background: linear-gradient(135deg, #0284c7 0%, #0369a1 100%);
            color: #ffffff !important;
            padding: 14px 28px;
            border-radius: 8px;
            text-decoration: none;
            font-weight: 600;
            margin: 20px 0;
        }
        .button:hover {
            background: linear-gradient(135deg, #0369a1 0%, #075985 100%);
        }
        .info-box {
            background-color: #f0f9ff;
            border-left: 4px solid #0284c7;
            padding: 16px 20px;
            margin: 20px 0;
            border-radius: 0 8px 8px 0;
        }
        .info-box p {
            margin: 4px 0;
            color: #0369a1;
        }
        .info-box strong {
            color: #0c4a6e;
        }
        .success-box {
            background-color: #f0fdf4;
            border-left: 4px solid #22c55e;
            padding: 16px 20px;
            margin: 20px 0;
            border-radius: 0 8px 8px 0;
        }
        .success-box p {
            margin: 4px 0;
            color: #166534;
        }
        .warning-box {
            background-color: #fffbeb;
            border-left: 4px solid #f59e0b;
            padding: 16px 20px;
            margin: 20px 0;
            border-radius: 0 8px 8px 0;
        }
        .warning-box p {
            margin: 4px 0;
            color: #92400e;
        }
        .footer {
            background-color: #f8fafc;
            padding: 30px;
            text-align: center;
            border-top: 1px solid #e2e8f0;
        }
        .footer p {
            font-size: 13px;
            color: #94a3b8;
            margin: 4px 0;
        }
        .footer a {
            color: #0284c7;
            text-decoration: none;
        }
        .social-links {
            margin-top: 16px;
        }
        .social-links a {
            display: inline-block;
            margin: 0 8px;
            color: #64748b;
        }
    </style>
</head>
<body>
    <div class="wrapper">
        <div class="container">
            <div class="header">
                <a href="{{ config('app.url') }}" class="logo">VIMAIZ</a>
            </div>
            <div class="content">
                @yield('content')
            </div>
            <div class="footer">
                <p>© {{ date('Y') }} VIMAIZ - Tous droits réservés</p>
                <p>
                    <a href="{{ config('app.url') }}">vimaiz.fr</a> |
                    <a href="mailto:contact@vimaiz.fr">contact@vimaiz.fr</a>
                </p>
                <p style="margin-top: 16px; font-size: 11px;">
                    Cet email a été envoyé à {{ $notifiable->email ?? '' }}.<br>
                    Si vous n'avez pas demandé cet email, veuillez nous contacter.
                </p>
            </div>
        </div>
    </div>
</body>
</html>
