/*
 * Shared UI strings (English + Hindi).
 * Page-specific copy lives inline in components as tx({ en, hi }).
 * To add a string: add a key here, then call t('your.key') in a component.
 */
const strings = {
  // Portal identity
  'portal.name': { en: 'National Scholarship & Fellowship Portal', hi: 'राष्ट्रीय छात्रवृत्ति एवं फेलोशिप पोर्टल' },
  'portal.ministry': { en: 'Ministry of Tribal Affairs', hi: 'जनजातीय कार्य मंत्रालय' },
  'portal.goi': { en: 'Government of India', hi: 'भारत सरकार' },
  'portal.session': { en: 'Session 2026-27', hi: 'सत्र 2026-27' },

  // Navigation
  'nav.home': { en: 'Home', hi: 'मुख्य पृष्ठ' },
  'nav.dashboard': { en: 'Dashboard', hi: 'डैशबोर्ड' },
  'nav.profile': { en: 'My profile', hi: 'मेरी प्रोफ़ाइल' },
  'nav.apply': { en: 'Apply for a scheme', hi: 'योजना हेतु आवेदन' },
  'nav.applications': { en: 'My applications', hi: 'मेरे आवेदन' },
  'nav.help': { en: 'Help & grievance', hi: 'सहायता एवं शिकायत' },
  'nav.login': { en: 'Login', hi: 'लॉगिन' },
  'nav.signup': { en: 'Sign up', hi: 'पंजीकरण' },
  'nav.logout': { en: 'Logout', hi: 'लॉगआउट' },
  'nav.menu': { en: 'Menu', hi: 'मेनू' },
  'nav.skip': { en: 'Skip to main content', hi: 'मुख्य विषय-वस्तु पर जाएं' },
  'nav.textSize': { en: 'Text size', hi: 'पाठ आकार' },
  'nav.switchLang': { en: 'हिन्दी', hi: 'English' },

  // Common actions
  'common.save': { en: 'Save', hi: 'सहेजें' },
  'common.saveDraft': { en: 'Save draft', hi: 'ड्राफ्ट सहेजें' },
  'common.saveContinue': { en: 'Save & continue', hi: 'सहेजें और आगे बढ़ें' },
  'common.back': { en: 'Back', hi: 'पीछे' },
  'common.cancel': { en: 'Cancel', hi: 'रद्द करें' },
  'common.edit': { en: 'Edit', hi: 'संपादित करें' },
  'common.view': { en: 'View', hi: 'देखें' },
  'common.remove': { en: 'Remove', hi: 'हटाएं' },
  'common.replace': { en: 'Replace', hi: 'बदलें' },
  'common.close': { en: 'Close', hi: 'बंद करें' },
  'common.print': { en: 'Print', hi: 'प्रिंट करें' },
  'common.loading': { en: 'Loading…', hi: 'लोड हो रहा है…' },
  'common.saving': { en: 'Saving…', hi: 'सहेजा जा रहा है…' },
  'common.saved': { en: 'Saved', hi: 'सहेजा गया' },
  'common.yes': { en: 'Yes', hi: 'हाँ' },
  'common.no': { en: 'No', hi: 'नहीं' },
  'common.select': { en: 'Select', hi: 'चुनें' },
  'common.required': { en: 'Required', hi: 'अनिवार्य' },
  'common.optional': { en: 'Optional', hi: 'वैकल्पिक' },
  'common.notProvided': { en: 'Not provided', hi: 'उपलब्ध नहीं' },
  'common.continue': { en: 'Continue', hi: 'आगे बढ़ें' },
  'common.retry': { en: 'Try again', hi: 'पुनः प्रयास करें' },

  // Form validation
  'err.required': { en: 'This field is required', hi: 'यह फ़ील्ड अनिवार्य है' },
  'err.email': { en: 'Enter a valid email address', hi: 'मान्य ईमेल पता दर्ज करें' },
  'err.mobile': { en: 'Enter a 10-digit mobile number starting with 6–9', hi: '6–9 से शुरू होने वाला 10 अंकों का मोबाइल नंबर दर्ज करें' },
  'err.pincode': { en: 'Enter a 6-digit PIN code', hi: '6 अंकों का पिन कोड दर्ज करें' },
  'err.percent': { en: 'Enter a percentage between 0 and 100', hi: '0 से 100 के बीच प्रतिशत दर्ज करें' },
  'err.ifsc': { en: 'IFSC must look like SBIN0001234', hi: 'IFSC इस प्रारूप में हो: SBIN0001234' },
  'err.account': { en: 'Account number must be 9–18 digits', hi: 'खाता संख्या 9–18 अंकों की होनी चाहिए' },
  'err.accountMatch': { en: 'Account numbers do not match', hi: 'खाता संख्याएं मेल नहीं खातीं' },
  'err.aadhaar': { en: 'Enter a valid 12-digit Aadhaar number', hi: 'मान्य 12 अंकों का आधार नंबर दर्ज करें' },
  'err.udise': { en: 'U-DISE code must be 11 digits', hi: 'यू-डाइस कोड 11 अंकों का होना चाहिए' },
  'err.amount': { en: 'Enter an amount in rupees', hi: 'राशि रुपये में दर्ज करें' },
  'err.fixBelow': { en: 'Please correct the highlighted fields before continuing.', hi: 'आगे बढ़ने से पहले चिह्नित फ़ील्ड ठीक करें।' },
  'err.network': { en: 'Could not reach the server. Check your connection and try again.', hi: 'सर्वर से संपर्क नहीं हो सका। कनेक्शन जाँचें और पुनः प्रयास करें।' },

  'auth.passwordShort': { en: 'Password must be at least 6 characters', hi: 'पासवर्ड कम से कम 6 अक्षरों का होना चाहिए' },
  'auth.passwordMatch': { en: 'Passwords do not match', hi: 'पासवर्ड मेल नहीं खाते' },

  // Application status (matches backend enum)
  'status.Draft': { en: 'Draft', hi: 'ड्राफ्ट' },
  'status.Pending': { en: 'Under verification', hi: 'सत्यापन प्रक्रिया में' },
  'status.Eligible': { en: 'Eligible — final review', hi: 'पात्र — अंतिम समीक्षा' },
  'status.Deficient': { en: 'Action needed', hi: 'कार्रवाई आवश्यक' },
  'status.Flagged': { en: 'Under review', hi: 'समीक्षाधीन' },
  'status.Selected': { en: 'Selected', hi: 'चयनित' },
  'status.Rejected': { en: 'Not selected', hi: 'चयनित नहीं' },

  // Application steps
  'step.registration': { en: 'Registration', hi: 'पंजीकरण' },
  'step.kyc': { en: 'Aadhaar e-KYC', hi: 'आधार ई-केवाईसी' },
  'step.personal': { en: 'Personal details', hi: 'व्यक्तिगत विवरण' },
  'step.category': { en: 'Category & income', hi: 'श्रेणी एवं आय' },
  'step.academic': { en: 'Academic details', hi: 'शैक्षणिक विवरण' },
  'step.bank': { en: 'Bank details', hi: 'बैंक विवरण' },
  'step.documents': { en: 'Upload documents', hi: 'दस्तावेज़ अपलोड' },
  'step.review': { en: 'Preview & final submit', hi: 'पूर्वावलोकन एवं अंतिम जमा' },
  'step.print': { en: 'Print application', hi: 'आवेदन प्रिंट करें' },

  // Document sources
  'doc.digilocker': { en: 'DigiLocker', hi: 'डिजिलॉकर' },
  'doc.manual': { en: 'Uploaded by you', hi: 'आपके द्वारा अपलोड' },
  'doc.pending': { en: 'Not added yet', hi: 'अभी नहीं जोड़ा गया' },
};

export default strings;
