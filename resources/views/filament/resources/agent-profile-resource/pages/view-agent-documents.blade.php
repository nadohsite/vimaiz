<x-filament-panels::page>
    <div class="space-y-6">
        {{-- Status Card --}}
        <x-filament::section>
            <x-slot name="heading">Statut de vérification</x-slot>
            
            <div class="flex items-center gap-4">
                @php
                    $status = $this->record->verification_status;
                    $statusColors = [
                        'pending' => 'gray',
                        'submitted' => 'warning',
                        'verified' => 'success',
                        'rejected' => 'danger',
                    ];
                    $statusLabels = [
                        'pending' => 'En attente de soumission',
                        'submitted' => 'Soumis - En attente de vérification',
                        'verified' => 'Vérifié',
                        'rejected' => 'Rejeté',
                    ];
                @endphp
                
                <x-filament::badge :color="$statusColors[$status] ?? 'gray'" size="lg">
                    {{ $statusLabels[$status] ?? $status }}
                </x-filament::badge>
                
                @if($status === 'rejected' && $this->record->rejection_reason)
                    <div class="text-sm text-danger-600 dark:text-danger-400">
                        <strong>Raison :</strong> {{ $this->record->rejection_reason }}
                    </div>
                @endif
            </div>
        </x-filament::section>

        {{-- Agent Info --}}
        <x-filament::section>
            <x-slot name="heading">Informations de l'agent</x-slot>
            
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                    <p class="text-sm text-gray-500 dark:text-gray-400">Nom</p>
                    <p class="font-medium">{{ $this->record->user->name }}</p>
                </div>
                <div>
                    <p class="text-sm text-gray-500 dark:text-gray-400">Email</p>
                    <p class="font-medium">{{ $this->record->user->email }}</p>
                </div>
                <div>
                    <p class="text-sm text-gray-500 dark:text-gray-400">Type</p>
                    <p class="font-medium">
                        {{ $this->record->agent_type === 'company' ? 'Entreprise' : 'Particulier' }}
                        @if($this->record->company_name)
                            ({{ $this->record->company_name }})
                        @endif
                    </p>
                </div>
                @if($this->record->siret)
                <div>
                    <p class="text-sm text-gray-500 dark:text-gray-400">SIRET</p>
                    <p class="font-medium font-mono">{{ $this->record->siret }}</p>
                </div>
                @endif
            </div>
        </x-filament::section>

        {{-- Documents Grid --}}
        <x-filament::section>
            <x-slot name="heading">Documents soumis</x-slot>
            
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                @foreach($this->getDocuments() as $document)
                    <div class="border rounded-xl p-4 {{ $document['uploaded'] ? 'border-success-300 bg-success-50 dark:border-success-700 dark:bg-success-900/20' : 'border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800' }}">
                        <div class="flex items-start justify-between mb-3">
                            <div class="flex items-center gap-2">
                                <x-filament::icon 
                                    :icon="$document['icon']" 
                                    class="w-5 h-5 {{ $document['uploaded'] ? 'text-success-600' : 'text-gray-400' }}"
                                />
                                <span class="font-medium text-sm">
                                    {{ $document['label'] }}
                                    @if($document['required'])
                                        <span class="text-danger-500">*</span>
                                    @endif
                                </span>
                            </div>
                            @if($document['uploaded'])
                                <x-filament::badge color="success" size="sm">
                                    Téléchargé
                                </x-filament::badge>
                            @else
                                <x-filament::badge color="gray" size="sm">
                                    Non fourni
                                </x-filament::badge>
                            @endif
                        </div>
                        
                        @if($document['uploaded'])
                            @if($document['is_image'])
                                <div class="mt-3 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-600">
                                    <a href="{{ $document['url'] }}" target="_blank" class="block">
                                        <img 
                                            src="{{ $document['url'] }}" 
                                            alt="{{ $document['label'] }}"
                                            class="w-full h-48 object-cover hover:opacity-90 transition-opacity"
                                        />
                                    </a>
                                </div>
                            @else
                                <div class="mt-3 p-4 bg-gray-100 dark:bg-gray-700 rounded-lg text-center">
                                    <x-filament::icon 
                                        icon="heroicon-o-document" 
                                        class="w-12 h-12 mx-auto text-gray-400 mb-2"
                                    />
                                    <p class="text-sm text-gray-600 dark:text-gray-400">Document PDF</p>
                                </div>
                            @endif
                            
                            <div class="mt-3">
                                <x-filament::button
                                    :href="$document['url']"
                                    tag="a"
                                    target="_blank"
                                    size="sm"
                                    color="gray"
                                    icon="heroicon-o-arrow-top-right-on-square"
                                    class="w-full justify-center"
                                >
                                    Ouvrir dans un nouvel onglet
                                </x-filament::button>
                            </div>
                        @else
                            <div class="mt-3 p-6 bg-gray-100 dark:bg-gray-700 rounded-lg text-center">
                                <x-filament::icon 
                                    icon="heroicon-o-document-plus" 
                                    class="w-12 h-12 mx-auto text-gray-300 dark:text-gray-500"
                                />
                                <p class="text-sm text-gray-500 dark:text-gray-400 mt-2">
                                    Document non téléchargé
                                </p>
                            </div>
                        @endif
                    </div>
                @endforeach
            </div>
        </x-filament::section>
    </div>
</x-filament-panels::page>
