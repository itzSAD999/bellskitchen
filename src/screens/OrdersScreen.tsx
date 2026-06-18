// screens/OrdersScreen.tsx
import React, { useState } from 'react';
import { Search, Printer, Calendar, CreditCard, DollarSign, Clock, ChevronDown, ChevronUp, Pause, Check, Trash2 } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useOrders } from '../hooks/useOrders';
import { useMenu } from '../hooks/useMenu';
import { formatOrderNumber, getDailyOrderNumber, formatDailyOrderNumber, formatGHS, updateOrderStatusInSupabase } from '../utils/orderUtils';
import ReceiptView from '../components/receipt/ReceiptView';
import { Order } from '../types';

export default function OrdersScreen() {
  // Sync state with database on mount
  useMenu();
  useOrders();

  const { state, dispatch } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'completed' | 'pending' | 'cancelled'>('all');
  const [paymentFilter, setPaymentFilter] = useState<'all' | 'cash' | 'momo'>('all');
  
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);
  
  // Custom dialog state for completing pending (draft) orders
  const [payingOrder, setPayingOrder] = useState<Order | null>(null);
  const [payingMethod, setPayingMethod] = useState<'cash' | 'momo'>('cash');
  
  // Target order to render in hidden printable ReceiptView
  const [printOrder, setPrintOrder] = useState<Order | null>(null);

  // Filter orders based on queries
  const filteredOrders = state.orders.filter(o => {
    const matchesSearch =
      formatOrderNumber(o.orderNumber).includes(searchQuery) ||
      o.items.some(item => item.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      o.total.toString().includes(searchQuery);

    const matchesStatus =
      statusFilter === 'all' || o.status === statusFilter;

    const matchesPayment =
      paymentFilter === 'all' || o.paymentMethod === paymentFilter;

    return matchesSearch && matchesStatus && matchesPayment;
  });

  // Session-wide calculations (using state.orders)
  const completedOrders = state.orders.filter(o => o.status === 'completed');
  const totalRevenue = completedOrders.reduce((sum, o) => sum + o.total, 0);
  const cashCount = completedOrders.filter(o => o.paymentMethod === 'cash').length;
  const momoCount = completedOrders.filter(o => o.paymentMethod === 'momo').length;
  const cashRevenue = completedOrders.filter(o => o.paymentMethod === 'cash').reduce((sum, o) => sum + o.total, 0);
  const momoRevenue = completedOrders.filter(o => o.paymentMethod === 'momo').reduce((sum, o) => sum + o.total, 0);
  const draftCount = state.orders.filter(o => o.status === 'pending').length;

  const toggleExpand = (id: string) => {
    setExpandedOrderId(prev => (prev === id ? null : id));
  };

  const handleReprint = (order: Order) => {
    setPrintOrder(order);
    const originalTitle = document.title;
    const date = new Date(order.createdAt);
    const dateStr = date.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' }).replace(/\//g, '-');
    document.title = `Order_${formatOrderNumber(order.orderNumber)}_Ticket_${formatDailyOrderNumber(getDailyOrderNumber(order, state.orders))}_${dateStr}`;

    setTimeout(() => {
      window.print();
      document.title = originalTitle;
      setPrintOrder(null);
    }, 100);
  };

  const initiatePayment = (order: Order) => {
    setPayingOrder(order);
    setPayingMethod(order.paymentMethod === 'card' ? 'cash' : (order.paymentMethod as 'cash' | 'momo'));
  };

  const handlePayConfirm = async () => {
    if (!payingOrder) return;

    // 1. Update status to 'completed' in Supabase
    updateOrderStatusInSupabase(payingOrder.id, 'completed', payingMethod);

    // 2. Dispatch to local state
    dispatch({
      type: 'COMPLETE_PENDING_ORDER',
      payload: { id: payingOrder.id, paymentMethod: payingMethod }
    });

    // 3. Set print order to render ReceiptView & trigger print
    const finalOrder: Order = {
      ...payingOrder,
      status: 'completed',
      paymentMethod: payingMethod
    };
    
    setPrintOrder(finalOrder);

    const originalTitle = document.title;
    const date = new Date(payingOrder.createdAt);
    const dateStr = date.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' }).replace(/\//g, '-');
    document.title = `Order_${formatOrderNumber(payingOrder.orderNumber)}_Ticket_${formatDailyOrderNumber(getDailyOrderNumber(payingOrder, state.orders))}_${dateStr}`;

    setTimeout(() => {
      window.print();
      document.title = originalTitle;
      setPrintOrder(null);
    }, 100);

    setPayingOrder(null);
  };

  const handleVoidDraft = async (orderId: string) => {
    const confirmVoid = window.confirm('Are you sure you want to void/cancel this draft order?');
    if (!confirmVoid) return;

    // Update status to 'cancelled' in Supabase
    updateOrderStatusInSupabase(orderId, 'cancelled');

    // Dispatch to local state
    dispatch({
      type: 'CANCEL_PENDING_ORDER',
      payload: orderId
    });
  };

  return (
    <div className="flex flex-col h-full bg-transparent select-none overflow-hidden print:bg-white print:p-0">
      {/* Search and Filters Bar - Hidden during printing */}
      <div className="bg-white border-b border-dark-100/60 p-4 md:p-5 flex-shrink-0 flex flex-col xl:flex-row xl:items-center justify-between gap-4 print:hidden">
        <div>
          <h2 className="text-dark-900 font-black text-lg md:text-xl tracking-tight">Order History & Drafts</h2>
          <p className="text-dark-500 text-xs mt-0.5 font-semibold">Track transactions, resolve unpaid drafts, and print receipts</p>
        </div>

        {/* Filters Grid */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Search bar */}
          <div className="relative w-44 md:w-56 flex-shrink-0">
            <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-dark-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search order #, item..."
              className="w-full bg-dark-50 border border-dark-100 rounded-xl pl-9 pr-3 py-2 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-transparent transition-all"
            />
          </div>

          {/* Status filter */}
          <div className="flex bg-dark-50 p-1 rounded-xl border border-dark-100 flex-shrink-0">
            {(['all', 'completed', 'pending', 'cancelled'] as const).map(st => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all whitespace-nowrap border border-transparent ${
                  statusFilter === st
                    ? 'bg-[#d97706] text-white shadow-md border-[#ffefd4]/20'
                    : 'text-dark-600 hover:text-dark-950 hover:bg-dark-100/50'
                }`}
              >
                {st === 'pending' ? `Drafts (${draftCount})` : st}
              </button>
            ))}
          </div>

          {/* Payment filter */}
          <div className="flex bg-dark-50 p-1 rounded-xl border border-dark-100 flex-shrink-0">
            {(['all', 'cash', 'momo'] as const).map(pm => (
              <button
                key={pm}
                onClick={() => setPaymentFilter(pm)}
                className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all whitespace-nowrap border border-transparent ${
                  paymentFilter === pm
                    ? 'bg-[#d97706] text-white shadow-md border-[#ffefd4]/20'
                    : 'text-dark-600 hover:text-dark-950 hover:bg-dark-100/50'
                }`}
              >
                {pm}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Metrics Row - Hidden during printing - Branded colorful indicators */}
      <div className="p-4 md:p-5 flex-shrink-0 grid grid-cols-2 md:grid-cols-4 gap-3 print:hidden">
        {/* Metric 1 - Crimson Red theme */}
        <div className="bg-white p-4 rounded-2xl border border-red-100 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-red-50 text-red-700 border border-red-100 flex items-center justify-center flex-shrink-0">
            <Calendar size={18} strokeWidth={2.5} />
          </div>
          <div>
            <div className="text-[10px] text-dark-400 font-extrabold uppercase tracking-wider leading-none">Completed</div>
            <div className="text-lg font-black text-dark-900 mt-1">{completedOrders.length}</div>
          </div>
        </div>

        {/* Metric 2 - Warm Orange theme */}
        <div className="bg-white p-4 rounded-2xl border border-orange-100 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-600 border border-orange-100 flex items-center justify-center flex-shrink-0">
            <DollarSign size={18} strokeWidth={2.5} />
          </div>
          <div>
            <div className="text-[10px] text-dark-400 font-extrabold uppercase tracking-wider leading-none">Total Revenue</div>
            <div className="text-lg font-black text-brand-600 mt-1">{formatGHS(totalRevenue)}</div>
          </div>
        </div>

        {/* Metric 3 - Warm Amber / Gold theme */}
        <div className="bg-white p-4 rounded-2xl border border-amber-100 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 border border-amber-100 flex items-center justify-center flex-shrink-0">
            <DollarSign size={18} strokeWidth={2.5} className="opacity-80" />
          </div>
          <div>
            <div className="text-[10px] text-dark-400 font-extrabold uppercase tracking-wider leading-none">Cash Sales</div>
            <div className="text-xs font-bold text-dark-700 mt-1">
              <span className="font-black text-dark-900 text-sm">{formatGHS(cashRevenue)}</span> ({cashCount})
            </div>
          </div>
        </div>

        {/* Metric 4 - Chocolate Brown / Gold theme */}
        <div className="bg-white p-4 rounded-2xl border border-brand-100/40 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-brand-50/50 text-brand-800 border border-brand-100/45 flex items-center justify-center flex-shrink-0">
            <CreditCard size={18} strokeWidth={2.5} />
          </div>
          <div>
            <div className="text-[10px] text-dark-400 font-extrabold uppercase tracking-wider leading-none">MoMo Sales</div>
            <div className="text-xs font-bold text-dark-700 mt-1">
              <span className="font-black text-dark-900 text-sm">{formatGHS(momoRevenue)}</span> ({momoCount})
            </div>
          </div>
        </div>
      </div>

      {/* Orders Scrollable Content - Hidden during printing */}
      <div className="flex-1 overflow-y-auto px-4 md:px-5 pb-5 print:hidden">
        {filteredOrders.length === 0 ? (
          <div className="bg-white rounded-3xl border border-dark-100/50 p-12 text-center shadow-card max-w-md mx-auto mt-6">
            <span className="text-4xl">🗒️</span>
            <h3 className="text-dark-800 font-bold text-sm mt-3">No orders found</h3>
            <p className="text-dark-400 text-xs mt-1 max-w-xs mx-auto leading-relaxed">
              We couldn't find any orders matching your filter criteria. Unpaid drafts and completed sales show up here.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {filteredOrders.map(order => {
              const isExpanded = expandedOrderId === order.id;
              const dateObj = new Date(order.createdAt);
              const timeStr = dateObj.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
              const dateStr = dateObj.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });

              return (
                <div
                  key={order.id}
                  className={`bg-white rounded-2xl border transition-all duration-150 shadow-sm overflow-hidden ${
                    order.status === 'pending'
                      ? 'border-red-300 bg-red-50/5 hover:border-red-400'
                      : order.status === 'cancelled'
                      ? 'border-dark-100 opacity-60 bg-dark-50/5'
                      : isExpanded
                      ? 'border-orange-300 ring-1 ring-orange-300'
                      : 'border-dark-100/60 hover:border-dark-200 hover:shadow-[0_4px_12px_rgba(249,127,10,0.04)]'
                  }`}
                >
                  {/* Card Header Row */}
                  <div
                    onClick={() => toggleExpand(order.id)}
                    className="p-4 flex items-center justify-between cursor-pointer hover:bg-brand-50/20 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex flex-col">
                        <span className="text-xs font-black text-dark-900 flex items-center gap-2">
                          Ticket #{formatDailyOrderNumber(getDailyOrderNumber(order, state.orders))} <span className="text-dark-400 font-semibold">· Ref #{formatOrderNumber(order.orderNumber)}</span>
                          {order.status === 'pending' && (
                            <span className="bg-red-50 border border-red-100 text-red-700 text-[8px] font-black tracking-wider px-2 py-0.5 rounded-full flex items-center gap-1 animate-pulse">
                              <Pause size={8} /> DRAFT / UNPAID
                            </span>
                          )}
                          {order.status === 'cancelled' && (
                            <span className="bg-dark-100 border border-dark-200 text-dark-600 text-[8px] font-black tracking-wider px-2 py-0.5 rounded-full">
                              VOIDED
                            </span>
                          )}
                        </span>
                        <span className="text-[10px] text-dark-400 font-bold flex items-center gap-1 mt-0.5">
                          <Clock size={11} className="text-brand-500" /> {dateStr} at {timeStr}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      {/* Payment Method badge */}
                      <span
                        className={`text-[9px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-lg border ${
                          order.status === 'pending'
                            ? 'bg-red-50 text-red-700 border-red-100'
                            : order.paymentMethod === 'cash'
                            ? 'bg-amber-50 text-amber-700 border-amber-200'
                            : 'bg-orange-50 text-orange-700 border-orange-200'
                        }`}
                      >
                        {order.status === 'pending' ? 'Unpaid' : order.paymentMethod}
                      </span>

                      {/* Total */}
                      <span className="text-sm font-black text-brand-600">
                        {formatGHS(order.total)}
                      </span>

                      {/* Expand Chevron */}
                      {isExpanded ? (
                        <ChevronUp size={16} className="text-dark-400" />
                      ) : (
                        <ChevronDown size={16} className="text-dark-400" />
                      )}
                    </div>
                  </div>

                  {/* Expanded Body Panel */}
                  {isExpanded && (
                    <div className="border-t border-dark-100/50 bg-dark-50/20 p-4 md:p-5 flex flex-col md:flex-row gap-6 animate-fade-in">
                      {/* Left: Items Breakdown */}
                      <div className="flex-1 space-y-3">
                        <h4 className="text-[10px] text-brand-700 font-black uppercase tracking-widest leading-none border-b border-brand-100/30 pb-1.5">
                          Ordered Items
                        </h4>
                        <div className="divide-y divide-dark-100/40">
                          {order.items.map((item, idx) => (
                            <div key={item.cartItemId || idx} className="py-2.5 first:pt-0 last:pb-0">
                              <div className="flex items-baseline justify-between text-xs font-bold text-dark-900">
                                <span>
                                  {item.quantity} × {item.name} <span className="text-[10px] text-dark-500 font-semibold">({item.size})</span>
                                </span>
                                <span className="font-extrabold text-dark-800">
                                  {formatGHS(item.bundleTotal * item.quantity)}
                                </span>
                              </div>
                              {item.addons && item.addons.length > 0 && (
                                <div className="text-[10px] text-dark-500 font-semibold pl-4 mt-0.5 space-y-0.5">
                                  {item.addons.map((a, aIdx) => (
                                    <div key={aIdx} className="flex justify-between">
                                      <span>+ {a.name}</span>
                                      <span>{formatGHS(a.price)}</span>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Right: Summary & Controls */}
                      <div className="w-full md:w-64 flex-shrink-0 flex flex-col justify-between border-t md:border-t-0 md:border-l border-dark-100/60 pt-4 md:pt-0 md:pl-6 gap-4">
                        <div className="space-y-2.5">
                          <h4 className="text-[10px] text-brand-700 font-black uppercase tracking-widest leading-none border-b border-brand-100/30 pb-1.5">
                            Transaction Info
                          </h4>
                          <div className="flex justify-between text-xs font-semibold text-dark-600">
                            <span>Status</span>
                            <span className={`font-bold capitalize ${
                              order.status === 'completed'
                                ? 'text-emerald-600'
                                : order.status === 'pending'
                                ? 'text-red-500'
                                : 'text-dark-500'
                            }`}>
                              {order.status === 'pending' ? 'pending payment' : order.status}
                            </span>
                          </div>
                          <div className="flex justify-between text-xs font-semibold text-dark-600">
                            <span>Payment Mode</span>
                            <span className="font-bold uppercase text-dark-900">{order.status === 'pending' ? 'unpaid' : order.paymentMethod}</span>
                          </div>
                          <div className="flex justify-between text-xs font-bold text-dark-900 border-t border-dashed border-dark-200 pt-2 text-sm">
                            <span>Grand Total</span>
                            <span className="font-black text-brand-600">{formatGHS(order.total)}</span>
                          </div>
                        </div>

                        {order.status === 'completed' && (
                          <button
                            type="button"
                            onClick={() => handleReprint(order)}
                            className="w-full bg-brand-50 hover:bg-brand-100 text-brand-700 py-3 rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all border border-brand-100 hover:border-brand-200 active:scale-[0.98]"
                          >
                            <Printer size={13} />
                            Reprint Receipt
                          </button>
                        )}

                        {order.status === 'pending' && (
                          <div className="flex flex-col gap-2">
                            <button
                              type="button"
                              onClick={() => initiatePayment(order)}
                              className="w-full bg-emerald-500 hover:bg-emerald-600 text-white py-3 rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all active:scale-[0.98] shadow-sm font-bold"
                            >
                              <Check size={13} strokeWidth={2.5} />
                              Resolve & Print
                            </button>
                            <button
                              type="button"
                              onClick={() => handleVoidDraft(order.id)}
                              className="w-full border border-red-200 hover:bg-red-50 text-red-500 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider flex items-center justify-center gap-1 active:scale-[0.98] transition-all"
                            >
                              <Trash2 size={12} />
                              Void Order
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Pay Order confirmation modal */}
      {payingOrder && (
        <div className="modal-overlay select-none">
          <div className="modal-card w-full max-w-sm overflow-hidden flex flex-col p-5 bg-white shadow-card-lg border border-dark-100/30">
            {/* Header */}
            <div className="flex items-center gap-3 border-b border-dark-100/50 pb-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-500 flex items-center justify-center">
                <Check size={20} strokeWidth={2.5} />
              </div>
              <div>
                <h3 className="font-extrabold text-dark-900 text-sm">
                  Complete Payment
                </h3>
                <p className="text-[10px] text-dark-500 font-semibold mt-0.5">
                  Order #{formatOrderNumber(payingOrder.orderNumber)}
                </p>
              </div>
            </div>

            {/* Body */}
            <div className="py-4 space-y-4 text-xs text-dark-700 font-medium">
              <div className="flex justify-between items-center bg-dark-50/50 rounded-2xl p-4 border border-dark-100">
                <span>Total Amount Due</span>
                <span className="text-xl font-black text-brand-600">{formatGHS(payingOrder.total)}</span>
              </div>
              
              {/* Payment selector */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-dark-400 uppercase tracking-wider">Select Payment Method</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setPayingMethod('cash')}
                    className={`py-3 rounded-xl font-bold uppercase text-xs tracking-wider border flex items-center justify-center gap-1.5 transition-all ${
                      payingMethod === 'cash'
                        ? 'bg-emerald-500 text-white border-emerald-500 shadow-sm'
                        : 'bg-white text-dark-700 border-dark-200 hover:bg-dark-50'
                    }`}
                  >
                    💵 Cash
                  </button>
                  <button
                    type="button"
                    onClick={() => setPayingMethod('momo')}
                    className={`py-3 rounded-xl font-bold uppercase text-xs tracking-wider border flex items-center justify-center gap-1.5 transition-all ${
                      payingMethod === 'momo'
                        ? 'bg-blue-500 text-white border-blue-500 shadow-sm'
                        : 'bg-white text-dark-700 border-dark-200 hover:bg-dark-50'
                    }`}
                  >
                    📱 MoMo
                  </button>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2.5 pt-2 border-t border-dark-100/50">
              <button
                type="button"
                onClick={() => setPayingOrder(null)}
                className="flex-1 py-3 border border-dark-200 hover:bg-dark-50 text-dark-700 text-xs font-black uppercase tracking-wider rounded-xl transition-all"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handlePayConfirm}
                className="flex-[1.5] py-3 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-black uppercase tracking-wider rounded-xl transition-all shadow-sm"
              >
                Pay & Print
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Hidden print-only receipt view. Targeted by browser printing when printOrder is set */}
      <div className="hidden print:block">
        {printOrder && <ReceiptView order={printOrder} />}
      </div>
    </div>
  );
}
