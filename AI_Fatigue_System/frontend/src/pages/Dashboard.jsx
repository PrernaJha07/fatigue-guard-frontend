import React, { useEffect, useState, useRef, useCallback } from 'react';
import axios from 'axios';
import { Brain, MousePointer2, Type, Clock, ShieldCheck } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useAuth } from '../context/AuthContext';
import WebcamMonitor from '../components/WebcamMonitor'; // Using your optimized component
import { sendDataToAI } from '../utils/aiService';

// --- SUB-COMPONENT: HISTORY TABLE ---
const HistoryTable = ({ reports }) => (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden mt-8">
        <div className="p-6 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
            <div className="flex items-center gap-2">
                <Clock className="text-slate-400" size={20} />
                <h3 className="text-lg font-bold text-slate-800">Fatigue Incident History</h3>
            </div>
            <span className="text-xs font-bold text-slate-500 bg-slate-200 px-3 py-1 rounded-full">
                {reports.length} Logs Stored
            </span>
        </div>
        <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
                <thead className="bg-slate-50/80 text-slate-500 text-[11px] uppercase tracking-widest font-bold">
                    <tr>
                        <th className="px-8 py-4">Timestamp</th>
                        <th className="px-8 py-4">AI Assessment</th>
                        <th className="px-8 py-4">Fatigue Score</th>
                        <th className="px-8 py-4">System Recommendation</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                    {reports.map((report, idx) => (
                        <tr key={idx} className="hover:bg-blue-50/30 transition-colors group">
                            <td className="px-8 py-5 text-sm text-slate-600 font-medium">{report.fullDate}</td>
                            <td className="px-8 py-5">
                                <span className={`flex items-center gap-1.5 w-fit px-3 py-1 rounded-full text-[10px] font-black tracking-tight ${
                                    report.scoreValue > 70 ? 'bg-red-100 text-red-600' : 'bg-emerald-100 text-emerald-600'
                                }`}>
                                    <ShieldCheck size={12}/>
                                    {report.scoreValue > 70 ? 'CRITICAL ALERT' : (report.scoreValue > 40 ? 'MONITORING' : 'OPTIMAL')}
                                </span>
                            </td>
                            <td className="px-8 py-5">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 bg-slate-100 h-1.5 rounded-full overflow-hidden">
                                        <div className="bg-blue-500 h-full" style={{ width: `${report.scoreValue}%` }}></div>
                                    </div>
                                    <span className="text-sm font-bold text-slate-700">{report.scoreValue}%</span>
                                </div>
                            </td>
                            <td className="px-8 py-5 text-sm text-slate-500 italic">
                                {report.recommendation || "System monitoring active."}
                            </td>
                        </tr>
                    ))}
                    {reports.length === 0 && (
                        <tr><td colSpan="4" className="px-8 py-10 text-center text-slate-400 text-sm">No historical data found.</td></tr>
                    )}
                </tbody>
            </table>
        </div>
    </div>
);

