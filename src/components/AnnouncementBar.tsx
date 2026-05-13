import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { HiXMark } from 'react-icons/hi2';
import { useApi } from '../hooks/useApi';
import { announcementApi } from '../lib/api';
import type { TIAnnouncement } from '../types';

export default function AnnouncementBar() {
  const { data, loading } = useApi<TIAnnouncement[]>(() => announcementApi.getActive());
  const announcement = data?.[0] ?? null;
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (!loading && announcement) {
      const dismissed = localStorage.getItem(`ann-dismissed-${announcement.id}`);
      if (!dismissed) setIsVisible(true);
    }
  }, [announcement, loading]);

  const dismiss = () => {
    if (announcement) localStorage.setItem(`ann-dismissed-${announcement.id}`, 'true');
    setIsVisible(false);
  };

  if (loading || !announcement || !isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ height: 0, opacity: 0 }}
        animate={{ height: 'auto', opacity: 1 }}
        exit={{ height: 0, opacity: 0 }}
        className="py-2 px-6 relative z-[60] overflow-hidden"
        style={{ backgroundColor: announcement.background_color, color: announcement.text_color }}
      >
        <div className="container mx-auto text-center font-body text-xs md:text-sm font-bold tracking-wide">
          {announcement.link ? (
            <a href={announcement.link} target="_blank" rel="noopener noreferrer" className="hover:underline">
              {announcement.message}
            </a>
          ) : (
            announcement.message
          )}
        </div>
        <button
          onClick={dismiss}
          className="absolute right-4 top-1/2 -translate-y-1/2 hover:scale-110 transition-transform"
        >
          <HiXMark size={20} />
        </button>
      </motion.div>
    </AnimatePresence>
  );
}
