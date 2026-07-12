import { Routes, Route } from "react-router-dom";
import Home from "../pages/Home";
import Dashboard from "../pages/Dashboard";
import Experimental from "../pages/Experimental/experimental";
import NotFound from "../pages/NotFound";
import VerifyEmail from "../pages/VerifyEmail";
import About from "../pages/About";
import Fadelands from "../pages/Fadelands";
import RxjsPlayground from "../pages/RxjsPlayground";

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/about" element={<About />} />
      <Route path="/verify-email" element={<VerifyEmail />} />
      <Route path="/fadelands" element={<Fadelands />} />
      <Route path="/rxjs" element={<RxjsPlayground />} />
      <Route path="*" element={<NotFound />} />
      <Route path="/experimental" element={<Experimental />} />
    </Routes>
  );
}

