import React from 'react';

const BUNDESLAENDER = [
  'Baden-Württemberg', 'Bayern', 'Berlin', 'Brandenburg', 'Bremen',
  'Hamburg', 'Hessen', 'Mecklenburg-Vorpommern', 'Niedersachsen',
  'Nordrhein-Westfalen', 'Rheinland-Pfalz', 'Saarland', 'Sachsen',
  'Sachsen-Anhalt', 'Schleswig-Holstein', 'Thüringen'
];

const requiredFields = ['firstName', 'lastName', 'street', 'zip', 'city', 'state', 'country'];

const Step2 = ({ data, onUpdate }) => {
  const handleChange = (e) => {
    onUpdate({ ...data, [e.target.name]: e.target.value });
  };

  const fieldClass = (name) => {
    const isEmpty = !data[name] || data[name].trim() === '';
    return `w-full px-4 py-3 rounded-xl border focus:ring-2 outline-none transition-all ${
      isEmpty
        ? 'border-red-300 bg-red-50 focus:border-red-400 focus:ring-red-100'
        : 'border-gray-200 focus:border-primary-500 focus:ring-primary-200'
    }`;
  };

  const isGermany = !data.country || data.country === '' || data.country.toLowerCase().includes('deutsch');

  return (
    <div>
      <h2 className="text-3xl font-bold text-gray-900 mb-2">Angaben der verstorbenen Person</h2>
      <p className="text-gray-500 mb-2">Bitte geben Sie die Daten der verstorbenen Person an, deren Accounts abgemeldet werden sollen.</p>
      <p className="text-xs text-red-500 mb-8">* Pflichtfelder</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="text-sm font-bold text-gray-700">Vorname <span className="text-red-500">*</span></label>
          <input type="text" name="firstName" value={data.firstName} onChange={handleChange}
            placeholder="Max" className={fieldClass('firstName')} />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-bold text-gray-700">Nachname <span className="text-red-500">*</span></label>
          <input type="text" name="lastName" value={data.lastName} onChange={handleChange}
            placeholder="Mustermann" className={fieldClass('lastName')} />
        </div>
        <div className="md:col-span-2 space-y-2">
          <label className="text-sm font-bold text-gray-700">Straße &amp; Hausnummer <span className="text-red-500">*</span></label>
          <input type="text" name="street" value={data.street} onChange={handleChange}
            placeholder="Musterstraße 1" className={fieldClass('street')} />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-bold text-gray-700">PLZ <span className="text-red-500">*</span></label>
          <input type="text" name="zip" value={data.zip} onChange={handleChange}
            placeholder="12345" className={fieldClass('zip')} />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-bold text-gray-700">Stadt <span className="text-red-500">*</span></label>
          <input type="text" name="city" value={data.city} onChange={handleChange}
            placeholder="Musterstadt" className={fieldClass('city')} />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-bold text-gray-700">Land <span className="text-red-500">*</span></label>
          <input type="text" name="country" value={data.country} onChange={handleChange}
            placeholder="Deutschland" className={fieldClass('country')} />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-bold text-gray-700">Bundesland <span className="text-red-500">*</span></label>
          {isGermany ? (
            <select name="state" value={data.state} onChange={handleChange}
              className={fieldClass('state') + ' bg-white'}>
              <option value="">Bitte wählen...</option>
              {BUNDESLAENDER.map(bl => <option key={bl} value={bl}>{bl}</option>)}
            </select>
          ) : (
            <input type="text" name="state" value={data.state} onChange={handleChange}
              placeholder="Bundesland / Region" className={fieldClass('state')} />
          )}
        </div>
      </div>
    </div>
  );
};

export default Step2;
