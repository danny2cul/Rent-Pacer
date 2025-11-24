import React, { useState, useEffect } from 'react';
import { AppState, RentConfig, TransactionType, Transaction, Card } from './types';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import Wallet from './components/Wallet';
import Scheduler from './components/Scheduler';
import AIAssistant from './components/AIAssistant';
import { Menu, X } from 'lucide-react';

// Initial Mock State
const INITIAL_STATE: AppState = {
  balance: 1200,
  transactions: [
    { id: '1', date: new Date(Date.now() - 86400000 * 14).toISOString(), amount: 1200, type: TransactionType.DEPOSIT, description: 'Initial Deposit', method: 'Bank Transfer' },
    { id: '2', date: new Date(Date.now() - 86400000 * 7).toISOString(), amount: 300, type: TransactionType.RELEASE, description: 'Weekly Rent Release' },
  ],
  config: {
    weeklyAmount: 300,
    payeeName: 'Alex (Roommate)',
    payeeEmail: '',
    releaseDay: 5, // Friday
    active: true,
    nextReleaseDate: new Date(Date.now() + 86400000).toISOString(), // Tomorrow placeholder
    payeeBankDetails: undefined
  },
  linkedCards: []
};

const App: React.FC = () => {
  // Load from local storage or use initial
  const [state, setState] = useState<AppState>(() => {
    const saved = localStorage.getItem('rentpacer_state');
    return saved ? JSON.parse(saved) : INITIAL_STATE;
  });

  const [activeTab, setActiveTab] = useState('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Persist State
  useEffect(() => {
    localStorage.setItem('rentpacer_state', JSON.stringify(state));
  }, [state]);

  // Simulation Logic: Check if we need to run a "Release" transaction
  useEffect(() => {
    if (!state.config.active) return;

    const checkSchedule = () => {
      const now = new Date();
      const nextRun = new Date(state.config.nextReleaseDate);

      if (now >= nextRun && state.balance >= state.config.weeklyAmount) {
        // It's time to pay!
        const newTransaction: Transaction = {
          id: crypto.randomUUID(),
          date: now.toISOString(),
          amount: state.config.weeklyAmount,
          type: TransactionType.RELEASE,
          description: `Weekly Rent to ${state.config.payeeName}`,
          method: state.config.payeeBankDetails ? `Transfer to ${state.config.payeeBankDetails.bankName} ...${state.config.payeeBankDetails.accountNumber.slice(-4)}` : 'Escrow Release'
        };

        // Calculate new next run date (add 7 days)
        const newNextRun = new Date(nextRun);
        newNextRun.setDate(newNextRun.getDate() + 7);

        setState(prev => ({
          ...prev,
          balance: prev.balance - prev.config.weeklyAmount,
          transactions: [...prev.transactions, newTransaction],
          config: {
            ...prev.config,
            nextReleaseDate: newNextRun.toISOString()
          }
        }));
      }
    };
    
    const interval = setInterval(checkSchedule, 10000); // Check every 10s for demo purposes
    checkSchedule(); // Run immediately on mount

    return () => clearInterval(interval);
  }, [state.config, state.balance]);

  const handleAddFunds = (amount: number, description: string, method: string = 'Manual Deposit') => {
    const newTx: Transaction = {
      id: crypto.randomUUID(),
      date: new Date().toISOString(),
      amount: amount,
      type: TransactionType.DEPOSIT,
      description,
      method
    };
    setState(prev => ({
      ...prev,
      balance: prev.balance + amount,
      transactions: [...prev.transactions, newTx]
    }));
  };

  const handleAddCard = (card: Card) => {
    setState(prev => ({
      ...prev,
      linkedCards: [...prev.linkedCards, card]
    }));
  };

  const handleSaveConfig = (newConfig: RentConfig) => {
    setState(prev => ({ ...prev, config: newConfig }));
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard': return <Dashboard state={state} />;
      case 'wallet': return <Wallet state={state} onAddFunds={handleAddFunds} onAddCard={handleAddCard} />;
      case 'scheduler': return <Scheduler config={state.config} onSaveConfig={handleSaveConfig} />;
      case 'assistant': return <AIAssistant state={state} />;
      default: return <Dashboard state={state} />;
    }
  };

  return (
    <div className="min-h-screen bg-[#f3f4f6] flex font-sans">
      {/* Mobile Menu Button */}
      <button 
        className="lg:hidden fixed top-4 right-4 z-50 bg-white p-2 rounded-lg shadow-md"
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
      >
        {mobileMenuOpen ? <X /> : <Menu />}
      </button>

      {/* Sidebar */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-40 w-64 transform transition-transform duration-300 ease-in-out
        ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <Sidebar activeTab={activeTab} setActiveTab={(tab) => { setActiveTab(tab); setMobileMenuOpen(false); }} />
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-4 lg:p-8 overflow-y-auto h-screen w-full">
        <div className="max-w-6xl mx-auto">
            {/* Header for Mobile */}
            <div className="lg:hidden mb-6 mt-2">
                 <h1 className="text-2xl font-bold text-indigo-900">RentPacer</h1>
            </div>

            {renderContent()}
        </div>
      </main>
      
      {/* Overlay for mobile menu */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/20 z-30 lg:hidden backdrop-blur-sm"
          onClick={() => setMobileMenuOpen(false)}
        ></div>
      )}
    </div>
  );
};

export default App;