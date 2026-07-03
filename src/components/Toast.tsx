import { useEffect } from "react";
import "./Toast.css";

interface ToastProps {
  message: string;
  show: boolean;
  onClose: () => void;
  autoHideDuration?: number;
}

export default function Toast({
  message,
  show,
  onClose,
  autoHideDuration = 5000,
}: ToastProps) {
  useEffect(() => {
    if (show && autoHideDuration > 0) {
      const timer = setTimeout(() => {
        onClose();
      }, autoHideDuration);

      return () => clearTimeout(timer);
    }
  }, [show, autoHideDuration, onClose]);

  if (!show) return null;

  return (
    <div className="toast-container">
      <div className="alert alert-info alert-dismissible fade show" role="alert">
        {message}
        <button
          type="button"
          className="btn-close"
          onClick={onClose}
          aria-label="Close"
        />
      </div>
    </div>
  );
}
