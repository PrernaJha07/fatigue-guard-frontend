import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShieldCheck, Lock, Mail } from 'lucide-react';
import axios from 'axios';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    try {
      // 1. Send login request to Backend
      const response = await axios.post('http://localhost:5000/api/login', {
        email,
        password
      });

      // 2. Destructure data from MySQL response
      const { token, user } = response.data;

      // 3. Trigger upgraded AuthContext login with user object
      login(user, token); 
      
      navigate('/dashboard');

    } catch (err) {
      setError(err.response?.data?.error || "Login failed. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="bg-white p-10 rounded-3xl shadow-xl border border-slate-100 w-full max-w-md">
        
        <div className="flex flex-col items-center mb-10">
          <div className="bg-blue-600 p-4 rounded-2xl shadow-lg mb-4 text-white">
            <ShieldCheck size={40} />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">FatigueGuard AI</h1>
          <p className="text-slate-500 text-sm">Secure Employee Portal</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 text-sm font-semibold rounded-r-lg">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-5">
          <div className="relative">
            <Mail className="absolute left-3 top-3 text-slate-400" size={20} />
            <input 
              type="email" 
              placeholder="Work Email" 
              required 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all" 
            />
          </div>
          
          <div className="relative">
            <Lock className="absolute left-3 top-3 text-slate-400" size={20} />
            <input 
              type="password" 
              placeholder="Password" 
              required 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all" 
            />
          </div>

          <div className="text-right">
            <Link to="/forgot-password" size={20} className="text-sm font-bold text-blue-600 hover:underline">
              Forgot Password?
            </Link>
          </div>

          <button type="submit" className="w-full bg-blue-600 text-white font-bold py-4 rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-100 transition-all">
            Secure Sign In
          </button>
        </form>

        <p className="text-center mt-8 text-slate-500 text-sm">
          New to the system?{' '}
          <Link to="/signup" className="text-blue-600 font-bold hover:underline">Create Account</Link>
        </p>
      </div>
    </div>
  );
}