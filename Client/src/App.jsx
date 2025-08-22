import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import EditProfile from "./components/EditProfile/EditProfile";
import Testimonials from "./components/Testimonials/Testimonials"
import DeliverableMaster from "./components/EventMasters/DeliverableMaster";
import CategoryMaster from "./components/EventMasters/CategoryMaster"
import CategorySubMaster from "./components/EventMasters/CategorySubMaster";
import EventSuperMaster from "./components/EventMasters/EventSuperMaster"
import EventMaster from "./components/EventMasters/EventMaster";
import CategoryWiseDeliverableMaster from "./components/EventMasters/CategoryWiseDeliverableMaster"
import SponsorMaster from "./components/EventMasters/sponsorMaster"
import ExpoRegistryTracker from "./components/ExpoRegistryTracker/ExpoRegistryTracker";
// import Footer from "./Pages/Footer/Footer";
import Login from "./Pages/Login/Login";


const Layout = () => {
  const location = useLocation();

  const hideLayoutRoutes = ["/", "/verifyotp"];

  const shouldHideLayout = hideLayoutRoutes.includes(location.pathname);

  if (shouldHideLayout) {
    return (
      <Routes>
        <Route path="/" element={<Login />} />
      </Routes>
    );

  }

  return (
    <div className="flex h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col min-h-screen">
        <div className="flex-1 overflow-y-auto p-4">
          <Routes>
            <Route path="/editprofile" element={<EditProfile />} />
            <Route path="/testimonials" element={<Testimonials />} />
            <Route path="/deliverable-master" element={<DeliverableMaster />} />
            <Route path="/category-master" element={<CategoryMaster />} />
            <Route path="/categorysub-master" element={<CategorySubMaster />} />
            <Route path="/eventsupermaster" element={<EventSuperMaster />} />
            <Route path="/eventmaster" element={<EventMaster />} />
            <Route path="/CategoryWiseDeliverableMaster" element={<CategoryWiseDeliverableMaster />} />
            <Route path="/sponsor-master" element={<SponsorMaster />} />
             <Route path="/exporegistry-tracker" element={<ExpoRegistryTracker />} />
          </Routes>
          {/* <Footer /> */}
        </div>
      </div>
    </div>
  );
};

function App() {
  return (
    <Router>
      <Layout />
    </Router>
  );
}

export default App;
