import { motion } from 'motion/react';
import { FiInstagram, FiExternalLink } from 'react-icons/fi';
import { BsHeartFill, BsChatFill } from 'react-icons/bs';

const INSTAGRAM_POSTS = [
  {
    id: '1',
    url: 'https://images.unsplash.com/photo-1601050690597-df056fb352ba?auto=format&fit=crop&q=80&w=600',
    likes: '1.2k',
    comments: '45',
    link: 'https://www.instagram.com/cookersdelightgh/p/Blsu_y9ACW0/'
  },
  {
    id: '2',
    url: 'https://images.unsplash.com/photo-1627308595229-7830a5c91f9f?auto=format&fit=crop&q=80&w=600',
    likes: '850',
    comments: '32',
    link: 'https://www.instagram.com/cookersdelightgh/p/BlveArPgayk/'
  },
  {
    id: '3',
    url: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&q=80&w=600',
    likes: '2.1k',
    comments: '120',
    link: 'https://www.instagram.com/cookersdelightgh/p/BlvG6oBAIoT/'
  },
  {
    id: '4',
    url: 'https://images.unsplash.com/photo-1603131839084-2fd74ef1e47d?auto=format&fit=crop&q=80&w=600',
    likes: '940',
    comments: '28',
    link: 'https://www.instagram.com/cookersdelightgh/p/BmGQ-GohS08/'
  },
  {
    id: '5',
    url: 'https://images.unsplash.com/photo-1546241072-48010ad28c2c?auto=format&fit=crop&q=80&w=600',
    likes: '1.5k',
    comments: '64',
    link: 'https://www.instagram.com/cookersdelightgh/p/BmsVZj8hjKI/'
  },
  {
    id: '6',
    url: 'https://images.unsplash.com/photo-1561651823-34feb02250e4?auto=format&fit=crop&q=80&w=600',
    likes: '1.8k',
    comments: '92',
    link: 'https://www.instagram.com/cookersdelightgh/'
  }
];

export const InstagramFeed = () => {
  return (
    <section className="py-24 bg-brand-black relative overflow-hidden" id="social">
      <div className="container mx-auto px-6 relative z-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div>
            <motion.span 
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              className="text-brand-orange text-[10px] uppercase font-black tracking-[0.3em] mb-4 block"
            >
              Social Connection
            </motion.span>
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-white text-5xl md:text-6xl font-serif font-bold leading-tight"
            >
              @cookersdelightgh
            </motion.h2>
          </div>
          <motion.a
            href="https://www.instagram.com/cookersdelightgh/"
            target="_blank"
            rel="noopener noreferrer"
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            className="flex items-center gap-3 px-8 py-4 bg-brand-orange text-white rounded-sm text-[10px] uppercase font-black tracking-widest hover:bg-white hover:text-brand-orange transition-all group"
          >
            <FiInstagram size={20} />
            Follow Our Story
            <span className="opacity-0 group-hover:opacity-100 transition-all">
              <FiExternalLink size={16} />
            </span>
          </motion.a>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
          {INSTAGRAM_POSTS.map((post, index) => (
            <motion.a
              key={post.id}
              href={post.link}
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
              className="group relative aspect-square overflow-hidden"
            >
              <img 
                src={post.url} 
                alt="Instagram post" 
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                loading="lazy"
                decoding="async"
              />
              <div className="absolute inset-0 bg-brand-orange/80 opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col items-center justify-center gap-4">
                <div className="flex items-center gap-2 text-white font-bold">
                  <BsHeartFill size={20} />
                  <span>{post.likes}</span>
                </div>
                <div className="flex items-center gap-2 text-white font-bold">
                  <BsChatFill size={20} />
                  <span>{post.comments}</span>
                </div>
              </div>
            </motion.a>
          ))}
        </div>
      </div>
      
      {/* Background Accent */}
      <div className="absolute -top-24 -right-24 w-96 h-96 bg-brand-orange/5 blur-[120px] rounded-full pointer-events-none" />
    </section>
  );
};
