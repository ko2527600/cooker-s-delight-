import { motion, AnimatePresence } from 'motion/react';
import { HiCheckCircle } from 'react-icons/hi2';

export interface ToastMessage {
  id: number;
  message: string;
  type: 'success' | 'info';
}

interface Props {
  toasts: ToastMessage[];
  removeToast: (id: number) => void;
}

export default function Toast({ toasts, removeToast }: Props) {
  return (
    <div className="fixed bottom-24 left-8 z-[200] flex flex-col gap-3 pointer-events-none">
      <AnimatePresence>
        {toasts.map(toast => (
          <motion.div
            key={toast.id}
            initial={{ x: -100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -100, opacity: 0 }}
            onClick={() => removeToast(toast.id)}
            className="pointer-events-auto bg-brand-black/90 backdrop-blur-xl border border-white/10 px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 min-w-[200px]"
          >
            <div className="w-8 h-8 rounded-full bg-brand-orange/20 flex items-center justify-center text-brand-orange">
              <HiCheckCircle size={20} />
            </div>
            <span className="font-body text-sm font-bold text-white">{toast.message}</span>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
