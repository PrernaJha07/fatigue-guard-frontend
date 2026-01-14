import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Brain, MousePointer2, Type, TrendingUp, AlertCircle } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const Dashboard = () => {
    const [chartData, setChartData] = useState([]);
    const [latestStats, setLatestStats] = useState({ fatigueLevel: 'Loading...', fatigueScore: 0 });
    const userId = localStorage.getItem('userId') || 1; 

    useEffect(() => {
        const fetchRealTimeData = async () => {
            try {
                const res = await axios.get(`http://localhost:5000/api/reports/${userId}`);
                
                // Format data for the Recharts AreaChart
                const formatted = res.data.map(item => ({
                    time: new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                    level: item.fatigueScore
                })).reverse(); // Reverse so latest is on the right
                
                setChartData(formatted);
                
                // Set the most recent single report for the StatCards
                if (res.data.length > 0) {
                    setLatestStats(res.data[0]);
                }
            } catch (err) {
                console.error("Error fetching MongoDB data:", err);
            }
        };

        fetchRealTimeData();
        // Optional: Set up polling to refresh every 30 seconds
        const interval = setInterval(fetchRealTimeData, 30000);
        return () => clearInterval(interval);
    }, [userId]);

    return (
        <div className="p-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <header className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-extrabold text-slate-900">Workspace Analytics</h1>
                    <p className="text-slate-500">Real-time monitoring of cognitive fatigue levels.</p>
                </div>
                <div className="flex items-center gap-2 px-3 py-1 bg-green-50 text-green-600 rounded-full text-xs font-bold ring-1 ring-green-100">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    LOCAL AI ACTIVE
                </div>
            </header>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard 
                    title="Cognitive Load" 
                    value={latestStats.fatigueLevel} 
                    icon={<Brain className="text-blue-500"/>} 
                    progress={latestStats.fatigueScore} 
                />
                <StatCard title="Typing Rhythm" value="82" unit="WPM" subtext="Stable Consistency" icon={<Type className="text-indigo-500"/>} />
                <StatCard title="Mouse Precision" value="94%" subtext="Standard Deviation: 0.04" icon={<MousePointer2 className="text-purple-500"/>} />
            </div>

            {/* Chart Section */}
            <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
                <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                    <TrendingUp className="text-blue-600" size={20} /> Fatigue Trend Progression
                </h3>
                <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={chartData}>
                            <defs>
                                <linearGradient id="colorLevel" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1}/>
                                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                            <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} dy={10} />
                            <YAxis hide domain={[0, 100]} />
                            <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                            <Area type="monotone" dataKey="level" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorLevel)" />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Alert Banner - Dynamic based on Score */}
            {latestStats.fatigueScore > 70 && (
                <div className="bg-red-50 border border-red-100 p-6 rounded-2xl flex gap-4">
                    <div className="bg-red-500 p-2 rounded-xl text-white h-fit">
                        <AlertCircle size={24} />
                    </div>
                    <div>
                        <h4 className="font-bold text-red-900 text-lg">High Fatigue Alert</h4>
                        <p className="text-red-700 mt-1">
                            Our AI detected {latestStats.fatigueScore}% fatigue. <b>Recommendation:</b> {latestStats.recommendation || 'Take a break immediately.'}
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
};

const StatCard = ({ title, value, unit, subtext, icon, progress }) => (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex justify-between items-start mb-4">
            <span className="text-slate-500 font-medium">{title}</span>
            {icon}
        </div>
        <div className="flex items-baseline gap-1">
            <span className="text-3xl font-bold text-slate-900">{value}</span>
            {unit && <span className="text-slate-400 font-normal text-sm">{unit}</span>}
        </div>
        {progress !== undefined ? (
            <div className="mt-4 h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                <div 
                    className={`h-full transition-all duration-1000 ${progress > 70 ? 'bg-red-500' : 'bg-blue-500'}`} 
                    style={{ width: `${progress}%` }}
                ></div>
            </div>
        ) : (
            <p className="text-green-500 text-xs font-bold mt-2 uppercase tracking-wider">{subtext}</p>
        )}
    </div>
);

export default Dashboard;