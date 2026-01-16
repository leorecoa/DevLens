const ErrorOverlay = ({ message }: { message: string }) => {
  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 border border-red-500 rounded-lg p-6 max-w-sm w-full text-center">
        <div className="flex justify-center mb-4">
          <img src="/alert-icon.svg" alt="Alert" className="h-12 w-12 text-red-500" />
        </div>
        <h3 className="text-lg font-semibold text-white mb-2">Ocorreu um Erro</h3>
        <p className="text-gray-400 text-sm">{message}</p>
      </div>
    </div>
  );
};

export default ErrorOverlay;
