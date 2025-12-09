import { loadStripe, Stripe, StripeElements } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { useState } from 'react';
import { router } from '@inertiajs/react';
import { CreditCard, Lock, AlertCircle, CheckCircle } from 'lucide-react';
import axios from 'axios';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_KEY || '');

interface PaymentFormProps {
    bookingId: number;
    amount: number;
    onSuccess: () => void;
    onError: (error: string) => void;
}

function PaymentForm({ bookingId, amount, onSuccess, onError }: PaymentFormProps) {
    const stripe = useStripe();
    const elements = useElements();
    const [processing, setProcessing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!stripe || !elements) {
            return;
        }

        setProcessing(true);
        setError(null);

        try {
            // Create payment intent
            const { data } = await axios.post(route('payment.create-intent'), {
                booking_id: bookingId,
            });

            const { clientSecret } = data;

            // Confirm payment
            const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
                payment_method: {
                    card: elements.getElement(CardElement)!,
                },
            });

            if (stripeError) {
                setError(stripeError.message || 'Payment failed');
                onError(stripeError.message || 'Payment failed');
                setProcessing(false);
                return;
            }

            if (paymentIntent.status === 'succeeded') {
                // Confirm payment on backend
                await axios.post(route('payment.confirm'), {
                    payment_intent_id: paymentIntent.id,
                    booking_id: bookingId,
                });

                onSuccess();
            }
        } catch (err: any) {
            const errorMessage = err.response?.data?.error || 'An error occurred';
            setError(errorMessage);
            onError(errorMessage);
        } finally {
            setProcessing(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                    <CreditCard className="w-4 h-4 inline mr-1" />
                    Card Details
                </label>
                <div className="p-4 border border-neutral-300 rounded-xl bg-white">
                    <CardElement
                        options={{
                            style: {
                                base: {
                                    fontSize: '16px',
                                    color: '#424770',
                                    '::placeholder': {
                                        color: '#aab7c4',
                                    },
                                },
                                invalid: {
                                    color: '#9e2146',
                                },
                            },
                        }}
                    />
                </div>
            </div>

            {error && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <div className="text-sm text-red-800">{error}</div>
                </div>
            )}

            <div className="bg-neutral-50 rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                    <span className="text-neutral-600">Total Amount</span>
                    <span className="text-2xl font-bold text-neutral-900">{amount.toFixed(2)} MAD</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-neutral-500">
                    <Lock className="w-3 h-3" />
                    <span>Secured by Stripe</span>
                </div>
            </div>

            <button
                type="submit"
                disabled={!stripe || processing}
                className="w-full bg-indigo-600 text-white px-6 py-4 rounded-xl hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium text-lg shadow-lg flex items-center justify-center gap-2"
            >
                {processing ? (
                    <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Processing...
                    </>
                ) : (
                    <>
                        <Lock className="w-5 h-5" />
                        Pay {amount.toFixed(2)} MAD
                    </>
                )}
            </button>

            <p className="text-xs text-center text-neutral-500">
                Your payment is secured with 256-bit SSL encryption
            </p>
        </form>
    );
}

interface StripePaymentProps {
    bookingId: number;
    amount: number;
    onSuccess: () => void;
    onError: (error: string) => void;
}

export default function StripePayment({ bookingId, amount, onSuccess, onError }: StripePaymentProps) {
    return (
        <Elements stripe={stripePromise}>
            <PaymentForm
                bookingId={bookingId}
                amount={amount}
                onSuccess={onSuccess}
                onError={onError}
            />
        </Elements>
    );
}
