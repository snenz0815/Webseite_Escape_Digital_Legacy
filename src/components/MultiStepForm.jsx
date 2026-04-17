import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Save, Link as LinkIcon, Mail, Copy, X, CheckCircle2 } from 'lucide-react';
import Step1 from './steps/Step1';
import Step2 from './steps/Step2';
import Step3 from './steps/Step3';
import Step4 from './steps/Step4';
import Step5 from './steps/Step5';
import Step6_Legal from './steps/Step6_Legal';
import Step7_Payment from './steps/Step7_Payment';
import Step8_Success from './steps/Step8_Success';

const MultiStepForm = ({ onBack }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [platformMeta, setPlatformMeta] = useState([]);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [saveEmail, setSaveEmail] = useState('');
  const [linkCopied, setLinkCopied] = useState(false);
  
  const initialFormData = {
    platforms: [],
    person1: { firstName: '', lastName: '', street: '', zip: '', city: '', state: '', country: '' },
    person2: { firstName: '', lastName: '', street: '', zip: '', city: '', state: '', country: '', email: '', phone: '', relationship: '' },
    accountDetails: {},
    documents: { idCopy: null, powerOfAttorney: null, certificate: null },
    agbAgreed: false,
    withdrawalConfirmed: false,
    correctnessConfirmed: false
  };

  const [formData, setFormData] = useState(initialFormData);

  // Check for state in URL on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const savedState = params.get('state');
    if (savedState) {
      try {
        const decoded = JSON.parse(atob(savedState));
        setFormData(prev => ({ ...prev, ...decoded.formData }));
        setCurrentStep(decoded.step);
        // Clear param without reload
        window.history.replaceState({}, document.title, window.location.pathname);
      } catch (e) {
        console.error("Failed to restore state", e);
      }
    }
  }, []);

  const totalSteps = 8;
  const progress = (currentStep / (totalSteps - 1)) * 100; // 100% at step 7 since 8 is success

  const generateSaveLink = () => {
    const stateToSave = {
      formData: { ...formData, documents: { idCopy: null, powerOfAttorney: null, certificate: null } },
      step: currentStep
    };
    const encoded = btoa(JSON.stringify(stateToSave));
    return `${window.location.origin}${window.location.pathname}?state=${encoded}`;
  };

  const copyLink = () => {
    const link = generateSaveLink();
    navigator.clipboard.writeText(link);
    setLinkCopied(true);
    setTimeout(() => setLinkCopied(false), 2000);
  };

  const nextStep = () => {
    if (currentStep < totalSteps) setCurrentStep(currentStep + 1);
  };

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
    else onBack();
  };

  const updateFormData = (stepField, data) => {
    if (typeof stepField === 'string' && typeof data === 'object' && !Array.isArray(data)) {
      setFormData(prev => ({ ...prev, [stepField]: { ...prev[stepField], ...data } }));
    } else {
      setFormData(prev => ({ ...prev, [stepField]: data }));
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1: return <Step1 data={formData.platforms} onUpdate={(data) => updateFormData('platforms', data)} onPlatformsLoaded={setPlatformMeta} />;
      case 2: return <Step2 data={formData.person1} onUpdate={(data) => updateFormData('person1', data)} />;
      case 3: return <Step3 data={formData.person2} onUpdate={(data) => updateFormData('person2', data)} />;
      case 4: return <Step4 platforms={formData.platforms} platformMeta={platformMeta} data={formData.accountDetails} onUpdate={(data) => updateFormData('accountDetails', data)} />;
      case 5: return <Step5 data={formData.documents} onUpdate={(data) => updateFormData('documents', data)} platforms={formData.platforms} platformMeta={platformMeta} />;
      case 6: return <Step6_Legal data={formData} onUpdate={(data) => setFormData(prev => ({...prev, ...data}))} />;
      case 7: return <Step7_Payment data={formData} platformMeta={platformMeta} onSuccess={nextStep} />;
      case 8: return <Step8_Success data={formData} platformMeta={platformMeta} />;
      default: return null;
    }
  };

  const isStepValid = () => {
    switch (currentStep) {
      case 1:
        return formData.platforms.length > 0;
      case 2:
        return Object.entries(formData.person1).every(([key, value]) => value && value.trim() !== '');
      case 3:
        return Object.entries(formData.person2).every(([key, value]) => {
          if (key === 'phone') return true;
          return value && value.trim() !== '';
        });
      case 4: {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const urlRegex = /^https?:\/\/[^\s/$.?#].[^\s]*$/i;

        return formData.platforms.every(p => {
          const meta = platformMeta.find(m => m.id === p);
          const specs = meta?.specs || {};
          const vals = formData.accountDetails[p] || {};
          
          if (specs.usernameRequired && !vals.username?.trim()) return false;
          
          if (specs.emailRequired) {
            if (!vals.email?.trim() || !emailRegex.test(vals.email)) return false;
          }
          
          if (specs.profileUrlRequired) {
            if (!vals.profileUrl?.trim() || !urlRegex.test(vals.profileUrl)) return false;
            
            // Basic platform-specific check
            const url = vals.profileUrl.toLowerCase();
            const platformId = p.toLowerCase();
            if (platformId.includes('instagram') && !url.includes('instagram.com')) return false;
            if (platformId.includes('facebook') && !url.includes('facebook.com')) return false;
            if (platformId.includes('linkedin') && !url.includes('linkedin.com')) return false;
            if (platformId.includes('tiktok') && !url.includes('tiktok.com')) return false;
            if ((platformId === 'x' || platformId.includes('twitter')) && (!url.includes('twitter.com') && !url.includes('x.com'))) return false;
            if (platformId.includes('youtube') && (!url.includes('youtube.com') && !url.includes('youtu.be'))) return false;
          }
          
          return true;
        });
      }
      case 5: {
        // Collect all required doc IDs from selected platforms
        const requiredDocIds = [...new Set(
          formData.platforms.flatMap(pid => {
            const meta = platformMeta.find(m => m.id === pid);
            return meta?.requiredDocuments || ['deathCertificate'];
          })
        )];
        return requiredDocIds.every(docId => formData.documents[docId]);
      }
      case 6:
        return formData.agbAgreed && formData.withdrawalConfirmed && formData.correctnessConfirmed;
      case 7:
        return true;
      case 8:
        return true;
      default:
        return true;
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Progress Bar & Save Button Header */}
      <div className="mb-8 px-4 flex flex-col gap-4">
        <div className="flex justify-between items-end">
          <div className="flex-grow mr-4">
            <div className="flex justify-between items-center mb-4">
              <span className="text-sm font-bold text-primary-600 uppercase tracking-wider">Schritt {currentStep} von {totalSteps}</span>
            </div>
            <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
              <motion.div 
                className="h-full bg-primary-600"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ type: "spring", stiffness: 50 }}
              />
            </div>
          </div>
          <button
            onClick={() => setShowSaveModal(true)}
            className="flex-shrink-0 flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-bold text-gray-700 hover:bg-gray-50 transition-all shadow-sm"
          >
            <Save className="w-4 h-4 text-primary-600" />
            <span>Zwischenstand speichern</span>
          </button>
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-xl shadow-gray-200/50 border border-gray-100 overflow-hidden relative">
        <div className="p-8 md:p-12">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              {renderStep()}
            </motion.div>
          </AnimatePresence>

          {currentStep < 7 && (
            <div className="mt-12 flex justify-between items-center pt-8 border-t border-gray-100">
              <button
                onClick={prevStep}
                className="px-6 py-3 text-gray-600 hover:text-gray-900 font-semibold flex items-center gap-2 transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
                Zurück
              </button>
              <button
                onClick={nextStep}
                disabled={!isStepValid()}
                className="px-8 py-3 bg-primary-600 text-white rounded-xl font-bold hover:bg-primary-700 transition-all shadow-lg shadow-primary-200 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Weiter
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Save Modal */}
      <AnimatePresence>
        {showSaveModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowSaveModal(false)}
              className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative bg-white w-full max-w-lg rounded-3xl shadow-2xl p-8 overflow-hidden"
            >
              <button 
                onClick={() => setShowSaveModal(false)}
                className="absolute top-6 right-6 p-2 text-gray-400 hover:text-gray-900 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>

              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-primary-50 text-primary-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Save className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900">Zwischenstand speichern</h3>
                <p className="text-gray-500 mt-2">Nutzen Sie den Link unten, um Ihre Umfrage jederzeit fortzusetzen.</p>
              </div>

              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700">Persönlicher Resume-Link</label>
                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      readOnly 
                      value={generateSaveLink().substring(0, 50) + "..."}
                      className="flex-grow px-4 py-3 bg-gray-50 rounded-xl border border-gray-200 text-gray-500 text-sm outline-none"
                    />
                    <button 
                      onClick={copyLink}
                      className={`flex-shrink-0 px-4 py-3 rounded-xl font-bold shadow-sm transition-all flex items-center gap-2 ${
                        linkCopied ? 'bg-green-500 text-white' : 'bg-primary-600 text-white hover:bg-primary-700'
                      }`}
                    >
                      {linkCopied ? <CheckCircle2 className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      {linkCopied ? 'Kopiert' : 'Kopieren'}
                    </button>
                  </div>
                </div>

                <div className="relative py-4">
                  <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-100"></div></div>
                  <div className="relative flex justify-center text-xs uppercase"><span className="bg-white px-2 text-gray-400 font-bold">Oder per Mail</span></div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700">E-Mail-Adresse</label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input 
                        type="email" 
                        placeholder="beispiel@mail.de"
                        value={saveEmail}
                        onChange={(e) => setSaveEmail(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 bg-white rounded-xl border border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none transition-all"
                      />
                    </div>
                  </div>
                  <button 
                    className="w-full py-4 bg-gray-900 text-white rounded-xl font-bold hover:bg-gray-800 transition-all flex items-center justify-center gap-2"
                  >
                    <Mail className="w-5 h-5" />
                    Link per Mail senden
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MultiStepForm;
