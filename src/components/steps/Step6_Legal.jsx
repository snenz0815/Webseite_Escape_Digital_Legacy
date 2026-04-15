import React from 'react';
import { ShieldCheck, FileText, Info } from 'lucide-react';

const Step6_Legal = ({ data, onUpdate }) => {
  const handleChange = (name, value) => {
    onUpdate({ ...data, [name]: value });
  };

  return (
    <div>
      <h2 className="text-3xl font-bold text-gray-900 mb-2">Rechtliches & Bestätigung</h2>
      <p className="text-gray-500 mb-10">Bitte lesen und bestätigen Sie die rechtlichen Hinweise, um fortzufahren.</p>

      <div className="space-y-8">
        {/* Widerrufsbelehrung */}
        <div className="p-6 rounded-2xl bg-primary-50 border border-primary-100">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-primary-600 shadow-sm flex-shrink-0">
              <Info className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 mb-2">Widerrufsbelehrung</h3>
              <div className="text-sm text-gray-600 max-h-32 overflow-y-auto pr-2 space-y-2">
                <p>Sie haben das Recht, binnen vierzehn Tagen ohne Angabe von Gründen diesen Vertrag zu widerrufen.</p>
                <p>Die Widerrufsfrist beträgt vierzehn Tage ab dem Tag des Vertragsabschlusses.</p>
                <p>Um Ihr Widerrufsrecht auszuüben, müssen Sie uns mittels einer eindeutigen Erklärung über Ihren Entschluss informieren.</p>
                <p><strong>Hinweis zum vorzeitigen Erlöschen:</strong> Ihr Widerrufsrecht erlischt vorzeitig, wenn wir mit der Ausführung der Dienstleistung mit Ihrer ausdrücklichen Zustimmung vor Ende der Widerrufsfrist begonnen haben.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Checkboxes */}
        <div className="space-y-6">
          <label className="flex items-start gap-4 p-4 rounded-xl border border-gray-100 hover:bg-gray-50 transition-all cursor-pointer group">
            <input
              type="checkbox"
              checked={data.agbAgreed}
              onChange={(e) => handleChange('agbAgreed', e.target.checked)}
              className="mt-1 w-5 h-5 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
            />
            <span className="text-sm text-gray-700">
              Ich habe die <a href="#" className="font-bold text-primary-600 hover:underline">AGB</a> sowie die <a href="#" className="font-bold text-primary-600 hover:underline">Datenschutzerklärung</a> gelesen und erkläre mich mit diesen einverstanden.
            </span>
          </label>

          <label className="flex items-start gap-4 p-4 rounded-xl border border-gray-100 hover:bg-gray-50 transition-all cursor-pointer group">
            <input
              type="checkbox"
              checked={data.withdrawalConfirmed}
              onChange={(e) => handleChange('withdrawalConfirmed', e.target.checked)}
              className="mt-1 w-5 h-5 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
            />
            <span className="text-sm text-gray-700">
              Ich verlange ausdrücklich, dass Sie mit der Dienstleistung vor Ende der Widerrufsfrist beginnen. Mir ist bekannt, dass ich bei vollständiger Vertragserfüllung mein **Widerrufsrecht verliere**.
            </span>
          </label>

          <label className="flex items-start gap-4 p-4 rounded-xl border border-gray-100 hover:bg-gray-50 transition-all cursor-pointer group">
            <input
              type="checkbox"
              checked={data.correctnessConfirmed}
              onChange={(e) => handleChange('correctnessConfirmed', e.target.checked)}
              className="mt-1 w-5 h-5 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
            />
            <span className="text-sm text-gray-700">
              Ich bestätige, dass alle von mir gemachten Angaben der Wahrheit entsprechen und ich zur Beantragung dieser Datenanpassung berechtigt bin.
            </span>
          </label>
        </div>
      </div>
    </div>
  );
};

export default Step6_Legal;
