<x-filament-panels::page>
    <style>
        .photo-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); gap: 1rem; }
        .photo-card { position: relative; border-radius: 0.75rem; overflow: hidden; background: #1f2937; aspect-ratio: 4/3; }
        .photo-card img { width: 100%; height: 100%; object-fit: cover; cursor: pointer; transition: transform 0.2s; }
        .photo-card:hover img { transform: scale(1.05); }
        .photo-card .overlay { position: absolute; bottom: 0; left: 0; right: 0; padding: 0.5rem; background: linear-gradient(transparent, rgba(0,0,0,0.8)); color: white; font-size: 0.75rem; }
        .photo-card .num { position: absolute; top: 0.5rem; right: 0.5rem; background: rgba(59, 130, 246, 0.9); color: white; padding: 0.25rem 0.5rem; border-radius: 9999px; font-size: 0.7rem; }
        .photo-card.after .num { background: rgba(34, 197, 94, 0.9); }
        .stats-row { display: flex; gap: 1rem; margin-bottom: 1.5rem; flex-wrap: wrap; }
        .stat-box { flex: 1; min-width: 150px; padding: 1.25rem; border-radius: 0.75rem; color: white; }
        .stat-box.blue { background: linear-gradient(135deg, #3b82f6, #2563eb); }
        .stat-box.green { background: linear-gradient(135deg, #22c55e, #16a34a); }
        .stat-box.purple { background: linear-gradient(135deg, #a855f7, #9333ea); }
        .stat-box .label { font-size: 0.875rem; opacity: 0.9; }
        .stat-box .value { font-size: 2rem; font-weight: 700; }
        .empty-box { text-align: center; padding: 2rem; background: rgba(0,0,0,0.2); border-radius: 0.75rem; color: #9ca3af; }
        #lightbox { position: fixed; inset: 0; z-index: 9999; background: rgba(0,0,0,0.95); display: none; align-items: center; justify-content: center; }
        #lightbox.show { display: flex; }
        #lightbox img { max-height: 85vh; max-width: 90vw; object-fit: contain; }
        #lightbox .btn { position: absolute; background: rgba(255,255,255,0.15); border: none; color: white; padding: 1rem; border-radius: 50%; cursor: pointer; font-size: 1.25rem; }
        #lightbox .btn:hover { background: rgba(255,255,255,0.25); }
        #lightbox .close { top: 1rem; right: 1rem; padding: 0.5rem 0.75rem; }
        #lightbox .prev { left: 1rem; top: 50%; transform: translateY(-50%); }
        #lightbox .next { right: 1rem; top: 50%; transform: translateY(-50%); }
        #lightbox .info { position: absolute; bottom: 1.5rem; left: 50%; transform: translateX(-50%); text-align: center; color: white; }
        .compare-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; }
        .compare-grid img { width: 100%; border-radius: 0.75rem; cursor: pointer; }
        @media (max-width: 640px) { .stats-row { flex-direction: column; } .compare-grid { grid-template-columns: 1fr; } }
    </style>

    <div id="lightbox" onclick="closeLightbox()">
        <button class="btn close" onclick="closeLightbox()">✕</button>
        <button class="btn prev" onclick="event.stopPropagation(); navLightbox(-1)">❮</button>
        <button class="btn next" onclick="event.stopPropagation(); navLightbox(1)">❯</button>
        <img id="lb-img" src="" alt="" onclick="event.stopPropagation()">
        <div class="info">
            <p id="lb-caption" style="background: rgba(0,0,0,0.5); padding: 0.5rem 1rem; border-radius: 0.5rem;"></p>
            <p id="lb-counter" style="opacity: 0.7; font-size: 0.875rem; margin-top: 0.5rem;"></p>
        </div>
    </div>

    <div class="stats-row">
        <div class="stat-box blue">
            <div class="label">Photos AVANT</div>
            <div class="value">{{ $this->getBeforePhotos()->count() }}</div>
        </div>
        <div class="stat-box green">
            <div class="label">Photos APRÈS</div>
            <div class="value">{{ $this->getAfterPhotos()->count() }}</div>
        </div>
        <div class="stat-box purple">
            <div class="label">Total</div>
            <div class="value">{{ $this->getBeforePhotos()->count() + $this->getAfterPhotos()->count() }}</div>
        </div>
    </div>

    <x-filament::section>
        <x-slot name="heading">
            Photos AVANT intervention
            <x-filament::badge color="info" style="margin-left: 0.5rem;">{{ $this->getBeforePhotos()->count() }}</x-filament::badge>
        </x-slot>
        
        @if($this->getBeforePhotos()->count() > 0)
            <div class="photo-grid">
                @foreach($this->getBeforePhotos() as $i => $photo)
                    <div class="photo-card" onclick="openLightbox('before', {{ $i }})">
                        <img src="{{ Storage::url($photo->file_path) }}" alt="Photo avant" loading="lazy">
                        <div class="overlay">{{ $photo->created_at->format('d/m/Y H:i') }}</div>
                        <div class="num">{{ $i + 1 }}</div>
                    </div>
                @endforeach
            </div>
        @else
            <div class="empty-box">Aucune photo avant intervention</div>
        @endif
    </x-filament::section>

    <x-filament::section style="margin-top: 1.5rem;">
        <x-slot name="heading">
            Photos APRÈS intervention
            <x-filament::badge color="success" style="margin-left: 0.5rem;">{{ $this->getAfterPhotos()->count() }}</x-filament::badge>
        </x-slot>
        
        @if($this->getAfterPhotos()->count() > 0)
            <div class="photo-grid">
                @foreach($this->getAfterPhotos() as $i => $photo)
                    <div class="photo-card after" onclick="openLightbox('after', {{ $i }})">
                        <img src="{{ Storage::url($photo->file_path) }}" alt="Photo après" loading="lazy">
                        <div class="overlay">{{ $photo->created_at->format('d/m/Y H:i') }}</div>
                        <div class="num">{{ $i + 1 }}</div>
                    </div>
                @endforeach
            </div>
        @else
            <div class="empty-box">Aucune photo après intervention</div>
        @endif
    </x-filament::section>

    @if($this->getBeforePhotos()->count() > 0 && $this->getAfterPhotos()->count() > 0)
        <x-filament::section style="margin-top: 1.5rem;">
            <x-slot name="heading">Comparaison AVANT / APRÈS</x-slot>
            <div class="compare-grid">
                <div>
                    <x-filament::badge color="info" style="margin-bottom: 0.5rem;">AVANT</x-filament::badge>
                    <img src="{{ Storage::url($this->getBeforePhotos()->first()->file_path) }}" alt="Avant" style="border: 2px solid #3b82f6;" onclick="openLightbox('before', 0)">
                </div>
                <div>
                    <x-filament::badge color="success" style="margin-bottom: 0.5rem;">APRÈS</x-filament::badge>
                    <img src="{{ Storage::url($this->getAfterPhotos()->first()->file_path) }}" alt="Après" style="border: 2px solid #22c55e;" onclick="openLightbox('after', 0)">
                </div>
            </div>
        </x-filament::section>
    @endif

    <script>
        const beforePhotos = @json($this->getBeforePhotos()->map(fn($p) => ['url' => \Illuminate\Support\Facades\Storage::url($p->file_path), 'caption' => $p->description ?? 'Photo avant - ' . $p->created_at->format('d/m/Y H:i')])->values());
        const afterPhotos = @json($this->getAfterPhotos()->map(fn($p) => ['url' => \Illuminate\Support\Facades\Storage::url($p->file_path), 'caption' => $p->description ?? 'Photo après - ' . $p->created_at->format('d/m/Y H:i')])->values());
        let photos = [], idx = 0;

        function openLightbox(type, i) {
            photos = type === 'before' ? beforePhotos : afterPhotos;
            idx = i;
            updateLb();
            document.getElementById('lightbox').classList.add('show');
            document.body.style.overflow = 'hidden';
        }

        function closeLightbox() {
            document.getElementById('lightbox').classList.remove('show');
            document.body.style.overflow = '';
        }

        function navLightbox(d) {
            idx = (idx + d + photos.length) % photos.length;
            updateLb();
        }

        function updateLb() {
            document.getElementById('lb-img').src = photos[idx].url;
            document.getElementById('lb-caption').textContent = photos[idx].caption;
            document.getElementById('lb-counter').textContent = (idx + 1) + ' / ' + photos.length;
        }

        document.addEventListener('keydown', e => {
            if (document.getElementById('lightbox').classList.contains('show')) {
                if (e.key === 'Escape') closeLightbox();
                if (e.key === 'ArrowLeft') navLightbox(-1);
                if (e.key === 'ArrowRight') navLightbox(1);
            }
        });
    </script>
</x-filament-panels::page>
