import { NavLink } from 'react-router-dom';
import { Button } from './ui/button';
import { NavigationMenu, NavigationMenuItem, NavigationMenuList } from './ui/navigation-menu';
import { LogOut } from 'lucide-react';
import { useContext } from 'react';
import { AuthContext } from './AuthProvider';

export const Sidebar: React.FC = () => {
  const auth = useContext(AuthContext);

  return (
    <div className="w-64 bg-gray-800 text-white h-screen p-4">
      <h2 className="text-xl font-bold mb-6">Pousada Admin</h2>
      <NavigationMenu orientation="vertical">
        <NavigationMenuList className="flex flex-col gap-2">
          <NavigationMenuItem>
            <NavLink to="/dashboard" className={({ isActive }) => `block p-2 rounded ${isActive ? 'bg-gray-600' : 'hover:bg-gray-700'}`}>
              Dashboard
            </NavLink>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <NavLink to="/rooms" className={({ isActive }) => `block p-2 rounded ${isActive ? 'bg-gray-600' : 'hover:bg-gray-700'}`}>
              Rooms
            </NavLink>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <NavLink to="/reservations" className={({ isActive }) => `block p-2 rounded ${isActive ? 'bg-gray-600' : 'hover:bg-gray-700'}`}>
              Reservations
            </NavLink>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <NavLink to="/guests" className={({ isActive }) => `block p-2 rounded ${isActive ? 'bg-gray-600' : 'hover:bg-gray-700'}`}>
              Guests
            </NavLink>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <NavLink to="/reports" className={({ isActive }) => `block p-2 rounded ${isActive ? 'bg-gray-600' : 'hover:bg-gray-700'}`}>
              Reports
            </NavLink>
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>
      <div className="mt-auto">
        <Button variant="ghost" className="w-full justify-start text-white hover:bg-gray-700" onClick={() => auth?.logout()}>
          <LogOut className="mr-2 h-4 w-4" />
          Logout
        </Button>
      </div>
    </div>
  );
};