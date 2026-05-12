import React, { useState, useEffect, useCallback } from 'react';
import {
  HiBuildingStorefront, HiCog6Tooth, HiClock, HiClipboardDocumentList,
  HiCreditCard, HiBell, HiPaintBrush, HiExclamationTriangle, HiEye, HiEyeSlash,
} from 'react-icons/hi2';
import { cdSettingsApi, statusesApi, prepTimesApi, menuItemsApi } from '../api';
import { Card, Field, Toggle, SaveBar, Spinner, inputClass, selectClass } from '../components/ui';

// ─── Types ────────────────────────────────────────────────────────────────────
interface OrderStatus {
  status_id: number;
  status_name: string;
  status_color: string;
  notify_customer: boolean;
  sort_order?: number;
}

interface MenuItem {
  menu_id: number;
  menu_name: string;
}

type SettingsMap = Record<string, string>;

// ─── Tab definitions ──────────────────────────────────────────────────────────
const TABS = [
  { id: 'restaurant', label: 'Restaurant Info',  icon: <HiBuildingStorefront size={18} /> },
  { id: 'orders',     label: 'Order Config',      icon: <HiCog6Tooth size={18} /> },
  { id: 'preptimes',  label: 'Prep Times',        icon: <HiClock size={18} /> },
  { id: 'statuses',   label: 'Order Statuses',    icon: <HiClipboardDocumentList size={18} /> },
  { id: 'payments',   label: 'Payments',          icon: <HiCreditCard size={18} /> },
  { id: 'notifications', label: 'Notifications',  icon: <HiBell size={18} /> },
  { id: 'appearance', label: 'Appearance',        icon: <HiPaintBrush size={18} /> },
] as const;

type TabId = typeof TABS[number]['id'];

// ─── Helpers ──────────────────────────────────────────────────────────────────
function str(v: unknown): string { return v == null ? '' : String(v); }
function bool(v: unknown): boolean { return v === true || v === 'true' || v === '1'; }

// ─── Sub-components ───────────────────────────────────────────────────────────

function SectionHeader({ title, description }: { title: string; description?: string }) {
  return (
    <div className="mb-6">
      <h2 className="text-lg font-bold text-white">{title}</h2>
      {description && <p className="text-sm text-white/40 mt-1">{description}</p>}
    </div>
  );
}

function ColorField({ label, settingKey, value, onChange }: {
  label: string; settingKey: string; value: string;
  onChange: (k: string, v: string) => void;
}) {
  return (
    <Field label={label}>
      <div className="flex items-center gap-3">
        <input
          type="color"
          value={value || '#EC4824'}
          onChange={e => onChange(settingKey, e.target.value)}
          className="w-10 h-10 rounded-lg border border-white/10 bg-transparent cursor-pointer"
        />
        <input
          type="text"
          value={value}
          onChange={e => onChange(settingKey, e.target.value)}
          className={inputClass + ' flex-1'}
          placeholder="#EC4824"
        />
      </div>
    </Field>
  );
}

// ─── Tab sections ─────────────────────────────────────────────────────────────

