import Dashboard from './pages/Dashboard';
import DailyView from './pages/DailyView';
import CommunicationDetail from './pages/CommunicationDetail';
import Settings from './pages/Settings';
import Communications from './pages/Communications';
import Analytics from './pages/Analytics';
import AITraining from './pages/AITraining';
import Automation from './pages/Automation';
import PatientDashboard from './pages/PatientDashboard';
import PatientProfile from './pages/PatientProfile';
import PatientCommunications from './pages/PatientCommunications';
import PatientMessages from './pages/PatientMessages';
import StaffMessaging from './pages/StaffMessaging';
import Prescriptions from './pages/Prescriptions';
import Layout from './Layout.jsx';


export const PAGES = {
    "Dashboard": Dashboard,
    "DailyView": DailyView,
    "CommunicationDetail": CommunicationDetail,
    "Settings": Settings,
    "Communications": Communications,
    "Analytics": Analytics,
    "AITraining": AITraining,
    "Automation": Automation,
    "PatientDashboard": PatientDashboard,
    "PatientProfile": PatientProfile,
    "PatientCommunications": PatientCommunications,
    "PatientMessages": PatientMessages,
    "StaffMessaging": StaffMessaging,
    "Prescriptions": Prescriptions,
}

export const pagesConfig = {
    mainPage: "Dashboard",
    Pages: PAGES,
    Layout: Layout,
};