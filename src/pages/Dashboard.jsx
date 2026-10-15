import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";

export default function Dashboard() {
  const [stats, setStats] = useState({
    students: 0,
    teachers: 0,
    totalFees: 0,
    totalExpenses: 0,
  });

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    // স্টুডেন্টের সংখ্যা বের করা
    const { count: studentCount } = await supabase
      .from("students")
      .select("*", { count: "exact", head: true });

    // টিচারের সংখ্যা বের করা
    const { count: teacherCount } = await supabase
      .from("teachers")
      .select("*", { count: "exact", head: true });

    // মোট ফি (Income) হিসাব করা
    const { data: feesData } = await supabase.from("fees").select("amount");
    const totalFees = feesData ? feesData.reduce((sum, item) => sum + Number(item.amount), 0) : 0;

    // মোট খরচ (Expenses) হিসাব করা
    const { data: expensesData } = await supabase.from("expenses").select("amount");
    const totalExpenses = expensesData ? expensesData.reduce((sum, item) => sum + Number(item.amount), 0) : 0;

    setStats({
      students: studentCount || 0,
      teachers: teacherCount || 0,
      totalFees,
      totalExpenses,
    });
  };

  const netBalance = stats.totalFees - stats.totalExpenses;

  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-bold text-gray-800">Dashboard & Reports Overview</h2>

      {/* Summary Cards */}
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
      
      {/* Financial Report Box */}
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