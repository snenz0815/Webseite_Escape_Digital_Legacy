import React from 'react';

const Step4 = ({ platforms, platformMeta, data, onUpdate }) => {
  const handleChange = (platformId, field, value) => {
    onUpdate({ ...data, [platformId]: { ...(data[platformId] || {}), [field]: value } });
  };

  const inputClass = "w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none transition-all bg-white";

  if (platforms.length === 0) {
    return (
      <div className="text-center py-10">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Keine Plattformen ausgewählt</h2>
        <p className="text-gray-500">Bitte gehen Sie zurück und wählen Sie mindestens eine Plattform aus.</p>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-3xl font-bold text-gray-900 mb-2">Account-Details</h2>
      <p className="text-gray-500 mb-3">Bitte geben Sie die Zugangsdaten der ausgewählten Plattformen an.</p>
      <p className="text-xs text-red-500 mb-8">* Mit * markierte Felder sind Pflichtfelder</p>

      <div className="space-y-8">
        {platforms.map((pid) => {
          const meta = platformMeta.find(m => m.id === pid) || {};
          const specs = meta.specs || {};
          const values = data[pid] || {};

          return (
            <div key={pid} className="p-6 rounded-2xl border border-gray-100 bg-gray-50/50 space-y-4">
              {/* Platform header */}
              <div className="flex items-center gap-3 pb-2 border-b border-gray-100">
                {meta.logoUrl && <img src={meta.logoUrl} alt={meta.name} className="w-8 h-8 object-contain" />}
                <span className="font-bold text-gray-900 text-lg">{meta.name || pid}</span>
                {specs.note && (
                  <span className="ml-auto text-xs text-gray-400 hidden sm:block">{specs.note}</span>
                )}
              </div>

              {/* Username field */}
              {specs.usernameRequired && (
                <div className="space-y-1">
                  <label className="text-sm font-bold text-gray-700">
                    Benutzername <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={values.username || ''}
                    onChange={e => handleChange(pid, 'username', e.target.value)}
                    placeholder={specs.placeholderText || '@benutzername'}
                    className={inputClass}
                  />
                </div>
              )}

              {/* Profile URL field */}
              {specs.profileUrlRequired && (
                <div className="space-y-1">
                  <label className="text-sm font-bold text-gray-700">
                    Profil-URL <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="url"
                    value={values.profileUrl || ''}
                    onChange={e => handleChange(pid, 'profileUrl', e.target.value)}
                    placeholder={specs.profileUrlPlaceholder || 'https://...'}
                    className={inputClass}
                  />
                </div>
              )}

              {/* Email field */}
              {specs.emailRequired && (
                <div className="space-y-1">
                  <label className="text-sm font-bold text-gray-700">
                    E-Mail des Kontos <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    value={values.email || ''}
                    onChange={e => handleChange(pid, 'email', e.target.value)}
                    placeholder={specs.emailPlaceholder || 'konto@beispiel.de'}
                    className={inputClass}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Step4;
