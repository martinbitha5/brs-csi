import React, { useState } from 'react';
import { StyleSheet, View, TextInput, TouchableOpacity } from 'react-native';
import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';
import { Ionicons } from '@expo/vector-icons';
import { CameraScanner } from '@/components/camera/CameraScanner';

interface ScanInputProps {
  onScan: (tagFull: string) => void;
  placeholder?: string;
  autoFocus?: boolean;
}

export const ScanInput: React.FC<ScanInputProps> = ({
  onScan,
  placeholder = 'Scannez ou saisissez le numéro de bagage',
  autoFocus = false,
}) => {
  const [tagFull, setTagFull] = useState('');
  const [cameraVisible, setCameraVisible] = useState(false);

  const handleScan = () => {
    if (tagFull.trim()) {
      onScan(tagFull.trim());
      setTagFull('');
    }
  };

  const handleCameraScan = (code: string) => {
    setTagFull(code);
    onScan(code);
    setTagFull('');
  };

  return (
    <>
      <ThemedView style={styles.container}>
        <View style={styles.inputContainer}>
          <TouchableOpacity
            onPress={() => setCameraVisible(true)}
            style={styles.cameraButton}>
            <Ionicons name="camera" size={24} color="#3B82F6" />
          </TouchableOpacity>
          <TextInput
            style={styles.input}
            value={tagFull}
            onChangeText={setTagFull}
            placeholder={placeholder}
            placeholderTextColor="#9CA3AF"
            autoFocus={autoFocus}
            autoCapitalize="none"
            autoCorrect={false}
            returnKeyType="done"
            onSubmitEditing={handleScan}
          />
          {tagFull.length > 0 && (
            <TouchableOpacity onPress={() => setTagFull('')} style={styles.clearButton}>
              <Ionicons name="close-circle" size={20} color="#9CA3AF" />
            </TouchableOpacity>
          )}
        </View>
        <TouchableOpacity
          style={[styles.scanButton, !tagFull.trim() && styles.scanButtonDisabled]}
          onPress={handleScan}
          disabled={!tagFull.trim()}>
          <Ionicons name="checkmark-circle" size={20} color="#FFF" />
          <ThemedText style={styles.scanButtonText}>Valider</ThemedText>
        </TouchableOpacity>
      </ThemedView>
      <CameraScanner
        visible={cameraVisible}
        onClose={() => setCameraVisible(false)}
        onScan={handleCameraScan}
      />
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 0,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    paddingHorizontal: 16,
    marginBottom: 14,
    borderWidth: 2,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  cameraButton: {
    padding: 4,
    marginRight: 4,
  },
  icon: {
    marginRight: 8,
    color: '#6B7280',
  },
  input: {
    flex: 1,
    fontSize: 17,
    paddingVertical: 14,
    color: '#0F172A',
    fontWeight: '500',
  },
  clearButton: {
    marginLeft: 8,
  },
  scanButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2563EB',
    borderRadius: 14,
    paddingVertical: 16,
    gap: 10,
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  scanButtonDisabled: {
    backgroundColor: '#94A3B8',
    opacity: 0.6,
    shadowOpacity: 0,
    elevation: 0,
  },
  scanButtonText: {
    color: '#FFF',
    fontSize: 17,
    fontWeight: '600',
    letterSpacing: -0.2,
  },
});

