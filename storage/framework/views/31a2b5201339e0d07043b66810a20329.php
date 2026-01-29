<?php $__env->startSection('title', 'Ménage terminé'); ?>

<?php $__env->startSection('content'); ?>
    <h1>Ménage terminé ! 🎉</h1>
    
    <p>Bonjour <?php echo e($notifiable->name); ?>,</p>
    
    <p>Le ménage de votre logement est terminé avec succès !</p>
    
    <div class="success-box">
        <p><strong>Mission :</strong> <?php echo e($mission->mission_number); ?></p>
        <p><strong>Statut :</strong> ✅ Terminée</p>
    </div>
    
    <div class="info-box">
        <p><strong>Logement :</strong> <?php echo e($mission->property->name ?? $mission->property->type); ?></p>
        <p><strong>Début :</strong> <?php echo e($mission->started_at?->format('d/m/Y à H:i')); ?></p>
        <p><strong>Fin :</strong> <?php echo e($mission->completed_at?->format('d/m/Y à H:i')); ?></p>
        <?php
            $duration = $mission->started_at && $mission->completed_at 
                ? $mission->started_at->diffInMinutes($mission->completed_at) 
                : $mission->duration_hours * 60;
        ?>
        <p><strong>Durée effective :</strong> <?php echo e(floor($duration / 60)); ?>h<?php echo e($duration % 60 > 0 ? sprintf('%02d', $duration % 60) : ''); ?></p>
    </div>
    
    <p>Les photos <strong>AVANT</strong> et <strong>APRÈS</strong> intervention sont maintenant disponibles dans votre espace client.</p>
    
    <p style="text-align: center;">
        <a href="<?php echo e(url('/client/missions/' . $mission->id)); ?>" class="button">
            Voir les photos
        </a>
    </p>
    
    <p>Merci de votre confiance. À bientôt sur VIMAIZ !</p>
    
    <p>L'équipe VIMAIZ</p>
<?php $__env->stopSection(); ?>

<?php echo $__env->make('emails.layout', array_diff_key(get_defined_vars(), ['__data' => 1, '__path' => 1]))->render(); ?><?php /**PATH /Volumes/Robert/projets clients/Stephane/vimaiz/resources/views/emails/mission-completed.blade.php ENDPATH**/ ?>