// import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
// import Sidebar from "./components/Sidebar";
// import EditProfile from "./components/EditProfile/EditProfile";
// import Testimonials from "./components/Testimonials/Testimonials"
// import DeliverableMaster from "./components/EventMasters/DeliverableMaster";
// import CategoryMaster from "./components/EventMasters/CategoryMaster"
// import CategorySubMaster from "./components/EventMasters/CategorySubMaster";
// import EventSuperMaster from "./components/EventMasters/EventSuperMaster"
// import EventMaster from "./components/EventMasters/EventMaster";
// import CategoryWiseDeliverableMaster from "./components/EventMasters/CategoryWiseDeliverableMaster"
// import SponsorMaster from "./components/EventMasters/sponsorMaster"
// import ExpoRegistryTracker from "./components/ExpoRegistryTracker/ExpoRegistryTracker";
// import AwardMaster from "./components/EventMasters/AwardMaster";
// import AwardRegistryTracker from "./components/ExpoRegistryTracker/AwardRegistryTracker";
// import CuratedSession from "./components/ExpoRegistryTracker/CuratedSession";
// import MinisterialSession from "./components/ExpoRegistryTracker/MinisterialSession";
// import SlotMaster from "./components/EventMasters/SlotMaster";
// import PassessRegistry from "./components/ExpoRegistryTracker/PassessRegistry";
// // import Footer from "./Pages/Footer/Footer";
// import Login from "./Pages/Login/Login";


// const Layout = () => {
//   const location = useLocation();

//   const hideLayoutRoutes = ["/", "/verifyotp"];

//   const shouldHideLayout = hideLayoutRoutes.includes(location.pathname);

//   if (shouldHideLayout) {
//     return (
//       <Routes>
//         <Route path="/" element={<Login />} />
//       </Routes>
//     );

//   }

//   return (
//     <div className="flex h-screen">
//       <Sidebar />
//       <div className="flex-1 flex flex-col min-h-screen">
//         <div className="flex-1 overflow-y-auto p-4">
//           <Routes>
//             <Route path="/editprofile" element={<EditProfile />} />
//             <Route path="/testimonials" element={<Testimonials />} />
//             <Route path="/deliverable-master" element={<DeliverableMaster />} />
//             <Route path="/category-master" element={<CategoryMaster />} />
//             <Route path="/categorysub-master" element={<CategorySubMaster />} />
//             <Route path="/eventsupermaster" element={<EventSuperMaster />} />
//             <Route path="/eventmaster" element={<EventMaster />} />
//             <Route path="/CategoryWiseDeliverableMaster" element={<CategoryWiseDeliverableMaster />} />
//             <Route path="/sponsor-master" element={<SponsorMaster />} />
//             <Route path="/exporegistry-tracker" element={<ExpoRegistryTracker />} />
//             <Route path="/award-master" element={<AwardMaster />} />
//             <Route path="/award-registry" element={<AwardRegistryTracker />} />
//             <Route path="/curated-sessions" element={<CuratedSession />} />
//             <Route path="/ministrial-sessions" element={<MinisterialSession />} />
//             <Route path="/slot-master" element={<SlotMaster />} />
//                 <Route path="/passess-registry" element={<PassessRegistry />} />
//           </Routes>
//           {/* <Footer /> */}
//         </div>
//       </div>
//     </div>
//   );
// };

// function App() {
//   return (
//     <Router>
//       <Layout />
//     </Router>
//   );
// }

// export default App;













import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from "react-router-dom";
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
import AwardMaster from "./components/EventMasters/AwardMaster";
import AwardRegistryTracker from "./components/ExpoRegistryTracker/AwardRegistryTracker";
import CuratedSession from "./components/ExpoRegistryTracker/CuratedSession";
import MinisterialSession from "./components/ExpoRegistryTracker/MinisterialSession";
import SlotMaster from "./components/EventMasters/SlotMaster";
import PassessRegistry from "./components/ExpoRegistryTracker/PassessRegistry";
import Login from "./Pages/Login/Login";
import ProtectedRoute from "./common/ProtectedRoutes/ProtectedRoute";
import NotFound from "./components/PageNotFound/PageNotFound";
import SpeakerTracker from "./components/ExpoRegistryTracker/SpeakerTracker";
import Dashboard from "./Pages/Dashboard/Dashboard";
import EventList from "./Pages/Login/EventList";

