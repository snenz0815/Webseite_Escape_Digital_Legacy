import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Check, Loader2 } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/api/platforms` : 'http://localhost:3001/api/platforms';

const Step1 = ({ data, onUpdate, onPlatformsLoaded }) => {
  const [platforms, setPlatforms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch(API_URL)
      .then(res => res.json())
      .then(list => {
        setPlatforms(list);
        if (onPlatformsLoaded) onPlatformsLoaded(list);
        setLoading(false);
      })
      .catch(() => { setError('Plattformen konnten nicht geladen werden.'); setLoading(false); });
  }, []);

  const social = platforms.filter(p => p.category === 'social_media');
  const streaming = platforms.filter(p => p.category === 'streaming');

  const togglePlatform = (id) => {
    if (data.includes(id)) onUpdate(data.filter(i => i !== id));
    else onUpdate([...data, id]);
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-20 gap-4">
      <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
      <p className="text-gray-500">Plattformen werden geladen...</p>
    </div>
  );

  if (error) return <p className="text-red-500 text-center py-10">{error}</p>;

  return (
    <div>
      <h2 className="text-3xl font-bold text-gray-900 mb-2">Plattformen auswählen</h2>
      <p className="text-gray-500 mb-10">Wählen Sie alle Accounts aus, die wir für Sie anpassen sollen.</p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        <div>
          <h3 className="text-lg font-bold text-gray-800 mb-6">Social Media Accounts</h3>
          <div className="grid grid-cols-2 gap-4">
            {social.map(p => <Card key={p.id} platform={p} selected={data.includes(p.id)} onClick={() => togglePlatform(p.id)} />)}
          </div>
        </div>
        <div>
          <h3 className="text-lg font-bold text-gray-800 mb-6">Streaming Dienste</h3>
          <div className="grid grid-cols-2 gap-4">
            {streaming.map(p => <Card key={p.id} platform={p} selected={data.includes(p.id)} onClick={() => togglePlatform(p.id)} />)}
          </div>
        </div>
      </div>
    </div>
  );
};

function Card({ platform, selected, onClick }) {
  return (
    <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={onClick}
      className={`relative flex flex-col items-center justify-center p-6 rounded-2xl border-2 transition-all gap-4 min-h-[140px] ${
        selected ? 'border-primary-600 bg-primary-50' : 'border-gray-100 bg-white hover:border-primary-200'
      }`}>
      <div className="h-12 flex items-center justify-center">
        <img src={platform.logoUrl} alt={platform.name} className="max-h-full max-w-full object-contain" />
      </div>
      <span className={`font-semibold text-sm ${selected ? 'text-primary-600' : 'text-gray-500'}`}>{platform.name}</span>
      {selected && (
        <div className="absolute top-2 right-2 w-6 h-6 bg-primary-600 rounded-full flex items-center justify-center shadow-lg">
          <Check className="w-4 h-4 text-white" />
        </div>
      )}
    </motion.button>
  );
}

export default Step1;
