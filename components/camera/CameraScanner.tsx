import React, { useState, useEffect } from 'react';
import { StyleSheet, View, TouchableOpacity, Modal } from 'react-native';
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Ionicons } from '@expo/vector-icons';

interface CameraScannerProps {
  visible: boolean;
  onClose: () => void;
  onScan: (code: string) => void;
}

export const CameraScanner: React.FC<CameraScannerProps> = ({
  visible,
  onClose,
  onScan,
}) => {
  const [permission, requestPermission] = useCameraPermissions();
  const [facing, setFacing] = useState<CameraType>('back');
  const [scanned, setScanned] = useState(false);

  useEffect(() => {
    if (visible) {
      setScanned(false);
    }
  }, [visible]);

  const handleBarCodeScanned = ({ type, data }: { type: string; data: string }) => {
    if (scanned) return;
    
    setScanned(true);
    onScan(data);
    onClose();
    
    // Réinitialiser après un court délai pour permettre un nouveau scan
    setTimeout(() => {
      setScanned(false);
    }, 1000);
  };

  const handleClose = () => {
    setScanned(false);
    onClose();
  };

  if (!permission) {
    // La permission est en cours de chargement
    return null;
  }

  if (!permission.granted) {
    return (
      <Modal visible={visible} transparent animationType="slide">
        <ThemedView style={styles.container}>
          <View style={styles.permissionContainer}>
            <Ionicons name="camera-outline" size={64} color="#3B82F6" />
            <ThemedText type="title" style={styles.permissionTitle}>
              Permission caméra requise
            </ThemedText>
            <ThemedText style={styles.permissionText}>
              Pour scanner les codes-barres, l'application a besoin d'accéder à votre caméra.
            </ThemedText>
            <TouchableOpacity
              style={styles.permissionButton}
              onPress={requestPermission}>
              <ThemedText style={styles.permissionButtonText}>
                Autoriser l'accès à la caméra
              </ThemedText>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={handleClose}>
              <ThemedText style={styles.closeButtonText}>Annuler</ThemedText>
            </TouchableOpacity>
          </View>
        </ThemedView>
      </Modal>
    );
  }

  return (
    <Modal visible={visible} transparent animationType="slide">
      <ThemedView style={styles.container}>
        <CameraView
          style={styles.camera}
          facing={facing}
          onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
          barcodeScannerSettings={{
            barcodeTypes: ['qr', 'ean13', 'ean8', 'code128', 'code39'],
          }}>
          <View style={styles.overlay}>
            <View style={styles.header}>
              <ThemedText type="title" style={styles.title}>
                Scanner un code
              </ThemedText>
              <TouchableOpacity
                style={styles.closeIconButton}
                onPress={handleClose}>
                <Ionicons name="close" size={28} color="#FFF" />
              </TouchableOpacity>
            </View>
            
            <View style={styles.scannerArea}>
              <View style={styles.scannerFrame} />
              <ThemedText style={styles.hint}>
                Positionnez le code-barres dans le cadre
              </ThemedText>
            </View>

            <View style={styles.footer}>
              <TouchableOpacity
                style={styles.flipButton}
                onPress={() => setFacing(facing === 'back' ? 'front' : 'back')}>
                <Ionicons name="camera-reverse" size={24} color="#FFF" />
                <ThemedText style={styles.flipButtonText}>Retourner</ThemedText>
              </TouchableOpacity>
            </View>
          </View>
        </CameraView>
      </ThemedView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  camera: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  title: {
    color: '#FFF',
    fontSize: 20,
    fontWeight: '600',
  },
  closeIconButton: {
    padding: 8,
  },
  scannerArea: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scannerFrame: {
    width: 250,
    height: 250,
    borderWidth: 2,
    borderColor: '#3B82F6',
    borderRadius: 12,
    backgroundColor: 'transparent',
  },
  hint: {
    marginTop: 20,
    color: '#FFF',
    fontSize: 14,
    textAlign: 'center',
    paddingHorizontal: 40,
  },
  footer: {
    padding: 20,
    alignItems: 'center',
  },
  flipButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 8,
  },
  flipButtonText: {
    color: '#FFF',
    fontSize: 16,
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
    backgroundColor: '#FFF',
  },
  permissionTitle: {
    marginTop: 24,
    marginBottom: 12,
    textAlign: 'center',
  },
  permissionText: {
    textAlign: 'center',
    marginBottom: 32,
    fontSize: 16,
    opacity: 0.7,
  },
  permissionButton: {
    backgroundColor: '#3B82F6',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    marginBottom: 16,
  },
  permissionButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  closeButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  closeButtonText: {
    color: '#6B7280',
    fontSize: 16,
  },
});

