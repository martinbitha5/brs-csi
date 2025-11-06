import React, { useState } from 'react';
import { StyleSheet, View, TouchableOpacity, ScrollView, Linking } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { UserRole } from '@/types';
import { Ionicons } from '@expo/vector-icons';

interface FAQItem {
  question: string;
  answer: string;
}

interface FAQCategory {
  title: string;
  icon: string;
  items: FAQItem[];
}

const getFAQByRole = (role: UserRole): FAQCategory[] => {
  const commonFAQ: FAQCategory[] = [
    {
      title: 'Général',
      icon: 'help-circle',
      items: [
        {
          question: 'Qu\'est-ce que BRS-CSI ?',
          answer: 'BRS-CSI (Baggage Reconciliation System - Customer Service Interface) est une application mobile de suivi et de gestion des bagages en temps réel pour les aéroports. Elle permet de scanner, rechercher et suivre les bagages tout au long de leur parcours.',
        },
        {
          question: 'Comment changer la langue de l\'application ?',
          answer: 'Allez dans Paramètres > Langue et sélectionnez votre langue préférée parmi Français, English, Lingala ou Swahili. Le changement est immédiat.',
        },
        {
          question: 'Comment me déconnecter ?',
          answer: 'Allez dans Paramètres et cliquez sur le bouton "Se déconnecter" en bas de l\'écran. Vous serez redirigé vers la page de connexion.',
        },
        {
          question: 'L\'application fonctionne-t-elle hors ligne ?',
          answer: 'Oui, certaines fonctionnalités sont disponibles hors ligne. Les données seront synchronisées automatiquement lorsque vous retrouverez une connexion internet.',
        },
        {
          question: 'Comment contacter le support technique ?',
          answer: 'Vous pouvez contacter le support via la section "Contact Support" dans les paramètres. Plusieurs options sont disponibles : email, téléphone et chat en direct.',
        },
      ],
    },
    {
      title: 'Authentification',
      icon: 'lock-closed',
      items: [
        {
          question: 'J\'ai oublié mon mot de passe, que faire ?',
          answer: 'Contactez votre administrateur système ou le support technique pour réinitialiser votre mot de passe. Les administrateurs peuvent réinitialiser les mots de passe depuis l\'interface de gestion des utilisateurs.',
        },
        {
          question: 'Puis-je changer mon email ?',
          answer: 'Non, l\'email ne peut pas être modifié directement. Contactez un administrateur pour effectuer cette modification.',
        },
        {
          question: 'Mon compte est bloqué, que faire ?',
          answer: 'Si votre compte est bloqué, contactez immédiatement le support technique ou votre superviseur. Ils pourront débloquer votre compte.',
        },
      ],
    },
  ];

  if (role === UserRole.AGENT) {
    return [
      ...commonFAQ,
      {
        title: 'Scan de bagages',
        icon: 'qr-code',
        items: [
          {
            question: 'Comment scanner un bagage ?',
            answer: 'Allez dans l\'onglet "Scanner", activez la caméra et pointez-la vers le code-barres ou QR code du bagage. Vous pouvez aussi saisir manuellement le tag complet si le scan ne fonctionne pas.',
          },
          {
            question: 'Quels formats de codes-barres sont supportés ?',
            answer: 'L\'application supporte les formats suivants : QR Code, EAN13, EAN8, Code128 et Code39. La plupart des tags de bagages utilisent l\'un de ces formats.',
          },
          {
            question: 'Que faire si le scan échoue ?',
            answer: 'Si le scan échoue, vous pouvez saisir manuellement le tag complet du bagage dans le champ de saisie. Assurez-vous que le code-barres n\'est pas endommagé et que l\'éclairage est suffisant.',
          },
          {
            question: 'Quelle est la différence entre "checked_in" et "loaded" ?',
            answer: '"checked_in" signifie que le bagage a été enregistré au comptoir. "loaded" signifie que le bagage a été chargé dans l\'avion. Ces statuts doivent être mis à jour dans l\'ordre chronologique.',
          },
          {
            question: 'Puis-je scanner un bagage plusieurs fois ?',
            answer: 'Oui, vous pouvez scanner un bagage plusieurs fois. Chaque scan est enregistré dans l\'historique avec la date, l\'heure et votre identité. Cela permet de suivre le parcours complet du bagage.',
          },
          {
            question: 'Que faire si je scanne un tag inconnu ?',
            answer: 'Si vous scannez un tag qui n\'existe pas dans le système, une alerte s\'affichera. Vérifiez que le tag est correct et qu\'il appartient bien au vol en cours. Contactez votre superviseur si nécessaire.',
          },
        ],
      },
      {
        title: 'Recherche de bagages',
        icon: 'search',
        items: [
          {
            question: 'Comment rechercher un bagage ?',
            answer: 'Allez dans l\'onglet "Recherche" et utilisez l\'un des critères suivants : tag complet, base tag, PNR (numéro de réservation) ou nom du passager. Les résultats s\'afficheront immédiatement.',
          },
          {
            question: 'Puis-je rechercher par nom de passager ?',
            answer: 'Oui, vous pouvez rechercher par nom complet ou partiel du passager. La recherche est insensible à la casse et aux accents.',
          },
          {
            question: 'Comment trouver tous les bagages d\'un vol ?',
            answer: 'Utilisez la recherche par PNR ou par nom de passager. Vous pouvez aussi filtrer les résultats par vol dans l\'écran de recherche avancée.',
          },
          {
            question: 'Que signifie "base_tag" ?',
            answer: 'Le base_tag est le préfixe commun à toutes les pièces d\'un même lot de bagages. Par exemple, si un passager a 3 bagages avec les tags ABC123-1, ABC123-2, ABC123-3, le base_tag est ABC123.',
          },
        ],
      },
      {
        title: 'Statuts et notifications',
        icon: 'notifications',
        items: [
          {
            question: 'Quels sont les différents statuts d\'un bagage ?',
            answer: 'Les statuts possibles sont : created (créé), checked_in (enregistré), loaded (chargé), in_transit (en transit), arrived (arrivé), missing (manquant).',
          },
          {
            question: 'Comment savoir si un lot de bagages est incomplet ?',
            answer: 'Une notification s\'affichera automatiquement si un lot de bagages n\'a pas toutes ses pièces scannées. Vous verrez aussi un badge d\'alerte sur l\'écran d\'accueil.',
          },
          {
            question: 'Que faire si un bagage est marqué "missing" ?',
            answer: 'Si un bagage est marqué comme manquant, une notification urgente sera générée. Recherchez le bagage dans la zone de tri et contactez votre superviseur immédiatement.',
          },
          {
            question: 'Comment voir mes notifications ?',
            answer: 'Les notifications importantes s\'affichent sur l\'écran d\'accueil. Vous pouvez aussi accéder à toutes vos notifications via l\'onglet "Notifications" dans le menu.',
          },
          {
            question: 'Les notifications sont-elles en temps réel ?',
            answer: 'Oui, les notifications sont mises à jour toutes les 30 secondes. Les notifications urgentes sont affichées immédiatement.',
          },
        ],
      },
      {
        title: 'Station et zone de travail',
        icon: 'location',
        items: [
          {
            question: 'Qu\'est-ce qu\'une station ?',
            answer: 'Une station correspond à l\'aéroport où vous travaillez. Chaque agent est associé à une station spécifique (ex: FZAA pour Kinshasa). Vos scans et recherches sont automatiquement filtrés par votre station.',
          },
          {
            question: 'Puis-je changer de station ?',
            answer: 'Non, en tant qu\'agent, votre station est fixe et définie lors de votre inscription. Seuls les superviseurs et administrateurs peuvent changer de station.',
          },
          {
            question: 'Pourquoi ne vois-je que les bagages de ma station ?',
            answer: 'Pour des raisons de sécurité et d\'efficacité, chaque agent ne voit que les bagages de sa propre station. Cela évite les erreurs et améliore les performances.',
          },
        ],
      },
      {
        title: 'Historique et traçabilité',
        icon: 'time',
        items: [
          {
            question: 'Où puis-je voir l\'historique de mes scans ?',
            answer: 'Allez dans l\'onglet "Activités" pour voir l\'historique complet de tous vos scans. Vous pouvez filtrer par date, vol ou type d\'action.',
          },
          {
            question: 'Tous mes scans sont-ils enregistrés ?',
            answer: 'Oui, chaque scan est enregistré avec la date, l\'heure, votre identité et la station. Cet historique est conservé pour la traçabilité et l\'audit.',
          },
          {
            question: 'Puis-je voir l\'historique d\'un bagage spécifique ?',
            answer: 'Oui, lorsque vous affichez les détails d\'un bagage, vous verrez l\'onglet "Historique" qui montre tous les scans effectués sur ce bagage, avec les dates et les agents responsables.',
          },
        ],
      },
    ];
  }

  if (role === UserRole.SUPERVISOR) {
    return [
      ...commonFAQ,
      {
        title: 'Tableau de bord',
        icon: 'stats-chart',
        items: [
          {
            question: 'Quelles statistiques puis-je voir ?',
            answer: 'En tant que superviseur, vous avez accès à des statistiques détaillées : nombre de scans par jour, bagages scannés, lots incomplets, bagages manquants, temps moyen de traitement, et statistiques par vol.',
          },
          {
            question: 'Comment voir les statistiques d\'un vol spécifique ?',
            answer: 'Allez dans l\'onglet "Supervision" > "Statistiques par vol" et sélectionnez le vol souhaité. Vous verrez toutes les métriques détaillées pour ce vol.',
          },
          {
            question: 'Les statistiques sont-elles en temps réel ?',
            answer: 'Oui, les statistiques sont mises à jour en temps réel. Vous pouvez rafraîchir manuellement en tirant vers le bas sur l\'écran.',
          },
          {
            question: 'Puis-je exporter les statistiques ?',
            answer: 'Oui, vous pouvez exporter les statistiques au format Excel ou CSV depuis l\'onglet "Supervision" > "Export de données".',
          },
        ],
      },
      {
        title: 'Gestion des vols',
        icon: 'airplane',
        items: [
          {
            question: 'Comment voir tous les vols ?',
            answer: 'Allez dans l\'onglet "Supervision" > "Gestion des vols". Vous verrez la liste de tous les vols avec leurs statuts et statistiques.',
          },
          {
            question: 'Puis-je créer un nouveau vol manuellement ?',
            answer: 'Oui, vous pouvez créer un nouveau vol depuis l\'interface de gestion des vols. Remplissez le code du vol, la date et la route.',
          },
          {
            question: 'Comment modifier les informations d\'un vol ?',
            answer: 'Dans la liste des vols, cliquez sur le vol souhaité et utilisez le bouton "Modifier". Seuls certains champs peuvent être modifiés selon l\'état du vol.',
          },
          {
            question: 'Que faire si un vol part bientôt avec des bagages manquants ?',
            answer: 'Une notification urgente sera générée automatiquement. Vous devez coordonner avec les agents pour localiser les bagages manquants avant le départ du vol.',
          },
        ],
      },
      {
        title: 'Export de données',
        icon: 'download',
        items: [
          {
            question: 'Quels formats d\'export sont disponibles ?',
            answer: 'Vous pouvez exporter les données au format Excel (.xlsx) ou CSV (.csv). Les deux formats incluent toutes les informations nécessaires.',
          },
          {
            question: 'Que puis-je exporter ?',
            answer: 'Vous pouvez exporter : la liste des vols, les passagers, les bagages, les scans, les statistiques et les rapports. Sélectionnez ce que vous souhaitez exporter dans l\'interface.',
          },
          {
            question: 'Les exports incluent-ils l\'historique complet ?',
            answer: 'Oui, les exports incluent tous les détails : historique des scans, dates, agents responsables, et toutes les métadonnées associées.',
          },
          {
            question: 'Puis-je programmer des exports automatiques ?',
            answer: 'Cette fonctionnalité n\'est pas encore disponible mais est prévue dans une future version. Pour l\'instant, les exports doivent être effectués manuellement.',
          },
        ],
      },
      {
        title: 'Édition manuelle',
        icon: 'create',
        items: [
          {
            question: 'Quand puis-je éditer manuellement un bagage ?',
            answer: 'Vous pouvez éditer manuellement les informations d\'un bagage en cas d\'erreur de scan, de problème de tag, ou pour corriger des données incorrectes.',
          },
          {
            question: 'Quels champs puis-je modifier ?',
            answer: 'Vous pouvez modifier le statut du bagage, associer un bagage à un autre passager, corriger le tag, et mettre à jour d\'autres informations selon les permissions.',
          },
          {
            question: 'Mes modifications sont-elles tracées ?',
            answer: 'Oui, toutes les modifications manuelles sont enregistrées dans l\'historique avec votre identité, la date et l\'heure. Cela permet l\'audit et la traçabilité.',
          },
          {
            question: 'Puis-je annuler une modification ?',
            answer: 'Oui, vous pouvez annuler une modification récente depuis l\'historique. Cependant, certaines modifications critiques peuvent nécessiter l\'approbation d\'un administrateur.',
          },
        ],
      },
      {
        title: 'Supervision des agents',
        icon: 'people',
        items: [
          {
            question: 'Comment voir l\'activité des agents ?',
            answer: 'Allez dans l\'onglet "Supervision" > "Tableau de bord". Vous verrez les statistiques par agent : nombre de scans, performance, et activité récente.',
          },
          {
            question: 'Puis-je voir les scans d\'un agent spécifique ?',
            answer: 'Oui, dans les statistiques, vous pouvez filtrer par agent pour voir tous ses scans et son historique d\'activité.',
          },
          {
            question: 'Comment identifier les problèmes de performance ?',
            answer: 'Les statistiques vous montrent les agents avec un faible nombre de scans, des erreurs fréquentes, ou des temps de traitement élevés. Vous pouvez ensuite les former ou les assister.',
          },
        ],
      },
    ];
  }

  // ADMIN
  return [
    ...commonFAQ,
    {
      title: 'Gestion des utilisateurs',
      icon: 'people',
      items: [
        {
          question: 'Comment créer un nouvel utilisateur ?',
          answer: 'Allez dans l\'onglet "Supervision" > "Gestion des utilisateurs" > "Créer un utilisateur". Remplissez le nom, l\'email, le rôle et la station (si applicable). Un email d\'activation sera envoyé.',
        },
        {
          question: 'Quels rôles puis-je attribuer ?',
          answer: 'Trois rôles sont disponibles : Agent (scan et recherche), Superviseur (droits agent + statistiques et exports), et Admin (tous les droits y compris gestion utilisateurs).',
        },
        {
          question: 'Comment modifier les permissions d\'un utilisateur ?',
          answer: 'Dans la liste des utilisateurs, sélectionnez l\'utilisateur et cliquez sur "Modifier". Vous pouvez changer le rôle, la station, et d\'autres paramètres.',
        },
        {
          question: 'Puis-je désactiver un compte utilisateur ?',
          answer: 'Oui, vous pouvez désactiver temporairement un compte utilisateur. L\'utilisateur ne pourra plus se connecter jusqu\'à ce que vous le réactiviez.',
        },
        {
          question: 'Comment réinitialiser le mot de passe d\'un utilisateur ?',
          answer: 'Dans la gestion des utilisateurs, sélectionnez l\'utilisateur et cliquez sur "Réinitialiser le mot de passe". Un email avec un lien de réinitialisation sera envoyé.',
        },
        {
          question: 'Puis-je voir l\'historique de connexion d\'un utilisateur ?',
          answer: 'Oui, pour chaque utilisateur, vous pouvez voir l\'historique des connexions, les dernières activités, et les statistiques d\'utilisation.',
        },
      ],
    },
    {
      title: 'Gestion des vols',
      icon: 'airplane',
      items: [
        {
          question: 'Comment importer des vols depuis un fichier Excel ?',
          answer: 'Allez dans l\'onglet "Supervision" > "Gestion des vols" > "Importer". Sélectionnez votre fichier Excel ou CSV. Le système validera et importera automatiquement les données.',
        },
        {
          question: 'Quel format de fichier est requis pour l\'import ?',
          answer: 'Les fichiers Excel (.xlsx) et CSV (.csv) sont supportés. Le fichier doit contenir les colonnes : code du vol, date, route, et optionnellement les passagers et bagages.',
        },
        {
          question: 'Puis-je modifier un vol après import ?',
          answer: 'Oui, vous pouvez modifier tous les champs d\'un vol depuis l\'interface de gestion. Cependant, certaines modifications peuvent être restreintes si le vol a déjà des scans associés.',
        },
        {
          question: 'Comment supprimer un vol ?',
          answer: 'Dans la gestion des vols, sélectionnez le vol et cliquez sur "Supprimer". Attention : cette action supprimera aussi tous les passagers et bagages associés. Une confirmation sera demandée.',
        },
        {
          question: 'Que se passe-t-il si j\'importe un vol en double ?',
          answer: 'Le système détectera les doublons basés sur le code du vol et la date. Vous pourrez choisir de mettre à jour le vol existant ou d\'ignorer l\'import.',
        },
      ],
    },
    {
      title: 'Configuration système',
      icon: 'settings',
      items: [
        {
          question: 'Comment configurer les notifications automatiques ?',
          answer: 'Allez dans "Paramètres système" > "Notifications". Vous pouvez configurer les seuils d\'alerte, les délais avant départ, et les types de notifications à générer automatiquement.',
        },
        {
          question: 'Puis-je modifier les statuts de bagages disponibles ?',
          answer: 'Les statuts sont prédéfinis et ne peuvent pas être modifiés pour garantir la cohérence du système. Cependant, vous pouvez configurer les règles de transition entre statuts.',
        },
        {
          question: 'Comment configurer les stations disponibles ?',
          answer: 'Les stations correspondent aux aéroports supportés. Pour ajouter une nouvelle station, contactez le support technique. La liste actuelle inclut 9 aéroports principaux.',
        },
        {
          question: 'Puis-je personnaliser les messages d\'alerte ?',
          answer: 'Oui, dans les paramètres système, vous pouvez personnaliser les messages de notification, les alertes, et les messages d\'erreur affichés aux utilisateurs.',
        },
        {
          question: 'Comment sauvegarder les données ?',
          answer: 'Les données sont automatiquement sauvegardées dans la base de données Supabase. Vous pouvez aussi exporter régulièrement les données importantes depuis l\'interface d\'export.',
        },
        {
          question: 'Comment restaurer des données supprimées ?',
          answer: 'Contactez le support technique avec les détails de la suppression. Les données peuvent être restaurées depuis les sauvegardes automatiques si la demande est faite dans les délais.',
        },
      ],
    },
    {
      title: 'Sécurité et audit',
      icon: 'shield-checkmark',
      items: [
        {
          question: 'Comment voir les logs d\'audit ?',
          answer: 'Allez dans "Paramètres système" > "Audit et logs". Vous verrez tous les événements importants : connexions, modifications, suppressions, et actions administratives.',
        },
        {
          question: 'Les actions sont-elles toutes tracées ?',
          answer: 'Oui, toutes les actions importantes sont tracées : scans, modifications, créations, suppressions, exports, et changements de configuration. L\'historique complet est conservé.',
        },
        {
          question: 'Comment gérer les permissions d\'accès ?',
          answer: 'Les permissions sont gérées via les rôles. Vous pouvez créer des rôles personnalisés avec des permissions spécifiques dans "Paramètres système" > "Rôles et permissions".',
        },
        {
          question: 'Puis-je voir qui a modifié quoi et quand ?',
          answer: 'Oui, pour chaque élément (bagage, vol, utilisateur), vous pouvez voir l\'historique complet des modifications avec l\'identité de l\'utilisateur, la date et l\'heure.',
        },
      ],
    },
    {
      title: 'Intégrations et API',
      icon: 'code',
      items: [
        {
          question: 'L\'application peut-elle s\'intégrer avec d\'autres systèmes ?',
          answer: 'Oui, l\'application utilise Supabase comme backend et peut s\'intégrer avec d\'autres systèmes via l\'API REST. Contactez le support technique pour les détails d\'intégration.',
        },
        {
          question: 'Y a-t-il une API disponible ?',
          answer: 'Oui, une API REST est disponible pour les intégrations. La documentation de l\'API est accessible depuis le support technique. Des clés API peuvent être générées pour les intégrations tierces.',
        },
        {
          question: 'Comment synchroniser les données avec d\'autres systèmes ?',
          answer: 'Les données sont synchronisées automatiquement via Supabase. Pour des synchronisations personnalisées, vous pouvez utiliser l\'API ou les fonctions d\'export/import.',
        },
      ],
    },
  ];
};

