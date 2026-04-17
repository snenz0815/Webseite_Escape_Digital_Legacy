// Klaro Cookie-Consent Konfiguration für Social-Wipe
// Dokumentation: https://klaro.org/docs

const klaroConfig = {
  // Sprache
  lang: 'de',

  // Position des Banners: 'top' oder 'bottom'
  elementID: 'klaro',
  storageMethod: 'localStorage', // 'cookie' oder 'localStorage'
  storageName: 'klaro-social-wipe',
  cookieDomain: window.location.hostname,
  cookieExpiresAfterDays: 365,

  // UI Optionen
  mustConsent: false,       // false = weiches Banner (nicht modaler Dialog)
  acceptAll: true,          // "Alle akzeptieren"-Button anzeigen
  hideDeclineAll: false,    // "Alle ablehnen" anzeigen
  noticeAsModal: false,
  disablePoweredBy: true,   // Klaro-Branding ausblenden

  // Übersetzungen
  translations: {
    de: {
      privacyPolicyUrl: '/datenschutz',
      consentNotice: {
        description:
          'Wir verwenden Cookies, um unsere Webseite zu betreiben und Zahlungen sicher abzuwickeln. Einige sind technisch notwendig, andere helfen uns bei der Verbesserung unseres Angebots.',
        learnMore: 'Einstellungen & Details',
      },
      consentModal: {
        title: 'Cookie-Einstellungen',
        description:
          'Hier können Sie einsehen und anpassen, welche Informationen wir über Sie erfassen. Einträge mit einem Schlosssymbol sind für den Betrieb der Seite technisch erforderlich und können nicht deaktiviert werden.',
        privacyPolicy: { text: 'Mehr in unserer {privacyPolicy}.', name: 'Datenschutzerklärung' },
      },
      acceptAll: 'Alle akzeptieren',
      acceptSelected: 'Auswahl akzeptieren',
      decline: 'Nur notwendige',
      close: 'Schließen',
      purposes: {
        necessary: 'Technisch notwendig',
        payments: 'Zahlungsabwicklung',
        functional: 'Funktional',
      },
    },
  },

  // Dienste / Services
  services: [
    {
      name: 'session',
      title: 'Session & Formulardaten',
      purposes: ['necessary'],
      required: true,       // Kann nicht abgelehnt werden
      description:
        'Speichert Ihren Fortschritt im Formular und technisch notwendige Sitzungsdaten. Kein Tracking.',
    },
    {
      name: 'paypal',
      title: 'PayPal',
      purposes: ['payments'],
      required: false,
      description:
        'PayPal setzt Cookies für die sichere Zahlungsabwicklung. Nur aktiv, wenn Sie per PayPal bezahlen.',
      onAccept: `console.log('PayPal-Cookies akzeptiert')`,
      onDecline: `console.log('PayPal-Cookies abgelehnt')`,
    },
    {
      name: 'stripe',
      title: 'Stripe',
      purposes: ['payments'],
      required: false,
      description:
        'Stripe setzt Cookies für die sichere Kreditkartenverarbeitung. Nur aktiv, wenn Sie per Kreditkarte bezahlen.',
    },
  ],
};

export default klaroConfig;