const Layout = () => {
  const location = useLocation();

  const hideLayoutRoutes = ["/", "/verifyotp","/event-list"];
  const noSidebarRoutes = ["/", "/verifyotp","/event-list"]; 

  // Check if user is authenticated
  const isAuthenticated = () => {
    const encryptedToken = sessionStorage.getItem('access_token');
    return !!encryptedToken;
  };

  const shouldHideLayout = hideLayoutRoutes.includes(location.pathname);
  const shouldHideSidebar = noSidebarRoutes.includes(location.pathname);

  if (shouldHideLayout) {
    return (
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="*" element={<Navigate to="/" replace />} />
         <Route path="/event-list" element={<EventList />} />
      </Routes>
    );
  }


  if (!isAuthenticated()) {
    return <Navigate to="/" replace />;
  }


  const isValidRoute = [
    "/editprofile",
    "/testimonials",
    "/deliverable-master",
    "/category-master",
    "/categorysub-master",
    "/eventsupermaster",
    "/eventmaster",
    "/CategoryWiseDeliverableMaster",
    "/sponsor-master",
    "/exporegistry-tracker",
    "/award-master",
    "/award-registry",
    "/curated-sessions",
    "/ministrial-sessions",
    "/slot-master",
    "/passess-registry",
    "/speaker-tracker",
    "/dashboard",
    "/event-list"
  ].includes(location.pathname);

  if (!isValidRoute) {
    return <NotFound />;
  }

  return (
    <div className="flex h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col min-h-screen">
        <div className="flex-1 overflow-y-auto p-4">
          <Routes>
            <Route path="/editprofile" element={
              <ProtectedRoute>
                <EditProfile />
              </ProtectedRoute>
            } />
            <Route path="/testimonials" element={
              <ProtectedRoute>
                <Testimonials />
              </ProtectedRoute>
            } />
            <Route path="/deliverable-master" element={
              <ProtectedRoute>
                <DeliverableMaster />
              </ProtectedRoute>
            } />
            <Route path="/category-master" element={
              <ProtectedRoute>
                <CategoryMaster />
              </ProtectedRoute>
            } />
            <Route path="/categorysub-master" element={
              <ProtectedRoute>
                <CategorySubMaster />
              </ProtectedRoute>
            } />
            <Route path="/eventsupermaster" element={
              <ProtectedRoute>
                <EventSuperMaster />
              </ProtectedRoute>
            } />
            <Route path="/eventmaster" element={
              <ProtectedRoute>
                <EventMaster />
              </ProtectedRoute>
            } />
            <Route path="/CategoryWiseDeliverableMaster" element={
              <ProtectedRoute>
                <CategoryWiseDeliverableMaster />
              </ProtectedRoute>
            } />
            <Route path="/sponsor-master" element={
              <ProtectedRoute>
                <SponsorMaster />
              </ProtectedRoute>
            } />
            <Route path="/exporegistry-tracker" element={
              <ProtectedRoute>
                <ExpoRegistryTracker />
              </ProtectedRoute>
            } />
            <Route path="/award-master" element={
              <ProtectedRoute>
                <AwardMaster />
              </ProtectedRoute>
            } />
            <Route path="/award-registry" element={
              <ProtectedRoute>
                <AwardRegistryTracker />
              </ProtectedRoute>
            } />
            <Route path="/curated-sessions" element={
              <ProtectedRoute>
                <CuratedSession />
              </ProtectedRoute>
            } />
            <Route path="/ministrial-sessions" element={
              <ProtectedRoute>
                <MinisterialSession />
              </ProtectedRoute>
            } />
            <Route path="/slot-master" element={
              <ProtectedRoute>
                <SlotMaster />
              </ProtectedRoute>
            } />
            <Route path="/passess-registry" element={
              <ProtectedRoute>
                <PassessRegistry />
              </ProtectedRoute>
            } />
                <Route path="/speaker-tracker" element={
              <ProtectedRoute>
                <SpeakerTracker />
              </ProtectedRoute>
            } />
                <Route path="/dashboard" element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } />

              <Route path="/event-list" element={
              <ProtectedRoute>
                <EventList />
              </ProtectedRoute>
            } />
          </Routes>
        </div>
      </div>
    </div>
  );
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        
        <Route path="/*" element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        } />

        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}

export default App;