import React, { useMemo } from 'react';
import { AppState, TransactionType } from '../types';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { ArrowUpRight, ArrowDownLeft, Calendar, Wallet } from 'lucide-react';

interface DashboardProps {
  state: AppState;
}

const Dashboard: React.FC<DashboardProps> = ({ state }) => {
  const weeksCovered = state.config.weeklyAmount > 0 
    ? Math.floor(state.balance / state.config.weeklyAmount) 
    : 0;

  const chartData = useMemo(() => {
    // Group last 6 weeks of releases
    const data = state.transactions
        .filter(t => t.type === TransactionType.RELEASE)
        .slice(0, 6)
        .reverse()
        .map(t => ({
            name: new Date(t.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
            amount: t.amount
        }));
    return data;
  }, [state.transactions]);

  const pieData = [
    { name: 'Remaining Balance', value: state.balance },
    { name: 'Paid Out (Total)', value: state.transactions.filter(t => t.type === TransactionType.RELEASE).reduce((acc, curr) => acc + curr.amount, 0) }
  ];
  
  const COLORS = ['#10B981', '#6366F1'];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Hero Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-gray-500">Current Wallet Balance</p>
              <h3 className="text-3xl font-bold text-gray-900 mt-2">${state.balance.toFixed(2)}</h3>
            </div>
            <div className="p-2 bg-emerald-100 rounded-lg">
              <Wallet className="w-6 h-6 text-emerald-600" />
            </div>
          </div>
          <p className="text-sm text-emerald-600 mt-4 font-medium flex items-center gap-1">
            <ArrowUpRight className="w-4 h-4" />
            {weeksCovered} weeks of rent covered
          </p>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex justify-between items-start">
                <div>
                    <p className="text-sm font-medium text-gray-500">Weekly Payment</p>
                    <h3 className="text-3xl font-bold text-gray-900 mt-2">${state.config.weeklyAmount}</h3>
                </div>
                <div className="p-2 bg-indigo-100 rounded-lg">
                    <ArrowDownLeft className="w-6 h-6 text-indigo-600" />
                </div>
            </div>
            <p className="text-sm text-gray-500 mt-4">
                Releasing to <span className="font-semibold text-gray-700">{state.config.payeeName}</span>
            </p>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex justify-between items-start">
                <div>
                    <p className="text-sm font-medium text-gray-500">Next Release</p>
                    <h3 className="text-xl font-bold text-gray-900 mt-2">
                        {new Date(state.config.nextReleaseDate).toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })}
                    </h3>
                </div>
                <div className="p-2 bg-orange-100 rounded-lg">
                    <Calendar className="w-6 h-6 text-orange-600" />
                </div>
            </div>
            <div className="mt-4 w-full bg-gray-200 rounded-full h-2.5">
                <div className="bg-orange-500 h-2.5 rounded-full" style={{ width: '65%' }}></div>
            </div>
            <p className="text-xs text-gray-400 mt-2">Auto-release scheduled</p>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h4 className="text-lg font-semibold text-gray-800 mb-4">Recent Releases</h4>
            <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#9CA3AF', fontSize: 12}} />
                        <YAxis axisLine={false} tickLine={false} tick={{fill: '#9CA3AF', fontSize: 12}} />
                        <Tooltip 
                            cursor={{fill: '#f9fafb'}}
                            contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'}}
                        />
                        <Bar dataKey="amount" fill="#6366F1" radius={[4, 4, 0, 0]} barSize={32} />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h4 className="text-lg font-semibold text-gray-800 mb-4">Fund Allocation</h4>
            <div className="h-64 flex items-center justify-center">
                 <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={pieData}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={80}
                            fill="#8884d8"
                            paddingAngle={5}
                            dataKey="value"
                        >
                            {pieData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Pie>
                        <Tooltip />
                    </PieChart>
                </ResponsiveContainer>
            </div>
            <div className="flex justify-center gap-6 mt-2">
                {pieData.map((entry, index) => (
                    <div key={index} className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index] }}></div>
                        <span className="text-sm text-gray-600">{entry.name}</span>
                    </div>
                ))}
            </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;