import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { toast } from "react-hot-toast";

export default function Fees() {
  const [fees, setFees] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    student_id: "",
    amount: "",
    month: "January",
    status: "Paid",
  });

  const months = [
    "January", "February", "March", "April", "May", "June", 
    "July", "August", "September", "October", "November", "December"
  ];

  useEffect(() => {
    fetchStudents();
    fetchFees();
  }, []);

  // স্টুডেন্টদের ডাটা নিয়ে আসা (ড্রপডাউনে দেখানোর জন্য)
  const fetchStudents = async () => {
    const { data, error } = await supabase
      .from("students")
      .select("id, name, class_name")
      .order("id", { ascending: true });
    if (!error) setStudents(data);
  };

  // ফি-এর ডাটা এবং সাথে রিলেশনাল স্টুডেন্ট ডাটা নিয়ে আসা
  const fetchFees = async () => {
    const { data, error } = await supabase
      .from("fees")
      .select(`
        *,
        students (name, class_name)
      `)
      .order("created_at", { ascending: false });
    
    if (!error) setFees(data);
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.student_id) {
      toast.error("Please select a student");
      return;
    }

    setLoading(true);
    
    const { error } = await supabase.from("fees").insert([
      {
        student_id: parseInt(formData.student_id),
        amount: parseFloat(formData.amount),
        month: formData.month,
        status: formData.status,
      },
    ]);

    setLoading(false);
    if (error) {
      toast.error(error.message || "Something went wrong");
    } else {
      toast.success("Fee record added successfully!");
      fetchFees(); 
      setFormData({ ...formData, amount: "" }); 
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">Fees Management</h2>

      {/* Add Fee Form */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold mb-4">Collect Fee</h3>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
          
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Select Student</label>
            <select
              name="student_id"
              value={formData.student_id}
              onChange={handleInputChange}
              required
              className="w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            >
              <option value="" disabled>-- Select a Student --</option>
              {students.map((student) => (
                <option key={student.id} value={student.id}>
                  ID: {student.id} - {student.name} (Class {student.class_name})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Amount (৳)</label>
            <input
              type="number"
              name="amount"
              value={formData.amount}
              onChange={handleInputChange}
              required
              placeholder="e.g. 500"
              className="w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Month</label>
            <select
              name="month"
              value={formData.month}
              onChange={handleInputChange}
              className="w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            >
              {months.map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </div>

          <button
            type="submit"
            disabled={loading || students.length === 0}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-md transition-colors disabled:bg-green-400 cursor-pointer"
          >
            {loading ? "Saving..." : "Save Record"}
          </button>
        </form>
      </div>

      {/* Fees List Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student Info</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Month</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {fees.map((fee) => (
              <tr key={fee.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(fee.created_at).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{fee.students?.name}</div>
                  <div className="text-sm text-gray-500">ID: {fee.student_id} | Class: {fee.students?.class_name}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{fee.month}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">৳ {fee.amount}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    fee.status === 'Paid' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {fee.status}
                  </span>
                </td>
              </tr>
            ))}
            {fees.length === 0 && (
              <tr>
                <td colSpan="5" className="px-6 py-4 text-center text-sm text-gray-500">No fee records found</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}