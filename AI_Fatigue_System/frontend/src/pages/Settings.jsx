import React, { useState } from 'react';
import { Bell, Shield, Monitor, Music, EyeOff } from 'lucide-react';

const Settings = () => {
  return (
    <div className="p-8 max-w-4xl animate-in fade-in duration-500">
      <h1 className="text-3xl font-bold text-slate-900 mb-2">Account & Privacy Settings</h1>
      <p className="text-slate-500 mb-10">Manage your local AI preferences and environmental controls.</p>

      <div className="space-y-6">
        {/* Privacy Section */}
        <section className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-3 mb-6 text-blue-600">
            <Shield size={24} />
            <h2 className="text-xl font-bold text-slate-800">Privacy & Security</h2>
          </div>
          <div className="space-y-4">
            <SettingToggle title="Local Data Encryption" description="Keep all fatigue logs encrypted on this device." defaultChecked />
            <SettingToggle title="Incognito Monitoring" description="Temporarily pause facial data collection." />
          </div>
        </section>

        {/* Adaptive Environment Section */}
        <section className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-3 mb-6 text-indigo-600">
            <Monitor size={24} />
            <h2 className="text-xl font-bold text-slate-800">Adaptive Environment</h2>
          </div>
          <div className="space-y-4">
            <SettingToggle title="Auto Screen Dimming" description="Automatically dim screen when high fatigue is detected." defaultChecked />
            <SettingToggle title="Soft Background Music" description="Play calming music during high mental strain." />
            <SettingToggle title="Break Prompts" description="Show notifications to take a walk every 2 hours." defaultChecked />
          </div>
        </section>
      </div>
    </div>
  );
};

const SettingToggle = ({ title, description, defaultChecked }) => (
  <div className="flex items-center justify-between py-3 border-b border-slate-50 last:border-0">
    <div>
      <h3 className="font-semibold text-slate-800">{title}</h3>
      <p className="text-sm text-slate-500">{description}</p>
    </div>
    <label className="relative inline-flex items-center cursor-pointer">
      <input type="checkbox" defaultChecked={defaultChecked} className="sr-only peer" />
      <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:bg-blue-600 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
    </label>
  </div>
);

export default Settings;