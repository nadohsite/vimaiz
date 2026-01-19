<x-filament-panels::page>
    <div class="space-y-6">
        {{-- Photos AVANT --}}
        <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <x-heroicon-o-camera class="w-5 h-5 text-blue-500" />
                Photos AVANT intervention
                <span class="text-sm font-normal text-gray-500">({{ $this->getBeforePhotos()->count() }} photos)</span>
            </h2>
            
            @if($this->getBeforePhotos()->count() > 0)
                <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    @foreach($this->getBeforePhotos() as $photo)
                        <div class="relative group">
                            <img 
                                src="{{ Storage::url($photo->file_path) }}" 
                                alt="{{ $photo->description ?? 'Photo avant' }}"
                                class="w-full h-48 object-cover rounded-lg cursor-pointer hover:opacity-90 transition"
                                onclick="window.open('{{ Storage::url($photo->file_path) }}', '_blank')"
                            />
                            <div class="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-xs p-2 rounded-b-lg">
                                <div>{{ $photo->created_at->format('d/m/Y H:i') }}</div>
                                @if($photo->description)
                                    <div class="truncate">{{ $photo->description }}</div>
                                @endif
                            </div>
                        </div>
                    @endforeach
                </div>
            @else
                <div class="text-center py-8 text-gray-500">
                    <x-heroicon-o-photo class="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>Aucune photo avant intervention</p>
                </div>
            @endif
        </div>

        {{-- Photos APRÈS --}}
        <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <x-heroicon-o-sparkles class="w-5 h-5 text-green-500" />
                Photos APRÈS intervention
                <span class="text-sm font-normal text-gray-500">({{ $this->getAfterPhotos()->count() }} photos)</span>
            </h2>
            
            @if($this->getAfterPhotos()->count() > 0)
                <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    @foreach($this->getAfterPhotos() as $photo)
                        <div class="relative group">
                            <img 
                                src="{{ Storage::url($photo->file_path) }}" 
                                alt="{{ $photo->description ?? 'Photo après' }}"
                                class="w-full h-48 object-cover rounded-lg cursor-pointer hover:opacity-90 transition"
                                onclick="window.open('{{ Storage::url($photo->file_path) }}', '_blank')"
                            />
                            <div class="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-xs p-2 rounded-b-lg">
                                <div>{{ $photo->created_at->format('d/m/Y H:i') }}</div>
                                @if($photo->description)
                                    <div class="truncate">{{ $photo->description }}</div>
                                @endif
                            </div>
                        </div>
                    @endforeach
                </div>
            @else
                <div class="text-center py-8 text-gray-500">
                    <x-heroicon-o-photo class="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>Aucune photo après intervention</p>
                </div>
            @endif
        </div>

        {{-- Comparaison côte à côte si les deux existent --}}
        @if($this->getBeforePhotos()->count() > 0 && $this->getAfterPhotos()->count() > 0)
            <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Comparaison AVANT / APRÈS
                </h2>
                <div class="grid grid-cols-2 gap-4">
                    <div>
                        <h3 class="text-sm font-medium text-gray-500 mb-2">AVANT</h3>
                        <img 
                            src="{{ Storage::url($this->getBeforePhotos()->first()->file_path) }}" 
                            alt="Avant"
                            class="w-full rounded-lg"
                        />
                    </div>
                    <div>
                        <h3 class="text-sm font-medium text-gray-500 mb-2">APRÈS</h3>
                        <img 
                            src="{{ Storage::url($this->getAfterPhotos()->first()->file_path) }}" 
                            alt="Après"
                            class="w-full rounded-lg"
                        />
                    </div>
                </div>
            </div>
        @endif
    </div>
</x-filament-panels::page>
