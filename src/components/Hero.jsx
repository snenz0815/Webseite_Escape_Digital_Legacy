import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, CheckCircle2 } from 'lucide-react';

const Hero = ({ onStart }) => {
  return (
    <div className="relative overflow-hidden bg-white pt-16 pb-32">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-7xl">
        <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-primary-100 rounded-full blur-3xl opacity-50" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-primary-50 rounded-full blur-3xl opacity-50" />
      </div>

      <div className="container relative mx-auto px-4">
        <nav className="flex items-center justify-between mb-20">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center text-white font-bold text-xl">
              S
            </div>
            <span className="text-xl font-bold tracking-tight">Social-Wipe</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-600">
            <a href="#" className="hover:text-primary-600 transition-colors">Services</a>
            <a href="#" className="hover:text-primary-600 transition-colors">Sicherheit</a>
            <a href="#" className="hover:text-primary-600 transition-colors">Preise</a>
          </div>
        </nav>

        <div className="flex flex-col lg:flex-row items-center gap-16">
          <div className="flex-1 text-center lg:text-left">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <span className="inline-block px-4 py-1.5 mb-6 text-sm font-semibold tracking-wider text-primary-700 uppercase bg-primary-50 rounded-full">
                Sicher & Professionell
              </span>
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold text-gray-900 leading-[1.1] mb-8">
                Das digitale Erbe in <span className="gradient-text">sicheren Händen.</span>
              </h1>
              <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto lg:mx-0">
                Wir kümmern uns pietätvoll und zuverlässig um die Abmeldung und Verwaltung der Social Media & Streaming Accounts von Verstorbenen.
              </p>

              <div className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start">
                <button
                  onClick={onStart}
                  className="group px-8 py-4 bg-primary-600 text-white rounded-full font-bold text-lg hover:bg-primary-700 transition-all shadow-xl shadow-primary-200 flex items-center gap-2"
                >
                  Jetzt starten
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
                <div className="flex items-center gap-2 text-gray-500 text-sm italic">
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                  DSGVO Konform
                </div>
              </div>
            </motion.div>
          </div>

          <div className="flex-1 relative">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative z-10"
            >
              <img
                src="https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&q=80&w=800"
                alt="Digital Security"
                className="rounded-3xl shadow-2xl border-8 border-white"
              />
              <div className="absolute -bottom-8 -left-8 bg-white p-6 rounded-2xl shadow-xl border border-gray-100 hidden md:block">
                <div className="flex items-center gap-4 mb-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
                  <span className="text-sm font-bold text-gray-900">Live Status</span>
                </div>
                <p className="text-sm text-gray-500">1.240 Accounts heute angepasst</p>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;
