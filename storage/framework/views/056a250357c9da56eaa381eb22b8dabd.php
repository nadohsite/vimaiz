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
            <div class="value"><?php echo e($this->getBeforePhotos()->count()); ?></div>
        </div>
        <div class="stat-box green">
            <div class="label">Photos APRÈS</div>
            <div class="value"><?php echo e($this->getAfterPhotos()->count()); ?></div>
        </div>
        <div class="stat-box purple">
            <div class="label">Total</div>
            <div class="value"><?php echo e($this->getBeforePhotos()->count() + $this->getAfterPhotos()->count()); ?></div>
        </div>
    </div>

    <?php if (isset($component)) { $__componentOriginalee08b1367eba38734199cf7829b1d1e9 = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginalee08b1367eba38734199cf7829b1d1e9 = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'filament::components.section.index','data' => []] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('filament::section'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes([]); ?>
         <?php $__env->slot('heading', null, []); ?> 
            Photos AVANT intervention
            <?php if (isset($component)) { $__componentOriginal986dce9114ddce94a270ab00ce6c273d = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginal986dce9114ddce94a270ab00ce6c273d = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'filament::components.badge','data' => ['color' => 'info','style' => 'margin-left: 0.5rem;']] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('filament::badge'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes(['color' => 'info','style' => 'margin-left: 0.5rem;']); ?><?php echo e($this->getBeforePhotos()->count()); ?> <?php echo $__env->renderComponent(); ?>
<?php endif; ?>
<?php if (isset($__attributesOriginal986dce9114ddce94a270ab00ce6c273d)): ?>
<?php $attributes = $__attributesOriginal986dce9114ddce94a270ab00ce6c273d; ?>
<?php unset($__attributesOriginal986dce9114ddce94a270ab00ce6c273d); ?>
<?php endif; ?>
<?php if (isset($__componentOriginal986dce9114ddce94a270ab00ce6c273d)): ?>
<?php $component = $__componentOriginal986dce9114ddce94a270ab00ce6c273d; ?>
<?php unset($__componentOriginal986dce9114ddce94a270ab00ce6c273d); ?>
<?php endif; ?>
         <?php $__env->endSlot(); ?>
        
        <?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if BLOCK]><![endif]--><?php endif; ?><?php if($this->getBeforePhotos()->count() > 0): ?>
            <div class="photo-grid">
                <?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if BLOCK]><![endif]--><?php endif; ?><?php $__currentLoopData = $this->getBeforePhotos(); $__env->addLoop($__currentLoopData); foreach($__currentLoopData as $i => $photo): $__env->incrementLoopIndices(); $loop = $__env->getLastLoop(); ?>
                    <div class="photo-card" onclick="openLightbox('before', <?php echo e($i); ?>)">
                        <img src="<?php echo e(Storage::url($photo->file_path)); ?>" alt="Photo avant" loading="lazy">
                        <div class="overlay"><?php echo e($photo->created_at->format('d/m/Y H:i')); ?></div>
                        <div class="num"><?php echo e($i + 1); ?></div>
                    </div>
                <?php endforeach; $__env->popLoop(); $loop = $__env->getLastLoop(); ?><?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if ENDBLOCK]><![endif]--><?php endif; ?>
            </div>
        <?php else: ?>
            <div class="empty-box">Aucune photo avant intervention</div>
        <?php endif; ?><?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if ENDBLOCK]><![endif]--><?php endif; ?>
     <?php echo $__env->renderComponent(); ?>
