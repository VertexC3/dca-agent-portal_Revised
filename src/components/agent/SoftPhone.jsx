import React, { useState, useEffect } from 'react';
import { Phone, X } from 'lucide-react';
import { config } from '../../services/config';

export default function SoftPhone() {
  const [open, setOpen] = useState(false);
  const softphoneUrl = config.neonnow.softphoneUrl;

  // Open panel on external dial requests (e.g. physician phone click)
  useEffect(() => {
    const handler = () => setOpen(true);
    window.addEventListener('softphone:dial', handler);
    return () => window.removeEventListener('softphone:dial', handler);
  }, []);

  return (
    <>
      <button
        onClick={() => setOpen((v) => !v)}
        className="fixed bottom-4 left-4 md:bottom-6 md:left-6 z-40 w-11 h-11 md:w-12 md:h-12 bg-[#8B1F1F] hover:bg-[#721919] text-white rounded-full shadow-lg flex items-center justify-center transition-all hover:scale-110 active:scale-95"
        title="Soft Phone"
      >
        {open ? <X className="w-5 h-5" /> : <Phone className="w-5 h-5" />}
      </button>

      {open && (
        <div
          id="neonnow-softphone-panel"
          className="fixed bottom-16 left-4 md:bottom-20 md:left-6 z-50 flex flex-col bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden w-[350px] max-w-[calc(100vw-2rem)] h-[600px] max-h-[calc(100vh-6rem)]"
        >
          <div className="bg-[#8B1F1F] px-4 py-3 flex items-center gap-2 shrink-0">
            <Phone className="w-4 h-4 text-white" />
            <span className="text-white font-bold text-sm">Soft Phone</span>
          </div>
          <iframe
            id="neonnow-iframe"
            src={softphoneUrl}
            title="NEONNOW Softphone"
            className="flex-1 w-full border-0"
            allow="microphone; autoplay; clipboard-write"
          />
        </div>
      )}
    </>
  );
}
