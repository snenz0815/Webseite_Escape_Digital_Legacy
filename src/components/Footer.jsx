import React from 'react';
import { Settings } from 'lucide-react';

const Footer = ({ onAdminClick }) => {
  return (
    <footer className="bg-white border-t border-gray-100 py-12">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">
              S
            </div>
            <span className="text-lg font-bold tracking-tight">Social-Wipe</span>
          </div>
          
          <div className="flex gap-8 text-sm text-gray-500">
            <a href="#" className="hover:text-primary-600">Impressum</a>
            <a href="#" className="hover:text-primary-600">Datenschutz</a>
            <a href="#" className="hover:text-primary-600">AGB</a>
            <a href="#" className="hover:text-primary-600">Kontakt</a>
            <button
              onClick={() => window.klaro && window.klaro.show(window.klaroConfig)}
              className="hover:text-primary-600 cursor-pointer"
            >
              Cookie-Einstellungen
            </button>
          </div>

          <div className="flex items-center gap-6">
            <div className="text-sm text-gray-400">
              © {new Date().getFullYear()} Social-Wipe.
            </div>
            {onAdminClick && (
              <button 
                onClick={onAdminClick}
                className="p-2 text-gray-300 hover:text-gray-500 transition-colors"
                title="Admin"
              >
                <Settings className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
