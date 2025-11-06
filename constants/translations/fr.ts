export const translations = {
  // Language Selection
  'language.select': 'Choisissez votre langue',
  'language.select.subtitle': 'Select your language',
  
  // Login
  'login.title': 'BRS-CSI',
  'login.subtitle': 'Système de Gestion des Bagages',
  'login.email': 'Email',
  'login.password': 'Mot de passe',
  'login.button': 'Se connecter',
  'login.button.loading': 'Connexion...',
  'login.noAccount': 'Pas encore de compte ?',
  'login.signup': "S'inscrire",
  'login.error.empty': 'Veuillez remplir tous les champs',
  'login.error.failed': 'Erreur de connexion',
  'login.error.generic': 'Une erreur est survenue lors de la connexion',
  
  // Register
  'register.title': 'Créer un compte',
  'register.subtitle': 'Remplissez les informations pour vous inscrire',
  'register.name': 'Nom complet',
  'register.email': 'Email',
  'register.password': 'Mot de passe (min. 6 caractères)',
  'register.confirmPassword': 'Confirmer le mot de passe',
  'register.role': 'Rôle',
  'register.station': 'Station',
  'register.selectRole': 'Sélectionner le rôle',
  'register.selectStation': 'Sélectionner la station',
  'register.button': "S'inscrire",
  'register.button.loading': 'Inscription...',
  'register.hasAccount': 'Déjà un compte ?',
  'register.login': 'Se connecter',
  'register.error.empty': 'Veuillez remplir tous les champs',
  'register.error.passwordLength': 'Le mot de passe doit contenir au moins 6 caractères',
  'register.error.passwordMatch': 'Les mots de passe ne correspondent pas',
  'register.error.station': 'Veuillez sélectionner une station',
  'register.success': 'Inscription réussie',
  'register.success.message': 'Votre compte a été créé avec succès. Vous pouvez maintenant vous connecter.',
  'register.error.failed': "Erreur d'inscription",
  'register.error.generic': "Une erreur est survenue lors de l'inscription",
  
  // Roles
  'role.agent': 'Agent',
  'role.supervisor': 'Superviseur',
  'role.admin': 'Administrateur',
  'role.agent.description': 'Scanner les bagages et gérer les opérations quotidiennes',
  'role.supervisor.description': 'Superviser les opérations et générer des rapports',
  'role.admin.description': 'Gérer les utilisateurs et la configuration',
  
  // Settings
  'settings.title': 'Paramètres',
  'settings.subtitle': 'Gérer vos préférences et votre compte',
  'settings.account': 'Compte',
  'settings.account.info': 'Informations sur votre compte',
  'settings.name': 'Nom',
  'settings.email': 'Email',
  'settings.role': 'Rôle',
  'settings.station': 'Station',
  'settings.language': 'Langue',
  'settings.language.subtitle': 'Choisissez votre langue préférée',
  'settings.help': 'Aide et Support',
  'settings.help.subtitle': 'Besoin d\'aide ? Consultez nos ressources',
  'settings.faq': 'Questions fréquentes (FAQ)',
  'settings.faq.description': 'Trouvez des réponses à vos questions',
  'settings.support': 'Contact Support',
  'settings.support.description': 'Contactez notre équipe de support',
  'settings.logout': 'Se déconnecter',
  'settings.logout.confirm': 'Déconnexion',
  'settings.logout.message': 'Êtes-vous sûr de vouloir vous déconnecter ?',
  'settings.logout.cancel': 'Annuler',
  
  // Home
  'home.subtitle': 'Système de suivi des bagages',
  'home.urgentAlerts': 'Alertes urgentes',
  'home.seeAll': 'Voir tout',
  'home.quickActions': 'Actions rapides',
  'home.scanBaggage': 'Scanner un bagage',
  'home.scanBaggage.description': 'Scannez ou saisissez le numéro de bagage pour mettre à jour son statut',
  'home.scanBoardingPass': 'Scanner une carte d\'embarquement',
  'home.scanBoardingPass.description': 'Scannez le QR code d\'une carte d\'embarquement pour lier les bagages',
  'home.searchBaggage': 'Rechercher un bagage',
  'home.searchBaggage.description': 'Recherchez un bagage par numéro ou PNR pour voir son statut',
  'home.missingBags': 'Bagages manquants',
  'home.missingBags.description': 'Consulter la liste des bagages manquants par vol',
  'home.activityHistory': 'Historique des activités',
  'home.activityHistory.description': 'Consulter l\'historique des scans et activités',
  'home.importData': 'Importer des données',
  'home.importData.description': 'Charger les données depuis un fichier CSV ou Excel',
  'home.about': 'À propos',
  'home.about.description1': 'BRS-CSI (Baggage Reconciliation System – Cargo System Integration) est une solution de suivi des bagages pour les aéroports d\'African Transport Systems (ATS) en RDC.',
  'home.about.description2': 'L\'application permet de tracer chaque bagage depuis l\'enregistrement jusqu\'à la livraison, avec gestion des lots de bagages et suivi en temps réel.',
  
  // Search
  'search.title': 'Rechercher',
  'search.subtitle': 'Recherchez un bagage par tag ou PNR',
  
  // Scan
  'scan.title': 'Scanner',
  'scan.baggage.placeholder': 'Scanner un tag bagage',
  'scan.boardingPass.placeholder': 'Scanner une carte d\'embarquement',
  'scan.showHistory': 'Afficher l\'historique',
  'scan.hideHistory': 'Masquer l\'historique',
  'scan.error.boardingPass': 'Impossible de scanner le boarding pass',
  'scan.success.title': 'Scan réussi',
  'scan.success.baggage': 'Bagage {tagFull} scanné avec succès.\nStatut: {status}',
  'scan.success.boardingPass': 'Boarding pass scanné avec succès.\n{count} bagage{plural} associé{plural}.',
  'scan.success.boardingPass.noBags': 'Boarding pass scanné avec succès.\nAucun bagage trouvé.',
  'scan.error.generic': 'Une erreur est survenue',
  'scan.mode.baggage': 'Bagage',
  'scan.mode.boardingPass': 'Carte d\'embarquement',
  'scan.result.lastScanned': 'Dernier bagage scanné',
  'scan.result.boardingPassScanned': 'Carte d\'embarquement scannée',
  
  // Missing
  'missing.title': 'Bagages manquants',
  'missing.subtitle': 'Liste des bagages manquants par vol',
  'missing.empty': 'Aucun bagage manquant',
  'missing.empty.flight': 'Aucun bagage manquant pour ce vol.',
  'missing.empty.station': 'Aucun bagage manquant dans cette station.',
  'missing.count': '{count} bagage{plural} manquant{plural}',
  
  // Notifications
  'notifications.title': 'Notifications',
  'notifications.subtitle': 'Alertes et avertissements en temps réel',
  
  // Missing
  'missing.title': 'Bagages manquants',
  'missing.subtitle': 'Liste des bagages manquants par vol',
  
  // Activity
  'activity.title': 'Activités',
  'activity.subtitle': 'Historique des scans et activités',
  
  // FAQ
  'faq.title': 'Questions fréquentes (FAQ)',
  'faq.subtitle': 'Trouvez des réponses à toutes vos questions',
  
  // Tabs
  'tabs.home': 'Accueil',
  'tabs.scan': 'Scanner',
  'tabs.missing': 'Manquants',
  'tabs.activity': 'Activités',
  'tabs.supervisor': 'Supervision',
  'tabs.settings': 'Paramètres',
  
  // Common
  'common.ok': 'OK',
  'common.error': 'Erreur',
};

