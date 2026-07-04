import { useEffect, useRef } from "react";

/**
 * Custom hook to trap focus within a modal and return focus to trigger element on close
 * @param isOpen - Whether the modal is currently open
 * @param onClose - Callback to close the modal (for ESC key)
 */
export function useFocusTrap(isOpen: boolean) {
  const modalRef = useRef<HTMLDivElement>(null);
  const triggerElementRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    // Store the element that triggered the modal (only if it's a meaningful focusable element)
    const activeEl = document.activeElement as HTMLElement;
    if (activeEl && activeEl !== document.body) {
      triggerElementRef.current = activeEl;
    }

    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key !== "Tab" || !modalRef.current) return;

      const focusableElements = modalRef.current.querySelectorAll<HTMLElement>(
        'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
      );

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      // If no focusable elements, prevent default tab behavior
      if (focusableElements.length === 0) {
        e.preventDefault();
        return;
      }

      // Shift + Tab: if on first element, wrap to last
      if (e.shiftKey && document.activeElement === firstElement) {
        e.preventDefault();
        lastElement.focus();
      }
      // Tab: if on last element, wrap to first
      else if (!e.shiftKey && document.activeElement === lastElement) {
        e.preventDefault();
        firstElement.focus();
      }
    };

    document.addEventListener("keydown", handleTabKey);

    return () => {
      document.removeEventListener("keydown", handleTabKey);
    };
  }, [isOpen]);

  // Return focus to trigger element when modal closes (only if we have a valid target)
  useEffect(() => {
    if (!isOpen && triggerElementRef.current && triggerElementRef.current !== document.body) {
      triggerElementRef.current.focus();
      triggerElementRef.current = null;
    }
  }, [isOpen]);

  return modalRef;
}
