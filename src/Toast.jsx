import { useEffect } from "react";
import "./Toast.css";

export default function Toast({ message, type = "success", onClose }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 3500);

    return () => clearTimeout(timer);
  }, [message, onClose]);

  return (
    <div className={`toast toast-${type}`}>
      <span className="toast-icon">
        {type === "success" ? "✓" : "!"}
      </span>

      <span className="toast-message">{message}</span>

      <button className="toast-close" onClick={onClose}>
        ×
      </button>
    </div>
  );
}