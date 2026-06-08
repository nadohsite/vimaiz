@if (config('broadcasting.default') !== 'null' && config('broadcasting.connections.reverb.key'))
    <script src="https://cdn.jsdelivr.net/npm/pusher-js@8.4.0/dist/web/pusher.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/laravel-echo@1.16.1/dist/echo.iife.js"></script>
    <script>
        window.Pusher = Pusher;

        window.Echo = new Echo({
            broadcaster: 'reverb',
            key: @js(config('broadcasting.connections.reverb.key')),
            wsHost: @js(config('broadcasting.connections.reverb.options.host')),
            wsPort: @js(config('broadcasting.connections.reverb.options.port') ?? 80),
            wssPort: @js(config('broadcasting.connections.reverb.options.port') ?? 443),
            forceTLS: @js((config('broadcasting.connections.reverb.options.scheme') ?? 'https') === 'https'),
            enabledTransports: ['ws', 'wss'],
            authEndpoint: '/broadcasting/auth',
        });

        window.dispatchEvent(new CustomEvent('EchoLoaded'));
    </script>
@endif
