import React from 'react';
import { useNotifications } from '../context/NotificationContext';
import { 
  X, 
  CheckCircle2, 
  AlertCircle, 
  Info
} from 'lucide-react';

const NotificationContainer: React.FC = () => {
  const { notifications, removeNotification } = useNotifications();

  const getIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle2 className="h-5 w-5 text-emerald-500" />;
      case 'error':
        return <AlertCircle className="h-5 w-5 text-rose-500" />;
      case 'info':
      default:
        return <Info className="h-5 w-5 text-indigo-500" />;
    }
  };

  const getStyles = (type: string) => {
    switch (type) {
      case 'success':
        return 'bg-emerald-50 border-emerald-100 shadow-emerald-100/50';
      case 'error':
        return 'bg-rose-50 border-rose-100 shadow-rose-100/50';
      case 'info':
      default:
        return 'bg-indigo-50 border-indigo-100 shadow-indigo-100/50';
    }
  };

  if (notifications.length === 0) return null;

  return (
    <div className="fixed top-6 right-6 z-[100] flex flex-col gap-3 min-w-[320px] max-w-md">
      {notifications.map((notification, index) => (
        <div
          key={index}
          className={`group relative overflow-hidden flex items-start gap-4 p-4 rounded-2xl border shadow-xl animate-in slide-in-from-right-full duration-300 ${getStyles(notification.type)}`}
        >
          {/* Subtle Progress Bar Background */}
          <div className="absolute bottom-0 left-0 h-1 bg-black/5 w-full"></div>
          
          <div className="flex-shrink-0 mt-0.5">
            {getIcon(notification.type)}
          </div>
          
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-slate-900 leading-tight">
              {notification.message}
            </p>
          </div>

          <button
            onClick={() => removeNotification(index)}
            className="flex-shrink-0 p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-black/5 transition-all opacity-0 group-hover:opacity-100"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ))}
    </div>
  );
};

export default NotificationContainer;
