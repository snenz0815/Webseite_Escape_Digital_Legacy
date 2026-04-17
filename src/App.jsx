import React, { useState } from 'react';
import Hero from './components/Hero';
import MultiStepForm from './components/MultiStepForm';
import Footer from './components/Footer';
import Admin from './components/Admin';
import { Shield, Zap, GraduationCap } from 'lucide-react';
import Maintenance from './components/Maintenance';

function App() {
  const [showForm, setShowForm] = useState(false);
  const [showAdmin, setShowAdmin] = useState(false);
  const [isUnlocked, setIsUnlocked] = useState(localStorage.getItem('site_unlocked') === 'true');

  if (!isUnlocked) {
    return <Maintenance onUnlock={() => setIsUnlocked(true)} />;
  }

  return (
    <div className="min-h-screen bg-white text-gray-900 overflow-x-hidden">
      {!showForm ? (
        <>
          <Hero onStart={() => setShowForm(true)} />
          <section className="py-20 bg-gray-50">
            <div className="max-w-6xl mx-auto px-4 text-center">
              <h2 className="text-3xl md:text-4xl font-bold mb-8 uppercase tracking-widest text-primary-600">Warum wir?</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <FeatureCard 
                  title="Pietätvoll & Diskret" 
                  description="Wir behandeln alle Daten des Verstorbenen mit größter Sorgfalt und Vertraulichkeit." 
                  icon={<Shield className="w-10 h-10 text-primary-600" />}
                />
                <FeatureCard 
                  title="Schnell & Unkompliziert" 
                  description="Unser geführter Prozess dauert nur wenige Minuten. Kein Papierkram – alles digital." 
                  icon={<Zap className="w-10 h-10 text-primary-600" />}
                />
                <FeatureCard 
                  title="Rechtlich Abgesichert" 
                  description="Wir erstellen rechtskonforme Abmeldungsschreiben für alle gängigen Plattformen und Dienste." 
                  icon={<GraduationCap className="w-10 h-10 text-primary-600" />}
                />
              </div>
            </div>
          </section>
          <Footer onAdminClick={() => setShowAdmin(true)} />
        </>
      ) : (
        <div className="py-10 md:py-20 px-4 min-h-screen bg-gradient-to-br from-primary-50 to-white">
          <MultiStepForm onBack={() => setShowForm(false)} />
        </div>
      )}
      {showAdmin && <Admin onClose={() => setShowAdmin(false)} />}
    </div>
  );
}

function FeatureCard({ title, description, icon }) {
  return (
    <div className="p-8 bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow flex flex-col items-center">
      <div className="mb-6">{icon}</div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  );
}

export default App;
