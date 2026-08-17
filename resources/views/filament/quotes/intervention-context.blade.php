<div class="vimaiz-bien">
    <div class="vimaiz-bien-card">
        <div class="vimaiz-bien-header">
            @include('filament.quotes.lucide-icon', ['name' => 'home', 'class' => 'vimaiz-bien-icon'])
            <span>Bien</span>
        </div>

        <div class="vimaiz-bien-body">
            <p class="vimaiz-bien-name">{{ $context['name'] }}</p>

            @if ($context['show_type'] && $context['type'] !== '—')
                <p class="vimaiz-bien-muted vimaiz-bien-type">{{ $context['type'] }}</p>
            @endif

            <p class="vimaiz-bien-muted vimaiz-bien-address">
                @include('filament.quotes.lucide-icon', ['name' => 'map-pin', 'class' => 'vimaiz-bien-pin'])
                <span>{{ $context['address_line1'] }}</span>
            </p>
            @if (filled($context['address_line2']))
                <p class="vimaiz-bien-muted">{{ $context['address_line2'] }}</p>
            @endif
            <p class="vimaiz-bien-muted">{{ trim($context['postal_code'].' '.$context['city']) }}</p>

            <div class="vimaiz-bien-chars">
                <p class="vimaiz-bien-chars-title">Caractéristiques</p>
                <div class="vimaiz-bien-grid">
                    @foreach ($context['characteristics'] as $item)
                        <div class="vimaiz-bien-tile">
                            @include('filament.quotes.lucide-icon', ['name' => $item['icon'], 'class' => 'vimaiz-bien-icon'])
                            <div>
                                <p class="vimaiz-bien-tile-label">{{ $item['label'] }}</p>
                                <p class="vimaiz-bien-tile-value">{{ $item['value'] }}</p>
                            </div>
                        </div>
                    @endforeach
                </div>
            </div>
        </div>
    </div>
</div>
