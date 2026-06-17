// components/cashier/CartPanel.tsx
import React, { useState } from 'react';
import { ShoppingBag, ChevronUp, ChevronDown, Trash2, Printer, ArrowRight, Pause } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import BundleItem from './BundleItem';
import PaymentToggle from './PaymentToggle';
import { calcCartTotal, saveOrderToSupabase, formatOrderNumber, getNextDailyNumber, formatDailyOrderNumber } from '../../utils/orderUtils';

interface Props {
  forceExpanded?: boolean;
}

export default function CartPanel({ forceExpanded = false }: Props) {
  const { state, dispatch } = useApp();
  const [expanded, setExpanded] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState<'pay' | 'hold' | 'clear' | null>(null);

  const cart  = state.cart;
  const total = calcCartTotal(cart);
  const isEmpty = cart.length === 0;

  const isExpanded = forceExpanded || expanded;

  const initiatePay = () => {
    if (isEmpty) return;
    setShowConfirmModal('pay');
  };

  const initiateHold = () => {
    if (isEmpty) return;
    setShowConfirmModal('hold');
  };

  const initiateClear = () => {
    if (isEmpty) return;
    setShowConfirmModal('clear');
  };

  const handleHoldConfirm = async () => {
    if (isEmpty) return;

    const newOrder = {
      id:            crypto.randomUUID(),
      orderNumber:   state._nextOrderNumber,
      items:         [...cart],
      total,
      paymentMethod: state.paymentMethod,
      status:        'pending' as const,
      createdAt:     new Date().toISOString(),
    };

    // Trigger Supabase save in background
    saveOrderToSupabase(newOrder);

    // Confirm local order with status 'pending'
    dispatch({
      type: 'CONFIRM_ORDER',
      payload: { status: 'pending', paymentMethod: state.paymentMethod }
    });

    // Reset cart and close panel
    dispatch({ type: 'NEW_ORDER' });
    setShowConfirmModal(null);
    setExpanded(false);
  };

  const handlePayAndPrintConfirm = async () => {
    if (isEmpty) return;

    const newOrder = {
      id:            crypto.randomUUID(),
      orderNumber:   state._nextOrderNumber,
      items:         [...cart],
      total,
      paymentMethod: state.paymentMethod,
      status:        'completed' as const,
      createdAt:     new Date().toISOString(),
    };

    // Trigger Supabase save in background
    saveOrderToSupabase(newOrder);

    // Confirm order (stores in state.orders, sets currentOrder)
    dispatch({
      type: 'CONFIRM_ORDER',
      payload: { status: 'completed', paymentMethod: state.paymentMethod }
    });

    // Adjust document title so browser saves receipt with order number + date timestamp by default
    const originalTitle = document.title;
    const date = new Date(newOrder.createdAt);
    const dateStr = date.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' }).replace(/\//g, '-');
    document.title = `Order_${formatOrderNumber(state._nextOrderNumber)}_Ticket_${formatDailyOrderNumber(getNextDailyNumber(state.orders))}_${dateStr}`;

    // Print receipt and clear cart automatically
    setTimeout(() => {
      window.print();
      document.title = originalTitle;
      dispatch({ type: 'NEW_ORDER' });
    }, 100);

    setShowConfirmModal(null);
    setExpanded(false);
  };

  const handleClearCart = () => {
    dispatch({ type: 'CANCEL_ORDER' });
    setShowConfirmModal(null);
    setExpanded(false);
  };

  // ─── Inline Sidebar Layout (Desktop/Tablet) ──────────────────────────────────
  if (forceExpanded) {
    return (
      <div className="flex flex-col h-full bg-white relative animate-fade-in select-none">
        {/* Header */}
        <div className="px-5 py-5 border-b border-dark-100 flex items-center gap-2.5 flex-shrink-0 bg-dark-50/50">
          <ShoppingBag size={20} className={isEmpty ? 'text-dark-400' : 'text-brand-500'} strokeWidth={2.2} />
          <h3 className="font-extrabold text-dark-900 text-sm">
            Current Order ({cart.length})
          </h3>
        </div>

        {/* Content list */}
        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
          {isEmpty ? (
            <div className="flex flex-col items-center justify-center h-full text-dark-400 py-16 px-4 text-center my-auto">
              <span className="text-4xl mb-3">🛒</span>
              <p className="text-sm font-bold text-dark-800">Your cart is empty</p>
              <p className="text-xs text-dark-400 mt-1 max-w-xs leading-relaxed">
                Tap items on the menu grid to build an order.
              </p>
            </div>
          ) : (
            cart.map(bundle => (
              <BundleItem key={bundle.cartItemId} bundle={bundle} />
            ))
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-dark-100 p-5 bg-dark-50/50 flex-shrink-0">
          <PaymentToggle />
          <div className="flex items-center justify-between mt-4 mb-4">
            <span className="text-xs font-bold text-dark-500 uppercase tracking-widest">Total Amount</span>
            <span className="text-2xl font-black text-brand-600">¢{total.toFixed(2)}</span>
          </div>

          <div className="flex flex-col gap-2">
            <button
              type="button"
              onClick={initiatePay}
              disabled={isEmpty}
              className={`w-full bg-brand-500 hover:bg-brand-600 active:scale-[0.98] text-white py-3.5 rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all ${
                isEmpty ? 'opacity-50 cursor-not-allowed hover:bg-brand-500 active:scale-100' : ''
              }`}
            >
              <Printer size={14} strokeWidth={2.5} />
              Pay & Print Receipt
            </button>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={initiateClear}
                disabled={isEmpty}
                className={`flex-1 border border-red-200 hover:bg-red-50 text-red-500 py-3 rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-1.5 active:scale-[0.98] transition-all ${
                  isEmpty ? 'opacity-40 cursor-not-allowed hover:bg-transparent active:scale-100' : ''
                }`}
              >
                <Trash2 size={13} />
                Clear
              </button>
              <button
                type="button"
                onClick={initiateHold}
                disabled={isEmpty}
                className={`flex-[2] bg-amber-500 hover:bg-amber-600 text-white py-3 rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-1.5 active:scale-[0.98] transition-all shadow-sm ${
                  isEmpty ? 'opacity-50 cursor-not-allowed hover:bg-amber-500 active:scale-100' : ''
                }`}
              >
                <Pause size={13} strokeWidth={2.5} />
                Hold as Draft
              </button>
            </div>
          </div>
        </div>

        {/* Confirmation Modal */}
        {showConfirmModal && (
          <div className="modal-overlay select-none">
            <div className="modal-card w-full max-w-sm overflow-hidden flex flex-col p-5 bg-white shadow-card-lg border border-dark-100/30">
              {/* Header */}
              <div className="flex items-center gap-3 border-b border-dark-100/50 pb-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                  showConfirmModal === 'pay' ? 'bg-brand-50 text-brand-500' :
                  showConfirmModal === 'hold' ? 'bg-amber-50 text-amber-500' :
                  'bg-red-50 text-red-500'
                }`}>
                  {showConfirmModal === 'pay' ? <Printer size={20} /> :
                   showConfirmModal === 'hold' ? <Pause size={20} /> :
                   <Trash2 size={20} />}
                </div>
                <div>
                  <h3 className="font-extrabold text-dark-900 text-sm">
                    {showConfirmModal === 'pay' ? 'Confirm Payment & Print' :
                     showConfirmModal === 'hold' ? 'Hold Order (Draft)' :
                     'Clear Current Order?'}
                  </h3>
                  <p className="text-[10px] text-dark-500 font-semibold leading-none mt-0.5">
                    Order #{formatOrderNumber(state._nextOrderNumber)}
                  </p>
                </div>
              </div>

              {/* Body */}
              <div className="py-4 space-y-3.5 text-xs text-dark-700 font-medium">
                {showConfirmModal !== 'clear' ? (
                  <div className="bg-dark-50/50 rounded-2xl p-4 border border-dark-100 flex flex-col gap-2">
                    <div className="flex justify-between">
                      <span>Items Total</span>
                      <span className="font-bold text-dark-800">{cart.length} item{cart.length !== 1 ? 's' : ''}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Payment Type</span>
                      <span className="font-bold uppercase text-dark-800">{state.paymentMethod}</span>
                    </div>
                    <div className="flex justify-between border-t border-dashed border-dark-200 pt-2 text-sm">
                      <span className="font-bold text-dark-800">Total Amount</span>
                      <span className="font-black text-brand-600">¢{total.toFixed(2)}</span>
                    </div>
                  </div>
                ) : (
                  <div className="bg-red-50/20 rounded-2xl p-4 border border-red-100 flex flex-col gap-2">
                    <div className="flex justify-between text-red-700">
                      <span>Items to remove</span>
                      <span className="font-bold">{cart.length} item{cart.length !== 1 ? 's' : ''}</span>
                    </div>
                    <div className="flex justify-between border-t border-dashed border-red-200 pt-2 text-red-750">
                      <span>Total Value Lost</span>
                      <span className="font-black">¢{total.toFixed(2)}</span>
                    </div>
                  </div>
                )}
                <p className="text-[11px] leading-relaxed text-dark-500">
                  {showConfirmModal === 'pay'
                    ? 'This will record the payment and trigger receipt printing. The cart will clear automatically.'
                    : showConfirmModal === 'hold'
                    ? 'This will save the items to draft (Pending Payment). You can retrieve and complete this order later in the History tab.'
                    : 'This will remove all items currently in the cart. This action cannot be undone.'}
                </p>
              </div>

              {/* Actions */}
              <div className="flex gap-2.5 pt-2 border-t border-dark-100/50">
                <button
                  type="button"
                  onClick={() => setShowConfirmModal(null)}
                  className="flex-1 py-3 border border-dark-200 hover:bg-dark-50 text-dark-700 text-xs font-black uppercase tracking-wider rounded-xl transition-all"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={
                    showConfirmModal === 'pay' ? handlePayAndPrintConfirm :
                    showConfirmModal === 'hold' ? handleHoldConfirm :
                    handleClearCart
                  }
                  className={`flex-[1.5] py-3 text-white text-xs font-black uppercase tracking-wider rounded-xl transition-all shadow-sm ${
                    showConfirmModal === 'pay' ? 'bg-brand-500 hover:bg-brand-600' :
                    showConfirmModal === 'hold' ? 'bg-amber-500 hover:bg-amber-600' :
                    'bg-red-500 hover:bg-red-600'
                  }`}
                >
                  {showConfirmModal === 'pay' ? 'Pay & Print' :
                   showConfirmModal === 'hold' ? 'Confirm Hold' :
                   'Clear Cart'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ─── Collapsible Panel Layout (Mobile) ───────────────────────────────────────
  return (
    <div className="bg-white border-t border-brand-100 shadow-[0_-4px_20px_rgba(0,0,0,0.08)] flex flex-col flex-shrink-0 transition-all duration-300">
      {/* Collapsed Header / Toggle Bar */}
      <button
        type="button"
        onClick={() => setExpanded(prev => !prev)}
        className="w-full flex items-center justify-between px-5 py-4 cursor-pointer focus:outline-none hover:bg-brand-50/30 transition-colors"
      >
        <div className="flex items-center gap-2.5">
          <ShoppingBag size={20} className={isEmpty ? 'text-dark-400' : 'text-brand-500'} strokeWidth={2.2} />
          <span className="font-bold text-dark-900 text-sm">
            {cart.length} item{cart.length !== 1 ? 's' : ''}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="font-black text-brand-600 text-lg">
            ¢{total.toFixed(2)}
          </span>
          {expanded ? (
            <ChevronDown size={20} className="text-dark-400" />
          ) : (
            <ChevronUp size={20} className="text-dark-400" />
          )}
        </div>
      </button>

      {/* Expanded Details */}
      {isExpanded && (
        <div className="px-5 pb-5 border-t border-dark-100 flex flex-col gap-4 max-h-[50vh] overflow-y-auto">
          {/* Scrollable list of bundles */}
          {isEmpty ? (
            <div className="flex flex-col items-center justify-center py-8 text-dark-400">
              <span className="text-3xl mb-1">🛒</span>
              <p className="text-sm font-medium">Your cart is empty</p>
            </div>
          ) : (
            <div className="flex flex-col gap-3 py-3 overflow-y-auto max-h-48">
              {cart.map(bundle => (
                <BundleItem key={bundle.cartItemId} bundle={bundle} />
              ))}
            </div>
          )}

          {/* Payment selector */}
          <PaymentToggle />

          {/* Totals & Clear Option */}
          <div className="flex items-center justify-between border-t border-dark-100 pt-3">
            <button
              type="button"
              onClick={initiateClear}
              disabled={isEmpty}
              className={`flex items-center gap-1 text-xs font-bold text-red-500 hover:text-red-600 active:scale-95 transition-all select-none ${isEmpty ? 'opacity-40 cursor-not-allowed' : ''}`}
            >
              <Trash2 size={14} /> Clear Cart
            </button>
            <div className="flex items-baseline gap-1">
              <span className="text-xs text-dark-400 font-semibold">Total:</span>
              <span className="text-xl font-black text-brand-600">¢{total.toFixed(2)}</span>
            </div>
          </div>

          {/* Checkout Buttons */}
          <div className="flex flex-col gap-2">
            <button
              type="button"
              onClick={initiatePay}
              disabled={isEmpty}
              className={`w-full bg-brand-500 hover:bg-brand-600 text-white py-3.5 rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 transition-all active:scale-[0.98] shadow-sm ${
                isEmpty ? 'opacity-50 cursor-not-allowed hover:bg-brand-500 active:scale-100' : ''
              }`}
            >
              <Printer size={14} strokeWidth={2.5} />
              Pay & Print Receipt
            </button>
            <button
              type="button"
              onClick={initiateHold}
              disabled={isEmpty}
              className={`w-full bg-amber-500 hover:bg-amber-600 text-white py-3 rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all active:scale-[0.98] shadow-sm ${
                isEmpty ? 'opacity-50 cursor-not-allowed hover:bg-amber-500 active:scale-100' : ''
              }`}
            >
              <Pause size={13} strokeWidth={2.5} />
              Hold as Draft
            </button>
          </div>
        </div>
      )}

      {/* Confirmation Modal (Mobile Overlay) */}
      {showConfirmModal && (
        <div className="modal-overlay select-none">
          <div className="modal-card w-full max-w-sm overflow-hidden flex flex-col p-5 bg-white shadow-card-lg border border-dark-100/30">
            {/* Header */}
            <div className="flex items-center gap-3 border-b border-dark-100/50 pb-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                showConfirmModal === 'pay' ? 'bg-brand-50 text-brand-500' :
                showConfirmModal === 'hold' ? 'bg-amber-50 text-amber-500' :
                'bg-red-50 text-red-500'
              }`}>
                {showConfirmModal === 'pay' ? <Printer size={20} /> :
                 showConfirmModal === 'hold' ? <Pause size={20} /> :
                 <Trash2 size={20} />}
              </div>
              <div>
                <h3 className="font-extrabold text-dark-900 text-sm">
                  {showConfirmModal === 'pay' ? 'Confirm Payment & Print' :
                   showConfirmModal === 'hold' ? 'Hold Order (Draft)' :
                   'Clear Current Order?'}
                </h3>
                <p className="text-[10px] text-dark-500 font-semibold leading-none mt-0.5">
                  Order #{formatOrderNumber(state._nextOrderNumber)}
                </p>
              </div>
            </div>

            {/* Body */}
            <div className="py-4 space-y-3.5 text-xs text-dark-700 font-medium">
              {showConfirmModal !== 'clear' ? (
                <div className="bg-dark-50/50 rounded-2xl p-4 border border-dark-100 flex flex-col gap-2">
                  <div className="flex justify-between">
                    <span>Items Total</span>
                    <span className="font-bold text-dark-800">{cart.length} item{cart.length !== 1 ? 's' : ''}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Payment Type</span>
                    <span className="font-bold uppercase text-dark-800">{state.paymentMethod}</span>
                  </div>
                  <div className="flex justify-between border-t border-dashed border-dark-200 pt-2 text-sm">
                    <span className="font-bold text-dark-800">Total Amount</span>
                    <span className="font-black text-brand-600">¢{total.toFixed(2)}</span>
                  </div>
                </div>
              ) : (
                <div className="bg-red-50/20 rounded-2xl p-4 border border-red-100 flex flex-col gap-2">
                  <div className="flex justify-between text-red-700">
                    <span>Items to remove</span>
                    <span className="font-bold">{cart.length} item{cart.length !== 1 ? 's' : ''}</span>
                  </div>
                  <div className="flex justify-between border-t border-dashed border-red-200 pt-2 text-red-750">
                    <span>Total Value Lost</span>
                    <span className="font-black">¢{total.toFixed(2)}</span>
                  </div>
                </div>
              )}
              <p className="text-[11px] leading-relaxed text-dark-500">
                {showConfirmModal === 'pay'
                  ? 'This will record the payment and trigger receipt printing. The cart will clear automatically.'
                  : showConfirmModal === 'hold'
                  ? 'This will save the items to draft (Pending Payment). You can retrieve and complete this order later in the History tab.'
                  : 'This will remove all items currently in the cart. This action cannot be undone.'}
              </p>
            </div>

            {/* Actions */}
            <div className="flex gap-2.5 pt-2 border-t border-dark-100/50">
              <button
                type="button"
                onClick={() => setShowConfirmModal(null)}
                className="flex-1 py-3 border border-dark-200 hover:bg-dark-50 text-dark-700 text-xs font-black uppercase tracking-wider rounded-xl transition-all"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={
                  showConfirmModal === 'pay' ? handlePayAndPrintConfirm :
                  showConfirmModal === 'hold' ? handleHoldConfirm :
                  handleClearCart
                }
                className={`flex-[1.5] py-3 text-white text-xs font-black uppercase tracking-wider rounded-xl transition-all shadow-sm ${
                  showConfirmModal === 'pay' ? 'bg-brand-500 hover:bg-brand-600' :
                  showConfirmModal === 'hold' ? 'bg-amber-500 hover:bg-amber-600' :
                  'bg-red-500 hover:bg-red-600'
                }`}
              >
                {showConfirmModal === 'pay' ? 'Pay & Print' :
                 showConfirmModal === 'hold' ? 'Confirm Hold' :
                 'Clear Cart'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
