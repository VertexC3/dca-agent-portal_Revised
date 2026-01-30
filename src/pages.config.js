/**
 * pages.config.js - Page routing configuration
 * 
 * This file is AUTO-GENERATED. Do not add imports or modify PAGES manually.
 * Pages are auto-registered when you create files in the ./pages/ folder.
 * 
 * THE ONLY EDITABLE VALUE: mainPage
 * This controls which page is the landing page (shown when users visit the app).
 * 
 * Example file structure:
 * 
 *   import HomePage from './pages/HomePage';
 *   import Dashboard from './pages/Dashboard';
 *   import Settings from './pages/Settings';
 *   
 *   export const PAGES = {
 *       "HomePage": HomePage,
 *       "Dashboard": Dashboard,
 *       "Settings": Settings,
 *   }
 *   
 *   export const pagesConfig = {
 *       mainPage: "HomePage",
 *       Pages: PAGES,
 *   };
 * 
 * Example with Layout (wraps all pages):
 *
 *   import Home from './pages/Home';
 *   import Settings from './pages/Settings';
 *   import __Layout from './Layout.jsx';
 *
 *   export const PAGES = {
 *       "Home": Home,
 *       "Settings": Settings,
 *   }
 *
 *   export const pagesConfig = {
 *       mainPage: "Home",
 *       Pages: PAGES,
 *       Layout: __Layout,
 *   };
 *
 * To change the main page from HomePage to Dashboard, use find_replace:
 *   Old: mainPage: "HomePage",
 *   New: mainPage: "Dashboard",
 *
 * The mainPage value must match a key in the PAGES object exactly.
 */
import AITraining from './pages/AITraining';
import Analytics from './pages/Analytics';
import Automation from './pages/Automation';
import CommunicationDetail from './pages/CommunicationDetail';
import Communications from './pages/Communications';
import DailyView from './pages/DailyView';
import Dashboard from './pages/Dashboard';
import Home from './pages/Home';
import PatientCommunications from './pages/PatientCommunications';
import PatientDashboard from './pages/PatientDashboard';
import PatientLogin from './pages/PatientLogin';
import PatientMessages from './pages/PatientMessages';
import PatientProfile from './pages/PatientProfile';
import PatientRoadmap from './pages/PatientRoadmap';
import PatientSettings from './pages/PatientSettings';
import PatientWelcomeFlow from './pages/PatientWelcomeFlow';
import PrescriptionTrends from './pages/PrescriptionTrends';
import Prescriptions from './pages/Prescriptions';
import Roadmap from './pages/Roadmap';
import Settings from './pages/Settings';
import StaffMessaging from './pages/StaffMessaging';
import __Layout from './Layout.jsx';


export const PAGES = {
    "AITraining": AITraining,
    "Analytics": Analytics,
    "Automation": Automation,
    "CommunicationDetail": CommunicationDetail,
    "Communications": Communications,
    "DailyView": DailyView,
    "Dashboard": Dashboard,
    "Home": Home,
    "PatientCommunications": PatientCommunications,
    "PatientDashboard": PatientDashboard,
    "PatientLogin": PatientLogin,
    "PatientMessages": PatientMessages,
    "PatientProfile": PatientProfile,
    "PatientRoadmap": PatientRoadmap,
    "PatientSettings": PatientSettings,
    "PatientWelcomeFlow": PatientWelcomeFlow,
    "PrescriptionTrends": PrescriptionTrends,
    "Prescriptions": Prescriptions,
    "Roadmap": Roadmap,
    "Settings": Settings,
    "StaffMessaging": StaffMessaging,
}

export const pagesConfig = {
    mainPage: "Dashboard",
    Pages: PAGES,
    Layout: __Layout,
};