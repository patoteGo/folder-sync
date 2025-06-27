import React from 'react';
import { FolderSync, CheckCircle, AlertTriangle, XCircle } from 'lucide-react';
import { SyncStats } from '../types';

interface StatsCardsProps {
  stats: SyncStats;
}

export const StatsCards: React.FC<StatsCardsProps> = ({ stats }) => {
  const cards = [
    {
      title: 'Total Relationships',
      value: stats.total,
      icon: FolderSync,
      gradient: 'from-blue-500 to-blue-600',
      bgGradient: 'from-blue-500/20 to-blue-600/20',
      borderColor: 'border-blue-500/30',
      iconColor: 'text-blue-400'
    },
    {
      title: 'Synced',
      value: stats.synced,
      icon: CheckCircle,
      gradient: 'from-emerald-500 to-emerald-600',
      bgGradient: 'from-emerald-500/20 to-emerald-600/20',
      borderColor: 'border-emerald-500/30',
      iconColor: 'text-emerald-400'
    },
    {
      title: 'Out of Sync',
      value: stats.outOfSync,
      icon: AlertTriangle,
      gradient: 'from-amber-500 to-amber-600',
      bgGradient: 'from-amber-500/20 to-amber-600/20',
      borderColor: 'border-amber-500/30',
      iconColor: 'text-amber-400'
    },
    {
      title: 'Errors',
      value: stats.errors,
      icon: XCircle,
      gradient: 'from-red-500 to-red-600',
      bgGradient: 'from-red-500/20 to-red-600/20',
      borderColor: 'border-red-500/30',
      iconColor: 'text-red-400'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
      {cards.map((card) => (
        <div 
          key={card.title} 
          className="group relative bg-gray-900/50 backdrop-blur-xl rounded-xl border border-gray-700/50 p-3 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-0.5"
        >
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">{card.title}</p>
              <p className="text-2xl font-bold text-white">{card.value}</p>
            </div>
            <div className={`p-2 rounded-lg bg-gradient-to-br ${card.bgGradient} border ${card.borderColor} group-hover:scale-110 transition-transform duration-300`}>
              <card.icon className={card.iconColor} size={18} />
            </div>
          </div>
          
          {/* Subtle glow effect */}
          <div className={`absolute inset-0 rounded-xl bg-gradient-to-br ${card.bgGradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10 blur-lg`}></div>
        </div>
      ))}
    </div>
  );
};