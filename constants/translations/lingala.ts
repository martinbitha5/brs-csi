export const translations = {
  // Language Selection
  'language.select': 'Pona lingala oyo olingi',
  'language.select.subtitle': 'Select your language',
  
  // Login
  'login.title': 'BRS-CSI',
  'login.subtitle': 'Sistème ya Kokanga Bilanga',
  'login.email': 'Email',
  'login.password': 'Banda ya kobomba',
  'login.button': 'Kokota',
  'login.button.loading': 'Kokota...',
  'login.noAccount': 'Ozali na káti te?',
  'login.signup': 'Kosaina',
  'login.error.empty': 'Sengi kofungola bilanga nyonso',
  'login.error.failed': 'Mbongo ya kokota',
  'login.error.generic': 'Mbongo esalaki na kokota',
  
  // Register
  'register.title': 'Kosala káti',
  'register.subtitle': 'Fungola makambo oyo esengeli',
  'register.name': 'Nkombo ya mokonzi',
  'register.email': 'Email',
  'register.password': 'Banda ya kobomba (min. 6 makambo)',
  'register.confirmPassword': 'Kondima banda ya kobomba',
  'register.role': 'Mosala',
  'register.station': 'Esika',
  'register.selectRole': 'Pona mosala',
  'register.selectStation': 'Pona esika',
  'register.button': 'Kosaina',
  'register.button.loading': 'Kosaina...',
  'register.hasAccount': 'Ozali na káti?',
  'register.login': 'Kokota',
  'register.error.empty': 'Sengi kofungola bilanga nyonso',
  'register.error.passwordLength': 'Banda ya kobomba esengeli kozala na makambo 6 te',
  'register.error.passwordMatch': 'Banda ya kobomba ezali ndenge moko te',
  'register.error.station': 'Sengi kopona esika',
  'register.success': 'Kosaina esali malamu',
  'register.success.message': 'Káti na yo esali malamu. Okoki kokota sikawa.',
  'register.error.failed': 'Mbongo ya kosaina',
  'register.error.generic': 'Mbongo esalaki na kosaina',
  
  // Roles
  'role.agent': 'Mobateli',
  'role.supervisor': 'Mokengeli',
  'role.admin': 'Mokonzi',
  'role.agent.description': 'Kosukola bilanga mpe kokanga mosala ya mokolo',
  'role.supervisor.description': 'Kokengela mosala mpe kobimisa rapó',
  'role.admin.description': 'Kokanga bato mpe makambo ya kokoma',
  
  // Settings
  'settings.title': 'Makambo',
  'settings.subtitle': 'Kokanga oyo olingi mpe káti na yo',
  'settings.account': 'Káti',
  'settings.account.info': 'Makambo ya káti na yo',
  'settings.name': 'Nkombo',
  'settings.email': 'Email',
  'settings.role': 'Mosala',
  'settings.station': 'Esika',
  'settings.language': 'Lingala',
  'settings.language.subtitle': 'Pona lingala oyo olingi',
  'settings.help': 'Lisalisi mpe Support',
  'settings.help.subtitle': 'Ozali na lisalisi? Tala makambo na biso',
  'settings.faq': 'Mituna ya bato mingi (FAQ)',
  'settings.faq.description': 'Wana mbano na mituna na yo',
  'settings.support': 'Benga Support',
  'settings.support.description': 'Benga ekipi ya lisalisi',
  'settings.logout': 'Kobima',
  'settings.logout.confirm': 'Kobima',
  'settings.logout.message': 'Ozali na ntembe te olingi kobima?',
  'settings.logout.cancel': 'Kolongola',
  
  // Home
  'home.subtitle': 'Sistème ya Kolanda Bilanga',
  'home.urgentAlerts': 'Bilenge ya Ntina',
  'home.seeAll': 'Komona nyonso',
  'home.quickActions': 'Misala ya Ntango',
  'home.scanBaggage': 'Kosukola bilanga',
  'home.scanBaggage.description': 'Sukola to kotya nimero ya bilanga mpo na kobongisa esika na yango',
  'home.scanBoardingPass': 'Kosukola karta ya kokota na avio',
  'home.scanBoardingPass.description': 'Sukola QR code ya karta ya kokota na avio mpo na kosangisa bilanga',
  'home.searchBaggage': 'Koluka bilanga',
  'home.searchBaggage.description': 'Luka bilanga na nimero to PNR mpo na komona esika na yango',
  'home.missingBags': 'Bilanga ya libungi',
  'home.missingBags.description': 'Komona listi ya bilanga ya libungi na mbangu',
  'home.activityHistory': 'Mokolo ya misala',
  'home.activityHistory.description': 'Komona mokolo ya misukoli mpe misala',
  'home.importData': 'Kokota makambo',
  'home.importData.description': 'Kotya makambo kowuta na fisié CSV to Excel',
  'home.about': 'Etali',
  'home.about.description1': 'BRS-CSI (Baggage Reconciliation System – Cargo System Integration) ezali sistème ya kolanda bilanga mpo na ba aéroports ya African Transport Systems (ATS) na RDC.',
  'home.about.description2': 'Application oyo ezali kotinda bilanga bwa moko kowuta na enregistrement tii na livraison, na kokanga ba lots ya bilanga mpe kolanda na ntango ya solo.',
  
  // Search
  'search.title': 'Koluka',
  'search.subtitle': 'Luka bilanga na tag to PNR',
  
  // Scan
  'scan.title': 'Kosukola',
  'scan.baggage.placeholder': 'Sukola tag ya bilanga',
  'scan.boardingPass.placeholder': 'Sukola karta ya kokota na avio',
  'scan.showHistory': 'Komona mokolo',
  'scan.hideHistory': 'Kobomba mokolo',
  'scan.error.boardingPass': 'Ekoki te kosukola karta ya kokota',
  'scan.success.title': 'Kosukola esali malamu',
  'scan.success.baggage': 'Bilanga {tagFull} esukoli malamu.\nEsika: {status}',
  'scan.success.boardingPass': 'Karta ya kokota esukoli malamu.\n{count} bilanga{plural} esangisi{plural}.',
  'scan.success.boardingPass.noBags': 'Karta ya kokota esukoli malamu.\nBilanga te.',
  'scan.error.generic': 'Mbongo esalaki',
  'scan.mode.baggage': 'Bilanga',
  'scan.mode.boardingPass': 'Karta ya kokota',
  'scan.result.lastScanned': 'Bilanga ya suka esukoli',
  'scan.result.boardingPassScanned': 'Karta ya kokota esukoli',
  
  // Missing
  'missing.title': 'Bilanga ya libungi',
  'missing.subtitle': 'Listi ya bilanga ya libungi na mbangu',
  'missing.empty': 'Bilanga ya libungi te',
  'missing.empty.flight': 'Bilanga ya libungi te na mbangu oyo.',
  'missing.empty.station': 'Bilanga ya libungi te na esika oyo.',
  'missing.count': '{count} bilanga{plural} ya libungi{plural}',
  
  // Notifications
  'notifications.title': 'Bilenge',
  'notifications.subtitle': 'Bilenge mpe bilenge ya ntango ya solo',
  
  // Missing
  'missing.title': 'Bilanga ya libungi',
  'missing.subtitle': 'Listi ya bilanga ya libungi na mbangu',
  
  // Activity
  'activity.title': 'Misala',
  'activity.subtitle': 'Mokolo ya misukoli mpe misala',
  
  // FAQ
  'faq.title': 'Mituna ya Bato Mingi (FAQ)',
  'faq.subtitle': 'Wana mbano na mituna na yo nyonso',
  
  // Tabs
  'tabs.home': 'Esika',
  'tabs.scan': 'Kosukola',
  'tabs.missing': 'Libungi',
  'tabs.activity': 'Misala',
  'tabs.supervisor': 'Kokengela',
  'tabs.settings': 'Makambo',
  
  // Common
  'common.ok': 'Malamu',
  'common.error': 'Mbongo',
};

