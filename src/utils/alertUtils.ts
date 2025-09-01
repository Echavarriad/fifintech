import { useAlertContext } from '../contexts/AlertContext';

/**
 * Hook de utilidad que proporciona funciones específicas para cada tipo de alerta
 * Extiende la funcionalidad del contexto de alertas para hacer más sencillo su uso
 */
export const useAlertUtils = () => {
  const { showAlert } = useAlertContext();

  /**
   * Muestra una alerta de éxito
   * @param title Título de la alerta (opcional, por defecto "Éxito")
   * @param message Mensaje de la alerta
   */
  const showSuccess = (message: string, title: string = "Éxito") => {
    showAlert('success', title, message);
  };

  /**
   * Muestra una alerta de error
   * @param title Título de la alerta (opcional, por defecto "Error")
   * @param message Mensaje de la alerta
   */
  const showError = (message: string, title: string = "Error") => {
    showAlert('error', title, message);
  };

  /**
   * Muestra una alerta de advertencia
   * @param title Título de la alerta (opcional, por defecto "Advertencia")
   * @param message Mensaje de la alerta
   */
  const showWarning = (message: string, title: string = "Advertencia") => {
    showAlert('warning', title, message);
  };

  /**
   * Muestra una alerta de información
   * @param title Título de la alerta (opcional, por defecto "Información")
   * @param message Mensaje de la alerta
   */
  const showInfo = (message: string, title: string = "Información") => {
    showAlert('info', title, message);
  };

  return {
    showSuccess,
    showError,
    showWarning,
    showInfo,
  };
};