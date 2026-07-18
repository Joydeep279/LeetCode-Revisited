import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import DashboardPage from "./pages/DashboardPage";
import ProgressPage from "./pages/ProgressPage";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/dashboard/:username" element={<DashboardPage />} />
        <Route path="/progress/:username" element={<ProgressPage />} />
      </Routes>
    </Router>
  );
}
