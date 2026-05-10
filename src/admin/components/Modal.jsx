import React from "react";
import { motion, AnimatePresence } from "motion/react";
import { HiXMark } from "react-icons/hi2";

const Modal = ({ isOpen, onClose, title, children, size = "md" }) => {
  const sizeClasses = {
    sm: "max-w-[400px]",
    md: "max-w-[640px]",
    lg: "max-w-[800px]"
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[900]"
          />
          <div className="fixed inset-0 z-[901] flex items-center justify-center p-6 pointer-events-none">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className={`w-full ${sizeClasses[size]} bg-[#111] border border-white/10 rounded-[24px] shadow-2xl pointer-events-auto overflow-hidden`}
            >
              <div className="flex justify-between items-center px-8 py-6 border-bottom border-white/5">
                <h3 className="text-xl font-bold text-white font-display">{title}</h3>
                <button onClick={onClose} className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white/40 hover:text-white transition-colors">
                  <HiXMark size={20} />
                </button>
              </div>
              <div className="px-8 py-6">
                {children}
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};

export default Modal;
