<?php $__env->startSection('title', 'Votre ménage a commencé'); ?>

<?php $__env->startSection('content'); ?>
    <h1>Votre ménage a commencé ! 🧹</h1>
    
    <p>Bonjour <?php echo e($notifiable->name); ?>,</p>
    
    <p>Bonne nouvelle ! L'agent de ménage est arrivé et a commencé le nettoyage de votre logement.</p>
    
    <div class="success-box">
        <p><strong>Mission :</strong> <?php echo e($mission->mission_number); ?></p>
        <p><strong>Début :</strong> <?php echo e($mission->started_at->format('d/m/Y à H:i')); ?></p>
    </div>
    
    <div class="info-box">
        <p><strong>Logement :</strong> <?php echo e($mission->property->name ?? $mission->property->type); ?></p>
        <p><strong>Durée prévue :</strong> <?php echo e($mission->duration_hours); ?> heure(s)</p>
    </div>
    
    <p>L'agent a pris des photos <strong>AVANT</strong> intervention qui seront disponibles dans votre espace client une fois la mission terminée.</p>
    
    <p style="text-align: center;">
        <a href="<?php echo e(url('/client/missions/' . $mission->id)); ?>" class="button">
            Suivre la mission
        </a>
    </p>
    
    <p>À bientôt,<br>L'équipe VIMAIZ</p>
<?php $__env->stopSection(); ?>

<?php echo $__env->make('emails.layout', array_diff_key(get_defined_vars(), ['__data' => 1, '__path' => 1]))->render(); ?><?php /**PATH /Volumes/Robert/projets clients/Stephane/vimaiz/resources/views/emails/mission-started.blade.php ENDPATH**/ ?>