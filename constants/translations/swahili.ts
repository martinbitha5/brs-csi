export const translations = {
  // Language Selection
  'language.select': 'Chagua lugha yako',
  'language.select.subtitle': 'Select your language',
  
  // Login
  'login.title': 'BRS-CSI',
  'login.subtitle': 'Mfumo wa Usimamizi wa Mzigo',
  'login.email': 'Barua pepe',
  'login.password': 'Nenosiri',
  'login.button': 'Ingia',
  'login.button.loading': 'Inaingia...',
  'login.noAccount': 'Huna akaunti?',
  'login.signup': 'Jisajili',
  'login.error.empty': 'Tafadhali jaza sehemu zote',
  'login.error.failed': 'Hitilafu ya kuingia',
  'login.error.generic': 'Hitilafu ilitokea wakati wa kuingia',
  
  // Register
  'register.title': 'Unda akaunti',
  'register.subtitle': 'Jaza taarifa za kujisajili',
  'register.name': 'Jina kamili',
  'register.email': 'Barua pepe',
  'register.password': 'Nenosiri (angalau herufi 6)',
  'register.confirmPassword': 'Thibitisha nenosiri',
  'register.role': 'Jukumu',
  'register.station': 'Kituo',
  'register.selectRole': 'Chagua jukumu',
  'register.selectStation': 'Chagua kituo',
  'register.button': 'Jisajili',
  'register.button.loading': 'Inasajili...',
  'register.hasAccount': 'Tayari una akaunti?',
  'register.login': 'Ingia',
  'register.error.empty': 'Tafadhali jaza sehemu zote',
  'register.error.passwordLength': 'Nenosiri lazima liwe na angalau herufi 6',
  'register.error.passwordMatch': 'Nenosiri hazifanani',
  'register.error.station': 'Tafadhali chagua kituo',
  'register.success': 'Usajili umefanikiwa',
  'register.success.message': 'Akaunti yako imeundwa kwa mafanikio. Sasa unaweza kuingia.',
  'register.error.failed': 'Hitilafu ya usajili',
  'register.error.generic': 'Hitilafu ilitokea wakati wa usajili',
  
  // Roles
  'role.agent': 'Wakala',
  'role.supervisor': 'Msimamizi',
  'role.admin': 'Msimamizi Mkuu',
  'role.agent.description': 'Skani mizigo na usimamize shughuli za kila siku',
  'role.supervisor.description': 'Simamia shughuli na toa ripoti',
  'role.admin.description': 'Simamia watumiaji na usanidi',
  
  // Settings
  'settings.title': 'Mipangilio',
  'settings.subtitle': 'Simamia mapendeleo yako na akaunti yako',
  'settings.account': 'Akaunti',
  'settings.account.info': 'Taarifa za akaunti yako',
  'settings.name': 'Jina',
  'settings.email': 'Barua pepe',
  'settings.role': 'Jukumu',
  'settings.station': 'Kituo',
  'settings.language': 'Lugha',
  'settings.language.subtitle': 'Chagua lugha unayopenda',
  'settings.help': 'Msaada na Usaidizi',
  'settings.help.subtitle': 'Unahitaji msaada? Angalia rasilimali zetu',
  'settings.faq': 'Maswali Yanayoulizwa Mara kwa Mara (FAQ)',
  'settings.faq.description': 'Pata majibu ya maswali yako',
  'settings.support': 'Wasiliana na Usaidizi',
  'settings.support.description': 'Wasiliana na timu yetu ya usaidizi',
  'settings.logout': 'Toka',
  'settings.logout.confirm': 'Toka',
  'settings.logout.message': 'Je, una uhakika unataka kutoka?',
  'settings.logout.cancel': 'Ghairi',
  
  // Home
  'home.subtitle': 'Mfumo wa Ufuatiliaji wa Mzigo',
  'home.urgentAlerts': 'Arifa za Dharura',
  'home.seeAll': 'Ona zote',
  'home.quickActions': 'Vitendo vya Haraka',
  'home.scanBaggage': 'Skani mzigo',
  'home.scanBaggage.description': 'Skana au ingiza nambari ya mzigo ili kusasisha hali yake',
  'home.scanBoardingPass': 'Skana kadi ya kupanda',
  'home.scanBoardingPass.description': 'Skana QR code ya kadi ya kupanda ili kuunganisha mzigo',
  'home.searchBaggage': 'Tafuta mzigo',
  'home.searchBaggage.description': 'Tafuta mzigo kwa nambari au PNR ili kuona hali yake',
  'home.missingBags': 'Mizigo iliyopotea',
  'home.missingBags.description': 'Angalia orodha ya mizigo iliyopotea kwa ndege',
  'home.activityHistory': 'Historia ya Shughuli',
  'home.activityHistory.description': 'Angalia historia ya skani na shughuli',
  'home.importData': 'Ingiza data',
  'home.importData.description': 'Pakia data kutoka faili ya CSV au Excel',
  'home.about': 'Kuhusu',
  'home.about.description1': 'BRS-CSI (Baggage Reconciliation System – Cargo System Integration) ni suluhisho la ufuatiliaji wa mzigo kwa viwanja vya ndege vya African Transport Systems (ATS) nchini DRC.',
  'home.about.description2': 'Programu hii inaruhusu kufuatilia kila mzigo kutoka kwenye usajili hadi kujifungua, na usimamizi wa makundi ya mizigo na ufuatiliaji wa wakati halisi.',
  
  // Search
  'search.title': 'Tafuta',
  'search.subtitle': 'Tafuta mzigo kwa tag au PNR',
  
  // Scan
  'scan.title': 'Skana',
  'scan.baggage.placeholder': 'Skana tag ya mzigo',
  'scan.boardingPass.placeholder': 'Skana kadi ya kupanda',
  'scan.showHistory': 'Onyesha historia',
  'scan.hideHistory': 'Ficha historia',
  'scan.error.boardingPass': 'Haiwezekani kuskana kadi ya kupanda',
  'scan.success.title': 'Skana imefanikiwa',
  'scan.success.baggage': 'Mzigo {tagFull} umeskanwa kwa mafanikio.\nHali: {status}',
  'scan.success.boardingPass': 'Kadi ya kupanda imeskanwa kwa mafanikio.\n{count} mzigo{plural} umeshikamana.',
  'scan.success.boardingPass.noBags': 'Kadi ya kupanda imeskanwa kwa mafanikio.\nHakuna mzigo uliopatikana.',
  'scan.error.generic': 'Hitilafu ilitokea',
  'scan.mode.baggage': 'Mzigo',
  'scan.mode.boardingPass': 'Kadi ya kupanda',
  'scan.result.lastScanned': 'Mzigo wa mwisho ulioskanwa',
  'scan.result.boardingPassScanned': 'Kadi ya kupanda imeskanwa',
  
  // Missing
  'missing.title': 'Mizigo iliyopotea',
  'missing.subtitle': 'Orodha ya mizigo iliyopotea kwa ndege',
  'missing.empty': 'Hakuna mzigo uliopotea',
  'missing.empty.flight': 'Hakuna mzigo uliopotea kwa ndege hii.',
  'missing.empty.station': 'Hakuna mzigo uliopotea katika kituo hiki.',
  'missing.count': '{count} mzigo{plural} uliopotea{plural}',
  
  // Notifications
  'notifications.title': 'Arifa',
  'notifications.subtitle': 'Arifa na onyo za wakati halisi',
  
  // Missing
  'missing.title': 'Mizigo iliyopotea',
  'missing.subtitle': 'Orodha ya mizigo iliyopotea kwa ndege',
  
  // Activity
  'activity.title': 'Shughuli',
  'activity.subtitle': 'Historia ya skani na shughuli',
  
  // FAQ
  'faq.title': 'Maswali Yanayoulizwa Mara kwa Mara (FAQ)',
  'faq.subtitle': 'Pata majibu ya maswali yako yote',
  
  // Tabs
  'tabs.home': 'Nyumbani',
  'tabs.scan': 'Skana',
  'tabs.missing': 'Iliyopotea',
  'tabs.activity': 'Shughuli',
  'tabs.supervisor': 'Usimamizi',
  'tabs.settings': 'Mipangilio',
  
  // Common
  'common.ok': 'Sawa',
  'common.error': 'Hitilafu',
};

