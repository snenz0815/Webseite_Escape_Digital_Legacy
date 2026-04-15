import React, { useState, useEffect } from 'react';
import { Plus, Trash2, ToggleLeft, ToggleRight, X, Save } from 'lucide-react';

const API = 'http://localhost:3001/api/admin/platforms';

const Admin = ({ onClose }) => {
  const [platforms, setPlatforms] = useState([]);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ name: '', category: 'social_media', logoUrl: '', usernameRequired: true, emailRequired: false, placeholderText: '' });

  const load = () => fetch(API).then(r => r.json()).then(setPlatforms);
  useEffect(() => { load(); }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    const fd = new FormData();
    fd.append('name', form.name);
    fd.append('category', form.category);
    fd.append('logoUrl', form.logoUrl);
    fd.append('usernameRequired', String(form.usernameRequired));
    fd.append('emailRequired', String(form.emailRequired));
    fd.append('placeholderText', form.placeholderText);
    if (form.logoFile) fd.append('logo', form.logoFile);
    await fetch(API, { method: 'POST', body: fd });
    setShowAdd(false);
    setForm({ name: '', category: 'social_media', logoUrl: '', usernameRequired: true, emailRequired: false, placeholderText: '' });
    load();
  };

  const toggle = async (id) => { await fetch(`${API}/${id}/toggle`, { method: 'PATCH' }); load(); };
  const remove = async (id) => { if (confirm('Wirklich löschen?')) { await fetch(`${API}/${id}`, { method: 'DELETE' }); load(); } };

  return (
    <div className="fixed inset-0 z-50 bg-gray-900/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-3xl rounded-3xl shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center sticky top-0 bg-white rounded-t-3xl z-10">
          <h2 className="text-xl font-bold text-gray-900">Plattform-Verwaltung</h2>
          <div className="flex gap-2">
            <button onClick={() => setShowAdd(!showAdd)} className="px-4 py-2 bg-primary-600 text-white rounded-xl text-sm font-bold flex items-center gap-2">
              <Plus className="w-4 h-4" /> Hinzufügen
            </button>
            <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-900"><X className="w-5 h-5" /></button>
          </div>
        </div>

        {showAdd && (
          <form onSubmit={handleAdd} className="p-6 border-b border-gray-100 bg-gray-50 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-600">Name</label>
                <input required value={form.name} onChange={e => setForm({...form, name: e.target.value})}
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm" placeholder="z.B. Twitch" />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-600">Kategorie</label>
                <select value={form.category} onChange={e => setForm({...form, category: e.target.value})}
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm bg-white">
                  <option value="social_media">Social Media</option>
                  <option value="streaming">Streaming</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-600">Logo-URL</label>
                <input value={form.logoUrl} onChange={e => setForm({...form, logoUrl: e.target.value})}
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm" placeholder="https://..." />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-600">Placeholder-Text</label>
                <input value={form.placeholderText} onChange={e => setForm({...form, placeholderText: e.target.value})}
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm" placeholder="@benutzername" />
              </div>
            </div>
            <div className="flex gap-6">
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={form.usernameRequired} onChange={e => setForm({...form, usernameRequired: e.target.checked})} /> Benutzername erforderlich
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={form.emailRequired} onChange={e => setForm({...form, emailRequired: e.target.checked})} /> E-Mail erforderlich
              </label>
            </div>
            <button type="submit" className="px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-bold flex items-center gap-2">
              <Save className="w-4 h-4" /> Speichern
            </button>
          </form>
        )}

        <div className="p-6 space-y-3">
          {platforms.map(p => (
            <div key={p.id} className={`flex items-center gap-4 p-4 rounded-xl border transition-all ${p.status === 'active' ? 'border-gray-100 bg-white' : 'border-red-100 bg-red-50 opacity-60'}`}>
              {p.logoUrl && <img src={p.logoUrl} alt={p.name} className="w-8 h-8 object-contain flex-shrink-0" />}
              <div className="flex-grow min-w-0">
                <p className="font-bold text-sm text-gray-900">{p.name}</p>
                <p className="text-xs text-gray-400">{p.category === 'social_media' ? 'Social Media' : 'Streaming'} · {p.status}</p>
              </div>
              <button onClick={() => toggle(p.id)} className="p-2 text-gray-400 hover:text-primary-600" title="Status umschalten">
                {p.status === 'active' ? <ToggleRight className="w-5 h-5 text-green-500" /> : <ToggleLeft className="w-5 h-5" />}
              </button>
              <button onClick={() => remove(p.id)} className="p-2 text-gray-400 hover:text-red-500" title="Löschen">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Admin;
