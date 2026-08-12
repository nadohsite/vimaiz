<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
        }
        .header {
            background: linear-gradient(135deg, #0284c7 0%, #0369a1 100%);
            color: white;
            padding: 18px 24px 16px;
            text-align: center;
        }
        .header img {
            width: 140px;
            height: auto;
            max-height: 40px;
            border: 0;
            display: block;
            margin: 0 auto;
        }
        .header-slogan {
            margin: 10px 0 0;
            color: #e0f2fe;
            font-size: 14px;
            line-height: 1.4;
            font-weight: 400;
        }
        .content {
            background-color: #f8fafc;
            padding: 30px;
            border: 1px solid #e2e8f0;
        }
        .field {
            margin-bottom: 15px;
        }
        .field strong {
            color: #0ea5e9;
        }
        .message-box {
            background-color: white;
            padding: 15px;
            border-left: 4px solid #0ea5e9;
            margin-top: 10px;
        }
    </style>
</head>
<body>
    <div class="container">
        @php
            $logoSrc = \App\Support\EmailBranding::logoSrc($message ?? null);
        @endphp
        <div class="header">
            @if($logoSrc)
            <a href="{{ config('app.url') }}" style="display:inline-block;text-decoration:none;line-height:0;">
                <img
                    src="{{ $logoSrc }}"
                    alt="Vimaiz"
                    width="140"
                    height="37"
                    style="width: 140px; height: auto; max-height: 40px; border: 0; display: block; margin: 0 auto;"
                >
            </a>
            @endif
            <p class="header-slogan">
                La décoration attire le regard. La propreté inspire confiance.
            </p>
            <h1 style="margin: 12px 0 0; font-size: 18px; color: #ffffff;">Nouveau message de contact</h1>
        </div>
        <div class="content">
            <div class="field">
                <strong>Nom :</strong> {{ $name }}
            </div>
            <div class="field">
                <strong>Email :</strong> <a href="mailto:{{ $email }}">{{ $email }}</a>
            </div>
            <div class="field">
                <strong>Sujet :</strong> {{ $subject }}
            </div>
            <div class="field">
                <strong>Message :</strong>
                <div class="message-box">
                    {!! nl2br(e($content)) !!}
                </div>
            </div>
        </div>
    </div>
</body>
</html>
