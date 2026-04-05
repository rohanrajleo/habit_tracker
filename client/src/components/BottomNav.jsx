import { Link, useLocation } from 'react-router-dom';
import { Home, BarChart2, Plus, User } from 'lucide-react';

export default function BottomNav() {
  const location = useLocation();
  const path = location.pathname;

  // HIDDEN ROUTES: 2nd nested pages
  const hiddenRoutes = ['/log', '/schedule', '/edit'];
  const isHidden = hiddenRoutes.some(route => path.endsWith(route));

  if (isHidden) return null;

  return (
    <div className="bottom-nav">
      <Link to="/" className={`nav-item ${path === '/' ? 'active' : ''}`}>
        <Home size={24} />
        <span>Home</span>
      </Link>
      <Link to="/stats" className={`nav-item ${path === '/stats' ? 'active' : ''}`}>
        <BarChart2 size={24} />
        <span>Stats</span>
      </Link>
      <Link to="/add" className={`nav-item ${path === '/add' ? 'active' : ''}`}>
        <Plus size={24} />
        <span>Add</span>
      </Link>
      <Link to="/profile" className={`nav-item ${path === '/profile' ? 'active' : ''}`}>
        <User size={24} />
        <span>Profile</span>
      </Link>
    </div>
  );
}
