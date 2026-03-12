import React, { useState, useEffect } from 'react';
import { Bell, Shield, Monitor, Music, EyeOff, Check } from 'lucide-react';

const Settings = () => {
  // Load settings from localStorage or use defaults
  const [settings, setSettings] = useState(() => {
    const saved = localStorage.getItem('fatigue_settings');
    return saved ? JSON.parse(saved) : {
      encryption: true,
      incognito: false,
      dimming: true,
      music: false,
      prompts: true
    };
  });

  const [showSaved, setShowSaved] = useState(false);

  // Auto-save whenever a setting changes
  useEffect(() => {
    localStorage.setItem('fatigue_settings', JSON.stringify(settings));
    // Trigger a small "Saved" toast
    setShowSaved(true);
    const timer = setTimeout(() => setShowSaved(false), 2000);
    return () => clearTimeout(timer);
  }, [settings]);

  const toggleSetting = (key) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="p-8 max-w-4xl animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex justify-between items-start mb-10">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Account & Privacy Settings</h1>
          <p className="text-slate-500">Manage your local AI preferences and environmental controls.</p>
        </div>
        
        {/* Dynamic Save Indicator */}
        <div className={`flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-50 text-emerald-600 text-xs font-bold transition-opacity duration-300 ${showSaved ? 'opacity-100' : 'opacity-0'}`}>
          <Check size={14} /> Preferences Synced
        </div>
      </div>

      <div className="space-y-6">
        {/* Privacy Section */}
        <section className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm transition-all hover:shadow-md">
          <div className="flex items-center gap-3 mb-8 text-blue-600">
            <Shield size={24} />
            <h2 className="text-xl font-bold text-slate-800">Privacy & Security</h2>
          </div>
          <div className="space-y-2">
            <SettingToggle 
              title="Local Data Encryption" 
              description="Keep all fatigue logs encrypted on this device." 
              checked={settings.encryption} 
              onChange={() => toggleSetting('encryption')} 
            />
            <SettingToggle 
              title="Incognito Monitoring" 
              description="Temporarily pause facial data collection." 
              checked={settings.incognito} 
              onChange={() => toggleSetting('incognito')} 
            />
          </div>
        </section>

        {/* Adaptive Environment Section */}
        <section className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm transition-all hover:shadow-md">
          <div className="flex items-center gap-3 mb-8 text-indigo-600">
            <Monitor size={24} />
            <h2 className="text-xl font-bold text-slate-800">Adaptive Environment</h2>
          </div>
          <div className="space-y-2">
            <SettingToggle 
              title="Auto Screen Dimming" 
              description="Automatically dim screen when high fatigue is detected." 
              checked={settings.dimming} 
              onChange={() => toggleSetting('dimming')} 
            />
            <SettingToggle 
              title="Soft Background Music" 
              description="Play calming music during high mental strain." 
              checked={settings.music} 
              onChange={() => toggleSetting('music')} 
            />
            <SettingToggle 
              title="Break Prompts" 
              description="Show notifications to take a walk every 2 hours." 
              checked={settings.prompts} 
              onChange={() => toggleSetting('prompts')} 
            />
          </div>
        </section>
      </div>
    </div>
  );
};

const SettingToggle = ({ title, description, checked, onChange }) => (
  <div className="flex items-center justify-between py-4 group">
    <div className="max-w-[80%]">
      <h3 className="font-bold text-slate-800 group-hover:text-blue-600 transition-colors">{title}</h3>
      <p className="text-sm text-slate-500 leading-relaxed">{description}</p>
    </div>
    <label className="relative inline-flex items-center cursor-pointer">
      <input 
        type="checkbox" 
        checked={checked} 
        onChange={onChange} 
        className="sr-only peer" 
      />
      <div className="w-12 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-6 peer-checked:bg-blue-600 after:content-[''] after:absolute after:top-[3px] after:left-[3px] after:bg-white after:rounded-full after:h-[18px] after:w-[18px] after:transition-all shadow-inner"></div>
    </label>
  </div>
);

export default Settings;
