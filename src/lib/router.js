/**
 * React Router v7 entry for this Vite SPA.
 * DOM components and hooks are split across package exports in v7; import from here.
 */
export {
  BrowserRouter,
  Link,
  NavLink,
  Navigate,
  Outlet,
  Route,
  Routes,
} from 'react-router/internal/react-server-client';

export {
  useLocation,
  useNavigate,
  useParams,
  useSearchParams,
} from 'react-router';
