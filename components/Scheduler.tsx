import React, { useState, useEffect } from 'react';
import { RentConfig } from '../types';
import { Settings, CheckCircle, AlertCircle, User, Building2, Lock } from 'lucide-react';

interface SchedulerProps {
  config: RentConfig;
  onSaveConfig: (newConfig: RentConfig) => void;
}

const Scheduler: React.FC<SchedulerProps> = ({ config, onSaveConfig }) => {
  const [localConfig, setLocalConfig] = useState<RentConfig>(config);
  const [isDirty, setIsDirty] = useState(false);

  // Initialize empty bank details if undefined
  useEffect(() => {
    if (!config.payeeBankDetails) {
        setLocalConfig(prev => ({
            ...prev,
            payeeBankDetails: {
                bankName: '',
                routingNumber: '',
                accountNumber: ''
            }
        }));
    } else {
        setLocalConfig(config);
    }
    setIsDirty(false);
  }, [config]);

  const handleChange = (field: keyof RentConfig, value: any) => {
    setLocalConfig(prev => ({ ...prev, [field]: value }));
    setIsDirty(true);
  };

  const handleBankChange = (field: string, value: string) => {
    setLocalConfig(prev => ({
        ...prev,
        payeeBankDetails: {
            ...prev.payeeBankDetails!,
            [field]: value
        }
    }));
    setIsDirty(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    
    // If release day changes, we need to recalculate nextReleaseDate logic in a real app, 
    // but here we'll just let the simulation runner handle the next tick.
    // Ideally, we reset the nextReleaseDate to the next occurrence of this day.
    
    const today = new Date();
    const currentDay = today.getDay();
    const targetDay = localConfig.releaseDay;
    let daysUntil = targetDay - currentDay;
    if (daysUntil <= 0) daysUntil += 7;
    
    const nextDate = new Date(today);
    nextDate.setDate(today.getDate() + daysUntil);
    nextDate.setHours(9, 0, 0, 0); // Set to 9 AM

    onSaveConfig({
        ...localConfig,
        nextReleaseDate: nextDate.toISOString()
    });
    setIsDirty(false);
  };

  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
                <Settings className="w-5 h-5 text-blue-600" />
            </div>
            <div>
                <h3 className="text-lg font-bold text-gray-900">Rent Configuration</h3>
                <p className="text-sm text-gray-500">Manage rent schedule and payouts</p>
            </div>
          </div>
          {localConfig.active ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
              Active
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
              Paused
            </span>
          )}
        </div>

        <form onSubmit={handleSave} className="p-8 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
            
            {/* Left Column */}
            <div className="space-y-8">
                {/* Payee Info */}
                <div className="space-y-4">
                    <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-wider flex items-center gap-2 pb-2 border-b border-gray-100">
                        <User className="w-4 h-4" /> Roommate Details
                    </h4>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Roommate Name</label>
                            <input
                                type="text"
                                required
                                value={localConfig.payeeName}
                                onChange={(e) => handleChange('payeeName', e.target.value)}
                                className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                                placeholder="Who receives the rent?"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                            <input
                                type="email"
                                value={localConfig.payeeEmail}
                                onChange={(e) => handleChange('payeeEmail', e.target.value)}
                                className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                                placeholder="For notifications"
                            />
                        </div>
                    </div>
                </div>

                 {/* Payment Rules */}
                <div className="space-y-4">
                    <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-wider flex items-center gap-2 pb-2 border-b border-gray-100">
                        <Settings className="w-4 h-4" /> Schedule
                    </h4>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Weekly Amount ($)</label>
                            <input
                                type="number"
                                required
                                min="1"
                                value={localConfig.weeklyAmount}
                                onChange={(e) => handleChange('weeklyAmount', parseFloat(e.target.value))}
                                className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Release Day</label>
                            <select
                                value={localConfig.releaseDay}
                                onChange={(e) => handleChange('releaseDay', parseInt(e.target.value))}
                                className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                            >
                                {days.map((day, index) => (
                                    <option key={day} value={index}>{day}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Column - Bank Details */}
            <div className="space-y-8">
                <div className="space-y-4">
                    <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-wider flex items-center gap-2 pb-2 border-b border-gray-100">
                        <Building2 className="w-4 h-4" /> Roommate's Bank (Payouts)
                    </h4>
                    <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 space-y-4">
                        <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
                             <Lock className="w-3 h-3" /> Encrypted & Secure via Stripe Connect
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Bank Name</label>
                            <input
                                type="text"
                                value={localConfig.payeeBankDetails?.bankName || ''}
                                onChange={(e) => handleBankChange('bankName', e.target.value)}
                                className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                                placeholder="e.g. Chase, Wells Fargo"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Routing Number</label>
                            <input
                                type="text"
                                value={localConfig.payeeBankDetails?.routingNumber || ''}
                                onChange={(e) => handleBankChange('routingNumber', e.target.value)}
                                className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                                placeholder="9 digits"
                                maxLength={9}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Account Number</label>
                            <input
                                type="text" // In real app, type="password" until focused
                                value={localConfig.payeeBankDetails?.accountNumber || ''}
                                onChange={(e) => handleBankChange('accountNumber', e.target.value)}
                                className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                                placeholder="Account number"
                            />
                        </div>
                    </div>
                </div>

                <div className="pt-4">
                    <label className="flex items-center cursor-pointer p-4 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
                        <div className="relative">
                            <input 
                                type="checkbox" 
                                className="sr-only" 
                                checked={localConfig.active}
                                onChange={(e) => handleChange('active', e.target.checked)}
                            />
                            <div className={`block w-12 h-7 rounded-full transition-colors ${localConfig.active ? 'bg-indigo-600' : 'bg-gray-200'}`}></div>
                            <div className={`dot absolute left-1 top-1 bg-white w-5 h-5 rounded-full transition-transform ${localConfig.active ? 'transform translate-x-5' : ''}`}></div>
                        </div>
                        <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">Enable Auto-Release</div>
                            <div className="text-xs text-gray-500">Automatically transfer funds weekly</div>
                        </div>
                    </label>
                </div>
            </div>
          </div>

          <div className="pt-6 border-t border-gray-100 flex justify-end">
            <button
                type="submit"
                disabled={!isDirty}
                className={`px-8 py-3 rounded-lg font-bold flex items-center gap-2 transition-all ${
                    isDirty 
                    ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-md transform hover:-translate-y-0.5' 
                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                }`}
            >
                {isDirty ? <CheckCircle className="w-5 h-5" /> : null}
                Save Configuration
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Scheduler;