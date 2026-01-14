import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, ShieldCheck } from 'lucide-react';
import axios from 'axios';

export default function ResetPassword() {
  const [email, setEmail] = useState(''); // In a real app, this comes from a secure token
  const [newPassword, setNewPassword] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleReset = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('http://localhost:5000/api/reset-password', { email, newPassword });
      setMessage(res.data.message);
      setTimeout(() => navigate('/login'), 3000);
    } catch (err) {
      alert("Reset failed: " + err.response.data.error);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="bg-white p-10 rounded-3xl shadow-xl border border-slate-100 w-full max-w-md">
        <div className="flex flex-col items-center mb-6">
          <div className="bg-green-100 text-green-600 p-3 rounded-full mb-4">
            <ShieldCheck size={32} />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Set New Password</h1>
        </div>

        {message && <div className="mb-4 p-3 bg-green-50 text-green-700 rounded-lg text-sm font-bold">{message}</div>}

        <form onSubmit={handleReset} className="space-y-5">
          <div>
            <label className="text-sm font-bold text-slate-600">Verify Email</label>
            <input type="email" required className="w-full px-4 py-3 bg-slate-50 border rounded-xl" 
                   value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div>
            <label className="text-sm font-bold text-slate-600">New Password</label>
            <input type="password" required className="w-full px-4 py-3 bg-slate-50 border rounded-xl" 
                   value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
          </div>
          <button type="submit" className="w-full bg-blue-600 text-white font-bold py-4 rounded-xl hover:bg-blue-700">
            Update Password
          </button>
        </form>
      </div>
    </div>
  );
}