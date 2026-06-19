import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "@/components/Layout/Navbar";
import Toast from "@/components/Layout/Toast";
import CategorySelectorModal from "@/components/Modals/CategorySelectorModal";
import CouponModal from "@/components/Modals/CouponModal";
import Supply from "@/pages/Supply";
import Team from "@/pages/Team";
import Records from "@/pages/Records";

export default function App() {
  return (
    <Router>
      <div className="min-h-screen pb-20 md:pb-0">
        <Navbar />
        <main className="container mx-auto px-4 pt-24 pb-8">
          <Routes>
            <Route path="/" element={<Supply />} />
            <Route path="/team" element={<Team />} />
            <Route path="/records" element={<Records />} />
          </Routes>
        </main>
        <Toast />
        <CategorySelectorModal />
        <CouponModal />
      </div>
    </Router>
  );
}
