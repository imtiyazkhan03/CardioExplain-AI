import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  FileText,
  Trash2,
  DownloadCloud,
  AlertCircle,
  Search,
  UploadCloud
} from 'lucide-react';
import { ecgApi } from '../services/api';
import type { AnalysisRecord } from '../types';


export const HistoryPage: React.FC = () => {
  const navigate = useNavigate();
  const [analyses, setAnalyses] = useState<AnalysisRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchRecords = () => {
    setLoading(true);
    ecgApi.listAnalyses()
      .then((data) => {
        setAnalyses(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    fetchRecords();
  }, []);

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this analysis record and all associated artifacts?')) {
      return;
    }

    try {
      setDeletingId(id);
      await ecgApi.deleteAnalysis(id);
      setAnalyses((prev) => prev.filter((a) => a.id !== id));
    } catch (err) {
      alert('Failed to delete analysis record.');
    } finally {
      setDeletingId(null);
    }
  };

  const filtered = analyses.filter((a) =>
    a.filename.toLowerCase().includes(searchQuery.toLowerCase()) ||
    a.file_type.toLowerCase().includes(searchQuery.toLowerCase()) ||
    a.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Analysis Report History
          </h1>
          <p className="text-slate-600 text-sm mt-1">
            Archived electrocardiogram analyses, extracted measurements, and generated PDF reports.
          </p>
        </div>

        <Link
          to="/upload"
          className="inline-flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white font-semibold px-4 py-2.5 rounded-xl text-xs shadow-xs transition-colors shrink-0"
        >
          <UploadCloud className="w-4 h-4" />
          <span>New ECG Upload</span>
        </Link>
      </div>

      {/* Filter / Search Bar */}
      <div className="flex items-center gap-3 bg-white p-3 rounded-xl border border-slate-200 shadow-xs">
        <Search className="w-4 h-4 text-slate-400 ml-2" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by filename, record ID, or file format..."
          className="w-full text-xs outline-none bg-transparent text-slate-800 placeholder-slate-400"
        />
      </div>

      {/* Table / List */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {loading ? (
          <div className="py-16 text-center text-slate-400 text-xs">
            <div className="w-6 h-6 border-2 border-teal-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
            Loading analysis records...
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center">
            <FileText className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <h3 className="text-sm font-semibold text-slate-800">No records found</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              {searchQuery ? 'Try adjusting your search filter.' : 'Upload an ECG file or launch a demo case to create a record.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 font-semibold">
                  <th className="py-3.5 px-4">Filename / Record</th>
                  <th className="py-3.5 px-3">Date &amp; Time</th>
                  <th className="py-3.5 px-3">Type</th>
                  <th className="py-3.5 px-3">Channels</th>
                  <th className="py-3.5 px-3">Quality</th>
                  <th className="py-3.5 px-3">Clinical Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((item) => {
                  const isUrgent = item.has_urgent_findings;
                  return (
                    <tr
                      key={item.id}
                      onClick={() => navigate(`/analysis/${item.id}`)}
                      className="hover:bg-slate-50/80 cursor-pointer transition-colors"
                    >
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-slate-900">{item.filename}</span>
                          {item.filename.includes('DEMO') && (
                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-amber-100 text-amber-800">
                              DEMO
                            </span>
                          )}
                        </div>
                        <span className="font-mono text-[11px] text-slate-400">{item.id.slice(0, 16)}...</span>
                      </td>

                      <td className="py-3.5 px-3 text-slate-600">
                        {new Date(item.created_at).toLocaleDateString()}{' '}
                        <span className="text-[11px] text-slate-400">
                          {new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </td>

                      <td className="py-3.5 px-3">
                        <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-bold uppercase text-[10px]">
                          {item.file_type}
                        </span>
                      </td>

                      <td className="py-3.5 px-3 text-slate-600">
                        {item.num_leads} lead(s)
                      </td>

                      <td className="py-3.5 px-3">
                        <span
                          className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase ${
                            item.quality.rating === 'high'
                              ? 'bg-emerald-50 text-emerald-700'
                              : 'bg-amber-50 text-amber-700'
                          }`}
                        >
                          {item.quality.rating}
                        </span>
                      </td>

                      <td className="py-3.5 px-3">
                        {isUrgent ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md bg-red-100 text-red-700">
                            <AlertCircle className="w-3 h-3" /> URGENT
                          </span>
                        ) : (
                          <span className="text-[10px] font-medium text-slate-600">
                            Completed
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                          <a
                            href={ecgApi.getReportUrl(item.id)}
                            target="_blank"
                            rel="noreferrer"
                            title="Download PDF Report"
                            className="p-1.5 rounded-lg text-slate-500 hover:text-teal-600 hover:bg-teal-50 transition-colors"
                          >
                            <DownloadCloud className="w-4 h-4" />
                          </a>

                          <button
                            onClick={(e) => handleDelete(item.id, e)}
                            disabled={deletingId === item.id}
                            title="Delete Analysis"
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
