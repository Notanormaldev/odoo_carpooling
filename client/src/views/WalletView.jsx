import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Loader } from 'lucide-react';
import toast from 'react-hot-toast';
import useAuthStore from '../store/authStore';
import api from '../api/axios';

export default function WalletView() {
  const { user, loadUser } = useAuthStore();
  const [balance, setBalance] = useState(0);
  const [amount, setAmount] = useState('500');
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchBalance();
  }, []);

  const fetchBalance = async () => {
    try {
      const res = await api.get('/wallet/balance');
      setBalance(res.data.data.balance);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleRecharge = async (e) => {
    e.preventDefault();
    const amt = Number(amount);
    if (!amt || amt <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    setPaying(true);
    try {
      // 1. Create Order on Backend
      const orderRes = await api.post('/wallet/recharge/order', { amount: amt });
      const { id: orderId, amount: orderAmt } = orderRes.data.data;

      // 2. Open Razorpay Checkout Modal
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_xxxx',
        amount: orderAmt,
        currency: 'INR',
        name: 'Carpooling Wallet',
        description: 'Load credits for corporate carpooling rides',
        order_id: orderId,
        prefill: {
          name: user?.name || '',
          email: user?.email || '',
          contact: user?.mobile || '',
        },
        readonly: {
          contact: true,
          email: true,
          name: true,
        },
        theme: {
          color: '#e85d4a',
        },
        handler: async function (response) {
          try {
            // 3. Verify Payment on Backend
            await api.post('/wallet/recharge/verify', {
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
            });
            toast.success(`₹${amt} added to your wallet! 🎉`);
            fetchBalance();
            await loadUser(); // refresh user balance in global navbar
          } catch (err) {
            toast.error('Payment verification failed. Contact support.');
          } finally {
            setPaying(false);
          }
        },
        modal: {
          ondismiss: function () {
            setPaying(false);
          }
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not initiate payment');
      setPaying(false);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-8 max-w-6xl mx-auto">
      <div className="md:col-span-1 bg-white border border-slate-200 p-6 rounded-lg shadow-sm h-fit">
        <h2 className="font-bold text-lg text-slate-800">Wallet</h2>
        <p className="text-xs text-slate-400 mt-1 font-medium">Recharge details</p>
      </div>

      <div className="md:col-span-3 bg-white border border-slate-200 rounded-lg p-6 shadow-sm space-y-6">
        <div className="flex items-center justify-between border-b border-slate-200 pb-4">
          <div className="flex items-center gap-2">
            <ChevronLeft className="w-5 h-5 text-[#e85d4a] cursor-pointer" onClick={() => navigate(-1)} />
            <h3 className="font-bold text-slate-800 text-sm">Recharge Wallet</h3>
          </div>
          <span className="text-sm font-semibold text-slate-600">Balance: <b className="text-slate-800">₹{balance}</b></span>
        </div>

        <form onSubmit={handleRecharge} className="space-y-6 max-w-md mx-auto">
          <div className="flex items-center gap-3">
            <span className="text-sm text-slate-400 font-bold">Amount</span>
            <input 
              type="text" 
              value={`₹ ${amount}`} 
              onChange={(e) => setAmount(e.target.value.replace(/[^0-9]/g, ''))}
              className="bg-transparent border-b border-slate-300 py-1 text-slate-800 font-bold text-base w-32 focus:outline-none focus:border-[#e85d4a]"
            />
          </div>

          <div className="p-3 bg-slate-50 border border-slate-100 rounded text-xs text-slate-500 space-y-1">
            <p className="font-semibold text-slate-600">Razorpay Secure Checkout</p>
            <p>Supports: UPI · Credit / Debit Card · Net Banking · Wallets</p>
          </div>

          <button
            type="submit"
            disabled={paying}
            className="w-full bg-[#e85d4a] hover:bg-[#d94d3a] disabled:opacity-50 text-white py-3 rounded text-sm font-semibold transition-colors shadow-sm flex items-center justify-center gap-2 cursor-pointer"
          >
            {paying ? <><Loader className="w-4 h-4 animate-spin" /> Processing...</> : `Pay ₹${amount} via Razorpay`}
          </button>
        </form>
      </div>
    </div>
  );
}
