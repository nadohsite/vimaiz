<?php $__env->startSection('title', 'Paiement crédité'); ?>

<?php $__env->startSection('content'); ?>
    <h1>Paiement crédité ! 💰</h1>
    
    <p>Bonjour <?php echo e($notifiable->name); ?>,</p>
    
    <p>Votre paiement pour la mission terminée a été crédité sur votre portefeuille VIMAIZ.</p>
    
    <div class="success-box">
        <p style="font-size: 24px;"><strong>+ <?php echo e(number_format($amount, 2, ',', ' ')); ?> €</strong></p>
    </div>
    
    <div class="info-box">
        <p><strong>Mission :</strong> <?php echo e($mission->mission_number); ?></p>
        <p><strong>Date de crédit :</strong> <?php echo e(now()->format('d/m/Y à H:i')); ?></p>
    </div>
    
    <p>Vous pouvez demander un virement vers votre compte bancaire à tout moment depuis votre espace agent (minimum 100 €).</p>
    
    <p style="text-align: center;">
        <a href="<?php echo e(url('/agent/wallet')); ?>" class="button">
            Voir mon portefeuille
        </a>
    </p>
    
    <p>Merci pour votre excellent travail !<br>L'équipe VIMAIZ</p>
<?php $__env->stopSection(); ?>

<?php echo $__env->make('emails.layout', array_diff_key(get_defined_vars(), ['__data' => 1, '__path' => 1]))->render(); ?><?php /**PATH /Volumes/Robert/projets clients/Stephane/vimaiz/resources/views/emails/agent-payout.blade.php ENDPATH**/ ?>