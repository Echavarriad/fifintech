import { useState } from 'react';

type AlertType = 'success' | 'error' | 'warning' | 'info';

interface AlertState {
  visible: boolean;
  type: AlertType;
  title: string;
  message: string;
}

interface UseAlertReturn {
  alertState: AlertState;
  showAlert: (type: AlertType, title: string, message: string) => void;
  hideAlert: () => void;
}

const useAlert = (): UseAlertReturn => {
  const [alertState, setAlertState] = useState<AlertState>({
    visible: false,
    type: 'info',
    title: '',
    message: '',
  });

  const showAlert = (type: AlertType, title: string, message: string) => {
    setAlertState({
      visible: true,
      type,
      title,
      message,
    });
  };

  const hideAlert = () => {
    setAlertState((prev) => ({
      ...prev,
      visible: false,
    }));
  };

  return {
    alertState,
    showAlert,
    hideAlert,
  };
};

export default useAlert;