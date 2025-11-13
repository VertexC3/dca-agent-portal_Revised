import Dashboard from './pages/Dashboard';
import DailyView from './pages/DailyView';
import CommunicationDetail from './pages/CommunicationDetail';
import Layout from './Layout.jsx';


export const PAGES = {
    "Dashboard": Dashboard,
    "DailyView": DailyView,
    "CommunicationDetail": CommunicationDetail,
}

export const pagesConfig = {
    mainPage: "Dashboard",
    Pages: PAGES,
    Layout: Layout,
};