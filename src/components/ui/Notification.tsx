import React from 'react';
import {
  CheckCircle2,
  AlertTriangle,
  AlertOctagon,
  Info,
  X,
} from 'lucide-react';
import { useNotification, NotificationItem, NotificationType } from '../../context/NotificationContext';

export function ToastContainer() {
  const { notifications, dismiss } = useNotification();

  if (notifications.length === 0) return null;

  return (
    <aside
      aria-live="polite"
      aria-label="System notifications"
      className="fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none"
    >
      {notifications.map((notif) => (
        <div key={notif.id} className="pointer-events-auto">
          <NotificationToast item={notif} onDismiss={() => dismiss(notif.id)} />
        </div>
      ))}
    </aside>
  );
}

function NotificationToast({
  item,
  onDismiss,
}: {
  item: NotificationItem;
  onDismiss: () => void;
}) {
  const iconMap: Record<NotificationType, React.ReactNode> = {
    success: <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />,
    warning: <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />,
    error: <AlertOctagon className="w-4 h-4 text-rose-400 shrink-0" />,
    info: <Info className="w-4 h-4 text-sky-400 shrink-0" />,
  };

  const borderStyles: Record<NotificationType, string> = {
    success: 'border-emerald-500/30 bg-[#10241E]',
    warning: 'border-amber-500/30 bg-[#251E13]',
    error: 'border-rose-500/30 bg-[#251416]',
    info: 'border-sky-500/30 bg-[#12202E]',
  };

  return (
    <div
      role="alert"
      className={`flex items-start gap-3 p-3.5 rounded-lg border shadow-xl ${borderStyles[item.type]} animate-in slide-in-from-bottom-2 duration-150`}
    >
      <div className="mt-0.5">{iconMap[item.type]}</div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold text-[#F8FAFC]">{item.title}</p>
        {item.message && (
          <p className="text-xs text-[#94A3B8] mt-0.5 leading-relaxed">{item.message}</p>
        )}
      </div>
      <button
        type="button"
        onClick={onDismiss}
        aria-label="Dismiss notification"
        className="text-[#94A3B8] hover:text-[#F8FAFC] p-0.5 rounded-md hover:bg-white/10 transition-colors cursor-pointer"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}

export function AlertBanner({
  type = 'info',
  title,
  children,
  action,
  className = '',
}: {
  type?: NotificationType;
  title?: string;
  children: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}) {
  const iconMap: Record<NotificationType, React.ReactNode> = {
    success: <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />,
    warning: <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />,
    error: <AlertOctagon className="w-4 h-4 text-rose-400 shrink-0" />,
    info: <Info className="w-4 h-4 text-sky-400 shrink-0" />,
  };

  const borderMap: Record<NotificationType, string> = {
    success: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-200',
    warning: 'border-amber-500/30 bg-amber-500/10 text-amber-200',
    error: 'border-rose-500/30 bg-rose-500/10 text-rose-200',
    info: 'border-sky-500/30 bg-sky-500/10 text-sky-200',
  };

  return (
    <div
      role="status"
      className={`flex items-start gap-3 p-3.5 rounded-lg border text-xs leading-relaxed ${borderMap[type]} ${className}`}
    >
      <div className="mt-0.5">{iconMap[type]}</div>
      <div className="flex-1 min-w-0">
        {title && <h4 className="font-semibold text-[#F8FAFC] mb-0.5">{title}</h4>}
        <div className="text-[#94A3B8]">{children}</div>
      </div>
      {action && <div className="shrink-0 ml-2">{action}</div>}
    </div>
  );
}
