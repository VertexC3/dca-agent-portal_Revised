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
import PrescriptionTrends from './pages/PrescriptionTrends';
import Prescriptions from './pages/Prescriptions';
import Roadmap from './pages/Roadmap';
import Settings from './pages/Settings';
import StaffMessaging from './pages/StaffMessaging';
import PatientWelcomeFlow from './pages/PatientWelcomeFlow';
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
    "PrescriptionTrends": PrescriptionTrends,
    "Prescriptions": Prescriptions,
    "Roadmap": Roadmap,
    "Settings": Settings,
    "StaffMessaging": StaffMessaging,
    "PatientWelcomeFlow": PatientWelcomeFlow,
}

export const pagesConfig = {
    mainPage: "Dashboard",
    Pages: PAGES,
    Layout: __Layout,
};