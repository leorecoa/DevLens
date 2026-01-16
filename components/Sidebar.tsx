import React from 'react';

const NavItem = ({ icon, label, isActive, isMobile }: { icon: string; label: string; isActive?: boolean; isMobile?: boolean }) => (
  <a
    href="#"
    className={`flex items-center px-4 py-3 text-sm font-medium transition-colors duration-200 ${
      isActive
        ? 'text-white bg-gray-800'
        : 'text-gray-400 hover:bg-gray-800 hover:text-white'
    } ${isMobile ? 'rounded-md' : ''}`}
  >
    <img src={icon} alt="" className="h-6 w-6 mr-3" />
    <span>{label}</span>
  </a>
);

const Sidebar = () => {
  const [isOpen, setIsOpen] = React.useState(false);

  const navItems = [
    { icon: '/dashboard-icon.svg', label: 'Dashboard', isActive: true },
    { icon: '/folders-icon.svg', label: 'Pastas' },
    { icon: '/analysis-icon.svg', label: 'Análises' },
    { icon: '/settings-icon.svg', label: 'Configurações' },
  ];

  return (
    <>
      {/* Mobile sidebar */}
      <div className="md:hidden">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="fixed top-4 left-4 z-20 p-2 rounded-md bg-gray-800 text-white"
        >
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={isOpen ? 'M6 18L18 6M6 6l12 12' : 'M4 6h16M4 12h16M4 18h16'} />
          </svg>
        </button>
        <div
          className={`fixed inset-0 z-10 bg-gray-900 bg-opacity-75 transition-opacity ${
            isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
          onClick={() => setIsOpen(false)}
        ></div>
        <div
          className={`fixed inset-y-0 left-0 z-20 w-64 bg-gray-900 transform transition-transform ${
            isOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <div className="flex flex-col h-full">
            <div className="flex items-center justify-center h-20 border-b border-gray-800">
              <img src="/logo.svg" alt="Logo" className="h-10 w-10" />
            </div>
            <nav className="flex-1 p-4 space-y-2">
              {navItems.map((item) => (
                <NavItem key={item.label} {...item} isMobile />
              ))}
            </nav>
          </div>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden md:flex md:flex-col md:w-64 md:fixed md:inset-y-0">
        <div className="flex flex-col flex-1 bg-gray-900 border-r border-gray-800">
          <div className="flex items-center justify-center h-20 border-b border-gray-800">
            <img src="/logo.svg" alt="Logo" className="h-10 w-10" />
          </div>
          <nav className="flex-1 mt-6">
            {navItems.map((item) => (
              <NavItem key={item.label} {...item} />
            ))}
          </nav>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
