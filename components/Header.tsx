const Header = ({ title }: { title: string }) => {
  return (
    <header className="fixed top-0 right-0 left-0 md:left-64 bg-gray-900 bg-opacity-90 backdrop-blur-sm z-10">
      <div className="flex items-center justify-between h-20 px-4 sm:px-6 lg:px-8 border-b border-gray-800">
        <h1 className="text-2xl font-semibold text-white">{title}</h1>
        <button className="flex items-center text-sm font-medium text-gray-400 hover:text-white transition-colors duration-200">
          <img src="/logout-icon.svg" alt="Logout" className="h-6 w-6 mr-2" />
          <span>Logout</span>
        </button>
      </div>
    </header>
  );
};

export default Header;
