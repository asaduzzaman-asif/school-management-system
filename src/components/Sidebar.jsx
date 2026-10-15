import { NavLink } from "react-router-dom";

export default function Sidebar() {
  const role = localStorage.getItem("userRole"); 

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = "/login";
  };

  let menus = [];

  if (role === "Admin") {
    menus = [
      { name: "Dashboard", path: "/" },
      { name: "Academic Setup", path: "/academic-setup" },
      { name: "Students", path: "/students" },
      { name: "Teachers", path: "/teachers" },
      { name: "Attendance", path: "/attendance" }, 
      { name: "Exams & Marks", path: "/exams" }, // নতুন যুক্ত করা হলো
      { name: "Fees Management", path: "/fees" },
      { name: "Expenses", path: "/expenses" },
      { name: "Assets", path: "/assets" },
    ];
  } else if (role === "Teacher") {
    menus = [
      { name: "Dashboard", path: "/" },
      { name: "My Class Students", path: "/students" },
      { name: "Take Attendance", path: "/attendance" }, 
      { name: "Exams & Marks", path: "/exams" }, // নতুন যুক্ত করা হলো
    ];
  } else if (role === "Accountant") {
    menus = [
      { name: "Dashboard", path: "/" },
      { name: "Collect Fees", path: "/fees" },
      { name: "Expenses", path: "/expenses" },
    ];
  } else if (role === "Student") {
    menus = [
      { name: "Dashboard", path: "/" },
    ];
  }

  return (
    <div className="w-64 bg-slate-900 text-white h-screen flex flex-col justify-between">
      <div>
        <div className="p-5 text-2xl font-bold border-b border-slate-700 text-center">
          School ERP
          <span className="block text-xs text-blue-400 mt-1 font-normal">Panel: {role}</span>
        </div>
        <nav className="p-4 space-y-2">
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

      <div className="p-4 border-t border-slate-700">
        <button 
          onClick={handleLogout}
          className="w-full bg-red-600 hover:bg-red-700 text-white py-2 rounded-md font-semibold transition-colors cursor-pointer"
        >
          Logout
        </button>
      </div>
    </div>
  );
}