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
            background-color: #0ea5e9;
            color: white;
            padding: 20px;
            text-align: center;
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
        <div class="header">
            <h1>Nouveau message de contact</h1>
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