function RestaurantTab({ orig, settings, onChange, onSave, onDiscard, saving }: {
  orig: SettingsMap; settings: SettingsMap;
  onChange: (k: string, v: string) => void;
  onSave: () => void; onDiscard: () => void; saving: boolean;
}) {
  const dirty = JSON.stringify(orig) !== JSON.stringify(settings);
  const keys = ['restaurant_name','tagline','whatsapp_number','instagram_handle','facebook_url','twitter_handle','footer_text'];
  const isDirty = keys.some(k => (orig[k] ?? '') !== (settings[k] ?? ''));

  return (
    <div className="space-y-5">
      <SectionHeader title="Restaurant Info" description="Public-facing brand information." />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <Field label="Restaurant Name" required>
          <input className={inputClass} value={str(settings.restaurant_name)} onChange={e => onChange('restaurant_name', e.target.value)} />
        </Field>
        <Field label="Tagline">
          <input className={inputClass} value={str(settings.tagline)} onChange={e => onChange('tagline', e.target.value)} />
        </Field>
        <Field label="WhatsApp Number" hint="Used for the WhatsApp order button">
          <input className={inputClass} value={str(settings.whatsapp_number)} placeholder="+233 XX XXX XXXX" onChange={e => onChange('whatsapp_number', e.target.value)} />
        </Field>
        <Field label="Instagram Handle">
          <input className={inputClass} value={str(settings.instagram_handle)} placeholder="@cookersdelight" onChange={e => onChange('instagram_handle', e.target.value)} />
        </Field>
        <Field label="Facebook URL">
          <input className={inputClass} value={str(settings.facebook_url)} onChange={e => onChange('facebook_url', e.target.value)} />
        </Field>
        <Field label="Twitter / X Handle">
          <input className={inputClass} value={str(settings.twitter_handle)} onChange={e => onChange('twitter_handle', e.target.value)} />
        </Field>
      </div>
      <Field label="Footer Text">
        <textarea
          rows={3}
          className={inputClass + ' resize-none'}
          value={str(settings.footer_text)}
          onChange={e => onChange('footer_text', e.target.value)}
        />
      </Field>
      <SaveBar dirty={isDirty} saving={saving} onSave={onSave} onDiscard={onDiscard} />
    </div>
  );
}

function OrderConfigTab({ orig, settings, onChange, onSave, onDiscard, saving }: {
  orig: SettingsMap; settings: SettingsMap;
  onChange: (k: string, v: string) => void;
  onSave: () => void; onDiscard: () => void; saving: boolean;
}) {
  const keys = ['order_type_delivery_enabled','order_type_pickup_enabled','order_type_dinein_enabled',
    'default_prep_time_minutes','order_lead_time_minutes','min_order_amount','max_order_items'];
  const isDirty = keys.some(k => (orig[k] ?? '') !== (settings[k] ?? ''));

  return (
    <div className="space-y-5">
      <SectionHeader title="Order Configuration" description="Control which order types are available and set global defaults." />
      <Card className="p-5 space-y-4">
        <p className="text-xs font-bold text-white/40 uppercase tracking-widest">Order Types</p>
        <Toggle value={bool(settings.order_type_delivery_enabled)} onChange={v => onChange('order_type_delivery_enabled', String(v))} label="Enable Delivery" />
        <Toggle value={bool(settings.order_type_pickup_enabled)} onChange={v => onChange('order_type_pickup_enabled', String(v))} label="Enable Pickup" />
        <Toggle value={bool(settings.order_type_dinein_enabled)} onChange={v => onChange('order_type_dinein_enabled', String(v))} label="Enable Dine-In" />
      </Card>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <Field label="Default Prep Time (minutes)">
          <input type="number" min={1} max={120} className={inputClass}
            value={str(settings.default_prep_time_minutes) || '15'}
            onChange={e => onChange('default_prep_time_minutes', e.target.value)} />
        </Field>
        <Field label="Order Lead Time (minutes)" hint="How far in advance orders must be placed">
          <input type="number" min={0} className={inputClass}
            value={str(settings.order_lead_time_minutes) || '0'}
            onChange={e => onChange('order_lead_time_minutes', e.target.value)} />
        </Field>
        <Field label="Minimum Order Amount (GH₵)">
          <input type="number" min={0} step={0.01} className={inputClass}
            value={str(settings.min_order_amount) || '0'}
            onChange={e => onChange('min_order_amount', e.target.value)} />
        </Field>
        <Field label="Maximum Items Per Order">
          <input type="number" min={1} className={inputClass}
            value={str(settings.max_order_items) || '50'}
            onChange={e => onChange('max_order_items', e.target.value)} />
        </Field>
      </div>
      <SaveBar dirty={isDirty} saving={saving} onSave={onSave} onDiscard={onDiscard} />
    </div>
  );
}