// --- MAIN DASHBOARD COMPONENT ---
const Dashboard = () => {
    const { user, token } = useAuth(); // Get token for secure cloud requests
    const [chartData, setChartData] = useState([]);
    const [liveAI, setLiveAI] = useState({ status: "Standby", score: 0 });
    const [typingStats, setTypingStats] = useState({ gap: 400, std: 50 });
    const [mousePrecision, setMousePrecision] = useState(100);

    const lastKeyTime = useRef(Date.now());
    const intervals = useRef([]);
    const mousePoints = useRef([]);
    const lastSaveTime = useRef(0);

    const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    const userId = user?.id || 1; 

    // Fetch History with Bearer Token for Live Security
    const fetchHistory = useCallback(async () => {
        try {
            const res = await axios.get(`${API_BASE_URL}/api/reports/${userId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const formatted = res.data.map(item => ({
                time: new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                fullDate: new Date(item.createdAt).toLocaleString(),
                level: item.fatigueScore / 100, 
                scoreValue: item.fatigueScore, 
                recommendation: item.recommendation
            }));
            setChartData(formatted);
        } catch (err) {
            console.error("Dashboard: Error fetching history", err);
        }
    }, [userId, API_BASE_URL, token]);

    useEffect(() => {
        fetchHistory();
        const interval = setInterval(fetchHistory, 30000); // Polling every 30s for cloud stability
        return () => clearInterval(interval);
    }, [fetchHistory]);

    // Behavioral Tracking: Keyboard
    useEffect(() => {
        const handleKeyDown = () => {
            const now = Date.now();
            const diff = now - lastKeyTime.current;
            lastKeyTime.current = now;
            if (diff < 2000) {
                intervals.current.push(diff);
                if (intervals.current.length > 10) {
                    const avg = intervals.current.reduce((a, b) => a + b) / intervals.current.length;
                    const std = Math.sqrt(intervals.current.map(x => Math.pow(x - avg, 2)).reduce((a, b) => a + b) / intervals.current.length);
                    setTypingStats({ gap: Math.round(avg), std: Math.round(std) });
                    intervals.current.shift();
                }
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    // Behavioral Tracking: Mouse
    useEffect(() => {
        const handleMouseMove = (e) => {
            const point = { x: e.clientX, y: e.clientY };
            mousePoints.current.push(point);
            if (mousePoints.current.length > 20) {
                let actualDist = 0;
                for (let i = 1; i < mousePoints.current.length; i++) {
                    actualDist += Math.hypot(mousePoints.current[i].x - mousePoints.current[i-1].x, mousePoints.current[i].y - mousePoints.current[i-1].y);
                }
                const straightDist = Math.hypot(mousePoints.current[mousePoints.current.length - 1].x - mousePoints.current[0].x, mousePoints.current[mousePoints.current.length - 1].y - mousePoints.current[0].y);
                const precision = straightDist > 0 ? (straightDist / actualDist) * 100 : 100;
                setMousePrecision(Math.min(100, Math.round(precision * 1.2))); 
                mousePoints.current.shift();
            }
        };
        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, []);

    const handleLiveDetection = useCallback(async (ear, mar) => {
        const currentTime = Date.now();
        // Send to AI every 5 seconds to prevent spamming the cloud server
        if (currentTime - lastSaveTime.current > 5000) {
            lastSaveTime.current = currentTime; 
            const result = await sendDataToAI(ear, mar, typingStats.gap, typingStats.std, mousePrecision, userId);
            if (result) {
                setLiveAI({ status: result.status, score: result.score });
                if (result.score > 0.4) fetchHistory(); // Auto-refresh history if fatigue is detected
            }
        }
    }, [userId, typingStats, mousePrecision, fetchHistory]);

    return (
        <div className={`p-8 space-y-8 min-h-screen transition-all duration-700 ${liveAI.status === "FATIGUE DETECTED" ? 'bg-red-50' : 'bg-slate-50'}`}>
            {/* Optimized Webcam Monitor Component */}
            <WebcamMonitor onDetection={handleLiveDetection} />

            <header className="flex justify-between items-end">
                <div>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight italic">AI.FATIGUE_GUARD</h1>
                    <p className="text-slate-500 font-medium">Neural Fatigue Analysis Dashboard</p>
                </div>
                <div className="flex items-center gap-3 bg-white p-2 rounded-2xl shadow-sm border border-slate-200">
                    <div className="px-4 py-2 bg-emerald-50 text-emerald-600 rounded-xl text-[10px] font-black ring-1 ring-emerald-100 flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div> ENGINE_ONLINE
                    </div>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 bg-white p-8 rounded-3xl border-2 border-blue-100 shadow-xl relative overflow-hidden group">
                    <div className="relative z-10 flex flex-col justify-between h-full">
                        <div>
                            <div className="flex items-center gap-2 text-blue-600 mb-4">
                                <Brain size={24} /> <span className="text-xs font-black uppercase tracking-[0.2em]">Neural Stream Inference</span>
                            </div>
                            <h2 className={`text-5xl font-black mb-2 transition-colors duration-500 ${liveAI.status === "FATIGUE DETECTED" ? 'text-red-600' : 'text-slate-900'}`}>{liveAI.status}</h2>
                            <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest">Confidence Index: {(liveAI.score * 100).toFixed(2)}%</p>
                        </div>
                        <div className="mt-8">
                            <div className="flex justify-between text-[10px] font-black text-slate-400 mb-3 tracking-tighter uppercase">
                                <span>Optimal State</span><span>High Risk Zone</span>
                            </div>
                            <div className="w-full h-4 bg-slate-100 rounded-full p-1">
                                <div className={`h-full rounded-full transition-all duration-500 ${liveAI.score > 0.7 ? 'bg-red-500' : 'bg-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.5)]'}`} style={{ width: `${liveAI.score * 100}%` }}></div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="space-y-4">
                    <StatCard title="Mouse Precision" value={mousePrecision} unit="%" icon={<MousePointer2 className={mousePrecision < 70 ? "text-red-500" : "text-emerald-500"}/>} progress={mousePrecision} />
                    <StatCard title="Typing Interval" value={typingStats.gap} unit="ms" icon={<Type className="text-indigo-500"/>} />
                </div>
            </div>

            <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm min-w-0">
                <div className="h-72">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={chartData}>
                            <defs><linearGradient id="colorLevel" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2}/><stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/></linearGradient></defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                            <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 'bold'}} dy={15} />
                            <YAxis hide domain={[0, 1]} />
                            <Tooltip contentStyle={{ borderRadius: '20px', border: 'none' }} />
                            <Area type="monotone" dataKey="level" stroke="#3b82f6" strokeWidth={4} fillOpacity={1} fill="url(#colorLevel)" />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>

            <HistoryTable reports={chartData} />
        </div>
    );
};

const StatCard = ({ title, value, unit, icon, progress }) => (
    <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm h-full">
        <div className="flex justify-between items-center mb-4">
            <span className="text-slate-400 text-xs font-black uppercase tracking-widest">{title}</span>{icon}
        </div>
        <div className="flex items-baseline gap-1">
            <span className="text-4xl font-black text-slate-900 tracking-tighter">{value}</span>
            <span className="text-slate-400 font-bold text-sm uppercase">{unit}</span>
        </div>
        {progress && (
            <div className="mt-4 h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${progress}%` }}></div>
            </div>
        )}
    </div>
);

export default Dashboard;
