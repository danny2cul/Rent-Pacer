import React, { useState } from 'react';
import { AppState, TransactionType, Card } from '../types';
import { PlusCircle, CreditCard, History, Lock, ShieldCheck, Trash2 } from 'lucide-react';

interface WalletProps {
  state: AppState;
  onAddFunds: (amount: number, description: string, method?: string) => void;
  onAddCard: (card: Card) => void;
}

const Wallet: React.FC<WalletProps> = ({ state, onAddFunds, onAddCard }) => {
  const [amount, setAmount] = useState<string>('');
  const [selectedCardId, setSelectedCardId] = useState<string>('');
  const [showAddCard, setShowAddCard] = useState(false);
  
  // New Card Form State
  const [newCardNum, setNewCardNum] = useState('');
  const [newCardExpiry, setNewCardExpiry] = useState('');
  const [newCardCvc, setNewCardCvc] = useState('');
  const [isProcessingCard, setIsProcessingCard] = useState(false);

  const handleDeposit = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(amount);
    if (val > 0) {
      let method = 'Manual Deposit';
      if (selectedCardId) {
        const card = state.linkedCards.find(c => c.id === selectedCardId);
        if (card) method = `${card.brand} •••• ${card.last4}`;
      }
      
      onAddFunds(val, 'Account Top-up', method);
      setAmount('');
    }
  };

  const handleSaveCard = (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessingCard(true);
    
    // Simulate Stripe processing delay
    setTimeout(() => {
        const last4 = newCardNum.slice(-4) || '4242';
        const brand = newCardNum.startsWith('5') ? 'Mastercard' : 'Visa'; // Simple detection
        const [expMonth, expYear] = newCardExpiry.split('/');
        
        onAddCard({
            id: crypto.randomUUID(),
            brand,
            last4,
            expMonth: expMonth || '12',
            expYear: expYear || '25'
        });
        
        setNewCardNum('');
        setNewCardExpiry('');
        setNewCardCvc('');
        setIsProcessingCard(false);
        setShowAddCard(false);
        // Auto select the new card
        // We don't have access to the new ID easily unless we generate it outside, but UI update will show it.
    }, 1500);
  };

  const formatCardNumber = (val: string) => {
    const v = val.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];

    for (let i = 0, len = match.length; i < len; i += 4) {
        parts.push(match.substring(i, i + 4));
    }

    if (parts.length) {
        return parts.join(' ');
    } else {
        return val;
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Add Funds Card */}
      <div className="lg:col-span-1 space-y-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 h-fit">
            <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-indigo-600" />
            Add Funds
            </h3>
            
            <form onSubmit={handleDeposit} className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Amount ($)</label>
                <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">$</span>
                <input 
                    type="number" 
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full pl-8 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                    placeholder="0.00"
                    min="1"
                    required
                />
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Payment Method</label>
                {state.linkedCards.length > 0 ? (
                    <div className="space-y-2">
                        {state.linkedCards.map(card => (
                            <div 
                                key={card.id}
                                onClick={() => setSelectedCardId(card.id)}
                                className={`p-3 rounded-xl border cursor-pointer flex items-center justify-between transition-all ${
                                    selectedCardId === card.id 
                                    ? 'border-indigo-600 bg-indigo-50 ring-1 ring-indigo-600' 
                                    : 'border-gray-200 hover:border-gray-300'
                                }`}
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-5 bg-gray-800 rounded flex items-center justify-center text-[8px] text-white font-bold tracking-widest uppercase">
                                        {card.brand}
                                    </div>
                                    <span className="text-sm font-medium text-gray-700">•••• {card.last4}</span>
                                </div>
                                {selectedCardId === card.id && <div className="w-2 h-2 rounded-full bg-indigo-600"></div>}
                            </div>
                        ))}
                        <button 
                            type="button"
                            onClick={() => { setSelectedCardId(''); setShowAddCard(true); }}
                            className="text-sm text-indigo-600 font-medium hover:text-indigo-800 flex items-center gap-1 mt-2"
                        >
                            <PlusCircle className="w-4 h-4" /> Add another card
                        </button>
                    </div>
                ) : (
                    <div className="text-center p-4 border-2 border-dashed border-gray-200 rounded-xl">
                        <p className="text-sm text-gray-500 mb-2">No cards linked</p>
                        <button 
                            type="button"
                            onClick={() => setShowAddCard(true)}
                            className="text-sm text-indigo-600 font-bold hover:text-indigo-800"
                        >
                            + Add Payment Method
                        </button>
                    </div>
                )}
            </div>

            <button 
                type="submit"
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
            >
                <Lock className="w-4 h-4" />
                {amount ? `Pay $${amount}` : 'Deposit Funds'}
            </button>

            <div className="flex items-center justify-center gap-1.5 text-xs text-gray-400 mt-2">
                <ShieldCheck className="w-3 h-3" />
                Payments secured by Stripe
            </div>
            </form>
        </div>
      </div>

      {/* Main Content Area: History or Add Card Form */}
      <div className="lg:col-span-2 space-y-6">
        
        {/* Add Card Form Modal/Section */}
        {showAddCard && (
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 animate-fade-in relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-lg font-bold text-gray-900">Add Payment Method</h3>
                    <button onClick={() => setShowAddCard(false)} className="text-gray-400 hover:text-gray-600">
                        Close
                    </button>
                </div>

                <form onSubmit={handleSaveCard} className="space-y-4 max-w-md">
                    <div>
                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Card Number</label>
                        <div className="relative">
                            <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <input
                                type="text"
                                value={newCardNum}
                                onChange={(e) => setNewCardNum(formatCardNumber(e.target.value))}
                                className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-shadow font-mono"
                                placeholder="0000 0000 0000 0000"
                                maxLength={19}
                                required
                            />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Expiry</label>
                            <input
                                type="text"
                                value={newCardExpiry}
                                onChange={(e) => setNewCardExpiry(e.target.value)}
                                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 outline-none font-mono"
                                placeholder="MM/YY"
                                maxLength={5}
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">CVC</label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                                <input
                                    type="text"
                                    value={newCardCvc}
                                    onChange={(e) => setNewCardCvc(e.target.value)}
                                    className="w-full pl-9 pr-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 outline-none font-mono"
                                    placeholder="123"
                                    maxLength={3}
                                    required
                                />
                            </div>
                        </div>
                    </div>
                    
                    <div className="pt-2">
                        <button 
                            type="submit" 
                            disabled={isProcessingCard}
                            className={`w-full py-2.5 rounded-lg font-semibold text-white transition-all flex items-center justify-center gap-2 ${
                                isProcessingCard ? 'bg-indigo-400 cursor-wait' : 'bg-indigo-600 hover:bg-indigo-700'
                            }`}
                        >
                            {isProcessingCard ? 'Processing...' : 'Save Card'}
                        </button>
                    </div>
                </form>
                
                <div className="mt-4 flex items-center justify-between opacity-50 grayscale">
                    {/* Mock payment logos */}
                    <div className="flex gap-2">
                        <div className="h-6 w-10 bg-gray-200 rounded"></div>
                        <div className="h-6 w-10 bg-gray-200 rounded"></div>
                        <div className="h-6 w-10 bg-gray-200 rounded"></div>
                    </div>
                </div>
            </div>
        )}

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <History className="w-5 h-5 text-gray-500" />
            History
            </h3>
            <div className="overflow-hidden">
            {state.transactions.length === 0 ? (
                <div className="text-center py-12 text-gray-400">
                    No transactions yet.
                </div>
            ) : (
                <div className="space-y-4">
                {state.transactions.slice().reverse().map((t) => (
                    <div key={t.id} className="flex items-center justify-between p-4 hover:bg-gray-50 rounded-xl border border-transparent hover:border-gray-100 transition-all group">
                    <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${t.type === TransactionType.DEPOSIT ? 'bg-emerald-100 text-emerald-600' : 'bg-orange-100 text-orange-600'}`}>
                            {t.type === TransactionType.DEPOSIT ? <PlusCircle className="w-5 h-5" /> : <CreditCard className="w-5 h-5" />}
                        </div>
                        <div>
                        <p className="font-semibold text-gray-900">{t.description}</p>
                        <p className="text-xs text-gray-400">{t.method || 'Manual'}</p>
                        </div>
                    </div>
                    <div className="text-right">
                        <div className={`font-bold text-lg ${t.type === TransactionType.DEPOSIT ? 'text-emerald-600' : 'text-gray-800'}`}>
                            {t.type === TransactionType.DEPOSIT ? '+' : '-'}${t.amount.toFixed(2)}
                        </div>
                        <p className="text-xs text-gray-400">{new Date(t.date).toLocaleDateString()}</p>
                    </div>
                    </div>
                ))}
                </div>
            )}
            </div>
        </div>
      </div>
    </div>
  );
};

export default Wallet;