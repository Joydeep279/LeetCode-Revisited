export default function LoadingSpinner({ message = "Loading..." }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 animate-fade-in">
      <div className="relative w-16 h-16 mb-6">
        <div className="absolute inset-0 rounded-full border-2 border-lc-dark-500"></div>
        <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-lc-purple-500 animate-spin"></div>
        <div className="absolute inset-2 rounded-full border-2 border-transparent border-t-lc-blue-400 animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
      </div>
      <p className="text-gray-400 text-sm font-medium">{message}</p>
    </div>
  );
}
