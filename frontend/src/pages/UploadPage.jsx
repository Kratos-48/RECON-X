import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Upload, Settings, ArrowRight } from "lucide-react";
import toast from "react-hot-toast";
import axiosInstance from "../lib/axios";

const UploadPage = () => {
  const [file1, setFile1] = useState(null);
  const [file2, setFile2] = useState(null);
  const [keyColumn, setKeyColumn] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async () => {
    if (!file1 || !file2 || !keyColumn.trim()) {
      toast.error("Please upload both files and enter a key column!");
      return;
    }

    const formData = new FormData();
    formData.append("file1", file1);
    formData.append("file2", file2);
    formData.append("keyColumn", keyColumn.trim());

    try {
      setLoading(true);
      const res = await axiosInstance.post("/api/upload", formData);
      toast.success("Reconciliation complete!");
      navigate(`/results/${res.data.jobId}`);
    } catch (err) {
      toast.error(err.response?.data?.error || "Something went wrong!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-base-300 text-base-content flex flex-col">
      {/* Header */}
      <header className="bg-base-200 border-b border-base-content/10 flex justify-between items-center px-6 h-16 fixed top-0 w-full z-50">
        <span className="text-2xl font-bold text-primary tracking-tighter">RECON-X</span>
        <button onClick={() => navigate("/history")} className="text-base-content/60 hover:text-primary text-sm transition-colors">
          History
        </button>
      </header>

      {/* Sidebar */}
      <nav className="bg-base-200 border-r border-base-content/10 fixed left-0 top-0 h-full w-64 flex flex-col pt-16 z-40">
        <div className="flex flex-col gap-1 mt-6">
          <a href="/" className="text-primary bg-primary/10 border-l-4 border-primary px-4 py-3 flex items-center gap-3 text-xs uppercase tracking-widest">
            <Upload size={18} /> Dashboard
          </a>
          <a href="/history" className="text-base-content/60 px-4 py-3 flex items-center gap-3 hover:text-primary text-xs uppercase tracking-widest border-l-4 border-transparent transition-all">
            <Settings size={18} /> History
          </a>
        </div>
      </nav>

      {/* Main */}
      <main className="ml-64 pt-16 flex-1 px-8 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-base-content mb-1">Initiate Reconciliation Job</h1>
          <p className="text-sm text-base-content/60">Upload two Excel files and configure matching parameters.</p>
        </div>

        {/* Upload Zones */}
        <div className="grid grid-cols-2 gap-6 mb-8">
          {/* File 1 */}
          <div className="bg-base-200 border border-base-content/10 rounded-lg p-6 flex flex-col">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xs font-mono text-base-content uppercase tracking-widest">Source A: System of Record</h2>
              <span className="px-2 py-1 rounded bg-base-300 border border-base-content/10 text-[10px] text-base-content/60 uppercase tracking-widest">Required</span>
            </div>
            <label className="flex-1 border-2 border-dashed border-primary/60 bg-base-300/30 rounded-lg flex flex-col items-center justify-center p-12 hover:border-primary transition-colors cursor-pointer">
              <Upload size={36} className="text-primary mb-4" />
              <p className="text-sm text-base-content mb-1">{file1 ? file1.name : "Drag & drop or browse"}</p>
              <p className="text-xs text-base-content/40">Supported: XLSX, XLS</p>
              <input type="file" accept=".xlsx,.xls" className="hidden" onChange={(e) => setFile1(e.target.files[0])} />
            </label>
          </div>

          {/* File 2 */}
          <div className="bg-base-200 border border-base-content/10 rounded-lg p-6 flex flex-col">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xs font-mono text-base-content uppercase tracking-widest">Source B: Counterparty Data</h2>
              <span className="px-2 py-1 rounded bg-base-300 border border-base-content/10 text-[10px] text-base-content/60 uppercase tracking-widest">Required</span>
            </div>
            <label className="flex-1 border-2 border-dashed border-primary/60 bg-base-300/30 rounded-lg flex flex-col items-center justify-center p-12 hover:border-primary transition-colors cursor-pointer">
              <Upload size={36} className="text-primary mb-4" />
              <p className="text-sm text-base-content mb-1">{file2 ? file2.name : "Drag & drop or browse"}</p>
              <p className="text-xs text-base-content/40">Supported: XLSX, XLS</p>
              <input type="file" accept=".xlsx,.xls" className="hidden" onChange={(e) => setFile2(e.target.files[0])} />
            </label>
          </div>
        </div>

        {/* Config */}
        <div className="bg-base-200 border border-base-content/10 rounded-lg p-6 mb-8">
          <h2 className="text-xs font-mono text-base-content uppercase tracking-widest mb-6 flex items-center gap-2">
            <Settings size={16} className="text-primary" /> Job Configuration
          </h2>
          <div>
            <label className="block text-[10px] text-base-content/60 uppercase tracking-widest mb-2">Primary Reconciliation Key Column</label>
            <input
              type="text"
              placeholder="e.g. transaction_id, employee_id, order_no..."
              className="w-full bg-base-300 border border-base-content/10 rounded px-4 py-2 text-sm text-base-content placeholder:text-base-content/30 focus:outline-none focus:border-primary transition-colors"
              value={keyColumn}
              onChange={(e) => setKeyColumn(e.target.value)}
            />
            <p className="text-[10px] text-base-content/40 mt-2">This column must exist in both files and will be used to match rows.</p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-4">
          <button
            onClick={() => { setFile1(null); setFile2(null); setKeyColumn(""); }}
            className="px-6 py-2 rounded border border-base-content/20 text-base-content/60 text-xs uppercase tracking-widest hover:border-primary hover:text-primary transition-colors"
          >
            Reset
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="px-6 py-2 rounded bg-primary text-primary-content text-xs font-bold uppercase tracking-widest flex items-center gap-2 hover:brightness-110 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Processing..." : <>Run Reconciliation <ArrowRight size={14} /></>}
          </button>
        </div>
      </main>
    </div>
  );
};

export default UploadPage;