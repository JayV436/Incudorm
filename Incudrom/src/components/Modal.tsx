import { useEffect, useRef } from "react";
import type { ReactNode } from "react";

/**
 * Accessible modal built on the native <dialog> element.
 * It traps focus, closes on Esc, and closes when the backdrop is clicked.
 * Children are only mounted while open, so forms inside reset every time.
 */
export function Modal({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      className="inc-modal"
      aria-labelledby="inc-modal-title"
      onClose={onClose}
      onClick={(e) => {
        if (e.target === ref.current) onClose();
      }}
    >
      {open && (
        <div className="inc-modal-body">
          <div className="inc-modal-head">
            <h2 id="inc-modal-title">{title}</h2>
            <button type="button" className="inc-btn inc-btn-ghost inc-btn-small" onClick={onClose}>
              Close
            </button>
          </div>
          {children}
        </div>
      )}
    </dialog>
  );
}
