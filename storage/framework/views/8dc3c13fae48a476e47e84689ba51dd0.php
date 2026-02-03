<?php if (isset($component)) { $__componentOriginal166a02a7c5ef5a9331faf66fa665c256 = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginal166a02a7c5ef5a9331faf66fa665c256 = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'filament-panels::components.page.index','data' => []] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('filament-panels::page'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes([]); ?>
    <?php
        $status = $this->record->verification_status;
        $statusLabels = [
            'pending' => 'En attente de soumission',
            'submitted' => 'En attente de vérification',
            'verified' => 'Documents vérifiés',
            'rejected' => 'Documents rejetés',
        ];
        $uploadedCount = collect($this->getDocuments())->where('uploaded', true)->count();
        $totalCount = count($this->getDocuments());
    ?>

    <style>
        .doc-card { transition: all 0.2s ease; }
        .doc-card:hover { transform: translateY(-2px); }
        .doc-image:hover img { transform: scale(1.05); }
    </style>

    
    <div style="background: linear-gradient(135deg, #0ea5e9 0%, #06b6d4 100%); border-radius: 16px; padding: 24px; margin-bottom: 24px; color: white;">
        <div style="display: flex; flex-wrap: wrap; align-items: center; gap: 20px;">
            
            <div style="width: 80px; height: 80px; background: rgba(255,255,255,0.2); border-radius: 16px; display: flex; align-items: center; justify-content: center; font-size: 28px; font-weight: bold;">
                <?php echo e(strtoupper(substr($this->record->user->name, 0, 2))); ?>

            </div>
            
            
            <div style="flex: 1; min-width: 200px;">
                <h2 style="font-size: 24px; font-weight: bold; margin: 0;"><?php echo e($this->record->user->name); ?></h2>
                <p style="opacity: 0.9; margin: 4px 0;"><?php echo e($this->record->user->email); ?></p>
                <div style="display: flex; flex-wrap: wrap; gap: 8px; margin-top: 8px;">
                    <span style="background: rgba(255,255,255,0.2); padding: 4px 12px; border-radius: 20px; font-size: 12px; display: inline-flex; align-items: center; gap: 6px;">
                        <?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if BLOCK]><![endif]--><?php endif; ?><?php if($this->record->agent_type === 'company'): ?>
                            <svg style="width: 14px; height: 14px;" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21" /></svg>
                            Entreprise
                        <?php else: ?>
                            <svg style="width: 14px; height: 14px;" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" /></svg>
                            Particulier
                        <?php endif; ?><?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if ENDBLOCK]><![endif]--><?php endif; ?>
                    </span>
                    <?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if BLOCK]><![endif]--><?php endif; ?><?php if($this->record->siret): ?>
                        <span style="background: rgba(255,255,255,0.2); padding: 4px 12px; border-radius: 20px; font-size: 12px; font-family: monospace;">
                            SIRET: <?php echo e($this->record->siret); ?>

                        </span>
                    <?php endif; ?><?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if ENDBLOCK]><![endif]--><?php endif; ?>
                </div>
            </div>
            
            
            <div style="text-align: right;">
                <div style="background: rgba(255,255,255,0.95); color: #334155; padding: 12px 20px; border-radius: 12px; display: inline-flex; align-items: center; gap: 8px;">
                    <?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if BLOCK]><![endif]--><?php endif; ?><?php if($status === 'pending'): ?>
                        <svg style="width: 20px; height: 20px; color: #6b7280;" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" /></svg>
                        <span style="color: #6b7280;"><?php echo e($statusLabels[$status]); ?></span>
                    <?php elseif($status === 'submitted'): ?>
                        <svg style="width: 20px; height: 20px; color: #f59e0b;" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" /><path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" /></svg>
                        <span style="color: #f59e0b;"><?php echo e($statusLabels[$status]); ?></span>
                    <?php elseif($status === 'verified'): ?>
                        <svg style="width: 20px; height: 20px; color: #10b981;" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" /></svg>
                        <span style="color: #10b981;"><?php echo e($statusLabels[$status]); ?></span>
                    <?php else: ?>
                        <svg style="width: 20px; height: 20px; color: #ef4444;" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="m9.75 9.75 4.5 4.5m0-4.5-4.5 4.5M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" /></svg>
                        <span style="color: #ef4444;"><?php echo e($statusLabels[$status]); ?></span>
                    <?php endif; ?><?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if ENDBLOCK]><![endif]--><?php endif; ?>
                </div>
                <p style="margin-top: 8px; font-size: 14px; opacity: 0.9; display: flex; align-items: center; gap: 6px;">
                    <svg style="width: 16px; height: 16px;" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" /></svg>
                    <?php echo e($uploadedCount); ?>/<?php echo e($totalCount); ?> documents fournis
                </p>
            </div>
        </div>
        
        <?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if BLOCK]><![endif]--><?php endif; ?><?php if($status === 'rejected' && $this->record->rejection_reason): ?>
            <div style="margin-top: 16px; background: rgba(239,68,68,0.2); border: 1px solid rgba(239,68,68,0.3); border-radius: 12px; padding: 16px;">
                <p style="margin: 0; font-weight: 600; display: flex; align-items: center; gap: 8px;">
                    <svg style="width: 18px; height: 18px;" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" /></svg>
                    Raison du rejet
                </p>
                <p style="margin: 8px 0 0 0; opacity: 0.9;"><?php echo e($this->record->rejection_reason); ?></p>
            </div>
        <?php endif; ?><?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if ENDBLOCK]><![endif]--><?php endif; ?>
    </div>

    
    <div style="margin-bottom: 16px; display: flex; justify-content: space-between; align-items: center;">
        <h3 style="font-size: 18px; font-weight: 600; margin: 0; color: var(--fi-body-text-color, #1e293b); display: flex; align-items: center; gap: 8px;">
            <svg style="width: 20px; height: 20px; color: #0ea5e9;" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M3.75 9.776c.112-.017.227-.026.344-.026h15.812c.117 0 .232.009.344.026m-16.5 0a2.25 2.25 0 0 0-1.883 2.542l.857 6a2.25 2.25 0 0 0 2.227 1.932H19.05a2.25 2.25 0 0 0 2.227-1.932l.857-6a2.25 2.25 0 0 0-1.883-2.542m-16.5 0V6A2.25 2.25 0 0 1 6 3.75h3.879a1.5 1.5 0 0 1 1.06.44l2.122 2.12a1.5 1.5 0 0 0 1.06.44H18A2.25 2.25 0 0 1 20.25 9v.776" /></svg>
            Documents soumis
        </h3>
        <span style="font-size: 14px; color: #64748b;">* Documents obligatoires</span>
    </div>

    <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 20px;">
        <?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if BLOCK]><![endif]--><?php endif; ?><?php $__currentLoopData = $this->getDocuments(); $__env->addLoop($__currentLoopData); foreach($__currentLoopData as $document): $__env->incrementLoopIndices(); $loop = $__env->getLastLoop(); ?>
            <div class="doc-card" style="
                border-radius: 16px; 
                overflow: hidden;
                background: var(--fi-card-bg, white);
                border: 2px solid <?php echo e($document['uploaded'] ? '#10b981' : '#e2e8f0'); ?>;
                <?php echo e(!$document['uploaded'] ? 'border-style: dashed;' : ''); ?>

            ">
                
                <div style="padding: 16px; border-bottom: 1px solid #f1f5f9; display: flex; justify-content: space-between; align-items: center;">
                    <div style="display: flex; align-items: center; gap: 12px;">
                        <div style="
                            width: 44px; 
                            height: 44px; 
                            border-radius: 12px; 
                            display: flex; 
                            align-items: center; 
                            justify-content: center;
                            background: <?php echo e($document['uploaded'] ? '#d1fae5' : '#f1f5f9'); ?>;
                        ">
                            <?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if BLOCK]><![endif]--><?php endif; ?><?php switch($document['type']):
                                case ('id_document'): ?>
                                    <svg style="width: 22px; height: 22px; color: <?php echo e($document['uploaded'] ? '#059669' : '#94a3b8'); ?>;" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                                        <path stroke-linecap="round" stroke-linejoin="round" d="M15 9h3.75M15 12h3.75M15 15h3.75M4.5 19.5h15a2.25 2.25 0 0 0 2.25-2.25V6.75A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25v10.5A2.25 2.25 0 0 0 4.5 19.5Zm6-10.125a1.875 1.875 0 1 1-3.75 0 1.875 1.875 0 0 1 3.75 0Zm1.294 6.336a6.721 6.721 0 0 1-3.17.789 6.721 6.721 0 0 1-3.168-.789 3.376 3.376 0 0 1 6.338 0Z" />
                                    </svg>
                                    <?php break; ?>
                                <?php case ('address_proof'): ?>
                                    <svg style="width: 22px; height: 22px; color: <?php echo e($document['uploaded'] ? '#059669' : '#94a3b8'); ?>;" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                                        <path stroke-linecap="round" stroke-linejoin="round" d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
                                    </svg>
                                    <?php break; ?>
                                <?php case ('siret_document'): ?>
                                    <svg style="width: 22px; height: 22px; color: <?php echo e($document['uploaded'] ? '#059669' : '#94a3b8'); ?>;" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                                        <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
                                    </svg>
                                    <?php break; ?>
                                <?php case ('driving_license_document'): ?>
                                    <svg style="width: 22px; height: 22px; color: <?php echo e($document['uploaded'] ? '#059669' : '#94a3b8'); ?>;" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                                        <path stroke-linecap="round" stroke-linejoin="round" d="M8.25 18.75a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 0 1-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 0 0-3.213-9.193 2.056 2.056 0 0 0-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 0 0-10.026 0 1.106 1.106 0 0 0-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
                                    </svg>
                                    <?php break; ?>
                                <?php case ('insurance_document'): ?>
                                    <svg style="width: 22px; height: 22px; color: <?php echo e($document['uploaded'] ? '#059669' : '#94a3b8'); ?>;" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                                        <path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" />
                                    </svg>
                                    <?php break; ?>
                                <?php default: ?>
                                    <svg style="width: 22px; height: 22px; color: <?php echo e($document['uploaded'] ? '#059669' : '#94a3b8'); ?>;" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                                        <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
                                    </svg>
                            <?php endswitch; ?><?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if ENDBLOCK]><![endif]--><?php endif; ?>
                        </div>
                        <div>
                            <p style="margin: 0; font-weight: 600; font-size: 14px; color: var(--fi-body-text-color, #1e293b);">
                                <?php echo e($document['label']); ?>

                                <?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if BLOCK]><![endif]--><?php endif; ?><?php if($document['required']): ?>
                                    <span style="color: #ef4444;">*</span>
                                <?php endif; ?><?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if ENDBLOCK]><![endif]--><?php endif; ?>
                            </p>
                            <p style="margin: 2px 0 0 0; font-size: 12px; color: #64748b;">
                                <?php echo e($document['required'] ? 'Obligatoire' : 'Optionnel'); ?>

                            </p>
                        </div>
                    </div>
                    
                    <?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if BLOCK]><![endif]--><?php endif; ?><?php if($document['uploaded']): ?>
                        <span style="background: #d1fae5; color: #059669; padding: 4px 10px; border-radius: 20px; font-size: 12px; font-weight: 500;">
                            ✓ Fourni
                        </span>
                    <?php else: ?>
                        <span style="background: #f1f5f9; color: #64748b; padding: 4px 10px; border-radius: 20px; font-size: 12px; font-weight: 500;">
                            ○ Manquant
                        </span>
                    <?php endif; ?><?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if ENDBLOCK]><![endif]--><?php endif; ?>
                </div>
                
                
                <div style="padding: 16px;">
                    <?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if BLOCK]><![endif]--><?php endif; ?><?php if($document['uploaded']): ?>
                        <?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if BLOCK]><![endif]--><?php endif; ?><?php if($document['is_image']): ?>
                            <a href="<?php echo e($document['url']); ?>" target="_blank" class="doc-image" style="display: block; overflow: hidden; border-radius: 12px;">
                                <img 
                                    src="<?php echo e($document['url']); ?>" 
                                    alt="<?php echo e($document['label']); ?>"
                                    style="width: 100%; height: 180px; object-fit: cover; transition: transform 0.3s ease;"
                                />
                            </a>
                        <?php else: ?>
                            <div style="height: 180px; background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%); border-radius: 12px; display: flex; flex-direction: column; align-items: center; justify-content: center;">
                                <svg style="width: 48px; height: 48px; color: #94a3b8;" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" /></svg>
                                <p style="margin: 8px 0 0 0; color: #64748b; font-size: 14px;">Document PDF</p>
                            </div>
                        <?php endif; ?><?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if ENDBLOCK]><![endif]--><?php endif; ?>
                        
                        <a 
                            href="<?php echo e($document['url']); ?>" 
                            target="_blank" 
                            style="
                                display: flex;
                                align-items: center;
                                justify-content: center;
                                gap: 8px;
                                margin-top: 12px;
                                padding: 12px;
                                background: #f0f9ff;
                                color: #0369a1;
                                border-radius: 10px;
                                text-decoration: none;
                                font-weight: 500;
                                font-size: 14px;
                                transition: background 0.2s;
                            "
                            onmouseover="this.style.background='#e0f2fe'"
                            onmouseout="this.style.background='#f0f9ff'"
                        >
                            <svg style="width: 16px; height: 16px;" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M13.5 6H5.25A2.25 2.25 0 0 0 3 8.25v10.5A2.25 2.25 0 0 0 5.25 21h10.5A2.25 2.25 0 0 0 18 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" /></svg>
                            Ouvrir le document
                        </a>
                    <?php else: ?>
                        <div style="height: 180px; border: 2px dashed #e2e8f0; border-radius: 12px; display: flex; flex-direction: column; align-items: center; justify-content: center;">
                            <div style="width: 60px; height: 60px; background: #f1f5f9; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-bottom: 12px;">
                                <svg style="width: 28px; height: 28px; color: #cbd5e1;" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M12 16.5V9.75m0 0 3 3m-3-3-3 3M6.75 19.5a4.5 4.5 0 0 1-1.41-8.775 5.25 5.25 0 0 1 10.233-2.33 3 3 0 0 1 3.758 3.848A3.752 3.752 0 0 1 18 19.5H6.75Z" /></svg>
                            </div>
                            <p style="margin: 0; color: #94a3b8; font-weight: 500;">Non téléchargé</p>
                            <p style="margin: 4px 0 0 0; color: #cbd5e1; font-size: 12px;">En attente de l'agent</p>
                        </div>
                    <?php endif; ?><?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if ENDBLOCK]><![endif]--><?php endif; ?>
                </div>
            </div>
        <?php endforeach; $__env->popLoop(); $loop = $__env->getLastLoop(); ?><?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if ENDBLOCK]><![endif]--><?php endif; ?>
    </div>
 <?php echo $__env->renderComponent(); ?>
<?php endif; ?>
<?php if (isset($__attributesOriginal166a02a7c5ef5a9331faf66fa665c256)): ?>
<?php $attributes = $__attributesOriginal166a02a7c5ef5a9331faf66fa665c256; ?>
<?php unset($__attributesOriginal166a02a7c5ef5a9331faf66fa665c256); ?>
<?php endif; ?>
<?php if (isset($__componentOriginal166a02a7c5ef5a9331faf66fa665c256)): ?>
<?php $component = $__componentOriginal166a02a7c5ef5a9331faf66fa665c256; ?>
<?php unset($__componentOriginal166a02a7c5ef5a9331faf66fa665c256); ?>
<?php endif; ?>
<?php /**PATH /Volumes/Robert/projets clients/Stephane/vimaiz/resources/views/filament/resources/agent-profile-resource/pages/view-agent-documents.blade.php ENDPATH**/ ?>