import { Link, useLocation } from 'react-router-dom';
import { Gift, Users, Receipt, User } from 'lucide-react';
import { useStore } from '@/store/useStore';

const Navbar = () => {
  const location = useLocation();
  const { user } = useStore();

  const navItems = [
    { path: '/', label: '补给领取', icon: Gift },
    { path: '/team', label: '组队任务', icon: Users },
    { path: '/records', label: '兑换记录', icon: Receipt },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-b border-dark-200 shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2">
            <span className="text-3xl">📚</span>
            <span className="font-display text-xl text-gradient font-bold">
              追番补给站
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-300 ${
                    isActive
                      ? 'bg-primary-500 text-white shadow-lg shadow-primary-200'
                      : 'text-dark-600 hover:text-primary-600 hover:bg-primary-50'
                  }`}
                >
                  <Icon size={18} />
                  <span className="font-medium">{item.label}</span>
                </Link>
              );
            })}
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-dark-100 rounded-full">
              <span className="text-primary-500 font-bold">
                ¥{user.totalSaved.toFixed(1)}
              </span>
              <span className="text-sm text-dark-500">已节省</span>
            </div>
            <div className="flex items-center gap-2">
              <img
                src={user.avatar}
                alt={user.name}
                className="w-10 h-10 rounded-full border-2 border-primary-200"
              />
              <span className="hidden sm:block text-sm font-medium text-dark-700">
                {user.name}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-dark-200">
        <div className="flex justify-around py-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex flex-col items-center gap-1 px-4 py-2 transition-colors ${
                  isActive ? 'text-primary-500' : 'text-dark-400'
                }`}
              >
                <Icon size={22} />
                <span className="text-xs font-medium">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
