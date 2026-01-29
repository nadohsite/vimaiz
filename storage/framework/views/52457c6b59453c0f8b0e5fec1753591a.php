<?php $__env->startSection('title', 'Paiement confirmé'); ?>

<?php $__env->startSection('content'); ?>
    <h1>Paiement reçu avec succès ! ✅</h1>
    
    <p>Bonjour <?php echo e($notifiable->name); ?>,</p>
    
    <p>Nous confirmons la réception de votre paiement. Votre réservation est maintenant confirmée !</p>
    
    <div class="success-box">
        <p><strong>Mission :</strong> <?php echo e($mission->mission_number); ?></p>
        <p><strong>Montant payé :</strong> <?php echo e(number_format($mission->total_price, 2, ',', ' ')); ?> €</p>
        <p><strong>Date de paiement :</strong> <?php echo e(now()->format('d/m/Y à H:i')); ?></p>
    </div>
    
    <div class="info-box">
        <p><strong>Logement :</strong> <?php echo e($mission->property->name ?? $mission->property->type); ?></p>
        <p><strong>Adresse :</strong> <?php echo e($mission->property->address_line1); ?>, <?php echo e($mission->property->postal_code); ?> <?php echo e($mission->property->city); ?></p>
        <p><strong>Date de la prestation :</strong> <?php echo e($mission->scheduled_at->format('d/m/Y à H:i')); ?></p>
        <p><strong>Durée prévue :</strong> <?php echo e($mission->duration_hours); ?> heure(s)</p>
    </div>
    
    <p>Un agent professionnel vous sera attribué dans les plus brefs délais. Vous recevrez une notification dès qu'il aura confirmé la mission.</p>
    
    <p style="text-align: center;">
        <a href="<?php echo e(url('/client/missions/' . $mission->id)); ?>" class="button">
            Suivre ma mission
        </a>
    </p>
    
    <p>Votre facture est disponible dans votre espace client.</p>
    
    <p>Merci de votre confiance !<br>L'équipe VIMAIZ</p>
<?php $__env->stopSection(); ?>

<?php echo $__env->make('emails.layout', array_diff_key(get_defined_vars(), ['__data' => 1, '__path' => 1]))->render(); ?><?php /**PATH /Volumes/Robert/projets clients/Stephane/vimaiz/resources/views/emails/payment-received.blade.php ENDPATH**/ ?>