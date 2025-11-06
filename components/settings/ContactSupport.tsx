import React, { useState } from 'react';
import { StyleSheet, View, TouchableOpacity, ScrollView, TextInput, Alert, Linking } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Ionicons } from '@expo/vector-icons';

interface ContactOption {
  id: string;
  title: string;
  description: string;
  icon: string;
  action: () => void;
  color: string;
}

export default function ContactSupport() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');

  const handleEmail = () => {
    const email = 'support@brs-csi.com';
    const subjectEncoded = encodeURIComponent(subject || 'Demande de support');
    const bodyEncoded = encodeURIComponent(message || '');
    const mailtoUrl = `mailto:${email}?subject=${subjectEncoded}&body=${bodyEncoded}`;
    
    Linking.openURL(mailtoUrl).catch(() => {
      Alert.alert(
        'Erreur',
        'Impossible d\'ouvrir l\'application email. Veuillez envoyer un email à support@brs-csi.com',
        [{ text: 'OK' }]
      );
    });
  };

  const handlePhone = () => {
    const phoneNumber = '+243900000000'; // Numéro de support
    const phoneUrl = `tel:${phoneNumber}`;
    
    Linking.openURL(phoneUrl).catch(() => {
      Alert.alert(
        'Erreur',
        'Impossible d\'ouvrir l\'application téléphone. Veuillez appeler le +243900000000',
        [{ text: 'OK' }]
      );
    });
  };

  const handleWhatsApp = () => {
    const phoneNumber = '243900000000'; // Numéro WhatsApp (sans +)
    const messageEncoded = encodeURIComponent(message || 'Bonjour, j\'ai besoin d\'aide avec BRS-CSI.');
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${messageEncoded}`;
    
    Linking.openURL(whatsappUrl).catch(() => {
      Alert.alert(
        'Erreur',
        'Impossible d\'ouvrir WhatsApp. Veuillez contacter le support via un autre moyen.',
        [{ text: 'OK' }]
      );
    });
  };

  const handleSubmitTicket = () => {
    if (!subject.trim() || !message.trim()) {
      Alert.alert(
        'Champs requis',
        'Veuillez remplir le sujet et le message avant d\'envoyer votre demande.',
        [{ text: 'OK' }]
      );
      return;
    }

    // Simuler l'envoi du ticket
    Alert.alert(
      'Demande envoyée',
      'Votre demande de support a été envoyée avec succès. Notre équipe vous répondra dans les plus brefs délais.',
      [{ text: 'OK' }]
    );

    // Réinitialiser les champs
    setSubject('');
    setMessage('');
  };

  const contactOptions: ContactOption[] = [
    {
      id: 'email',
      title: 'Email',
      description: 'support@brs-csi.com\nRéponse sous 24h',
      icon: 'mail',
      action: handleEmail,
      color: '#007AFF',
    },
    {
      id: 'phone',
      title: 'Téléphone',
      description: '+243 900 000 000\nLun-Ven: 8h-18h',
      icon: 'call',
      action: handlePhone,
      color: '#34C759',
    },
    {
      id: 'whatsapp',
      title: 'WhatsApp',
      description: 'Chat en direct\nDisponible 24/7',
      icon: 'logo-whatsapp',
      action: handleWhatsApp,
      color: '#25D366',
    },
  ];

  const dynamicStyles = {
    container: {
      backgroundColor: isDark ? '#000000' : '#FFFFFF',
    },
    section: {
      backgroundColor: isDark ? '#151718' : '#FFFFFF',
      borderColor: isDark ? '#2A2A2A' : '#E5E7EB',
    },
    sectionTitle: {
      color: isDark ? '#ECEDEE' : '#11181C',
    },
    sectionSubtitle: {
      color: isDark ? '#9BA1A6' : '#687076',
    },
    input: {
      backgroundColor: isDark ? '#1A1A1A' : '#F5F5F5',
      borderColor: isDark ? '#2A2A2A' : '#E0E0E0',
      color: isDark ? '#ECEDEE' : '#11181C',
    },
    button: {
      backgroundColor: '#007AFF',
    },
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <ThemedText type="title" style={[styles.mainTitle, dynamicStyles.sectionTitle]}>
        Contact Support
      </ThemedText>
      <ThemedText type="subtitle" style={[styles.mainSubtitle, dynamicStyles.sectionSubtitle]}>
        Notre équipe est là pour vous aider
      </ThemedText>

      {/* Options de contact rapide */}
      <View style={[styles.section, dynamicStyles.section]}>
        <ThemedText type="defaultSemiBold" style={[styles.sectionTitle, dynamicStyles.sectionTitle]}>
          Contact rapide
        </ThemedText>
        <ThemedText type="subtitle" style={[styles.sectionSubtitle, dynamicStyles.sectionSubtitle]}>
          Choisissez votre moyen de contact préféré
        </ThemedText>

        <View style={styles.contactOptionsContainer}>
          {contactOptions.map((option) => (
            <TouchableOpacity
              key={option.id}
              style={[styles.contactOption, { borderColor: option.color }]}
              onPress={option.action}
              activeOpacity={0.7}
            >
              <View style={[styles.contactOptionIcon, { backgroundColor: `${option.color}20` }]}>
                <Ionicons name={option.icon as any} size={28} color={option.color} />
              </View>
              <View style={styles.contactOptionContent}>
                <ThemedText style={[styles.contactOptionTitle, dynamicStyles.sectionTitle]}>
                  {option.title}
                </ThemedText>
                <ThemedText style={[styles.contactOptionDescription, dynamicStyles.sectionSubtitle]}>
                  {option.description}
                </ThemedText>
              </View>
              <Ionicons name="chevron-forward" size={20} color={isDark ? '#9BA1A6' : '#687076'} />
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Formulaire de ticket */}
      <View style={[styles.section, dynamicStyles.section]}>
        <ThemedText type="defaultSemiBold" style={[styles.sectionTitle, dynamicStyles.sectionTitle]}>
          Créer un ticket de support
        </ThemedText>
        <ThemedText type="subtitle" style={[styles.sectionSubtitle, dynamicStyles.sectionSubtitle]}>
          Décrivez votre problème en détail
        </ThemedText>

        <View style={styles.formContainer}>
          <View style={styles.inputContainer}>
            <ThemedText style={[styles.label, dynamicStyles.sectionSubtitle]}>
              Sujet
            </ThemedText>
            <TextInput
              style={[styles.input, dynamicStyles.input]}
              placeholder="Ex: Problème de scan"
              placeholderTextColor={isDark ? '#6B7280' : '#9CA3AF'}
              value={subject}
              onChangeText={setSubject}
            />
          </View>

          <View style={styles.inputContainer}>
            <ThemedText style={[styles.label, dynamicStyles.sectionSubtitle]}>
              Message
            </ThemedText>
            <TextInput
              style={[styles.textArea, dynamicStyles.input]}
              placeholder="Décrivez votre problème en détail..."
              placeholderTextColor={isDark ? '#6B7280' : '#9CA3AF'}
              value={message}
              onChangeText={setMessage}
              multiline
              numberOfLines={6}
              textAlignVertical="top"
            />
          </View>

          <TouchableOpacity
            style={[styles.submitButton, dynamicStyles.button]}
            onPress={handleSubmitTicket}
            activeOpacity={0.8}
          >
            <Ionicons name="send" size={20} color="#FFFFFF" />
            <ThemedText style={styles.submitButtonText}>
              Envoyer la demande
            </ThemedText>
          </TouchableOpacity>
        </View>
      </View>

      {/* Informations supplémentaires */}
      <View style={[styles.section, dynamicStyles.section]}>
        <ThemedText type="defaultSemiBold" style={[styles.sectionTitle, dynamicStyles.sectionTitle]}>
          Informations utiles
        </ThemedText>
        
        <View style={styles.infoItem}>
          <Ionicons name="time-outline" size={20} color={isDark ? '#9BA1A6' : '#687076'} />
          <View style={styles.infoContent}>
            <ThemedText style={[styles.infoTitle, dynamicStyles.sectionTitle]}>
              Heures d'ouverture
            </ThemedText>
            <ThemedText style={[styles.infoText, dynamicStyles.sectionSubtitle]}>
              Support téléphonique : Lundi-Vendredi, 8h-18h (GMT+1)\nSupport email : 24/7\nWhatsApp : 24/7
            </ThemedText>
          </View>
        </View>

        <View style={styles.infoItem}>
          <Ionicons name="information-circle-outline" size={20} color={isDark ? '#9BA1A6' : '#687076'} />
          <View style={styles.infoContent}>
            <ThemedText style={[styles.infoTitle, dynamicStyles.sectionTitle]}>
              Temps de réponse
            </ThemedText>
            <ThemedText style={[styles.infoText, dynamicStyles.sectionSubtitle]}>
              {'Urgent : < 1 heure\nNormal : < 24 heures\nGénéral : < 48 heures'}
            </ThemedText>
          </View>
        </View>

        <View style={styles.infoItem}>
          <Ionicons name="document-text-outline" size={20} color={isDark ? '#9BA1A6' : '#687076'} />
          <View style={styles.infoContent}>
            <ThemedText style={[styles.infoTitle, dynamicStyles.sectionTitle]}>
              Documentation
            </ThemedText>
            <ThemedText style={[styles.infoText, dynamicStyles.sectionSubtitle]}>
              Consultez la section FAQ pour trouver des réponses aux questions fréquentes avant de contacter le support.
            </ThemedText>
          </View>
        </View>
      </View>
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
  section: {
    marginBottom: 24,
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 14,
    marginBottom: 16,
  },
  contactOptionsContainer: {
    marginTop: 12,
    gap: 12,
  },
  contactOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
  },
  contactOptionIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  contactOptionContent: {
    flex: 1,
  },
  contactOptionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  contactOptionDescription: {
    fontSize: 13,
    lineHeight: 18,
  },
  formContainer: {
    marginTop: 12,
  },
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
  },
  input: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    fontSize: 16,
  },
  textArea: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    fontSize: 16,
    minHeight: 120,
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    marginTop: 8,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  infoItem: {
    flexDirection: 'row',
    marginTop: 16,
    alignItems: 'flex-start',
  },
  infoContent: {
    flex: 1,
    marginLeft: 12,
  },
  infoTitle: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 4,
  },
  infoText: {
    fontSize: 13,
    lineHeight: 18,
  },
});

