import { Routes, Route } from "react-router-dom";
import UploadPage from "./pages/UploadPage";
import ResultsPage from "./pages/ResultsPage";
import HistoryPage from "./pages/HistoryPage";

function App() {
  return (
    <Routes>
      <Route path="/" element={<UploadPage />} />
      <Route path="/results/:jobId" element={<ResultsPage />} />
      <Route path="/history" element={<HistoryPage />} />
    </Routes>
  );
}

export default App;