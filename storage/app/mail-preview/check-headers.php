<?php

/**
 * Contrôle d'uniformité des entêtes de mails.
 * Extrait le bloc <td class="header"> de chaque message produit,
 * neutralise l'identifiant d'image (unique par envoi) puis compare les empreintes.
 */
$sources = [];

// 1. Messages passés par le mailer "log"
$logPath = __DIR__.'/../../logs/laravel.log';
$offset = (int) ($argv[1] ?? 0);
if (is_file($logPath)) {
    $fh = fopen($logPath, 'r');
    fseek($fh, $offset);
    $log = quoted_printable_decode(stream_get_contents($fh));
    $messages = preg_split('/Message-ID:/', $log);
    array_shift($messages);
    foreach ($messages as $message) {
        preg_match('/Subject: (.*)/', $message, $m);
        $label = trim($m[1] ?? '?');
        if (str_starts_with($label, '=?')) {
            $label = iconv_mime_decode($label, 0, 'UTF-8');
        }
        $sources[count($sources).'. '.$label] = $message;
    }
}

// 2. Rendus écrits directement sur disque
foreach (glob(__DIR__.'/rendered-*.html') as $file) {
    $sources[basename($file, '.html')] = file_get_contents($file);
}

$fingerprints = [];

foreach ($sources as $label => $html) {
    if (! preg_match('/<td[^>]*class="header"[^>]*>(.*?)<\/td>/s', $html, $m)) {
        printf("%-46.46s %s\n", mb_substr($label, 0, 46), 'AUCUNE ENTETE TROUVEE');

        continue;
    }

    $header = $m[0];
    $header = preg_replace('/src="[^"]*"/', 'src="LOGO"', $header);
    $header = preg_replace('/\s+/', ' ', $header);
    $header = str_replace('> <', '><', $header);

    $hash = substr(md5($header), 0, 8);
    $fingerprints[$hash][] = $label;
}

echo "Empreintes d'entête distinctes : ".count($fingerprints)."\n\n";

foreach ($fingerprints as $hash => $labels) {
    echo "[$hash] ".count($labels)." mail(s)\n";
    foreach ($labels as $label) {
        echo '   - '.mb_substr($label, 0, 60)."\n";
    }
    echo "\n";
}
