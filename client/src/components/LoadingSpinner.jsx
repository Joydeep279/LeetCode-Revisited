export default function LoadingSpinner({ message = "Loading..." }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 animate-fade-in">
      <div className="w-10 h-10 mb-5 rounded-full border-2 border-drac-current border-t-drac-purple animate-spin"></div>
      <p className="text-drac-comment text-sm font-medium">{message}</p>
    </div>
  );
}
