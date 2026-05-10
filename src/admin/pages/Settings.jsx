import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import { 
  HiOutlineUser, HiLockClosed, HiOutlineEye, HiOutlineEyeSlash,
  HiOutlineBuildingOffice2, HiOutlineTrash, HiOutlineExclamationTriangle
} from "react-icons/hi2";
import api from "../../api/axios";
import { useToast } from "../components/Toast";
import ConfirmDialog from "../components/ConfirmDialog";

const Settings = () => {
  const { showToast } = useToast();
  const [admin, setAdmin] = useState({ name: "", email: "" });
  const [config, setConfig] = useState({
    restaurantName: "", tagline: "", phone: "", whatsapp: "",
    instagram: "", facebook: "", openingHours: "", email: ""
  });
  
  const [passwords, setPasswords] = useState({ current: "", new: "", confirm: "" });
  const [showPass, setShowPass] = useState({ current: false, new: false });
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState({ profile: false, config: false, pass: false, clear: false });

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("cd_admin_user") || "{}");
    setAdmin({ name: user.name || "", email: user.email || "" });

    const fetchConfig = async () => {
      try {
        const response = await api.get("/config");
        setConfig(response.data);
      } catch (err) {
        showToast("Failed to load business info", "error");
      }
    };
    fetchConfig();
  }, [showToast]);

  const handleProfileSave = async (e) => {
    e.preventDefault();
    setLoading({ ...loading, profile: true });
    try {
      const response = await api.put("/auth/me", { name: admin.name });
      localStorage.setItem("cd_admin_user", JSON.stringify(response.data));
      showToast("Profile updated");
    } catch (err) {
      showToast("Update failed", "error");
    } finally {
      setLoading({ ...loading, profile: false });
    }
  };

  const handleConfigSave = async (e) => {
    e.preventDefault();
    setLoading({ ...loading, config: true });
    try {
      await api.put("/config", config);
      showToast("Business information updated");
    } catch (err) {
      showToast("Save failed", "error");
    } finally {
      setLoading({ ...loading, config: false });
    }
  };

  const handlePasswordSave = async (e) => {
    e.preventDefault();
    if (passwords.new !== passwords.confirm) return showToast("Passwords do not match", "warning");
    
    setLoading({ ...loading, pass: true });
    try {
      await api.post("/auth/change-password", {
        currentPassword: passwords.current,
        newPassword: passwords.new
      });
      showToast("Password updated successfully");
      setPasswords({ current: "", new: "", confirm: "" });
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to update password", "error");
    } finally {
      setLoading({ ...loading, pass: false });
    }
  };

  const handleClearOrders = async () => {
    setLoading({ ...loading, clear: true });
    try {
      await api.delete("/orders/all");
      showToast("All orders cleared", "success");
      setShowConfirm(false);
    } catch (err) {
      showToast("Failed to clear orders", "error");
    } finally {
      setLoading({ ...loading, clear: false });
    }
  };

  const getStrength = (pass) => {
    if (!pass) return { label: "", color: "bg-white/5", width: "0%" };
    let score = 0;
    if (pass.length > 6) score++;
    if (pass.length > 10) score++;
    if (/[A-Z]/.test(pass)) score++;
    if (/[0-9]/.test(pass)) score++;
    if (/[^A-Za-z0-9]/.test(pass)) score++;

    if (score < 3) return { label: "Weak", color: "bg-red-500", width: "33%" };
    if (score < 5) return { label: "Fair", color: "bg-yellow-500", width: "66%" };
    return { label: "Strong", color: "bg-green-500", width: "100%" };
  };

  const strength = getStrength(passwords.new);

  return (
    <div className="max-w-4xl mx-auto space-y-12 pb-20">
      <h1 className="text-3xl font-display font-bold text-white">Settings</h1>

      {/* Account Settings */}
      <div className="bg-[#1a1a1a] border border-white/5 rounded-2xl overflow-hidden">
        <div className="p-8 border-b border-white/5">
          <h3 className="text-xl font-bold text-white flex items-center gap-3">
            <HiOutlineUser className="text-brand-orange" /> Account Settings
          </h3>
        </div>
        <div className="p-8 space-y-8">
           <div className="flex flex-col items-center gap-4">
              <div className="w-20 h-20 rounded-full bg-[#EC4824] flex items-center justify-center text-2xl font-bold text-white">
                {admin.name.charAt(0)}
              </div>
              <button disabled className="text-[10px] font-bold text-white/20 uppercase tracking-widest cursor-not-allowed">Upload Photo</button>
           </div>

           <form onSubmit={handleProfileSave} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                   <label className="text-[10px] font-bold text-white/20 uppercase tracking-widest ml-1">Display Name</label>
                   <input value={admin.name} onChange={e => setAdmin({ ...admin, name: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-3 text-white outline-none focus:border-brand-orange" />
                </div>
                <div className="space-y-2 opacity-50">
                   <label className="text-[10px] font-bold text-white/20 uppercase tracking-widest ml-1">Email (Immutable)</label>
                   <input disabled value={admin.email} className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-3 text-white/40 cursor-not-allowed" />
                </div>
              </div>
              <button type="submit" className="bg-[#EC4824] text-white px-8 py-3 rounded-xl font-bold text-sm transition-all hover:scale-105">
                {loading.profile ? "Updating..." : "Save Changes"}
              </button>
           </form>

           <div className="h-[1px] bg-white/5" />

           <form onSubmit={handlePasswordSave} className="space-y-6">
              <h4 className="text-lg font-bold text-white">Change Password</h4>
              <div className="space-y-4">
                 <div className="relative">
                    <label className="text-[10px] font-bold text-white/20 uppercase tracking-widest block mb-2">Current Password</label>
                    <input required type={showPass.current ? "text" : "password"} value={passwords.current} onChange={e => setPasswords({ ...passwords, current: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-3 text-white outline-none" />
                    <button type="button" onClick={() => setShowPass({ ...showPass, current: !showPass.current })} className="absolute right-4 bottom-3.5 text-white/20">
                      {showPass.current ? <HiOutlineEyeSlash size={20} /> : <HiOutlineEye size={20} />}
                    </button>
                 </div>

                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="relative">
                       <label className="text-[10px] font-bold text-white/20 uppercase tracking-widest block mb-2">New Password</label>
                       <input required type={showPass.new ? "text" : "password"} value={passwords.new} onChange={e => setPasswords({ ...passwords, new: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-3 text-white outline-none" />
                       <button type="button" onClick={() => setShowPass({ ...showPass, new: !showPass.new })} className="absolute right-4 bottom-3.5 text-white/20">
                         {showPass.new ? <HiOutlineEyeSlash size={20} /> : <HiOutlineEye size={20} />}
                       </button>
                       <div className="mt-2 h-1 w-full bg-white/5 rounded-full overflow-hidden">
                          <div className={`h-full transition-all duration-500 ${strength.color}`} style={{ width: strength.width }} />
                       </div>
                       <p className="text-[8px] font-bold uppercase tracking-widest mt-1 opacity-40">{strength.label}</p>
                    </div>
                    <div>
                       <label className="text-[10px] font-bold text-white/20 uppercase tracking-widest block mb-2">Confirm New Password</label>
                       <input required type="password" value={passwords.confirm} onChange={e => setPasswords({ ...passwords, confirm: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-3 text-white outline-none" />
                       {passwords.new && passwords.confirm && passwords.new === passwords.confirm && (
                         <p className="text-[8px] font-bold text-green-500 uppercase tracking-widest mt-2">✓ Passwords match</p>
                       )}
                    </div>
                 </div>
              </div>
              <button type="submit" className="bg-white/5 hover:bg-white/10 text-white px-8 py-3 rounded-xl font-bold text-sm transition-all">
                 {loading.pass ? "Processing..." : "Update Password"}
              </button>
           </form>
        </div>
      </div>

      {/* Business Information */}
      <div className="bg-[#1a1a1a] border border-white/5 rounded-2xl overflow-hidden">
        <div className="p-8 border-b border-white/5">
          <h3 className="text-xl font-bold text-white flex items-center gap-3">
            <HiOutlineBuildingOffice2 className="text-brand-orange" /> Business Information
          </h3>
          <p className="text-xs text-white/20 font-bold uppercase tracking-widest mt-1 ml-9">This updates info shown across the website</p>
        </div>
        <form onSubmit={handleConfigSave} className="p-8 space-y-6">
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                 <label className="text-[10px] font-bold text-white/20 uppercase tracking-widest ml-1">Restaurant Name</label>
                 <input value={config.restaurantName} onChange={e => setConfig({ ...config, restaurantName: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-3 text-white outline-none" />
              </div>
              <div className="space-y-2">
                 <label className="text-[10px] font-bold text-white/20 uppercase tracking-widest ml-1">Tagline</label>
                 <input value={config.tagline} onChange={e => setConfig({ ...config, tagline: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-3 text-white outline-none" />
              </div>
              <div className="space-y-2">
                 <label className="text-[10px] font-bold text-white/20 uppercase tracking-widest ml-1">Phone Number</label>
                 <input value={config.phone} onChange={e => setConfig({ ...config, phone: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-3 text-white outline-none" />
              </div>
              <div className="space-y-2">
                 <label className="text-[10px] font-bold text-white/20 uppercase tracking-widest ml-1">WhatsApp</label>
                 <input value={config.whatsapp} onChange={e => setConfig({ ...config, whatsapp: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-3 text-white outline-none" />
              </div>
              <div className="space-y-2">
                 <label className="text-[10px] font-bold text-white/20 uppercase tracking-widest ml-1">Instagram Handle</label>
                 <div className="relative">
                    <span className="absolute left-5 top-3.5 text-white/20">@</span>
                    <input value={config.instagram} onChange={e => setConfig({ ...config, instagram: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-5 py-3 text-white outline-none" />
                 </div>
              </div>
              <div className="space-y-2">
                 <label className="text-[10px] font-bold text-white/20 uppercase tracking-widest ml-1">Facebook Page</label>
                 <input value={config.facebook} onChange={e => setConfig({ ...config, facebook: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-3 text-white outline-none" />
              </div>
              <div className="space-y-2">
                 <label className="text-[10px] font-bold text-white/20 uppercase tracking-widest ml-1">Opening Hours</label>
                 <input value={config.openingHours} onChange={e => setConfig({ ...config, openingHours: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-3 text-white outline-none" />
              </div>
              <div className="space-y-2">
                 <label className="text-[10px] font-bold text-white/20 uppercase tracking-widest ml-1">Contact Email</label>
                 <input value={config.email} onChange={e => setConfig({ ...config, email: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-3 text-white outline-none" />
              </div>
           </div>
           <button type="submit" className="bg-[#EC4824] text-white px-8 py-3 rounded-xl font-bold text-sm transition-all hover:scale-105">
              {loading.config ? "Saving..." : "Save Business Profile"}
           </button>
        </form>
      </div>

      {/* Danger Zone */}
      <div className="bg-red-500/[0.03] border border-red-500/20 rounded-2xl overflow-hidden p-8">
        <h3 className="text-xl font-bold text-red-500 flex items-center gap-3 mb-6">
          <HiOutlineExclamationTriangle /> Danger Zone
        </h3>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
           <div>
              <p className="text-white font-bold mb-1">Clear All Orders</p>
              <p className="text-xs text-white/40 max-w-md">Wipe the entire order history. This is irreversible and will reset your analytics counters for the current period.</p>
           </div>
           <button 
            onClick={() => setShowConfirm(true)}
            className="px-6 py-3 border border-red-500/40 text-red-500 font-bold rounded-xl hover:bg-red-500 hover:text-white transition-all text-sm whitespace-nowrap"
           >
             Clear All Orders
           </button>
        </div>
      </div>

      <ConfirmDialog 
        isOpen={showConfirm} 
        onClose={() => setShowConfirm(false)} 
        onConfirm={handleClearOrders}
        title="Clear All Orders"
        message="This will permanently delete ALL orders from the database. This cannot be undone. Are you absolutely sure?"
        danger={true}
        confirmLabel="Yes, Delete Everything"
      />
    </div>
  );
};

export default Settings;
