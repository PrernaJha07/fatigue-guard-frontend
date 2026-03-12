import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Calendar, Download, AlertCircle, FileText, X } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { useAuth } from '../context/AuthContext'; // Import your Auth context

const Reports = () => {
    const { token } = useAuth(); // Access the secure token
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedReport, setSelectedReport] = useState(null);

    // --- DYNAMIC API URL ---
    const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

    const userStored = localStorage.getItem('user');
    const userData = userStored ? JSON.parse(userStored) : null;
    const userId = userData ? userData.id : 1; 

    const fetchHistory = async () => {
        try {
            setLoading(true);
            // UPDATED: Dynamic URL and Authorization header
            const res = await axios.get(`${API_BASE_URL}/api/reports/${userId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setReports(res.data);
        } catch (err) {
            console.error("Reports: Error fetching history", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (userId) fetchHistory();
    }, [userId, token]);

    const exportToPDF = () => {
        if (reports.length === 0) {
            alert("No data available to export.");
            return;
        }

        const doc = new jsPDF();
        doc.setFontSize(20);
        doc.text("AI.FATIGUE_GUARD: Historical Report", 14, 22);
        
        doc.setFontSize(10);
        doc.setTextColor(100);
        doc.text(`User: ${userData?.name || userId} | Generated: ${new Date().toLocaleString()}`, 14, 30);

        const tableColumn = ["Date", "Fatigue Level", "Score", "Recommendation"];
        const tableRows = reports.map(report => [
            new Date(report.createdAt).toLocaleDateString(),
            report.fatigueLevel,
            `${report.fatigueScore}%`,
            report.recommendation || "Monitoring active"
        ]);

        autoTable(doc, {
            startY: 40,
            head: [tableColumn],
            body: tableRows,
            theme: 'striped',
            headStyles: { fillColor: [59, 130, 246] }
        });

        doc.save(`Fatigue_Report_${new Date().toLocaleDateString()}.pdf`);
    };

    if (loading) {
        return (
            <div className="p-8 flex items-center justify-center min-h-[50vh]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="p-8 max-w-6xl animate-in fade-in duration-700">
            <div className="flex justify-between items-end mb-10">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">Daily Fatigue Reports</h1>
                    <p className="text-slate-500 mt-1">Historical tracking of cognitive strain and behavioral patterns.</p>
                </div>
                <button 
                    onClick={exportToPDF}
                    className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-100"
                >
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
                        {reports.length > 0 ? reports.map((report) => (
                            <tr key={report._id} className="hover:bg-slate-50/50 transition-colors">
                                <td className="px-6 py-5 font-semibold text-slate-700 flex items-center gap-2">
                                    <Calendar size={16} className="text-slate-400" /> 
                                    {new Date(report.createdAt).toLocaleDateString()}
                                </td>
                                <td className={`px-6 py-5 font-bold ${
                                    report.fatigueLevel === 'Severe' ? 'text-red-600' : 
                                    report.fatigueLevel === 'Moderate' || report.fatigueLevel === 'Medium' ? 'text-amber-600' : 'text-green-600'
                                }`}>
                                    {report.fatigueLevel} ({report.fatigueScore}%)
                                </td>
                                <td className="px-6 py-5">
                                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                                        report.fatigueLevel === 'Low' || report.fatigueLevel === 'Normal' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                                    }`}>
                                        <AlertCircle size={12}/> {report.recommendation || 'Normal'}
                                    </span>
                                </td>
                                <td className="px-6 py-5 text-right">
                                    <button 
                                        onClick={() => setSelectedReport(report)}
                                        className="text-blue-600 font-bold text-sm hover:underline flex items-center gap-1 justify-end ml-auto"
                                    >
                                        <FileText size={14} /> Details
                                    </button>
                                </td>
                            </tr>
                        )) : (
                            <tr>
                                <td colSpan="4" className="px-6 py-10 text-center text-slate-400">No reports found in the history.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* DETAILS MODAL */}
            {selectedReport && (
                <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in duration-300">
                        <div className="p-6 border-b flex justify-between items-center bg-slate-50">
                            <h3 className="font-bold text-slate-800">Fatigue Incident Details</h3>
                            <button onClick={() => setSelectedReport(null)} className="text-slate-400 hover:text-slate-600"><X /></button>
                        </div>
                        <div className="p-8 space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-4 bg-slate-50 rounded-2xl">
                                    <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Fatigue Score</p>
                                    <p className="text-2xl font-black text-blue-600">{selectedReport.fatigueScore}%</p>
                                </div>
                                <div className="p-4 bg-slate-50 rounded-2xl">
                                    <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Mouse Precision</p>
                                    <p className="text-2xl font-black text-emerald-600">{selectedReport.mousePrecision || 100}%</p>
                                </div>
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-slate-400 uppercase mb-2">System Recommendation</p>
                                <div className="p-4 border-2 border-blue-50 bg-blue-50/30 rounded-2xl italic text-slate-700 text-sm">
                                    "{selectedReport.recommendation}"
                                </div>
                            </div>
                            <div className="text-[10px] text-slate-400 font-medium text-center italic">
                                Captured on {new Date(selectedReport.createdAt).toLocaleString()}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Reports;
