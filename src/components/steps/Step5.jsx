import React, { useState, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, FileText, X, CheckCircle2, Loader2 } from 'lucide-react';

const API = import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/api` : 'http://localhost:3001/api';

const Step5 = ({ data, onUpdate, platforms }) => {
  const [allPlatformMeta, setAllPlatformMeta] = useState([]);
  const [documentTypes, setDocumentTypes] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch(`${API}/platforms`).then(r => r.json()),
      fetch(`${API}/document-types`).then(r => r.json())
    ])
      .then(([platformList, docTypes]) => {
        setAllPlatformMeta(platformList);
        setDocumentTypes(docTypes);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  // Collect required doc IDs from all selected platforms (union, deduplicated)
  const requiredDocIds = [...new Set(
    (platforms || []).flatMap(pid => {
      const meta = allPlatformMeta.find(m => m.id === pid);
      return meta?.requiredDocuments || ['deathCertificate'];
    })
  )];

  // Which platforms need each document (for badges)
  const docPlatformMap = {};
  requiredDocIds.forEach(docId => {
    docPlatformMap[docId] = allPlatformMeta
      .filter(m => platforms?.includes(m.id) && m.requiredDocuments?.includes(docId))
      .map(m => m.name);
  });

  const handleUpload = (docId, files) => {
    onUpdate({ ...data, [docId]: files[0] });
  };

  const removeFile = (docId) => {
    onUpdate({ ...data, [docId]: null });
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-20 gap-4">
      <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
      <p className="text-gray-500 text-sm">Dokumente werden geladen...</p>
    </div>
  );

  if (!platforms || platforms.length === 0) return (
    <p className="text-gray-500 text-center py-10">Bitte wählen Sie zuerst Plattformen aus (Schritt 1).</p>
  );

  return (
    <div>
      <h2 className="text-3xl font-bold text-gray-900 mb-2">Dokumente hochladen</h2>
      <p className="text-gray-500 mb-3">
        Basierend auf Ihren gewählten Plattformen benötigen wir die folgenden Unterlagen.
      </p>
      <p className="text-xs text-red-500 mb-8">* Alle aufgelisteten Dokumente sind Pflichtfelder</p>

      <div className="space-y-5">
        {requiredDocIds.map(docId => {
          const docType = documentTypes[docId];
          if (!docType) return null;
          return (
            <UploadZone
              key={docId}
              title={docType.label}
              description={docType.description}
              platformsNeeding={docPlatformMap[docId] || []}
              file={data[docId] || null}
              onDrop={(files) => handleUpload(docId, files)}
              onRemove={() => removeFile(docId)}
            />
          );
        })}
      </div>
    </div>
  );
};

function UploadZone({ title, description, platformsNeeding, file, onDrop, onRemove }) {
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    maxFiles: 1,
    accept: { 'application/pdf': ['.pdf'], 'image/*': ['.jpeg', '.jpg', '.png'] }
  });

  return (
    <div className={`p-5 rounded-2xl border-2 transition-all ${
      file ? 'border-green-200 bg-green-50' : 'border-gray-100 bg-white'
    }`}>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex-grow min-w-0">
          <h3 className="font-bold text-gray-900 mb-0.5 flex items-center gap-2">
            {title} <span className="text-red-500 text-xs">*</span>
            {file && <CheckCircle2 className="w-4 h-4 text-green-500" />}
          </h3>
          <p className="text-xs text-gray-500 mb-2">{description}</p>
          {platformsNeeding.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {platformsNeeding.map(name => (
                <span key={name} className="px-2 py-0.5 rounded-full bg-primary-50 text-primary-700 text-[10px] font-bold">
                  {name}
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="flex-shrink-0">
          {file ? (
            <div className="flex items-center gap-3 px-4 py-3 bg-white rounded-xl border border-green-200">
              <FileText className="w-4 h-4 text-green-600" />
              <div className="max-w-[140px]">
                <p className="text-xs font-bold text-gray-900 truncate">{file.name}</p>
                <p className="text-[10px] text-green-600">Hochgeladen ✓</p>
              </div>
              <button onClick={onRemove} className="p-1 text-gray-400 hover:text-red-500 transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div
              {...getRootProps()}
              className={`flex items-center gap-2 px-5 py-3 rounded-xl border-2 border-dashed cursor-pointer transition-all text-sm font-bold ${
                isDragActive
                  ? 'border-primary-500 bg-primary-50 text-primary-700'
                  : 'border-gray-200 hover:border-primary-300 bg-gray-50 text-gray-600'
              }`}
            >
              <input {...getInputProps()} />
              <Upload className="w-4 h-4" />
              Hochladen
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Step5;
