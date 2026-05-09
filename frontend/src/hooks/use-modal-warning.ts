import { useState, useCallback } from "react";

export function useModalWarning(isDirty: boolean, closeAction: () => void) {
  const [showWarning, setShowWarning] = useState(false);

  const checkWarning = useCallback(() => {
    if (isDirty) {
      setShowWarning(true);
      return true; // Indica que o alerta foi ativado
    }
    closeAction();
    return false; // Indica que fechou direto
  }, [isDirty, closeAction]);

  const handleConfirmClose = useCallback(() => {
    setShowWarning(false);
    closeAction();
  }, [closeAction]);

  return {
    showWarning,
    setShowWarning,
    checkWarning,
    handleConfirmClose,
  };
}