<?php endif; ?>
<?php if (isset($__attributesOriginalee08b1367eba38734199cf7829b1d1e9)): ?>
<?php $attributes = $__attributesOriginalee08b1367eba38734199cf7829b1d1e9; ?>
<?php unset($__attributesOriginalee08b1367eba38734199cf7829b1d1e9); ?>
<?php endif; ?>
<?php if (isset($__componentOriginalee08b1367eba38734199cf7829b1d1e9)): ?>
<?php $component = $__componentOriginalee08b1367eba38734199cf7829b1d1e9; ?>
<?php unset($__componentOriginalee08b1367eba38734199cf7829b1d1e9); ?>
<?php endif; ?>

    <?php if (isset($component)) { $__componentOriginalee08b1367eba38734199cf7829b1d1e9 = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginalee08b1367eba38734199cf7829b1d1e9 = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'filament::components.section.index','data' => ['style' => 'margin-top: 1.5rem;']] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('filament::section'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes(['style' => 'margin-top: 1.5rem;']); ?>
         <?php $__env->slot('heading', null, []); ?> 
            Photos APRÈS intervention
            <?php if (isset($component)) { $__componentOriginal986dce9114ddce94a270ab00ce6c273d = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginal986dce9114ddce94a270ab00ce6c273d = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'filament::components.badge','data' => ['color' => 'success','style' => 'margin-left: 0.5rem;']] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('filament::badge'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes(['color' => 'success','style' => 'margin-left: 0.5rem;']); ?><?php echo e($this->getAfterPhotos()->count()); ?> <?php echo $__env->renderComponent(); ?>
<?php endif; ?>
<?php if (isset($__attributesOriginal986dce9114ddce94a270ab00ce6c273d)): ?>
<?php $attributes = $__attributesOriginal986dce9114ddce94a270ab00ce6c273d; ?>
<?php unset($__attributesOriginal986dce9114ddce94a270ab00ce6c273d); ?>
<?php endif; ?>
<?php if (isset($__componentOriginal986dce9114ddce94a270ab00ce6c273d)): ?>
<?php $component = $__componentOriginal986dce9114ddce94a270ab00ce6c273d; ?>
<?php unset($__componentOriginal986dce9114ddce94a270ab00ce6c273d); ?>
<?php endif; ?>
         <?php $__env->endSlot(); ?>
        
        <?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if BLOCK]><![endif]--><?php endif; ?><?php if($this->getAfterPhotos()->count() > 0): ?>
            <div class="photo-grid">
                <?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if BLOCK]><![endif]--><?php endif; ?><?php $__currentLoopData = $this->getAfterPhotos(); $__env->addLoop($__currentLoopData); foreach($__currentLoopData as $i => $photo): $__env->incrementLoopIndices(); $loop = $__env->getLastLoop(); ?>
                    <div class="photo-card after" onclick="openLightbox('after', <?php echo e($i); ?>)">
                        <img src="<?php echo e(Storage::url($photo->file_path)); ?>" alt="Photo après" loading="lazy">
                        <div class="overlay"><?php echo e($photo->created_at->format('d/m/Y H:i')); ?></div>
                        <div class="num"><?php echo e($i + 1); ?></div>
                    </div>
                <?php endforeach; $__env->popLoop(); $loop = $__env->getLastLoop(); ?><?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if ENDBLOCK]><![endif]--><?php endif; ?>
            </div>
        <?php else: ?>
            <div class="empty-box">Aucune photo après intervention</div>
        <?php endif; ?>
     <?php echo $__env->renderComponent(); ?>
