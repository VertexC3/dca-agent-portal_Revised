import Dashboard from './pages/Dashboard';
import DailyView from './pages/DailyView';
import CommunicationDetail from './pages/CommunicationDetail';
import Settings from './pages/Settings';
import Communications from './pages/Communications';
import Analytics from './pages/Analytics';
import AITraining from './pages/AITraining';
import Layout from './Layout.jsx';


export const PAGES = {
    "Dashboard": Dashboard,
    "DailyView": DailyView,
    "CommunicationDetail": CommunicationDetail,
    "Settings": Settings,
    "Communications": Communications,
    "Analytics": Analytics,
    "AITraining": AITraining,
}

export const pagesConfig = {
    mainPage: "Dashboard",
    Pages: PAGES,
    Layout: Layout,
};