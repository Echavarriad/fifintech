import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal } from 'react-native';

type AlertType = 'success' | 'error' | 'warning' | 'info';

interface AlertMessageProps {
  visible: boolean;
  type: AlertType;
  title: string;
  message: string;
  onClose: () => void;
}

const AlertMessage: React.FC<AlertMessageProps> = ({
  visible,
  type,
  title,
  message,
  onClose,
}) => {
  // Definir colores según el tipo de alerta
  const getBackgroundColor = () => {
    switch (type) {
      case 'success':
        return '#48b783'; // Verde
      case 'error':
        return '#e74c3c'; // Rojo
      case 'warning':
        return '#f39c12'; // Naranja
      case 'info':
        return '#3498db'; // Azul
      default:
        return '#48b783';
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'success':
        return '✓';
      case 'error':
        return '✗';
      case 'warning':
        return '⚠';
      case 'info':
        return 'ℹ';
      default:
        return '';
    }
  };

  return (
    <Modal
      transparent
      animationType="fade"
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.centeredView}>
        <View style={[styles.alertContainer, { borderColor: getBackgroundColor() }]}>
          <View style={[styles.headerContainer, { backgroundColor: getBackgroundColor() }]}>
            <Text style={styles.icon}>{getIcon()}</Text>
            <Text style={styles.title}>{title}</Text>
          </View>
          <View style={styles.messageContainer}>
            <Text style={styles.message}>{message}</Text>
          </View>
          <TouchableOpacity
            style={[styles.button, { backgroundColor: getBackgroundColor() }]}
            onPress={onClose}
          >
            <Text style={styles.buttonText}>Aceptar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  alertContainer: {
    width: '80%',
    backgroundColor: 'white',
    borderRadius: 10,
    overflow: 'hidden',
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
  },
  icon: {
    fontSize: 20,
    color: 'white',
    marginRight: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
  messageContainer: {
    padding: 20,
  },
  message: {
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
  },
  button: {
    padding: 12,
    alignItems: 'center',
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 5,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default AlertMessage;