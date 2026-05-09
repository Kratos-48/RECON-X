import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Trash2, Eye, Upload } from "lucide-react";
import toast from "react-hot-toast";
import axiosInstance from "../lib/axios";

const HistoryPage = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => { fetchJobs(); }, []);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get("/api/jobs");
      setJobs(res.data);
    } catch {
      toast.error("Failed to load job history");
    } finally {
      setLoading(false);
    }
  };

  const deleteJob = async (jobId) => {
    try {
      await axiosInstance.delete(`/api/jobs/${jobId}`);
      toast.success("Job deleted!");
      fetchJobs();
    } catch {
      toast.error("Failed to delete job");
    }
  };

  const formatDate = (dateStr) => new Date(dateStr).toLocaleString();

  const getMatchPercent = (job) => {
    if (!job.total_rows) return 0;
    return Math.round((job.matched_rows / job.total_rows) * 100);
  };

  return (
    <div className="min-h-screen bg-base-300 text-base-content flex flex-col">
      {/* Header */}
      <header className="bg-base-200 border-b border-base-content/10 flex justify-between items-center px-6 h-16 fixed top-0 w-full z-50">
        <span className="text-2xl font-bold text-primary tracking-tighter">RECON-X</span>
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-2 text-xs text-base-content/60 hover:text-primary transition-colors"
        >
          <Upload size={14} /> New Job
        </button>
      </header>

      {/* Sidebar */}
      <nav className="bg-base-200 border-r border-base-content/10 fixed left-0 top-0 h-full w-64 flex flex-col pt-16 z-40">
        <div className="flex flex-col gap-1 mt-6">
          <a href="/" className="text-base-content/60 px-4 py-3 flex items-center gap-3 hover:text-primary text-xs uppercase tracking-widest border-l-4 border-transparent transition-all">
            Dashboard
          </a>
          <a href="/history" className="text-primary bg-primary/10 border-l-4 border-primary px-4 py-3 flex items-center gap-3 text-xs uppercase tracking-widest">
            History
          </a>
        </div>
      </nav>

      {/* Main */}
      <main className="ml-64 pt-16 flex-1 px-8 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-base-content mb-1">Job History</h1>
          <p className="text-sm text-base-content/60">All past reconciliation jobs and their results.</p>
        </div>

        {loading ? (
          <div className="text-center text-base-content/40 py-20">Loading...</div>
        ) : jobs.length === 0 ? (
          <div className="text-center text-base-content/40 py-20">
            <p className="mb-4">No jobs found.</p>
            <button
              onClick={() => navigate("/")}
              className="bg-primary text-primary-content px-6 py-2 rounded text-xs font-bold uppercase tracking-widest hover:brightness-110 transition-all"
            >
              Start First Job
            </button>
          </div>
        ) : (
          <div className="bg-base-200 border border-base-content/10 rounded overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead className="bg-base-200 shadow-[0_2px_0_0_oklch(var(--p))]">
                <tr>
                  <th className="text-[10px] tracking-widest text-base-content/60 py-3 px-4 uppercase">Job ID</th>
                  <th className="text-[10px] tracking-widest text-base-content/60 py-3 px-4 uppercase">File A</th>
                  <th className="text-[10px] tracking-widest text-base-content/60 py-3 px-4 uppercase">File B</th>
                  <th className="text-[10px] tracking-widest text-base-content/60 py-3 px-4 uppercase">Total Rows</th>
                  <th className="text-[10px] tracking-widest text-base-content/60 py-3 px-4 uppercase">Match %</th>
                  <th className="text-[10px] tracking-widest text-base-content/60 py-3 px-4 uppercase">Mismatches</th>
                  <th className="text-[10px] tracking-widest text-base-content/60 py-3 px-4 uppercase">Date</th>
                  <th className="text-[10px] tracking-widest text-base-content/60 py-3 px-4 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="text-xs divide-y divide-base-content/10">
                {jobs.map((job) => (
                  <tr key={job.job_id} className="hover:bg-base-300 transition-colors">
                    <td className="py-3 px-4 text-primary font-mono text-[11px]">{job.job_id.slice(0, 8)}...</td>
                    <td className="py-3 px-4 text-base-content/60">{job.file1_name}</td>
                    <td className="py-3 px-4 text-base-content/60">{job.file2_name}</td>
                    <td className="py-3 px-4 text-base-content">{job.total_rows}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${getMatchPercent(job) >= 90 ? "bg-primary/10 text-primary" : "bg-error/10 text-error"}`}>
                        {getMatchPercent(job)}%
                      </span>
                    </td>
                    <td className="py-3 px-4 text-error">{job.mismatched_rows}</td>
                    <td className="py-3 px-4 text-base-content/60 font-mono text-[11px]">{formatDate(job.created_at)}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => navigate(`/results/${job.job_id}`)}
                          className="p-1.5 rounded hover:bg-primary/10 text-primary transition-colors"
                          title="View Results"
                        >
                          <Eye size={14} />
                        </button>
                        <button
                          onClick={() => deleteJob(job.job_id)}
                          className="p-1.5 rounded hover:bg-error/10 text-error transition-colors"
                          title="Delete Job"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
};

export default HistoryPage;