<?php endif; ?>
<?php if (isset($__attributesOriginalee08b1367eba38734199cf7829b1d1e9)): ?>
<?php $attributes = $__attributesOriginalee08b1367eba38734199cf7829b1d1e9; ?>
<?php unset($__attributesOriginalee08b1367eba38734199cf7829b1d1e9); ?>
<?php endif; ?>
<?php if (isset($__componentOriginalee08b1367eba38734199cf7829b1d1e9)): ?>
<?php $component = $__componentOriginalee08b1367eba38734199cf7829b1d1e9; ?>
<?php unset($__componentOriginalee08b1367eba38734199cf7829b1d1e9); ?>
<?php endif; ?>

    <?php if($this->getBeforePhotos()->count() > 0 && $this->getAfterPhotos()->count() > 0): ?>
        <?php if (isset($component)) { $__componentOriginalee08b1367eba38734199cf7829b1d1e9 = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginalee08b1367eba38734199cf7829b1d1e9 = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'filament::components.section.index','data' => ['style' => 'margin-top: 1.5rem;']] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('filament::section'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes(['style' => 'margin-top: 1.5rem;']); ?>
             <?php $__env->slot('heading', null, []); ?> Comparaison AVANT / APRÈS <?php $__env->endSlot(); ?>
            <div class="compare-grid">
                <div>
                    <?php if (isset($component)) { $__componentOriginal986dce9114ddce94a270ab00ce6c273d = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginal986dce9114ddce94a270ab00ce6c273d = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'filament::components.badge','data' => ['color' => 'info','style' => 'margin-bottom: 0.5rem;']] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('filament::badge'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes(['color' => 'info','style' => 'margin-bottom: 0.5rem;']); ?>AVANT <?php echo $__env->renderComponent(); ?>
<?php endif; ?>
<?php if (isset($__attributesOriginal986dce9114ddce94a270ab00ce6c273d)): ?>
<?php $attributes = $__attributesOriginal986dce9114ddce94a270ab00ce6c273d; ?>
<?php unset($__attributesOriginal986dce9114ddce94a270ab00ce6c273d); ?>
<?php endif; ?>
<?php if (isset($__componentOriginal986dce9114ddce94a270ab00ce6c273d)): ?>
<?php $component = $__componentOriginal986dce9114ddce94a270ab00ce6c273d; ?>
<?php unset($__componentOriginal986dce9114ddce94a270ab00ce6c273d); ?>
<?php endif; ?>
                    <img src="<?php echo e(Storage::url($this->getBeforePhotos()->first()->file_path)); ?>" alt="Avant" style="border: 2px solid #3b82f6;" onclick="openLightbox('before', 0)">
                </div>
                <div>
                    <?php if (isset($component)) { $__componentOriginal986dce9114ddce94a270ab00ce6c273d = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginal986dce9114ddce94a270ab00ce6c273d = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'filament::components.badge','data' => ['color' => 'success','style' => 'margin-bottom: 0.5rem;']] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('filament::badge'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes(['color' => 'success','style' => 'margin-bottom: 0.5rem;']); ?>APRÈS <?php echo $__env->renderComponent(); ?>
<?php endif; ?>
<?php if (isset($__attributesOriginal986dce9114ddce94a270ab00ce6c273d)): ?>
<?php $attributes = $__attributesOriginal986dce9114ddce94a270ab00ce6c273d; ?>
<?php unset($__attributesOriginal986dce9114ddce94a270ab00ce6c273d); ?>
<?php endif; ?>
<?php if (isset($__componentOriginal986dce9114ddce94a270ab00ce6c273d)): ?>
<?php $component = $__componentOriginal986dce9114ddce94a270ab00ce6c273d; ?>
<?php unset($__componentOriginal986dce9114ddce94a270ab00ce6c273d); ?>
<?php endif; ?>
                    <img src="<?php echo e(Storage::url($this->getAfterPhotos()->first()->file_path)); ?>" alt="Après" style="border: 2px solid #22c55e;" onclick="openLightbox('after', 0)">
                </div>
            </div>
         <?php echo $__env->renderComponent(); ?>
<?php endif; ?>
<?php if (isset($__attributesOriginalee08b1367eba38734199cf7829b1d1e9)): ?>
<?php $attributes = $__attributesOriginalee08b1367eba38734199cf7829b1d1e9; ?>
<?php unset($__attributesOriginalee08b1367eba38734199cf7829b1d1e9); ?>
<?php endif; ?>
<?php if (isset($__componentOriginalee08b1367eba38734199cf7829b1d1e9)): ?>
<?php $component = $__componentOriginalee08b1367eba38734199cf7829b1d1e9; ?>
<?php unset($__componentOriginalee08b1367eba38734199cf7829b1d1e9); ?>
<?php endif; ?>
    <?php endif; ?><?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if ENDBLOCK]><![endif]--><?php endif; ?>

    <script>
        const beforePhotos = <?php echo json_encode($this->getBeforePhotos()->map(fn($p) => ['url' => \Illuminate\Support\Facades\Storage::url($p->file_path), 'caption' => $p->description ?? 'Photo avant - ' . $p->created_at->format('d/m/Y H:i')])->values(), 512) ?>;
        const afterPhotos = <?php echo json_encode($this->getAfterPhotos()->map(fn($p) => ['url' => \Illuminate\Support\Facades\Storage::url($p->file_path), 'caption' => $p->description ?? 'Photo après - ' . $p->created_at->format('d/m/Y H:i')])->values(), 512) ?>;
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
<?php /**PATH /Volumes/Robert/projets clients/Stephane/vimaiz/resources/views/filament/resources/mission-resource/pages/view-mission-photos.blade.php ENDPATH**/ ?>