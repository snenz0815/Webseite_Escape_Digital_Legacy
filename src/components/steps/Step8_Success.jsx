import React, { useState, useEffect } from 'react';
import { FileDown, CheckCircle2, Loader2, MailCheck } from 'lucide-react';
import { jsPDF } from 'jspdf';

const DOC_LABELS = {
  deathCertificate: 'Sterbeurkunde (Kopie)',
  applicantId: 'Personalausweis / Reisepass des Antragstellers (Kopie)',
  proofOfRelationship: 'Verwandtschaftsnachweis (Heiratsurkunde / Erbschein)',
  powerOfAttorney: 'Vollmacht / Nachlassurkunde',
};

const Step8_Success = ({ data, platformMeta }) => {
  const [allPlatforms, setAllPlatforms] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('http://localhost:3001/api/platforms')
      .then(r => r.json())
      .then(list => { setAllPlatforms(list); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const getMeta = (pid) => allPlatforms.find(p => p.id === pid) || (platformMeta || []).find(p => p.id === pid) || {};

  const uploadedDocs = Object.entries(data.documents || {})
    .filter(([, file]) => file)
    .map(([key]) => DOC_LABELS[key] || key);

  const generatePdf = (platformId) => {
    const meta = getMeta(platformId);
    const addr = meta.contactAddress || {};
    const p1 = data.person1 || {};
    const p2 = data.person2 || {};
    const accDetails = data.accountDetails?.[platformId] || {};
    const date = new Date().toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' });

    const doc = new jsPDF({ unit: 'mm', format: 'a4' });
    const lm = 25; const rm = 185; const pw = rm - lm;

    const setBody = (size = 10) => { doc.setFont('helvetica', 'normal'); doc.setFontSize(size); doc.setTextColor(40, 40, 40); };
    const setBold = (size = 10) => { doc.setFont('helvetica', 'bold'); doc.setFontSize(size); doc.setTextColor(40, 40, 40); };
    const setGray = (size = 8) => { doc.setFont('helvetica', 'normal'); doc.setFontSize(size); doc.setTextColor(120, 120, 120); };
    const line = (y) => { doc.setDrawColor(220, 220, 220); doc.line(lm, y, rm, y); };

    doc.setFillColor(22, 163, 74);
    doc.roundedRect(lm, 12, 22, 22, 3, 3, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.setTextColor(255, 255, 255);
    doc.text('DS', lm + 11, 26, { align: 'center' });
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(22, 163, 74);
    doc.text('Digital-Swipe', lm + 26, 21);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(120, 120, 120);
    doc.text('Digitales Erbe professionell verwalten', lm + 26, 26);

    setBody(9);
    doc.text(`${p2.firstName} ${p2.lastName}`, rm, 20, { align: 'right' });
    doc.text(`${p2.street}`, rm, 25, { align: 'right' });
    doc.text(`${p2.zip} ${p2.city}`, rm, 30, { align: 'right' });
    doc.text(`${p2.state}, ${p2.country}`, rm, 35, { align: 'right' });
    doc.text(`${p2.email}`, rm, 40, { align: 'right' });
    if (p2.phone) doc.text(p2.phone, rm, 45, { align: 'right' });

    setGray(7);
    doc.text('Digital-Swipe – Im Auftrag des Antragstellers', lm, 52);
    setBody(10);
    doc.text(addr.company || meta.name || platformId, lm, 60);
    if (addr.department) { setBody(9); doc.text(addr.department, lm, 65); }
    setBody(10);
    let addrY = addr.department ? 71 : 65;
    doc.text(addr.street || '', lm, addrY);
    doc.text(`${addr.city || ''}`, lm, addrY + 5);
    doc.text(addr.country || '', lm, addrY + 10);

    setBody(10);
    doc.text(date, rm, 85, { align: 'right' });
    line(90);
    setBold(11);
    doc.text(`Betreff: Antrag auf Löschung des Nutzerkontos eines Verstorbenen`, lm, 98);
    setBold(10);
    doc.text(`Plattform: ${meta.name || platformId} | Verstorbene Person: ${p1.firstName} ${p1.lastName}`, lm, 105);
    line(109);

    setBody(10);
    doc.text('Sehr geehrte Damen und Herren,', lm, 117);

    const body1 = `ich wende mich an Sie in meiner Eigenschaft als ${p2.relationship || 'Angehörige/r'} des am ${date} verstorbenen Herrn / Frau ${p1.firstName} ${p1.lastName}, zuletzt wohnhaft in ${p1.street}, ${p1.zip} ${p1.city}, ${p1.country}.`;
    const body2 = `Ich beantrage hiermit die vollständige und unwiderrufliche Löschung des Nutzerkontos der verstorbenen Person bei ${meta.name || platformId} gemäß Art. 17 DSGVO (Recht auf Vergessenwerden) sowie in Übereinstimmung mit Ihren eigenen Richtlinien zur Verarbeitung von Daten Verstorbener.`;
    const body3 = 'Zur Identifizierung des betreffenden Kontos teile ich Ihnen folgende Angaben mit:';
    const body4 = `Ich versichere, dass die beigefügten Unterlagen vollständig und wahrheitsgemäß sind. Ich bitte Sie, den Antrag schnellstmöglich zu bearbeiten und mir eine schriftliche Bestätigung der Kontolöschung an die oben genannte E-Mail-Adresse zu senden.`;
    const body5 = `Sollten Sie weitere Unterlagen oder Informationen benötigen, stehe ich Ihnen gerne unter den oben angegebenen Kontaktdaten zur Verfügung.`;

    let y = 125;
    const wrapText = (text, startY) => {
      const lines = doc.splitTextToSize(text, pw);
      doc.text(lines, lm, startY);
      return startY + lines.length * 5.5;
    };

    y = wrapText(body1, y); y += 4;
    y = wrapText(body2, y); y += 4;
    y = wrapText(body3, y); y += 3;

    doc.setFillColor(248, 250, 248);
    doc.setDrawColor(200, 230, 200);
    const boxStart = y;
    setBold(9);
    const accountLines = [];
    if (accDetails.username) accountLines.push(`Benutzername: ${accDetails.username}`);
    if (accDetails.profileUrl) accountLines.push(`Profil-URL: ${accDetails.profileUrl}`);
    if (accDetails.email) accountLines.push(`E-Mail des Kontos: ${accDetails.email}`);
    if (accountLines.length === 0) accountLines.push('Keine weiteren Kontodetails angegeben.');
    const boxH = accountLines.length * 6 + 8;
    doc.roundedRect(lm, boxStart, pw, boxH, 2, 2, 'FD');
    setBody(9);
    accountLines.forEach((al, i) => { doc.text(al, lm + 4, boxStart + 6 + i * 6); });
    y = boxStart + boxH + 5;

    y = wrapText(body4, y); y += 4;
    y = wrapText(body5, y); y += 8;

    if (y > 240) {
      doc.addPage();
      y = 20;
    }

    setBody(10);
    doc.text('Mit freundlichen Grüßen,', lm, y); y += 8;
    setBold(10);
    doc.text(`${p2.firstName} ${p2.lastName}`, lm, y); y += 5;
    setBody(9);
    doc.text(`(${p2.relationship || 'Angehörige/r'} der verstorbenen Person)`, lm, y);

    y += 12;
    if (y > 250) {
      doc.addPage();
      y = 20;
    }
    line(y); y += 6;
    setBold(9);
    doc.text('Anlagen:', lm, y); y += 5;
    setBody(9);
    if (uploadedDocs.length > 0) {
      uploadedDocs.forEach((dl, i) => { doc.text(`${i + 1}. ${dl}`, lm + 4, y); y += 5; });
    } else {
      doc.text('(Keine Dokumente hochgeladen)', lm + 4, y);
    }

    if (addr.onlineForm && y < 250) {
      y += 6;
      setGray(8);
      const hintLines = doc.splitTextToSize(`Hinweis: ${meta.name || platformId} bietet ein offizielles Online-Formular unter ${addr.onlineForm} an. Reichen Sie dieses Schreiben dort ein.`, pw);
      doc.text(hintLines, lm, y);
    }

    const totalPages = doc.internal.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      const footerY = 272;
      doc.setDrawColor(22, 163, 74);
      doc.setLineWidth(0.5);
      doc.line(lm, footerY - 4, rm, footerY - 4);
      doc.setLineWidth(0.2);
      setGray(7);
      doc.text(`Digital-Swipe | Erstellt am ${date} | DSGVO-konform`, lm, footerY);
      doc.text(`Seite ${i} von ${totalPages}`, rm, footerY, { align: 'right' });
      doc.text(`Antragsteller: ${p2.firstName} ${p2.lastName}`, lm, footerY + 4);
    }

    doc.save(`Antrag_${meta.name || platformId}_${p2.lastName}_${date.replace(/\./g, '-')}.pdf`);
  };

  const platformNames = { instagram: 'Instagram', facebook: 'Facebook', x: 'X / Twitter', tiktok: 'TikTok', linkedin: 'LinkedIn', netflix: 'Netflix', spotify: 'Spotify', disney: 'Disney+', youtube: 'YouTube' };

  return (
    <div className="text-center">
      <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
        <CheckCircle2 className="w-10 h-10 text-green-600" />
      </div>
      <h2 className="text-4xl font-bold text-gray-900 mb-4">Vielen Dank!</h2>
      <p className="text-xl text-gray-600 mb-8 max-w-xl mx-auto">
        Ihre Zahlung war erfolgreich. Die Dokumente wurden generiert und in unserem System verarbeitet. 
        Hier können Sie alle Anträge für Ihre Unterlagen herunterladen.
      </p>

      {/* Success Info Box */}
      <div className="bg-primary-50 rounded-2xl p-6 mb-10 max-w-2xl mx-auto flex items-start gap-4 text-left">
        <MailCheck className="w-8 h-8 text-primary-600 flex-shrink-0 mt-1" />
        <div>
          <h4 className="font-bold text-primary-900 mb-1">Alle Dokumente wurden erfolgreich versandt</h4>
          <p className="text-sm text-primary-700">
            Wir haben Ihren Auftrag erhalten und die notwendigen Schritte eingeleitet.
            Für Ihre Unterlagen haben wir offizielle Schreibvorlagen für jede Plattform erstellt.
          </p>
        </div>
      </div>

      <div className="p-8 rounded-3xl bg-white border border-gray-100 shadow-sm max-w-3xl mx-auto">
        <h3 className="font-bold text-lg flex items-center justify-center gap-2 mb-6">
          <FileDown className="w-5 h-5 text-gray-400" /> Ihre Antragsunterlagen
        </h3>
        
        {loading ? (
          <div className="flex justify-center p-8"><Loader2 className="w-8 h-8 animate-spin text-primary-500" /></div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {data.platforms.map((pid) => (
              <button
                key={pid}
                onClick={() => generatePdf(pid)}
                className="flex items-center gap-3 px-5 py-4 bg-gray-50 text-gray-700 hover:text-primary-700 rounded-xl font-bold hover:bg-primary-50 border border-gray-100 hover:border-primary-100 transition-all text-left shadow-sm"
              >
                <FileDown className="w-5 h-5 flex-shrink-0" />
                <span>PDF: {platformNames[pid] || pid}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Step8_Success;
