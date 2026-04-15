import React, { useState, useEffect } from 'react';
import { ShieldCheck, CreditCard, FileDown, Loader2, CheckCircle2, Lock } from 'lucide-react';
import { jsPDF } from 'jspdf';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';

// Get public key from Vite Environment
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

// Inner form component to access Stripe hooks
const CheckoutForm = ({ onSuccess, amount }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [error, setError] = useState(null);
  const [processing, setProcessing] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    // Optional: Only check Klaro consent for 'payments' dynamically here
    // const hasConsent = window.klaro && window.klaro.getManager().getConsent('stripe');

    setProcessing(true);
    const { error: submitError, paymentIntent } = await stripe.confirmPayment({
      elements,
      confirmParams: { return_url: window.location.href },
      redirect: 'if_required',
    });

    if (submitError) {
      setError(submitError.message);
      setProcessing(false);
    } else if (paymentIntent && paymentIntent.status === 'succeeded') {
      setProcessing(false);
      onSuccess();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <PaymentElement />
      {error && <div className="text-red-500 text-sm mt-2">{error}</div>}
      <button
        disabled={!stripe || processing}
        type="submit"
        className="w-full mt-4 bg-primary-600 hover:bg-primary-700 text-white font-bold py-3 px-4 rounded-xl transition-all disabled:opacity-50"
      >
        {processing ? 'Verarbeite Zahlung...' : `${amount},00 € Jetzt bezahlen`}
      </button>
    </form>
  );
};

const DOC_LABELS = {
  deathCertificate: 'Sterbeurkunde (Kopie)',
  applicantId: 'Personalausweis / Reisepass des Antragstellers (Kopie)',
  proofOfRelationship: 'Verwandtschaftsnachweis (Heiratsurkunde / Erbschein)',
  powerOfAttorney: 'Vollmacht / Nachlassurkunde',
};

const Step7_Payment = ({ data, onSuccess, platformMeta = [] }) => {
  const [clientSecret, setClientSecret] = useState(null);
  const [totalAmount, setTotalAmount] = useState(null);

  const uploadedDocs = Object.entries(data.documents || {})
    .filter(([, file]) => file)
    .map(([key]) => DOC_LABELS[key] || key);

  useEffect(() => {
    // Initialize Stripe session dynamically
    fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/create-payment-intent`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ selectedPlatforms: data.platforms })
    })
      .then(r => r.json())
      .then(resData => {
        setClientSecret(resData.clientSecret);
        setTotalAmount(resData.totalAmount);
      })
      .catch(e => console.error('Error creating payment intent:', e));
  }, []);

  return (
    <div>
      <h2 className="text-3xl font-bold text-gray-900 mb-2">Zahlung abschließen</h2>
      <p className="text-gray-500 mb-10">Bestätigen Sie die Zusammenfassung und schließen Sie den Vorgang ab.</p>

      <div className="space-y-8">


        {/* Summary */}
        <div className="p-6 rounded-2xl bg-gray-50 border border-gray-100 space-y-4">
          <h3 className="font-bold text-gray-900 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-green-500" /> Zusammenfassung
          </h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-500">Antragsteller:</p>
              <p className="font-semibold">{data.person2?.firstName} {data.person2?.lastName}</p>
            </div>
            <div>
              <p className="text-gray-500">Verstorbene Person:</p>
              <p className="font-semibold">{data.person1?.firstName} {data.person1?.lastName}</p>
            </div>
            <div className="col-span-2 sm:col-span-1">
              <p className="text-gray-500">Plattformen:</p>
              <p className="font-semibold leading-relaxed">
                {data.platforms.map(pid => {
                  const meta = platformMeta.find(m => m.id === pid);
                  return meta ? meta.name : pid;
                }).join(', ')}
              </p>
            </div>
            <div>
              <p className="text-gray-500">Dokumente:</p>
              <p className="font-semibold">{uploadedDocs.length} hochgeladen</p>
            </div>
          </div>
          {uploadedDocs.length > 0 && (
            <div className="pt-2 border-t border-gray-200">
              <p className="text-xs font-bold text-gray-600 mb-1">Beigefügte Anlagen:</p>
              <ul className="text-xs text-gray-500 space-y-0.5">
                {uploadedDocs.map((d, i) => <li key={i}>• {d}</li>)}
              </ul>
            </div>
          )}
        </div>

        {/* Payment */}
        <div className="p-8 rounded-3xl border-2 border-primary-100 bg-white space-y-6">
          <div className="flex items-center justify-between pointer-events-none">
            <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <CreditCard className="w-6 h-6 text-primary-600" /> Zahlungsinformationen
            </h3>
            <span className="text-2xl font-black text-primary-600">
              {totalAmount ? `${totalAmount},00 €` : '...'}
            </span>
          </div>
          
          {clientSecret ? (
            <Elements stripe={stripePromise} options={{ clientSecret, appearance: { theme: 'stripe' } }}>
              <CheckoutForm onSuccess={onSuccess} amount={totalAmount} />
            </Elements>
          ) : (
            <div className="flex justify-center p-8"><Loader2 className="w-8 h-8 animate-spin text-primary-500" /></div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Step7_Payment;
