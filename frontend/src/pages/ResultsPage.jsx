import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Download, ArrowLeft, Search } from "lucide-react";
import toast from "react-hot-toast";
import axiosInstance from "../lib/axios";

const ResultsPage = () => {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [results, setResults] = useState([]);
  const [pagination, setPagination] = useState({});
  const [page, setPage] = useState(1);
  const [typeFilter, setTypeFilter] = useState("");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchJob(); }, [jobId]);
  useEffect(() => { fetchResults(); }, [jobId, page, typeFilter]);

  const fetchJob = async () => {
    try {
      const res = await axiosInstance.get(`/api/jobs/${jobId}`);
      setJob(res.data);
    } catch {
      toast.error("Failed to load job details");
    }
  };

  const fetchResults = async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get(`/api/jobs/${jobId}/results`, {
        params: { page, limit: 50, type: typeFilter || undefined },
      });
      setResults(res.data.results);
      setPagination(res.data.pagination);
    } catch {
      toast.error("Failed to load results");
    } finally {
      setLoading(false);
    }
  };

  const filteredResults = results.filter((r) =>
    search ? r.row_key?.toLowerCase().includes(search.toLowerCase()) : true
  );

  const getTypeBadge = (type) => {
    if (type === "mismatch") return <span className="px-2 py-0.5 rounded bg-error/10 text-error border border-error/20 text-[9px] uppercase tracking-widest">Mismatch</span>;
    if (type === "missing_in_file1") return <span className="px-2 py-0.5 rounded bg-base-content/10 text-base-content/60 border border-base-content/20 text-[9px] uppercase tracking-widest">Missing A</span>;
    if (type === "missing_in_file2") return <span className="px-2 py-0.5 rounded bg-base-content/10 text-base-content/60 border border-base-content/20 text-[9px] uppercase tracking-widest">Missing B</span>;
  };

  return (
    <div className="min-h-screen bg-base-300 text-base-content flex flex-col">
      {/* Header */}
      <header className="bg-base-200 border-b border-base-content/10 flex justify-between items-center px-6 h-16 fixed top-0 w-full z-50">
        <span className="text-2xl font-bold text-primary tracking-tighter">RECON-X</span>
        <button onClick={() => navigate("/history")} className="text-base-content/60 hover:text-primary text-sm transition-colors">History</button>
      </header>

      {/* Sidebar */}
      <nav className="bg-base-200 border-r border-base-content/10 fixed left-0 top-0 h-full w-64 flex flex-col pt-16 z-40">
        <div className="flex flex-col gap-1 mt-6">
          <a href="/" className="text-base-content/60 px-4 py-3 flex items-center gap-3 hover:text-primary text-xs uppercase tracking-widest border-l-4 border-transparent transition-all">Dashboard</a>
          <a href="/history" className="text-base-content/60 px-4 py-3 flex items-center gap-3 hover:text-primary text-xs uppercase tracking-widest border-l-4 border-transparent transition-all">History</a>
        </div>
      </nav>

      {/* Main */}
      <main className="ml-64 pt-16 flex-1 px-8 py-8">
        {/* Page Header */}
        <div className="flex justify-between items-end mb-6">
          <div>
            <button onClick={() => navigate("/")} className="flex items-center gap-1 text-base-content/60 hover:text-primary text-xs mb-2 transition-colors">
              <ArrowLeft size={14} /> Back to Upload
            </button>
            <h1 className="text-2xl font-semibold text-base-content mb-1">Reconciliation Results</h1>
            <p className="text-xs text-base-content/60 font-mono">Job ID: <span className="text-primary">{jobId}</span></p>
          </div>
          <button
            onClick={() => window.open(`https://recon-x-backend.onrender.com/api/jobs/${jobId}/export`, "_blank")
            className="bg-primary text-primary-content px-4 py-2 rounded text-xs font-bold uppercase tracking-widest flex items-center gap-2 hover:brightness-110 transition-all"
          >
            <Download size={14} /> Export Report
          </button>
        </div>

        {/* Stats Cards */}
        {job && (
          <div className="grid grid-cols-4 gap-4 mb-6">
            <div className="bg-base-200 border border-base-content/10 rounded p-5 flex flex-col justify-between h-28">
              <span className="text-[10px] text-base-content/60 uppercase tracking-widest">Total Records</span>
              <span className="text-3xl font-bold text-base-content">{job.total_rows}</span>
            </div>
            <div className="bg-base-200 border border-primary/30 rounded p-5 flex flex-col justify-between h-28">
              <span className="text-[10px] text-primary uppercase tracking-widest">Matched</span>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-base-content">{job.matched_rows}</span>
                <span className="text-xs text-primary bg-primary/10 px-1.5 py-0.5 rounded">
                  {job.total_rows ? Math.round((job.matched_rows / job.total_rows) * 100) : 0}%
                </span>
              </div>
            </div>
            <div className="bg-base-200 border border-error/50 rounded p-5 flex flex-col justify-between h-28">
              <span className="text-[10px] text-error uppercase tracking-widest">Value Mismatches</span>
              <span className="text-3xl font-bold text-error">{job.mismatched_rows}</span>
            </div>
            <div className="bg-base-200 border border-base-content/10 border-dashed rounded p-5 flex flex-col justify-between h-28">
              <span className="text-[10px] text-base-content/40 uppercase tracking-widest">Missing Records</span>
              <span className="text-3xl font-bold text-base-content/60">{job.missing_in_file1 + job.missing_in_file2}</span>
            </div>
          </div>
        )}

        {/* Toolbar */}
        <div className="bg-base-200 border border-base-content/10 rounded p-3 flex justify-between items-center mb-4">
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-base-content/40" />
              <input
                type="text"
                placeholder="Search row key..."
                className="bg-base-300 border-none rounded pl-9 pr-4 py-1.5 text-xs text-base-content focus:outline-none focus:ring-1 focus:ring-primary placeholder:text-base-content/30 w-64"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <select
              className="bg-base-300 border border-base-content/10 rounded px-3 py-1.5 text-xs text-base-content focus:outline-none focus:border-primary"
              value={typeFilter}
              onChange={(e) => { setTypeFilter(e.target.value); setPage(1); }}
            >
              <option value="">All Types</option>
              <option value="mismatch">Mismatches</option>
              <option value="missing_in_file1">Missing in A</option>
              <option value="missing_in_file2">Missing in B</option>
            </select>
          </div>
          <span className="text-xs text-base-content/60 font-mono">
            Showing {filteredResults.length} of {pagination.total || 0} results
          </span>
        </div>

        {/* Table */}
        <div className="bg-base-200 border border-base-content/10 rounded overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="sticky top-0 bg-base-200 shadow-[0_2px_0_0_oklch(var(--p))]">
                <tr>
                  <th className="text-[10px] tracking-widest text-base-content/60 py-3 px-4 uppercase">Status</th>
                  <th className="text-[10px] tracking-widest text-base-content/60 py-3 px-4 uppercase">Row Key</th>
                  <th className="text-[10px] tracking-widest text-base-content/60 py-3 px-4 uppercase">Sheet</th>
                  <th className="text-[10px] tracking-widest text-base-content/60 py-3 px-4 uppercase">Column</th>
                  <th className="text-[10px] tracking-widest text-base-content/60 py-3 px-4 uppercase">File 1 Value</th>
                  <th className="text-[10px] tracking-widest text-base-content/60 py-3 px-4 uppercase">File 2 Value</th>
                </tr>
              </thead>
              <tbody className="text-xs divide-y divide-base-content/10">
                {loading ? (
                  <tr><td colSpan={6} className="py-12 text-center text-base-content/40">Loading...</td></tr>
                ) : filteredResults.length === 0 ? (
                  <tr><td colSpan={6} className="py-12 text-center text-base-content/40">No results found</td></tr>
                ) : filteredResults.map((r) => (
                  <tr key={r.id} className="hover:bg-base-300 transition-colors relative">
                    <td className="py-2.5 px-4 relative">
                      <div className={`absolute left-0 top-0 bottom-0 w-[3px] ${r.type === "mismatch" ? "bg-error" : "bg-base-content/30"}`}></div>
                      {getTypeBadge(r.type)}
                    </td>
                    <td className="py-2.5 px-4 text-primary font-mono">{r.row_key}</td>
                    <td className="py-2.5 px-4 text-base-content/60">{r.sheet_name}</td>
                    <td className="py-2.5 px-4 text-base-content/60">{r.column_name || "—"}</td>
                    <td className="py-2.5 px-4 bg-base-300/50">{r.file1_value || "—"}</td>
                    <td className={`py-2.5 px-4 ${r.type === "mismatch" ? "text-error" : ""}`}>{r.file2_value || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex justify-center items-center gap-4 p-4 border-t border-base-content/10">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-4 py-1.5 rounded border border-base-content/20 text-xs text-base-content/60 hover:border-primary hover:text-primary disabled:opacity-30 transition-colors"
              >
                Previous
              </button>
              <span className="text-xs text-base-content/60 font-mono">Page {page} of {pagination.totalPages}</span>
              <button
                onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
                disabled={page === pagination.totalPages}
                className="px-4 py-1.5 rounded border border-base-content/20 text-xs text-base-content/60 hover:border-primary hover:text-primary disabled:opacity-30 transition-colors"
              >
                Next
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default ResultsPage;
