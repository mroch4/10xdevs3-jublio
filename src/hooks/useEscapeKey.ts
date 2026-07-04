import { useEffect } from "react";

/**
 * Custom hook to handle ESC key press for closing modals
 * @param onClose - Callback function to execute when ESC is pressed
 * @param isOpen - Whether the modal is currently open
 * @param isBlocked - Whether to block ESC (e.g., during loading operations)
 */
export function useEscapeKey(
  onClose: () => void,
  isOpen: boolean,
  isBlocked: boolean = false
) {
  useEffect(() => {
    const handleEscKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen && !isBlocked) {
        onClose();
      }
    };

    document.addEventListener("keydown", handleEscKey);
    return () => {
      document.removeEventListener("keydown", handleEscKey);
    };
  }, [onClose, isOpen, isBlocked]);
}
