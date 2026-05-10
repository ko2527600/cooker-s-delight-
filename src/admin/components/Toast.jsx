import React, { createContext, useContext, useState, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { HiCheckCircle, HiXCircle, HiInformationCircle, HiExclamationTriangle, HiXMark } from "react-icons/hi2";

const ToastContext = createContext({ showToast: () => {} });

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((message, type = "success") => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  }, []);

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const getIcon = (type) => {
    switch (type) {
      case "success": return <HiCheckCircle className="text-green-400" size={20} />;
      case "error": return <HiXCircle className="text-red-400" size={20} />;
      case "warning": return <HiExclamationTriangle className="text-yellow-400" size={20} />;
      case "info": return <HiInformationCircle className="text-blue-400" size={20} />;
      default: return null;
    }
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed bottom-8 left-8 z-[1000] flex flex-col gap-3 pointer-events-none">
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              initial={{ x: -100, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ opacity: 0, x: -20 }}
              className="pointer-events-auto bg-[#1a1a1a] border border-white/10 rounded-xl px-5 py-4 shadow-2xl flex items-center gap-3 min-w-[300px]"
            >
              {getIcon(toast.type)}
              <span className="text-sm font-medium text-white flex-1">{toast.message}</span>
              <button onClick={() => removeToast(toast.id)} className="text-white/20 hover:text-white transition-colors">
                <HiXMark size={16} />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => useContext(ToastContext);
