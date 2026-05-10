import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  HiOutlineShoppingBag, HiOutlineMapPin, HiOutlineClipboardDocumentCheck,
  HiOutlinePlus, HiOutlineMinus, HiOutlineTrash, HiOutlineCheckCircle,
  HiOutlineRocketLaunch, HiOutlineTruck, HiOutlineBuildingStorefront,
  HiOutlineCurrencyDollar, HiOutlineArrowRight, HiOutlineArrowLeft,
  HiOutlineStar, HiOutlineMagnifyingGlass, HiOutlineBanknotes, HiOutlineMap
} from 'react-icons/hi2';
import { toast } from 'react-hot-toast';
import { getImgUrl } from '../../utils/image';
import { useCustomer } from '../CustomerContext';
import api from '../../api/axios';

const PlaceOrder = () => {
  const navigate = useNavigate();
  const { customer, refreshCustomer } = useCustomer();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [menu, setMenu] = useState([]);
  const [branches, setBranches] = useState([]);
  const [categories, setCategories] = useState(['All']);
  const [activeCategory, setActiveCategory] = useState('All');
  const [search, setSearch] = useState('');

  // Cart State
  const [cart, setCart] = useState([]);
  
  // Order Details
  const [orderType, setOrderType] = useState('delivery'); // delivery | pickup
  const [deliveryAddress, setDeliveryAddress] = useState(null);
  const [selectedBranch, setSelectedBranch] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('cash'); // cash | momo
  const [note, setNote] = useState('');
  
  // Address Form
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [newAddress, setNewAddress] = useState({ label: 'Home', address: '', area: '', landmark: '', isDefault: false, latitude: null, longitude: null });

  const detectLocation = () => {
    if ("geolocation" in navigator) {
      toast.loading('Detecting location...', { id: 'location-toast' });
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setNewAddress(prev => ({
            ...prev,
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          }));
          toast.success('Location detected!', { id: 'location-toast' });
        },
        (error) => {
          toast.error('Failed to get location. Please enable location services.', { id: 'location-toast' });
        }
      );
    } else {
      toast.error('Geolocation is not supported by your browser');
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [menuRes, branchRes] = await Promise.all([
          api.get('/menu?available=true'),
          api.get('/branches')
        ]);
        setMenu(menuRes.data);
        setBranches(branchRes.data);
        const cats = ['All', ...new Set(menuRes.data.map(item => {
          const c = item.category?.trim();
          return c ? c.charAt(0).toUpperCase() + c.slice(1).toLowerCase() : 'Other';
        }))];
        setCategories(cats);
      } catch (err) {
        toast.error('Failed to load menu items');
      }
    };
    fetchData();
  }, []);

  const filteredMenu = useMemo(() => {
    return menu.filter(item => {
      const itemCat = item.category?.trim() ? item.category.trim().charAt(0).toUpperCase() + item.category.trim().slice(1).toLowerCase() : 'Other';
      const matchCat = activeCategory === 'All' || itemCat === activeCategory;
      const matchSearch = item.name.toLowerCase().includes(search.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [menu, activeCategory, search]);

  const subtotal = useMemo(() => {
    return cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  }, [cart]);

  const deliveryFee = orderType === 'delivery' ? 15 : 0;
  const total = subtotal + deliveryFee;
  const pointsToEarn = Math.floor(total / 10);

  const addToCart = (item) => {
    setCart(prev => {
      const existing = prev.find(i => i.id === item.id);
      if (existing) {
        return prev.map(i => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prev, { ...item, quantity: 1 }];
    });
  };

  const removeFromCart = (id) => {
    setCart(prev => {
      const existing = prev.find(i => i.id === id);
      if (existing.quantity === 1) {
        return prev.filter(i => i.id !== id);
      }
      return prev.map(i => i.id === id ? { ...i, quantity: i.quantity - 1 } : i);
    });
  };

  const getItemQuantity = (id) => {
    return cart.find(i => i.id === id)?.quantity || 0;
  };

  const handlePlaceOrder = async () => {
    if (orderType === 'delivery' && !deliveryAddress) return toast.error('Please select a delivery address');
    if (orderType === 'pickup' && !selectedBranch) return toast.error('Please select a branch for pickup');

    setLoading(true);
    try {
      const payload = {
        type: orderType,
        deliveryAddress: orderType === 'delivery' ? `${deliveryAddress.address}, ${deliveryAddress.area}` : null,
        branch: orderType === 'pickup' ? selectedBranch.name : null,
        items: cart.map(i => ({ 
          menuItemId: i.id, 
          quantity: i.quantity, 
          price: i.price,
          name: i.name 
        })),
        totalAmount: total,
        paymentMethod,
        note,
        latitude: orderType === 'delivery' && deliveryAddress ? deliveryAddress.latitude : null,
        longitude: orderType === 'delivery' && deliveryAddress ? deliveryAddress.longitude : null
      };
      
      const res = await api.post('/customers/orders', payload);
      setStep(4); // Success screen
      setCart([]);
      refreshCustomer();
      toast.success('Order placed successfully! 🚀');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to place order');
    } finally {
      setLoading(false);
    }
  };

  const saveNewAddress = async () => {
    if (!newAddress.address || !newAddress.area) return toast.error('Address and area are required');
    try {
      const res = await api.post('/customers/profile/addresses', newAddress);
      setDeliveryAddress(res.data);
      setShowAddressForm(false);
      refreshCustomer();
      toast.success('Address saved!');
    } catch (err) {
      toast.error('Failed to save address');
    }
  };

  return (
    <div className="max-w-7xl mx-auto">
      
      {/* Step Header */}
      {step < 4 && (
        <div className="mb-10">
          <div className="flex items-center justify-between max-w-2xl mx-auto relative px-4 sm:px-12">
            {/* Connector Lines */}
            <div className="absolute left-[15%] right-[15%] top-1/2 -translate-y-1/2 h-1 bg-white/5 z-0">
               <div className="h-full bg-brand-orange transition-all duration-500" style={{ width: step === 1 ? '0%' : step === 2 ? '50%' : '100%' }} />
            </div>
            
            {[
              { n: 1, label: 'Items', icon: HiOutlineShoppingBag },
              { n: 2, label: 'Delivery', icon: HiOutlineTruck },
              { n: 3, label: 'Review', icon: HiOutlineClipboardDocumentCheck }
            ].map(s => (
              <div key={s.n} className="flex flex-col items-center gap-3 relative z-10">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-300 ${
                  step === s.n ? 'bg-brand-orange text-white shadow-xl shadow-brand-orange/30 scale-110' :
                  step > s.n ? 'bg-green-500 text-white' : 'bg-[#1a1a1a] text-white/40 border border-white/10'
                }`}>
                  {step > s.n ? <HiOutlineCheckCircle size={24} /> : <s.icon size={24} />}
                </div>
                <span className={`text-[10px] font-black uppercase tracking-widest ${step >= s.n ? 'text-white' : 'text-white/20'}`}>
                  {s.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main Flow Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        
        {/* Left Column: Flow Content */}
        <div className="lg:col-span-8 space-y-8">
          
          <AnimatePresence mode="wait">
            
            {/* STEP 1: CHOOSE ITEMS */}
            {step === 1 && (
              <motion.div 
                key="step1"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-8"
              >
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
                   <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar w-full sm:w-auto">
                      {categories.map(cat => (
                        <button 
                          key={cat}
                          onClick={() => setActiveCategory(cat)}
                          className={`px-6 py-2.5 rounded-xl font-bold text-xs uppercase tracking-widest transition-all whitespace-nowrap ${
                            activeCategory === cat ? 'bg-brand-orange text-white shadow-lg' : 'bg-white/5 text-white/40 hover:text-white'
                          }`}
                        >
                          {cat}
                        </button>
                      ))}
                   </div>
                   <div className="relative w-full sm:w-64">
                      <HiOutlineMagnifyingGlass className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={18} />
                      <input 
                        type="text" 
                        placeholder="Search menu..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="w-full bg-[#141414] border border-white/10 rounded-xl pl-12 pr-4 py-3 text-sm focus:border-brand-orange transition-all"
                      />
                   </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                   {filteredMenu.map(item => (
                     <div key={item.id} className={`bg-[#141414] border-2 rounded-[2rem] overflow-hidden transition-all group ${getItemQuantity(item.id) > 0 ? 'border-brand-orange' : 'border-white/5'}`}>
                         <div className="h-48 relative overflow-hidden bg-white/5">
                            <img 
                              src={item.image ? getImgUrl(item.image) : '/assets/placeholder.jpg'} 
                              alt={item.name} 
                              onError={(e) => { e.currentTarget.src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400'; }}
                              className="w-full h-full object-cover transition-transform group-hover:scale-110" 
                            />
                           <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-md text-white font-black px-3 py-1.5 rounded-full text-xs">
                              ₵{item.price}
                           </div>
                        </div>
                        <div className="p-6">
                           <h4 className="font-bold text-white mb-2">{item.name}</h4>
                           <p className="text-white/40 text-xs line-clamp-2 mb-6 min-h-[32px]">{item.description}</p>
                           
                           <div className="flex items-center justify-between">
                              {getItemQuantity(item.id) > 0 ? (
                                <div className="flex items-center gap-4 bg-brand-orange/10 rounded-2xl p-1 px-2 border border-brand-orange/20">
                                   <button onClick={() => removeFromCart(item.id)} className="w-8 h-8 bg-brand-orange rounded-xl flex items-center justify-center text-white"><HiOutlineMinus /></button>
                                   <span className="font-black text-brand-orange">{getItemQuantity(item.id)}</span>
                                   <button onClick={() => addToCart(item)} className="w-8 h-8 bg-brand-orange rounded-xl flex items-center justify-center text-white"><HiOutlinePlus /></button>
                                </div>
                              ) : (
                                <button 
                                  onClick={() => addToCart(item)}
                                  className="w-full bg-white/5 hover:bg-brand-orange py-3 rounded-2xl text-white font-black text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2"
                                >
                                  <HiOutlinePlus size={16} /> ADD TO ORDER
                                </button>
                              )}
                           </div>
                        </div>
                     </div>
                   ))}
                </div>
              </motion.div>
            )}

            {/* STEP 2: DELIVERY DETAILS */}
            {step === 2 && (
              <motion.div 
                key="step2"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-8"
              >
                <div className="flex bg-[#141414] border border-white/5 p-1.5 rounded-2xl w-full sm:w-max">
                   {[
                     { id: 'delivery', label: 'Delivery', icon: HiOutlineTruck },
                     { id: 'pickup', label: 'Pickup', icon: HiOutlineBuildingStorefront }
                   ].map(t => (
                     <button 
                        key={t.id}
                        onClick={() => setOrderType(t.id)}
                        className={`flex items-center gap-3 px-8 py-3 rounded-xl font-bold text-sm transition-all ${
                          orderType === t.id ? 'bg-brand-orange text-white shadow-lg' : 'text-white/40 hover:text-white'
                        }`}
                     >
                       <t.icon size={20} /> {t.label}
                     </button>
                   ))}
                </div>

                {orderType === 'delivery' ? (
                  <div className="space-y-6">
                     <h3 className="text-xl font-black text-white uppercase">Delivery Address</h3>
                     <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {customer?.addresses?.map(addr => (
                          <div 
                            key={addr.id} 
                            onClick={() => setDeliveryAddress(addr)}
                            className={`p-6 bg-[#141414] rounded-2xl border-2 transition-all cursor-pointer relative group ${
                              deliveryAddress?.id === addr.id ? 'border-brand-orange shadow-lg shadow-brand-orange/10' : 'border-white/5 hover:border-white/10'
                            }`}
                          >
                             <div className="flex items-center gap-3 mb-3">
                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${deliveryAddress?.id === addr.id ? 'bg-brand-orange text-white' : 'bg-white/5 text-white/40'}`}>
                                   <HiOutlineMapPin size={18} />
                                </div>
                                <span className="font-bold text-sm">{addr.label}</span>
                                {deliveryAddress?.id === addr.id && <HiOutlineCheckCircle className="ml-auto text-brand-orange" size={20} />}
                             </div>
                             <p className="text-xs text-white/40 leading-relaxed">{addr.address}, {addr.area}</p>
                          </div>
                        ))}
                        <button 
                          onClick={() => setShowAddressForm(true)}
                          className="p-6 bg-white/5 border-2 border-dashed border-white/10 rounded-2xl flex flex-col items-center justify-center gap-3 text-white/40 hover:text-white hover:border-white/20 transition-all"
                        >
                           <HiOutlinePlus size={32} />
                           <span className="font-bold text-xs uppercase tracking-widest">Add New Address</span>
                        </button>
                     </div>
                  </div>
                ) : (
                  <div className="space-y-6">
                     <h3 className="text-xl font-black text-white uppercase">Select Branch</h3>
                     <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {branches.map(branch => (
                          <div 
                            key={branch.id} 
                            onClick={() => branch.isOpen && setSelectedBranch(branch)}
                            className={`p-6 bg-[#141414] rounded-2xl border-2 transition-all relative ${
                              !branch.isOpen ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer group'
                            } ${
                              selectedBranch?.id === branch.id ? 'border-brand-orange shadow-lg shadow-brand-orange/10' : 'border-white/5 hover:border-white/10'
                            }`}
                          >
                             <div className="flex items-center gap-3 mb-3">
                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${selectedBranch?.id === branch.id ? 'bg-brand-orange text-white' : 'bg-white/5 text-white/40'}`}>
                                   <HiOutlineBuildingStorefront size={18} />
                                </div>
                                <span className="font-bold text-sm">{branch.name}</span>
                                {branch.isOpen ? (
                                   <span className="ml-auto text-[8px] bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full uppercase font-bold">Open</span>
                                ) : (
                                   <span className="ml-auto text-[8px] bg-red-500/20 text-red-400 px-2 py-0.5 rounded-full uppercase font-bold">Closed</span>
                                )}
                             </div>
                             <p className="text-xs text-white/40">{branch.area}</p>
                          </div>
                        ))}
                     </div>
                  </div>
                )}

                <div className="space-y-6">
                   <h3 className="text-xl font-black text-white uppercase">Payment Method</h3>
                   <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {[
                        { id: 'cash', label: orderType === 'delivery' ? 'Cash on Delivery' : 'Pay at Branch', icon: HiOutlineBanknotes },
                        { id: 'momo', label: 'Mobile Money', icon: HiOutlineCurrencyDollar }
                      ].map(p => (
                        <div 
                          key={p.id}
                          onClick={() => setPaymentMethod(p.id)}
                          className={`p-6 bg-[#141414] rounded-2xl border-2 transition-all cursor-pointer group flex items-center gap-4 ${
                            paymentMethod === p.id ? 'border-brand-orange' : 'border-white/5'
                          }`}
                        >
                           <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${paymentMethod === p.id ? 'bg-brand-orange text-white' : 'bg-white/5 text-white/40'}`}>
                              <p.icon size={22} />
                           </div>
                           <div>
                              <p className="font-bold text-sm">{p.label}</p>
                              {p.id === 'momo' && <p className="text-[10px] text-brand-orange font-bold uppercase mt-0.5">Pay to: 0243379412</p>}
                           </div>
                           {paymentMethod === p.id && <HiOutlineCheckCircle className="ml-auto text-brand-orange" size={20} />}
                        </div>
                      ))}
                   </div>
                </div>

                <div className="space-y-4">
                   <h3 className="text-xl font-black text-white uppercase">Special Instructions</h3>
                   <textarea 
                     placeholder="Any allergies or special requests? (Optional)"
                     value={note}
                     onChange={e => setNote(e.target.value)}
                     className="w-full bg-[#141414] border border-white/5 rounded-2xl p-6 text-sm text-white focus:border-brand-orange transition-all min-h-[120px] outline-none"
                   />
                </div>
              </motion.div>
            )}

            {/* STEP 3: REVIEW & PLACE */}
            {step === 3 && (
              <motion.div 
                key="step3"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-8"
              >
                <div className="bg-[#141414] border border-white/5 rounded-[2.5rem] p-8 space-y-8">
                   <div className="flex justify-between items-center pb-6 border-b border-white/5">
                      <h3 className="text-2xl font-black text-white tracking-tight uppercase">Order Summary</h3>
                      <button onClick={() => setStep(1)} className="text-brand-orange text-xs font-bold uppercase hover:underline">Edit Items</button>
                   </div>

                   <div className="space-y-4">
                      {cart.map(item => (
                        <div key={item.id} className="flex justify-between items-center text-sm">
                           <div className="flex items-center gap-3">
                              <span className="w-8 h-8 bg-white/5 rounded-lg flex items-center justify-center text-xs font-black text-brand-orange">{item.quantity}x</span>
                              <span className="font-bold text-white/80">{item.name}</span>
                           </div>
                           <span className="font-bold text-white">₵{item.price * item.quantity}</span>
                        </div>
                      ))}
                   </div>

                   <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-6 border-t border-white/5">
                      <div className="space-y-4">
                         <div className="flex flex-col gap-1">
                            <span className="text-[10px] font-bold text-white/20 uppercase tracking-widest">Type / Method</span>
                            <span className="font-bold text-white flex items-center gap-2 capitalize">
                               {orderType} • {paymentMethod}
                            </span>
                         </div>
                         <div className="flex flex-col gap-1">
                            <span className="text-[10px] font-bold text-white/20 uppercase tracking-widest">Destination</span>
                            <span className="font-bold text-white">
                               {orderType === 'delivery' ? `${deliveryAddress?.address}, ${deliveryAddress?.area}` : selectedBranch?.name}
                            </span>
                         </div>
                      </div>
                      <div className="space-y-4 sm:text-right">
                         <div className="flex flex-col gap-1">
                            <span className="text-[10px] font-bold text-white/20 uppercase tracking-widest">Estimated Time</span>
                            <span className="font-bold text-green-400">{orderType === 'delivery' ? '30-45 mins' : '15-20 mins'}</span>
                         </div>
                         <div className="flex flex-col gap-1">
                            <span className="text-[10px] font-bold text-white/20 uppercase tracking-widest">Loyalty Reward</span>
                            <span className="font-bold text-yellow-400 flex items-center gap-2 sm:justify-end">
                               <HiOutlineStar /> +{pointsToEarn} Points
                            </span>
                         </div>
                      </div>
                   </div>

                   {note && (
                     <div className="p-4 bg-white/5 rounded-xl italic text-xs text-white/40">
                        "{note}"
                     </div>
                   )}
                </div>

                <div className="flex gap-4">
                   <button onClick={() => setStep(2)} className="flex-1 bg-white/5 hover:bg-white/10 text-white font-black py-4 rounded-2xl transition-all flex items-center justify-center gap-2">
                      <HiOutlineArrowLeft /> BACK
                   </button>
                   <button 
                     onClick={handlePlaceOrder}
                     disabled={loading}
                     className="flex-[2] bg-brand-orange hover:bg-brand-orange/90 text-white font-black py-4 rounded-2xl shadow-xl shadow-brand-orange/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                   >
                      {loading ? 'PROCESSING...' : (
                        <>
                          CONFIRM & PLACE ORDER ₵{total}
                          <HiOutlineArrowRight />
                        </>
                      )}
                   </button>
                </div>
              </motion.div>
            )}

            {/* STEP 4: SUCCESS SCREEN */}
            {step === 4 && (
              <motion.div 
                key="step4"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="max-w-xl mx-auto text-center space-y-8 py-10"
              >
                <div className="w-24 h-24 bg-green-500/20 text-green-400 rounded-full flex items-center justify-center mx-auto mb-8 animate-bounce">
                   <HiOutlineRocketLaunch size={48} />
                </div>
                <div>
                   <h2 className="text-4xl font-black text-white tracking-tight uppercase mb-2">ORDER PLACED!</h2>
                   <p className="text-white/40 font-medium italic">"Mouthwatering food is on its way to you."</p>
                </div>
                
                <div className="bg-[#141414] border border-white/5 rounded-[2rem] p-8 space-y-4">
                   <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Estimated Delivery Time</p>
                   <p className="text-3xl font-black text-brand-orange">{orderType === 'delivery' ? '45 MINS' : '20 MINS'}</p>
                   <p className="text-xs text-white/20">We'll notify you as soon as the kitchen starts preparing!</p>
                </div>

                <div className="flex flex-col gap-4">
                   <button 
                     onClick={() => navigate('/portal/orders')}
                     className="w-full bg-brand-orange text-white font-black py-4 rounded-2xl shadow-xl shadow-brand-orange/20 hover:scale-105 transition-all"
                   >
                     TRACK MY ORDER
                   </button>
                   <button 
                     onClick={() => navigate('/portal/dashboard')}
                     className="w-full bg-white/5 hover:bg-white/10 text-white font-black py-4 rounded-2xl transition-all"
                   >
                     BACK TO DASHBOARD
                   </button>
                </div>
              </motion.div>
            )}

          </AnimatePresence>

        </div>

        {/* Right Column: Order Summary / Cart */}
        {step < 4 && (
          <div className="lg:col-span-4">
            <div className="bg-[#141414] border border-white/5 rounded-[2.5rem] p-8 sticky top-24">
              <h3 className="text-lg font-black text-white mb-8 flex items-center gap-3">
                <HiOutlineShoppingBag className="text-brand-orange" />
                MY ORDER
              </h3>

              <div className="space-y-6 max-h-[40vh] overflow-y-auto custom-scrollbar pr-2">
                 {cart.length > 0 ? cart.map(item => (
                   <div key={item.id} className="flex justify-between items-center group">
                      <div className="flex gap-4">
                         <div className="w-10 h-10 rounded-lg overflow-hidden shrink-0">
                            <img src={item.image} alt="" className="w-full h-full object-cover" />
                         </div>
                         <div>
                            <p className="text-sm font-bold text-white/80">{item.name}</p>
                            <p className="text-[10px] text-white/40 font-black">₵{item.price} x {item.quantity}</p>
                         </div>
                      </div>
                      <div className="flex items-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                         <button onClick={() => removeFromCart(item.id)} className="w-6 h-6 bg-white/5 rounded-full flex items-center justify-center text-white/40 hover:text-red-400"><HiOutlineMinus size={12} /></button>
                         <button onClick={() => addToCart(item)} className="w-6 h-6 bg-white/5 rounded-full flex items-center justify-center text-white/40 hover:text-green-400"><HiOutlinePlus size={12} /></button>
                      </div>
                   </div>
                 )) : (
                   <div className="text-center py-10">
                      <HiOutlineShoppingBag size={48} className="mx-auto text-white/5 mb-4" />
                      <p className="text-xs font-bold text-white/20 uppercase tracking-widest">Cart is empty</p>
                   </div>
                 )}
              </div>

              <div className="mt-8 pt-8 border-t border-white/5 space-y-4">
                 <div className="flex justify-between text-xs font-bold uppercase tracking-widest">
                    <span className="text-white/40">Subtotal</span>
                    <span className="text-white">₵{subtotal}</span>
                 </div>
                 <div className="flex justify-between text-xs font-bold uppercase tracking-widest">
                    <span className="text-white/40">Delivery Fee</span>
                    <span className="text-white">₵{deliveryFee}</span>
                 </div>
                 <div className="flex justify-between text-lg font-black uppercase tracking-tight pt-2">
                    <span className="text-white/60">Total</span>
                    <span className="text-brand-orange font-black">₵{total}</span>
                 </div>
              </div>

              {step === 1 && (
                <button 
                  disabled={cart.length === 0}
                  onClick={() => setStep(2)}
                  className="w-full bg-brand-orange hover:bg-brand-orange/90 text-white font-black py-4 rounded-2xl shadow-xl shadow-brand-orange/20 transition-all mt-8 flex items-center justify-center gap-2 disabled:opacity-50 active:scale-95"
                >
                  CONTINUE TO DELIVERY
                  <HiOutlineArrowRight />
                </button>
              )}
              {step === 2 && (
                <button 
                  disabled={orderType === 'delivery' ? !deliveryAddress : !selectedBranch}
                  onClick={() => setStep(3)}
                  className="w-full bg-brand-orange hover:bg-brand-orange/90 text-white font-black py-4 rounded-2xl shadow-xl shadow-brand-orange/20 transition-all mt-8 flex items-center justify-center gap-2 disabled:opacity-50 active:scale-95"
                >
                  REVIEW ORDER
                  <HiOutlineArrowRight />
                </button>
              )}
            </div>
          </div>
        )}

      </div>

      {/* Address Modal */}
      <AnimatePresence>
        {showAddressForm && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setShowAddressForm(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-md"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-lg bg-[#141414] border border-white/10 rounded-[2.5rem] p-8 space-y-6"
            >
               <h3 className="text-xl font-black text-white uppercase">Add New Address</h3>
               
               <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-2">
                     {['Home', 'Work', 'Other'].map(l => (
                       <button 
                        key={l}
                        onClick={() => setNewAddress({...newAddress, label: l})}
                        className={`py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${
                          newAddress.label === l ? 'bg-brand-orange border-brand-orange text-white' : 'bg-white/5 border-white/10 text-white/40 hover:text-white'
                        }`}
                       >
                         {l}
                       </button>
                     ))}
                  </div>

                  <div className="space-y-2">
                     <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest ml-1">Street Address</label>
                     <textarea 
                        value={newAddress.address}
                        onChange={e => setNewAddress({...newAddress, address: e.target.value})}
                        placeholder="House number, street name..."
                        className="w-full bg-black/30 border border-white/5 rounded-xl p-4 text-sm focus:border-brand-orange outline-none transition-all"
                     />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                       <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest ml-1">Area / Neighborhood</label>
                       <input 
                          type="text"
                          value={newAddress.area}
                          onChange={e => setNewAddress({...newAddress, area: e.target.value})}
                          placeholder="e.g. East Legon"
                          className="w-full bg-black/30 border border-white/5 rounded-xl p-4 text-sm focus:border-brand-orange outline-none transition-all"
                       />
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest ml-1">Landmark</label>
                       <input 
                          type="text"
                          value={newAddress.landmark}
                          onChange={e => setNewAddress({...newAddress, landmark: e.target.value})}
                          placeholder="e.g. Near KFC"
                          className="w-full bg-black/30 border border-white/5 rounded-xl p-4 text-sm focus:border-brand-orange outline-none transition-all"
                       />
                    </div>
                  </div>

                  <div className="pt-2">
                     <button 
                        onClick={detectLocation}
                        className="w-full bg-white/5 hover:bg-white/10 border border-white/10 text-brand-orange font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2 text-sm uppercase tracking-widest"
                     >
                        <HiOutlineMap size={18} />
                        {newAddress.latitude ? "Update Location" : "Detect My Location"}
                     </button>
                  </div>

                  {newAddress.latitude && newAddress.longitude && (
                     <div className="w-full h-32 rounded-xl overflow-hidden border border-brand-orange/30">
                        <iframe 
                           width="100%" 
                           height="100%" 
                           style={{ border: 0 }} 
                           loading="lazy" 
                           allowFullScreen 
                           src={`https://www.google.com/maps?q=${newAddress.latitude},${newAddress.longitude}&hl=es;z=14&output=embed`}
                        ></iframe>
                     </div>
                  )}
               </div>

               <div className="flex gap-4 pt-4">
                  <button onClick={() => setShowAddressForm(false)} className="flex-1 py-4 text-xs font-black uppercase tracking-widest text-white/40 hover:text-white">Cancel</button>
                  <button onClick={saveNewAddress} className="flex-1 bg-brand-orange text-white font-black py-4 rounded-2xl shadow-xl shadow-brand-orange/20">SAVE ADDRESS</button>
               </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default PlaceOrder;