interface FAQProps {
  role: UserRole;
}

export default function FAQ({ role }: FAQProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  const faqCategories = getFAQByRole(role);

  const toggleCategory = (title: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(title)) {
      newExpanded.delete(title);
    } else {
      newExpanded.add(title);
    }
    setExpandedCategories(newExpanded);
  };

  const toggleItem = (categoryTitle: string, itemIndex: number) => {
    const key = `${categoryTitle}-${itemIndex}`;
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(key)) {
      newExpanded.delete(key);
    } else {
      newExpanded.add(key);
    }
    setExpandedItems(newExpanded);
  };

  const dynamicStyles = {
    container: {
      backgroundColor: isDark ? '#000000' : '#FFFFFF',
    },
    category: {
      backgroundColor: isDark ? '#151718' : '#FFFFFF',
      borderColor: isDark ? '#2A2A2A' : '#E5E7EB',
    },
    categoryTitle: {
      color: isDark ? '#ECEDEE' : '#11181C',
    },
    item: {
      backgroundColor: isDark ? '#1A1A1A' : '#F5F5F5',
      borderColor: isDark ? '#2A2A2A' : '#E0E0E0',
    },
    question: {
      color: isDark ? '#ECEDEE' : '#11181C',
    },
    answer: {
      color: isDark ? '#9BA1A6' : '#687076',
    },
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <ThemedText type="title" style={[styles.mainTitle, dynamicStyles.categoryTitle]}>
        Questions fréquentes (FAQ)
      </ThemedText>
      <ThemedText type="subtitle" style={[styles.mainSubtitle, dynamicStyles.answer]}>
        Trouvez des réponses à toutes vos questions
      </ThemedText>

      {faqCategories.map((category, categoryIndex) => {
        const isCategoryExpanded = expandedCategories.has(category.title);

        return (
          <View key={categoryIndex} style={[styles.category, dynamicStyles.category]}>
            <TouchableOpacity
              style={styles.categoryHeader}
              onPress={() => toggleCategory(category.title)}
              activeOpacity={0.7}
            >
              <View style={styles.categoryHeaderContent}>
                <Ionicons
                  name={category.icon as any}
                  size={24}
                  color={isDark ? '#007AFF' : '#007AFF'}
                  style={styles.categoryIcon}
                />
                <ThemedText type="defaultSemiBold" style={[styles.categoryTitle, dynamicStyles.categoryTitle]}>
                  {category.title}
                </ThemedText>
              </View>
              <Ionicons
                name={isCategoryExpanded ? 'chevron-up' : 'chevron-down'}
                size={24}
                color={isDark ? '#9BA1A6' : '#687076'}
              />
            </TouchableOpacity>

            {isCategoryExpanded && (
              <View style={styles.itemsContainer}>
                {category.items.map((item, itemIndex) => {
                  const itemKey = `${category.title}-${itemIndex}`;
                  const isItemExpanded = expandedItems.has(itemKey);

                  return (
                    <View key={itemIndex} style={[styles.item, dynamicStyles.item]}>
                      <TouchableOpacity
                        style={styles.itemHeader}
                        onPress={() => toggleItem(category.title, itemIndex)}
                        activeOpacity={0.7}
                      >
                        <ThemedText style={[styles.question, dynamicStyles.question]}>
                          {item.question}
                        </ThemedText>
                        <Ionicons
                          name={isItemExpanded ? 'chevron-up' : 'chevron-down'}
                          size={20}
                          color={isDark ? '#9BA1A6' : '#687076'}
                          style={styles.itemChevron}
                        />
                      </TouchableOpacity>
                      {isItemExpanded && (
                        <View style={styles.answerContainer}>
                          <ThemedText style={[styles.answer, dynamicStyles.answer]}>
                            {item.answer}
                          </ThemedText>
                        </View>
                      )}
                    </View>
                  );
                })}
              </View>
            )}
          </View>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 24,
  },
  mainTitle: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 8,
  },
  mainSubtitle: {
    fontSize: 15,
    marginBottom: 24,
  },
  category: {
    marginBottom: 16,
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
  },
  categoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  categoryHeaderContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  categoryIcon: {
    marginRight: 12,
  },
  categoryTitle: {
    fontSize: 18,
    fontWeight: '600',
    flex: 1,
  },
  itemsContainer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  item: {
    marginTop: 12,
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  question: {
    fontSize: 15,
    fontWeight: '500',
    flex: 1,
    marginRight: 12,
  },
  itemChevron: {
    marginLeft: 8,
  },
  answerContainer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  answer: {
    fontSize: 14,
    lineHeight: 20,
  },
});

