import { usePaystackPayment } from 'react-paystack';
import { useApp } from '../context/AppContext';

export function usePaystackCheckout(amount: number, email: string, onSuccess: (reference: any) => void, onClose: () => void) {
  const { state } = useApp();
  const publicKey = state.storeSettings.paystackPublicKey || import.meta.env.VITE_PAYSTACK_PUBLIC_KEY || 'pk_test_placeholder';

  const config = {
    reference: (new Date()).getTime().toString() + crypto.randomUUID().slice(0, 8),
    email: email || 'guest@bellskitchen.com',
    amount: Math.round(amount * 100), // in pesewas
    publicKey,
    currency: 'GHS',
  };

  const initializePayment = usePaystackPayment(config);

  const startCheckout = () => {
    initializePayment({ onSuccess, onClose });
  };

  return { startCheckout };
}
