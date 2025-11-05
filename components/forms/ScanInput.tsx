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
    padding: 16,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    paddingHorizontal: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
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
    fontSize: 16,
    paddingVertical: 12,
    color: '#111827',
  },
  clearButton: {
    marginLeft: 8,
  },
  scanButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#3B82F6',
    borderRadius: 12,
    paddingVertical: 14,
    gap: 8,
  },
  scanButtonDisabled: {
    backgroundColor: '#9CA3AF',
    opacity: 0.5,
  },
  scanButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

