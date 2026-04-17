import React, { useState } from 'react';
import { Lock, Construction } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Maintenance = ({ onUnlock }) => {
  const [password, setPassword] = useState('');
  const [showInput, setShowInput] = useState(false);
  const [error, setError] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (password === '0000') {
      onUnlock();
      localStorage.setItem('site_unlocked', 'true');
    } else {
      setError(true);
      setTimeout(() => setError(false), 500);
      setPassword('');
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Background Orbs */}
      <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-primary-100 rounded-full blur-3xl opacity-30" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-primary-50 rounded-full blur-3xl opacity-30" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center z-10"
      >
        <div className="w-24 h-24 bg-primary-50 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-sm border border-primary-100">
          <Construction className="w-12 h-12 text-primary-600" />
        </div>
        <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4 tracking-tight">
          Wir sind bald <span className="text-primary-600">zurück.</span>
        </h1>
        <p className="text-xl text-gray-600 max-w-md mx-auto mb-12">
          Social-Wipe wird gerade aktualisiert, um Ihnen einen noch besseren Service zu bieten. Bitte schauen Sie später wieder vorbei.
        </p>
        
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-full text-sm font-medium text-gray-500 border border-gray-100">
          <div className="w-2 h-2 bg-primary-500 rounded-full animate-pulse" />
          Wartungsarbeiten aktiv
        </div>
      </motion.div>

      {/* Secret Lock Button */}
      <div className="absolute top-4 right-4 z-50">
        <button 
          onClick={() => setShowInput(!showInput)}
          className="p-3 text-gray-300 hover:text-primary-600 transition-colors bg-white/50 backdrop-blur-sm rounded-full border border-gray-100/50"
        >
          <Lock className="w-5 h-5" />
        </button>

        <AnimatePresence>
          {showInput && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="absolute top-14 right-0"
            >
              <form 
                onSubmit={handleSubmit}
                className={`bg-white p-4 rounded-2xl shadow-2xl border border-gray-100 w-64 ${error ? 'animate-shake' : ''}`}
              >
                <label className="block text-sm font-bold text-gray-700 mb-2">Admin Zugang</label>
                <input
                  autoFocus
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Passwort eingeben"
                  className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
                />
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <style jsx>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-4px); }
          75% { transform: translateX(4px); }
        }
        .animate-shake {
          animation: shake 0.2s ease-in-out 0s 2;
        }
      `}</style>
    </div>
  );
};

export default Maintenance;
