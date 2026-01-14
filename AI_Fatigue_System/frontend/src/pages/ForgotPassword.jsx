import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft } from 'lucide-react';
import axios from 'axios';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleResetRequest = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');

    try {
      const response = await axios.post('http://localhost:5000/api/forgot-password', { email });
      setMessage(response.data.message);
    } catch (err) {
      setError(err.response?.data?.error || "Something went wrong.");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="bg-white p-10 rounded-3xl shadow-xl border border-slate-100 w-full max-w-md">
        <Link to="/login" className="flex items-center gap-2 text-slate-500 hover:text-blue-600 mb-8 transition-colors text-sm font-semibold">
          <ArrowLeft size={16} /> Back to Login
        </Link>
        <h1 className="text-2xl font-bold text-slate-900 mb-2">Forgot Password?</h1>
        <p className="text-slate-500 mb-8">Enter your work email to receive a reset link.</p>
        
        {message && <div className="mb-4 p-3 bg-green-50 text-green-700 rounded-lg text-sm font-bold">{message}</div>}
        {error && <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm font-bold">{error}</div>}

        <form className="space-y-5" onSubmit={handleResetRequest}>
          <div className="relative">
            <Mail className="absolute left-3 top-3 text-slate-400" size={20} />
            <input 
              type="email" 
              placeholder="Work Email" 
              required
              className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <button type="submit" className="w-full bg-blue-600 text-white font-bold py-4 rounded-xl hover:bg-blue-700 transition-all">
            Send Reset Link
          </button>
        </form>
      </div>
    </div>
  );
}