import React from 'react';
import { CheckCircle, AlertCircle, XCircle, Clock } from 'lucide-react';

interface StatusBadgeProps {
  status: 'synced' | 'out-of-sync' | 'error' | 'pending' | 'syncing';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const getStatusConfig = () => {
    switch (status) {
      case 'synced':
        return {
          icon: CheckCircle,
          text: 'Synced',
          className: 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
        };
      case 'out-of-sync':
        return {
          icon: AlertCircle,
          text: 'Out of Sync',
          className: 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
        };
      case 'error':
        return {
          icon: XCircle,
          text: 'Error',
          className: 'bg-red-500/20 text-red-400 border border-red-500/30'
        };
      case 'pending':
        return {
          icon: Clock,
          text: 'Pending',
          className: 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
        };
      case 'syncing':
        return {
          icon: Clock,
          text: 'Syncing...',
          className: 'bg-blue-500/20 text-blue-400 border border-blue-500/30 animate-pulse'
        };
    }
  };

  const { icon: Icon, text, className } = getStatusConfig();

  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium backdrop-blur-sm ${className}`}>
      <Icon size={14} />
      {text}
    </span>
  );
};