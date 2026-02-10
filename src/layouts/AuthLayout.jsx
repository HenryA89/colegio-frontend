export default function AuthLayout({ children }) {
  return (
    <div className="flex items-center justify-center h-screen bg-gradient-to-r from-blue-500 to-indigo-600">
      <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-lg">
        {children}
      </div>
    </div>
  );
}
