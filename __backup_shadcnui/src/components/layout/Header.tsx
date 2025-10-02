import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { LogOut, Bell } from 'lucide-react';
import { authService } from '@/lib/auth';

interface HeaderProps {
  onLogout: () => void;
}

export default function Header({ onLogout }: HeaderProps) {
  const user = authService.getCurrentUser();

  const handleLogout = () => {
    authService.logout();
    onLogout();
  };

  return (
    <header className="bg-white border-b border-gray-200 shadow-sm">
      <div className="px-6 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <img 
            src="https://drive.google.com/uc?id=1AOPPAXjSYDz0BvMa5EpR6ttTLkn1zzr5" 
            alt="LEGALITY 360°" 
            className="h-10 w-auto"
            onError={(e) => {
              (e.target as HTMLImageElement).src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTYwIiBoZWlnaHQ9IjQwIiB2aWV3Qm94PSIwIDAgMTYwIDQwIiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPgo8cmVjdCB3aWR0aD0iMTYwIiBoZWlnaHQ9IjQwIiBmaWxsPSIjMjU2M2ViIi8+Cjx0ZXh0IHg9IjgwIiB5PSIyNSIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjEyIiBmb250LXdlaWdodD0iYm9sZCIgZmlsbD0id2hpdGUiIHRleHQtYW5jaG9yPSJtaWRkbGUiPkxFR0FMSVRZIDM2MMKwPC90ZXh0Pgo8L3N2Zz4=';
            }}
          />
          <div className="h-8 w-px bg-gray-300" />
          <h1 className="text-xl font-semibold text-gray-900">Portal del Cliente</h1>
        </div>
        
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="sm" className="relative">
            <Bell className="h-5 w-5" />
            <span className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full text-xs"></span>
          </Button>
          
          <div className="flex items-center space-x-3">
            <div className="text-right">
              <p className="text-sm font-medium text-gray-900">{user?.nombre}</p>
              <p className="text-xs text-gray-500">{user?.email}</p>
            </div>
            <Avatar>
              <AvatarFallback className="bg-blue-100 text-blue-700">
                {user?.nombre?.split(' ').map(n => n[0]).join('').slice(0, 2)}
              </AvatarFallback>
            </Avatar>
          </div>
          
          <Button variant="ghost" size="sm" onClick={handleLogout}>
            <LogOut className="h-4 w-4 mr-2" />
            Salir
          </Button>
        </div>
      </div>
    </header>
  );
}