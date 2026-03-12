import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ShieldCheck, Lock, Mail } from 'lucide-react';
import axios from 'axios';

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  // Try to get token from URL (sent in the reset email)
  const token = searchParams.get('token');
  
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // --- DYNAMIC API URL ---
  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  const handleReset = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');
    setLoading(true);

    try {
      // UPDATED: Using dynamic API_BASE_URL and sending the token if available
      const res = await axios.post(`${API_BASE_URL}/api/reset-password`, { 
        email, 
        newPassword,
        token // This matches the reset_token column in your Aiven DB
      });

      setMessage(res.data.message || "Password updated successfully!");
      
      // Delay navigation so the user can see the success message
      setTimeout(() => navigate('/login'), 2500);
      
    } catch (err) {
      setError(err.response?.data?.error || "Reset failed. The link may be expired.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="bg-white p-10 rounded-3xl shadow-xl border border-slate-100 w-full max-w-md">
        <div className="flex flex-col items-center mb-8">
          <div className="bg-blue-600 p-4 rounded-2xl shadow-lg mb-4 text-white">
            <ShieldCheck size={32} />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Set New Password</h1>
          <p className="text-slate-500 text-sm mt-1">Please enter your details to gain access</p>
        </div>

        {message && (
          <div className="mb-6 p-4 bg-green-50 border-l-4 border-green-500 text-green-700 text-sm font-bold rounded-r-lg">
            {message}
          </div>
        )}

        {error && (
          <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 text-sm font-bold rounded-r-lg">
            {error}
          </div>
        )}

        <form onSubmit={handleReset} className="space-y-5">
          <div className="space-y-1">
            <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Account Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 text-slate-300" size={18} />
              <input 
                type="email" 
                required 
                placeholder="Confirm your email"
                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none disabled:opacity-50" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">New Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 text-slate-300" size={18} />
              <input 
                type="password" 
                required 
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none disabled:opacity-50" 
                value={newPassword} 
                onChange={(e) => setNewPassword(e.target.value)}
                disabled={loading}
              />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className={`w-full bg-blue-600 text-white font-bold py-4 rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-100 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {loading ? 'Updating...' : 'Update Password'}
          </button>
        </form>
      </div>
    </div>
  );
}
