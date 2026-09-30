'use client';

import React from 'react';
import { useApp } from '../context/AppContext';
import { Mic } from 'lucide-react';

export default function FloatingMicButton() {
  const { setIsVoiceOpen } = useApp();

  return (
    <button
      onClick={() => setIsVoiceOpen(true)}
      className="fixed bottom-6 right-6 z-30 bg-emerald-600 hover:bg-emerald-700 text-white p-4 rounded-full shadow-lg flex items-center space-x-2 transition-transform hover:scale-105 active:scale-95"
      title="Order with Voice"
      aria-label="Order with Voice"
    >
      <Mic className="w-6 h-6" />
      <span className="hidden sm:inline-block font-medium text-sm pr-1">Voice Order</span>
    </button>
  );
}
