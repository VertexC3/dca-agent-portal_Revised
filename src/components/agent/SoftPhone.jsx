import React, { useState, useRef } from 'react';
import { Phone, PhoneOff, PhoneCall, X, Delete, Mic, MicOff, Volume2, VolumeX } from 'lucide-react';

const DIAL_KEYS = [
  ['1', ''], ['2', 'ABC'], ['3', 'DEF'],
  ['4', 'GHI'], ['5', 'JKL'], ['6', 'MNO'],
  ['7', 'PQRS'], ['8', 'TUV'], ['9', 'WXYZ'],
  ['*', ''], ['0', '+'], ['#', ''],
];

export default function SoftPhone() {
  const [open, setOpen] = useState(false);
  const [dialInput, setDialInput] = useState('');
  const [callActive, setCallActive] = useState(false);
  const [callTimer, setCallTimer] = useState(0);
  const [muted, setMuted] = useState(false);
  const [speakerOff, setSpeakerOff] = useState(false);
  const timerRef = React.useRef(null);

  const handleDial = (key) => setDialInput(v => v + key);
  const handleDelete = () => setDialInput(v => v.slice(0, -1));

  const startCall = () => {
    if (!dialInput) return;
    setCallActive(true);
    setCallTimer(0);
    timerRef.current = setInterval(() => setCallTimer(t => t + 1), 1000);
  };

  const endCall = () => {
    setCallActive(false);
    clearInterval(timerRef.current);
    setCallTimer(0);
    setMuted(false);
    setSpeakerOff(false);
  };

  const formatTimer = (s) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

  return (
    <>
      {/* Floating Toggle Button */}
      <button
        onClick={() => setOpen(v => !v)}
        className="fixed bottom-6 left-6 z-50 w-12 h-12 bg-[#8B1F1F] hover:bg-[#721919] text-white rounded-full shadow-lg flex items-center justify-center transition-all hover:scale-110 active:scale-95"
        title="Soft Phone"
      >
        {open ? <X className="w-5 h-5" /> : <Phone className="w-5 h-5" />}
      </button>

      {/* Soft Phone Panel */}
      {open && (
        <div className="fixed bottom-20 left-6 z-50 w-64 bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden">
          {/* Header */}
          <div className="bg-[#8B1F1F] px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-white" />
              <span className="text-white font-bold text-sm">Soft Phone</span>
            </div>
            {callActive && (
              <span className="text-white text-xs font-mono bg-white/20 px-2 py-0.5 rounded-full">
                {formatTimer(callTimer)}
              </span>
            )}
          </div>

          <div className="p-4">
            {/* Display */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 mb-3 flex items-center justify-between min-h-[40px]">
              {callActive ? (
                <div className="flex items-center gap-2">
                  <PhoneCall className="w-4 h-4 text-green-600 animate-pulse" />
                  <span className="text-sm font-semibold text-gray-800">{dialInput}</span>
                </div>
              ) : (
                <span className={`text-sm font-mono tracking-widest ${dialInput ? 'text-gray-800' : 'text-gray-400'}`}>
                  {dialInput || 'Enter number...'}
                </span>
              )}
              {dialInput && !callActive && (
                <button onClick={handleDelete} className="text-gray-400 hover:text-gray-700 transition-colors">
                  <Delete className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Dialpad */}
            {!callActive && (
              <div className="grid grid-cols-3 gap-1.5 mb-3">
                {DIAL_KEYS.map(([key, sub]) => (
                  <button
                    key={key}
                    onClick={() => handleDial(key)}
                    className="flex flex-col items-center justify-center h-11 rounded-lg bg-gray-50 border border-gray-200 hover:bg-gray-100 active:bg-gray-200 transition-colors"
                  >
                    <span className="text-sm font-bold text-gray-800 leading-none">{key}</span>
                    {sub && <span className="text-[9px] text-gray-400 mt-0.5 leading-none">{sub}</span>}
                  </button>
                ))}
              </div>
            )}

            {/* In-call controls */}
            {callActive && (
              <div className="flex justify-center gap-4 mb-3 py-2">
                <button
                  onClick={() => setMuted(v => !v)}
                  className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${muted ? 'bg-red-100 text-red-600 border border-red-200' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                  title={muted ? 'Unmute' : 'Mute'}
                >
                  {muted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                </button>
                <button
                  onClick={() => setSpeakerOff(v => !v)}
                  className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${speakerOff ? 'bg-red-100 text-red-600 border border-red-200' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                  title={speakerOff ? 'Speaker On' : 'Speaker Off'}
                >
                  {speakerOff ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                </button>
              </div>
            )}

            {/* Call / End button */}
            <button
              onClick={callActive ? endCall : startCall}
              disabled={!callActive && !dialInput}
              className={`w-full h-11 rounded-full font-semibold text-sm flex items-center justify-center gap-2 transition-all ${
                callActive
                  ? 'bg-red-600 hover:bg-red-700 text-white'
                  : dialInput
                  ? 'bg-green-600 hover:bg-green-700 text-white'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
            >
              {callActive ? (
                <><PhoneOff className="w-4 h-4" /> End Call</>
              ) : (
                <><Phone className="w-4 h-4" /> Call</>
              )}
            </button>
          </div>
        </div>
      )}
    </>
  );
}