function PrepTimesTab() {
  const [items, setItems]       = useState<MenuItem[]>([]);
  const [times, setTimes]       = useState<Record<number, number>>({});
  const [draft, setDraft]       = useState<Record<number, number>>({});
  const [loading, setLoading]   = useState(true);
  const [saving, setSaving]     = useState(false);

  useEffect(() => {
    Promise.all([menuItemsApi.list(), prepTimesApi.list()]).then(([mRes, pRes]) => {
      const menuList: MenuItem[] = (mRes.data?.data ?? mRes.data ?? []).map((m: any) => ({
        menu_id: m.menu_id, menu_name: m.menu_name,
      }));
      const prepMap: Record<number, number> = pRes.data?.data ?? pRes.data ?? {};
      setItems(menuList);
      setTimes(prepMap);
      setDraft({ ...prepMap });
    }).finally(() => setLoading(false));
  }, []);

  const changed = items.filter(m => (draft[m.menu_id] ?? 15) !== (times[m.menu_id] ?? 15));

  const handleSave = async () => {
    setSaving(true);
    try {
      await Promise.all(changed.map(m => prepTimesApi.update(m.menu_id, draft[m.menu_id] ?? 15)));
      setTimes({ ...draft });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="flex justify-center py-20"><Spinner size={32} /></div>;

  return (
    <div>
      <SectionHeader title="Prep Times" description="Set how long each dish takes to prepare. Used to calculate estimated wait times shown to customers." />
      <Card>
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/8">
              <th className="text-left px-5 py-3 text-xs font-bold text-white/40 uppercase tracking-widest">Menu Item</th>
              <th className="text-right px-5 py-3 text-xs font-bold text-white/40 uppercase tracking-widest w-40">Prep Time (min)</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, i) => {
              const current = draft[item.menu_id] ?? 15;
              const orig    = times[item.menu_id] ?? 15;
              const dirty   = current !== orig;
              return (
                <tr key={item.menu_id} className={`border-b border-white/5 last:border-0 ${dirty ? 'bg-[#EC4824]/5' : ''}`}>
                  <td className="px-5 py-3 text-sm text-white">{item.menu_name}</td>
                  <td className="px-5 py-3">
                    <input
                      type="number"
                      min={1}
                      max={120}
                      value={current}
                      onChange={e => setDraft(d => ({ ...d, [item.menu_id]: Number(e.target.value) }))}
                      className="w-24 bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-white text-sm text-right focus:border-[#EC4824] focus:outline-none ml-auto block"
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </Card>
      <SaveBar
        dirty={changed.length > 0}
        saving={saving}
        onSave={handleSave}
        onDiscard={() => setDraft({ ...times })}
      />
    </div>
  );
}

function OrderStatusesTab() {
  const [statuses, setStatuses]   = useState<OrderStatus[]>([]);
  const [draft, setDraft]         = useState<OrderStatus[]>([]);
  const [loading, setLoading]     = useState(true);
  const [saving, setSaving]       = useState(false);

  useEffect(() => {
    statusesApi.list().then(res => {
      const list: OrderStatus[] = res.data?.data ?? res.data ?? [];
      setStatuses(list);
      setDraft(list.map(s => ({ ...s })));
    }).finally(() => setLoading(false));
  }, []);

  const isDirty = JSON.stringify(statuses) !== JSON.stringify(draft);

  const updateDraft = (id: number, field: keyof OrderStatus, value: unknown) => {
    setDraft(d => d.map(s => s.status_id === id ? { ...s, [field]: value } : s));
  };

  const handleToggleNotify = async (id: number, value: boolean) => {
    updateDraft(id, 'notify_customer', value);
    await statusesApi.update(id, { notify_customer: value });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await Promise.all(draft.map(s =>
        statusesApi.update(s.status_id, {
          status_name: s.status_name,
          status_color: s.status_color,
          sort_order: s.sort_order ?? 0,
        })
      ));
      setStatuses(draft.map(s => ({ ...s })));
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="flex justify-center py-20"><Spinner size={32} /></div>;

  return (
    <div>
      <SectionHeader title="Order Statuses" description="Configure the statuses used through the order lifecycle. Toggle customer notifications per status." />
      <Card>
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/8">
              {['Status Name','Color','Notify Customer','Sort Order'].map(h => (
                <th key={h} className="text-left px-5 py-3 text-xs font-bold text-white/40 uppercase tracking-widest">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {draft.map(s => (
              <tr key={s.status_id} className="border-b border-white/5 last:border-0 hover:bg-white/[0.02]">
                <td className="px-5 py-3">
                  <input
                    value={s.status_name}
                    onChange={e => updateDraft(s.status_id, 'status_name', e.target.value)}
                    className="bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-white text-sm focus:border-[#EC4824] focus:outline-none w-36"
                  />
                </td>
                <td className="px-5 py-3">
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={s.status_color || '#6b7280'}
                      onChange={e => updateDraft(s.status_id, 'status_color', e.target.value)}
                      className="w-8 h-8 rounded cursor-pointer border border-white/10 bg-transparent"
                    />
                    <span className="text-xs text-white/50 font-mono">{s.status_color}</span>
                  </div>
                </td>
                <td className="px-5 py-3">
                  <Toggle
                    value={!!s.notify_customer}
                    onChange={v => handleToggleNotify(s.status_id, v)}
                  />
                </td>
                <td className="px-5 py-3">
                  <input
                    type="number"
                    value={s.sort_order ?? 0}
                    onChange={e => updateDraft(s.status_id, 'sort_order', Number(e.target.value))}
                    className="w-16 bg-white/5 border border-white/10 rounded-lg px-2 py-1.5 text-white text-sm text-center focus:border-[#EC4824] focus:outline-none"
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
      <SaveBar dirty={isDirty} saving={saving} onSave={handleSave} onDiscard={() => setDraft(statuses.map(s => ({ ...s })))} />
    </div>
  );
}

function PaymentsTab({ orig, settings, onChange, onSave, onDiscard, saving }: {
  orig: SettingsMap; settings: SettingsMap;
  onChange: (k: string, v: string) => void;
  onSave: () => void; onDiscard: () => void; saving: boolean;
}) {
  const [showSecret, setShowSecret] = useState(false);
  const keys = ['paystack_public_key','paystack_secret_key','currency_code','currency_symbol'];
  const isDirty = keys.some(k => (orig[k] ?? '') !== (settings[k] ?? ''));

  return (
    <div className="space-y-5">
      <SectionHeader title="Payment Settings" description="Configure payment processor credentials and currency." />
      <div className="flex gap-3 items-start p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-xl">
        <HiExclamationTriangle size={20} className="text-yellow-400 flex-shrink-0 mt-0.5" />
        <p className="text-sm text-yellow-300/80">
          Payment credentials are stored securely in the database. Never share your secret key publicly.
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <Field label="Paystack Public Key">
          <input className={inputClass} value={str(settings.paystack_public_key)} placeholder="pk_live_..." onChange={e => onChange('paystack_public_key', e.target.value)} />
        </Field>
        <Field label="Paystack Secret Key">
          <div className="relative">
            <input
              type={showSecret ? 'text' : 'password'}
              className={inputClass + ' pr-12'}
              value={str(settings.paystack_secret_key)}
              placeholder="sk_live_..."
              onChange={e => onChange('paystack_secret_key', e.target.value)}
            />
            <button
              type="button"
              onClick={() => setShowSecret(s => !s)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white transition-colors"
            >
              {showSecret ? <HiEyeSlash size={18} /> : <HiEye size={18} />}
            </button>
          </div>
        </Field>
        <Field label="Currency Code" hint="ISO 4217 code">
          <input className={inputClass} value={str(settings.currency_code) || 'GHS'} onChange={e => onChange('currency_code', e.target.value)} />
        </Field>
        <Field label="Currency Symbol">
          <input className={inputClass} value={str(settings.currency_symbol) || 'GH₵'} onChange={e => onChange('currency_symbol', e.target.value)} />
        </Field>
      </div>
      <SaveBar dirty={isDirty} saving={saving} onSave={onSave} onDiscard={onDiscard} />
    </div>
  );
}

function NotificationsTab({ orig, settings, onChange, onSave, onDiscard, saving }: {
  orig: SettingsMap; settings: SettingsMap;
  onChange: (k: string, v: string) => void;
  onSave: () => void; onDiscard: () => void; saving: boolean;
}) {
  const keys = ['notify_new_order_email','notify_new_order_sms','admin_email','sms_number',
    'notification_sound_enabled','low_stock_threshold'];
  const isDirty = keys.some(k => (orig[k] ?? '') !== (settings[k] ?? ''));

  return (
    <div className="space-y-5">
      <SectionHeader title="Notifications" description="Configure who gets notified and how when new orders arrive." />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <Field label="Admin Email" hint="Receives order notification emails">
          <input type="email" className={inputClass} value={str(settings.admin_email)} onChange={e => onChange('admin_email', e.target.value)} />
        </Field>
        <Field label="SMS Number" hint="Receives SMS alerts (requires SMS provider)">
          <input className={inputClass} value={str(settings.sms_number)} placeholder="+233 XX XXX XXXX" onChange={e => onChange('sms_number', e.target.value)} />
        </Field>
        <Field label="Low Stock Alert Threshold" hint="Alert after X orders without stock update. 0 to disable.">
          <input type="number" min={0} className={inputClass} value={str(settings.low_stock_threshold) || '0'} onChange={e => onChange('low_stock_threshold', e.target.value)} />
        </Field>
      </div>
      <Card className="p-5 space-y-4">
        <p className="text-xs font-bold text-white/40 uppercase tracking-widest">Notification Channels</p>
        <Toggle value={bool(settings.notify_new_order_email)} onChange={v => onChange('notify_new_order_email', String(v))} label="Email on new order" />
        <Toggle value={bool(settings.notify_new_order_sms)} onChange={v => onChange('notify_new_order_sms', String(v))} label="SMS on new order" />
        <Toggle value={bool(settings.notification_sound_enabled)} onChange={v => onChange('notification_sound_enabled', String(v))} label="Play sound in admin panel when new order arrives" />
      </Card>
      <SaveBar dirty={isDirty} saving={saving} onSave={onSave} onDiscard={onDiscard} />
    </div>
  );
}

function AppearanceTab({ orig, settings, onChange, onSave, onDiscard, saving }: {
  orig: SettingsMap; settings: SettingsMap;
  onChange: (k: string, v: string) => void;
  onSave: () => void; onDiscard: () => void; saving: boolean;
}) {
  const keys = ['brand_color','brand_color_secondary','logo_url','hero_image_url',
    'show_announcement_bar','maintenance_mode'];
  const isDirty = keys.some(k => (orig[k] ?? '') !== (settings[k] ?? ''));

  return (
    <div className="space-y-5">
      <SectionHeader title="Appearance" description="Brand colors and visual settings for the public site." />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <ColorField label="Brand Color" settingKey="brand_color" value={str(settings.brand_color) || '#EC4824'} onChange={onChange} />
        <ColorField label="Secondary Color" settingKey="brand_color_secondary" value={str(settings.brand_color_secondary) || '#0d0d0d'} onChange={onChange} />
        <Field label="Logo URL">
          <input className={inputClass} value={str(settings.logo_url)} placeholder="https://cdn.example.com/logo.png" onChange={e => onChange('logo_url', e.target.value)} />
        </Field>
        <Field label="Hero Image URL">
          <input className={inputClass} value={str(settings.hero_image_url)} placeholder="https://cdn.example.com/hero.jpg" onChange={e => onChange('hero_image_url', e.target.value)} />
        </Field>
      </div>
      <Card className="p-5 space-y-4">
        <Toggle value={bool(settings.show_announcement_bar)} onChange={v => onChange('show_announcement_bar', String(v))} label="Show announcement bar on public site" />
        <div>
          <Toggle value={bool(settings.maintenance_mode)} onChange={v => onChange('maintenance_mode', String(v))} label="Maintenance mode" />
          {bool(settings.maintenance_mode) && (
            <p className="text-xs text-red-400 mt-2 ml-14">Warning: This will show a maintenance page to all visitors on the public site.</p>
          )}
        </div>
      </Card>
      <SaveBar dirty={isDirty} saving={saving} onSave={onSave} onDiscard={onDiscard} />
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function Settings() {
  const [activeTab, setActiveTab] = useState<TabId>('restaurant');
  const [settings, setSettings]   = useState<SettingsMap>({});
  const [origSettings, setOrig]   = useState<SettingsMap>({});
  const [loading, setLoading]     = useState(true);
  const [saving, setSaving]       = useState(false);

  useEffect(() => {
    cdSettingsApi.list().then(res => {
      const data: SettingsMap = res.data?.data ?? res.data ?? {};
      setSettings(data);
      setOrig(data);
    }).finally(() => setLoading(false));
  }, []);

  const handleChange = useCallback((key: string, value: string) => {
    setSettings(s => ({ ...s, [key]: value }));
  }, []);

  const handleSave = useCallback(async (keys: string[]) => {
    setSaving(true);
    const pairs: SettingsMap = {};
    keys.forEach(k => { pairs[k] = settings[k] ?? ''; });
    try {
      await cdSettingsApi.setMany(pairs);
      setOrig(o => ({ ...o, ...pairs }));
    } finally {
      setSaving(false);
    }
  }, [settings]);

  const handleDiscard = useCallback((keys: string[]) => {
    setSettings(s => {
      const reset = { ...s };
      keys.forEach(k => { reset[k] = origSettings[k] ?? ''; });
      return reset;
    });
  }, [origSettings]);

  const restaurantKeys   = ['restaurant_name','tagline','whatsapp_number','instagram_handle','facebook_url','twitter_handle','footer_text'];
  const orderConfigKeys  = ['order_type_delivery_enabled','order_type_pickup_enabled','order_type_dinein_enabled','default_prep_time_minutes','order_lead_time_minutes','min_order_amount','max_order_items'];
  const paymentsKeys     = ['paystack_public_key','paystack_secret_key','currency_code','currency_symbol'];
  const notifKeys        = ['notify_new_order_email','notify_new_order_sms','admin_email','sms_number','notification_sound_enabled','low_stock_threshold'];
  const appearanceKeys   = ['brand_color','brand_color_secondary','logo_url','hero_image_url','show_announcement_bar','maintenance_mode'];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner size={32} />
      </div>
    );
  }

  const sharedTabProps = { orig: origSettings, settings, onChange: handleChange, saving };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-black text-white">Settings</h1>
        <p className="text-white/40 text-sm mt-1">Configure every aspect of your restaurant platform.</p>
      </div>

      <div className="flex gap-6 items-start">
        {/* Sidebar tabs */}
        <aside className="w-52 flex-shrink-0 space-y-0.5 sticky top-0">
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all text-left ${
                activeTab === tab.id
                  ? 'bg-[#EC4824]/15 text-[#EC4824]'
                  : 'text-white/40 hover:text-white hover:bg-white/5'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </aside>

        {/* Tab content */}
        <div className="flex-1 min-w-0">
          {activeTab === 'restaurant' && (
            <RestaurantTab
              {...sharedTabProps}
              onSave={() => handleSave(restaurantKeys)}
              onDiscard={() => handleDiscard(restaurantKeys)}
            />
          )}
          {activeTab === 'orders' && (
            <OrderConfigTab
              {...sharedTabProps}
              onSave={() => handleSave(orderConfigKeys)}
              onDiscard={() => handleDiscard(orderConfigKeys)}
            />
          )}
          {activeTab === 'preptimes' && <PrepTimesTab />}
          {activeTab === 'statuses'  && <OrderStatusesTab />}
          {activeTab === 'payments'  && (
            <PaymentsTab
              {...sharedTabProps}
              onSave={() => handleSave(paymentsKeys)}
              onDiscard={() => handleDiscard(paymentsKeys)}
            />
          )}
          {activeTab === 'notifications' && (
            <NotificationsTab
              {...sharedTabProps}
              onSave={() => handleSave(notifKeys)}
              onDiscard={() => handleDiscard(notifKeys)}
            />
          )}
          {activeTab === 'appearance' && (
            <AppearanceTab
              {...sharedTabProps}
              onSave={() => handleSave(appearanceKeys)}
              onDiscard={() => handleDiscard(appearanceKeys)}
            />
          )}
        </div>
      </div>
    </div>
  );
}
