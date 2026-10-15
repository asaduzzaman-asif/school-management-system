export default function Navbar() {
  return (
    <header className="bg-white shadow-sm h-16 flex items-center justify-between px-6">
      <h2 className="text-xl font-semibold text-gray-800">Admin Panel</h2>
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">
          A
        </div>
      </div>
    </header>
  );
}