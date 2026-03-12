import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft } from 'lucide-react';
import axios from 'axios';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // --- DYNAMIC API URL ---
  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  const handleResetRequest = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');
    setLoading(true);

    try {
      // UPDATED: Replaced localhost with dynamic cloud URL
      const response = await axios.post(`${API_BASE_URL}/api/forgot-password`, { email });
      setMessage(response.data.message || "A reset link has been sent to your email.");
    } catch (err) {
      setError(err.response?.data?.error || "Failed to send reset link. Please check the email address.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="bg-white p-10 rounded-3xl shadow-xl border border-slate-100 w-full max-w-md">
        <Link to="/login" className="flex items-center gap-2 text-slate-500 hover:text-blue-600 mb-8 transition-colors text-sm font-semibold w-fit">
          <ArrowLeft size={16} /> Back to Login
        </Link>
        
        <h1 className="text-2xl font-bold text-slate-900 mb-2">Forgot Password?</h1>
        <p className="text-slate-500 mb-8">Enter your work email to receive a reset link.</p>
        
        {message && <div className="mb-6 p-4 bg-green-50 border-l-4 border-green-500 text-green-700 rounded-r-lg text-sm font-bold">{message}</div>}
        {error && <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-r-lg text-sm font-bold">{error}</div>}

        <form className="space-y-5" onSubmit={handleResetRequest}>
          <div className="relative">
            <Mail className="absolute left-3 top-3 text-slate-400" size={20} />
            <input 
              type="email" 
              placeholder="Work Email" 
              required
              disabled={loading}
              className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all disabled:opacity-50"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          
          <button 
            type="submit" 
            disabled={loading}
            className={`w-full bg-blue-600 text-white font-bold py-4 rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-100 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {loading ? 'Sending...' : 'Send Reset Link'}
          </button>
        </form>
      </div>
    </div>
  );
}
