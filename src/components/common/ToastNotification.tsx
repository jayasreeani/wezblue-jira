'use client';

import React from 'react';
import { useApp } from '@/context/AppContext';
import { CheckCircle2, AlertCircle, Info } from 'lucide-react';

export default function ToastNotification() {
  const { toast } = useApp();

  if (!toast) return null;

  const icons = {
    success: <CheckCircle2 className="w-4 h-4 text-emerald-600" />,
    error: <AlertCircle className="w-4 h-4 text-red-600" />,
    info: <Info className="w-4 h-4 text-blue-600" />,
  };

  const borders = {
    success: 'border-emerald-300 bg-emerald-50 text-emerald-950',
    error: 'border-red-300 bg-red-50 text-red-950',
    info: 'border-blue-300 bg-blue-50 text-blue-950',
  };

  return (
    <div className="fixed bottom-5 right-5 z-50 animate-in slide-in-from-bottom-5 duration-200">
      <div className={`flex items-center space-x-2.5 px-4 py-3 rounded-lg border shadow-xl text-xs font-semibold ${borders[toast.type]}`}>
        {icons[toast.type]}
        <span>{toast.message}</span>
      </div>
    </div>
  );
}
