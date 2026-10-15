import { Outlet } from "react-router-dom";
import { Toaster } from "react-hot-toast"; // নতুন ইম্পোর্ট
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";

export default function Layout() {
  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Navbar />
        <main className="flex-1 overflow-x-hidden overflow-y-auto p-6">
          {/* এই Toaster কম্পোনেন্টটি যোগ করা হলো */}
          <Toaster position="top-right" reverseOrder={false} />
          <Outlet /> 
        </main>
      </div>
    </div>
  );
}