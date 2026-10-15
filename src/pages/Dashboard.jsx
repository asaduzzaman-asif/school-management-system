import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";

export default function Dashboard() {
  const [role, setRole] = useState("");
  const [userName, setUserName] = useState("");
  
  // অ্যাডমিনদের জন্য স্ট্যাটিস্টিকস স্টেট
  const [stats, setStats] = useState({
    students: 0,
    teachers: 0,
    totalFees: 0,
    totalExpenses: 0,
  });

  useEffect(() => {
    // লোকাল স্টোরেজ থেকে ইউজারের রোল নিয়ে আসা
    const savedRole = localStorage.getItem("userRole");
    const savedName = localStorage.getItem("userName");
    setRole(savedRole || "");
    setUserName(savedName || "");

    // যদি অ্যাডমিন হয়, তবেই ডাটাবেস থেকে হিসাব-নিকাশ আনবে
    if (savedRole === "Admin") {
      fetchDashboardStats();
    }
  }, []);

  const fetchDashboardStats = async () => {
    const { count: studentCount } = await supabase.from("students").select("*", { count: "exact", head: true });
    const { count: teacherCount } = await supabase.from("teachers").select("*", { count: "exact", head: true });
    
    const { data: expensesData } = await supabase.from("expenses").select("amount");
    const totalExpenses = expensesData ? expensesData.reduce((sum, item) => sum + Number(item.amount), 0) : 0;

    // ফি হিসাব করা (টেবিল fees বা fee_invoices যাই থাকুক না কেন)
    let totalFees = 0;
    const { data: feesData } = await supabase.from("fees").select("amount");
    if(feesData) totalFees = feesData.reduce((sum, item) => sum + Number(item.amount), 0);

    setStats({
      students: studentCount || 0,
      teachers: teacherCount || 0,
      totalFees,
      totalExpenses,
    });
  };

  // ================= স্টুডেন্ট ভিউ =================
  if (role === "Student") {
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-gray-800">Welcome, Student {userName}!</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h3 className="font-semibold text-gray-700">My Attendance</h3>
            <p className="text-2xl font-bold text-emerald-600">92%</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h3 className="font-semibold text-gray-700">Upcoming Exam</h3>
            <p className="text-xl font-bold text-blue-600">Mid-Term (12 Nov)</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h3 className="font-semibold text-gray-700">Fee Status</h3>
            <p className="text-xl font-bold text-emerald-500">No Dues</p>
          </div>
        </div>
      </div>
    );
  }

  // ================= টিচার ভিউ =================
  if (role === "Teacher") {
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-gray-800">Welcome, Teacher {userName}!</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h3 className="font-semibold text-gray-700">Today's Classes</h3>
            <p className="text-2xl font-bold text-blue-600">4 Classes</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h3 className="font-semibold text-gray-700">Pending Marks Entry</h3>
            <p className="text-2xl font-bold text-orange-500">Class 6 (Math)</p>
          </div>
        </div>
      </div>
    );
  }
  
  // ================= অ্যাকাউন্ট্যান্ট ভিউ =================
  if (role === "Accountant") {
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-gray-800">Welcome, Accountant {userName}!</h2>
        <div className="bg-white p-6 rounded-lg shadow-sm border-l-4 border-emerald-500">
          <h3 className="font-semibold text-gray-700">Today's Fee Collection</h3>
          <p className="text-3xl font-bold text-emerald-600">৳ 0</p>
        </div>
      </div>
    );
  }

  // ================= ডিফল্ট অ্যাডমিন ভিউ =================
  const netBalance = stats.totalFees - stats.totalExpenses;
  
  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-bold text-gray-800">Dashboard & Reports Overview</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 border-l-4 border-l-blue-500">
          <h3 className="text-gray-500 text-sm font-medium uppercase tracking-wider">Total Students</h3>
          <p className="text-3xl font-bold text-gray-800 mt-2">{stats.students}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 border-l-4 border-l-purple-500">
          <h3 className="text-gray-500 text-sm font-medium uppercase tracking-wider">Total Teachers</h3>
          <p className="text-3xl font-bold text-gray-800 mt-2">{stats.teachers}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 border-l-4 border-l-emerald-500">
          <h3 className="text-gray-500 text-sm font-medium uppercase tracking-wider">Total Fees Collected</h3>
          <p className="text-3xl font-bold text-emerald-600 mt-2">৳ {stats.totalFees}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 border-l-4 border-l-red-500">
          <h3 className="text-gray-500 text-sm font-medium uppercase tracking-wider">Total Expenses</h3>
          <p className="text-3xl font-bold text-red-600 mt-2">৳ {stats.totalExpenses}</p>
        </div>
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 max-w-2xl">
        <h3 className="text-lg font-semibold mb-4 border-b pb-2">Financial Report</h3>
        <div className="space-y-4">
          <div className="flex justify-between items-center text-gray-700">
            <span>Total Income (From Student Fees)</span>
            <span className="font-semibold text-emerald-600">+ ৳ {stats.totalFees}</span>
          </div>
          <div className="flex justify-between items-center text-gray-700">
            <span>Total Institutional Expenses</span>
            <span className="font-semibold text-red-600">- ৳ {stats.totalExpenses}</span>
          </div>
          <div className="flex justify-between items-center pt-4 border-t border-gray-200 text-xl">
            <span className="font-bold text-gray-900">Net Balance</span>
            <span className={`font-bold ${netBalance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              ৳ {netBalance}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}