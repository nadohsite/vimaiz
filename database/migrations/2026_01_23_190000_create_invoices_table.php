<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('invoices', function (Blueprint $table) {
            $table->id();
            $table->string('invoice_number')->unique();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->foreignId('mission_id')->nullable()->constrained()->onDelete('set null');
            $table->foreignId('quote_id')->nullable()->constrained()->onDelete('set null');
            
            $table->decimal('subtotal', 10, 2);
            $table->decimal('tax_rate', 5, 2)->default(20.00);
            $table->decimal('tax_amount', 10, 2);
            $table->decimal('total', 10, 2);
            
            $table->string('status')->default('paid'); // draft, pending, paid, refunded
            $table->string('payment_method')->nullable();
            $table->string('payment_intent_id')->nullable();
            
            $table->text('billing_name')->nullable();
            $table->text('billing_address')->nullable();
            $table->string('billing_email')->nullable();
            
            $table->text('description')->nullable();
            $table->json('line_items')->nullable();
            
            $table->timestamp('issued_at')->nullable();
            $table->timestamp('paid_at')->nullable();
            $table->timestamp('due_at')->nullable();
            
            $table->timestamps();
            
            $table->index(['user_id', 'status']);
            $table->index('invoice_number');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('invoices');
    }
};
