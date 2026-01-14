import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Calendar, Download, AlertCircle, CheckCircle2 } from 'lucide-react';

const Reports = () => {
    const [reports, setReports] = useState([]);
    const userId = localStorage.getItem('userId') || 1;

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const res = await axios.get(`http://localhost:5000/api/reports/${userId}`);
                setReports(res.data);
            } catch (err) {
                console.error("Error fetching history:", err);
            }
        };
        fetchHistory();
    }, [userId]);

    return (
        <div className="p-8 max-w-6xl animate-in fade-in duration-700">
            <div className="flex justify-between items-end mb-10">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">Daily Fatigue Reports</h1>
                    <p className="text-slate-500 mt-1">Historical tracking of cognitive strain and behavioral patterns.</p>
                </div>
                <button className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-100">
                    <Download size={18} /> Export All (PDF)
                </button>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-slate-50 border-b border-slate-200">
                        <tr>
                            <th className="px-6 py-4 text-sm font-bold text-slate-600 uppercase">Date</th>
                            <th className="px-6 py-4 text-sm font-bold text-slate-600 uppercase">Avg Fatigue Level</th>
                            <th className="px-6 py-4 text-sm font-bold text-slate-600 uppercase">System Recommendation</th>
                            <th className="px-6 py-4 text-sm font-bold text-slate-600 uppercase text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {reports.length === 0 ? (
                            <tr>
                                <td colSpan="4" className="px-6 py-10 text-center text-slate-400">No reports found in MongoDB.</td>
                            </tr>
                        ) : (
                            reports.map((report) => (
                                <tr key={report._id} className="hover:bg-slate-50/50 transition-colors">
                                    <td className="px-6 py-5 font-semibold text-slate-700 flex items-center gap-2">
                                        <Calendar size={16} className="text-slate-400" /> 
                                        {new Date(report.createdAt).toLocaleDateString()}
                                    </td>
                                    <td className={`px-6 py-5 font-bold ${
                                        report.fatigueLevel === 'Severe' ? 'text-red-600' : 
                                        report.fatigueLevel === 'Moderate' ? 'text-amber-600' : 'text-green-600'
                                    }`}>
                                        {report.fatigueLevel} ({report.fatigueScore}%)
                                    </td>
                                    <td className="px-6 py-5">
                                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                                            report.fatigueLevel === 'Normal' ? 'bg-green-100 text-green-700' : 
                                            report.fatigueLevel === 'Moderate' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'
                                        }`}>
                                            {report.fatigueLevel === 'Normal' ? <CheckCircle2 size={12}/> : <AlertCircle size={12}/>}
                                            {report.recommendation || 'No Recommendation'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-5 text-right">
                                        <button className="text-blue-600 font-bold text-sm hover:underline">View Details</button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Reports;