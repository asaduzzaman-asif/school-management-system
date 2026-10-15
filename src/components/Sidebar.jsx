import { NavLink } from "react-router-dom";

export default function Sidebar() {
  const menus = [
    { name: "Dashboard", path: "/" },
    { name: "Students", path: "/students" },
    { name: "Teachers", path: "/teachers" },
    { name: "Fees Management", path: "/fees" },
    { name: "Expenses", path: "/expenses" },
    { name: "Assets", path: "/assets" },
  ];

  return (
    <div className="w-64 bg-slate-900 text-white h-screen flex flex-col">
      <div className="p-5 text-2xl font-bold border-b border-slate-700 text-center">
        School ERP
      </div>
      <nav className="flex-1 p-4 space-y-2">
        {menus.map((menu, index) => (
          <NavLink
            key={index}
            to={menu.path}
            className={({ isActive }) =>
              `block px-4 py-3 rounded-md transition-colors ${
                isActive ? "bg-blue-600" : "hover:bg-slate-800"
              }`
            }
          >
            {menu.name}
          </NavLink>
        ))}
      </nav>
    </div>
  );
}