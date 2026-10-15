import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { toast } from "react-hot-toast";

export default function Teachers() {
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [userRole, setUserRole] = useState("");

  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    phone: "",
    email: "",
    basic_salary: "",
    username: "",
    password: "password123", // ডিফল্ট পাসওয়ার্ড
  });

  useEffect(() => {
    // লোকাল স্টোরেজ থেকে ইউজারের রোল নিয়ে আসা
    const role = localStorage.getItem("userRole");
    setUserRole(role || "");
    fetchTeachers();
  }, []);

  const fetchTeachers = async () => {
    const { data, error } = await supabase
      .from("teachers")
      .select("*")
      .order("id", { ascending: false });
    
    if (!error) setTeachers(data);
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // ধাপ ১: টিচারের লগিন অ্যাকাউন্ট তৈরি করা
    const { data: userData, error: userError } = await supabase
      .from("users")
      .insert([{ username: formData.username, password: formData.password, role: "Teacher" }])
      .select()
      .single();

    if (userError) {
      toast.error(`Login Error: Username already exists! Try a different one.`);
      setLoading(false);
      return;
    }

    // ধাপ ২: টিচার প্রোফাইল তৈরি করা এবং অ্যাকাউন্টের সাথে লিংক করা
    const { error: teacherError } = await supabase.from("teachers").insert([
      {
        user_id: userData.id,
        first_name: formData.first_name,
        last_name: formData.last_name,
        phone: formData.phone,
        email: formData.email,
        basic_salary: parseFloat(formData.basic_salary) || 0,
      },
    ]);

    setLoading(false);

    if (teacherError) {
      // 🔴 রোলব্যাক (Rollback): যদি প্রোফাইল সেভ না হয়, তবে লগিন অ্যাকাউন্ট ডিলিট করে দেব
      await supabase.from("users").delete().eq("id", userData.id);
      toast.error(`Profile Error: ${teacherError.message}`);
    } else {
      toast.success("Teacher added successfully!");
      fetchTeachers();
      setFormData({
        ...formData,
        first_name: "", last_name: "", phone: "", email: "", basic_salary: "", username: ""
      });
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">Teachers Management</h2>

      {/* শুধুমাত্র অ্যাডমিন হলেই টিচার অ্যাড করার ফর্মটি দেখাবে */}
      {userRole === "Admin" && (
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold mb-6 border-b pb-2 text-purple-600">Teacher Profile Information</h3>
          <form onSubmit={handleSubmit} className="space-y-6">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                <input type="text" name="first_name" value={formData.first_name} onChange={handleInputChange} required className="w-full border border-gray-300 rounded-md p-2 focus:ring-purple-500 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                <input type="text" name="last_name" value={formData.last_name} onChange={handleInputChange} required className="w-full border border-gray-300 rounded-md p-2 focus:ring-purple-500 outline-none" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                <input type="text" name="phone" value={formData.phone} onChange={handleInputChange} required placeholder="e.g. 017XXXXXXX" className="w-full border border-gray-300 rounded-md p-2 focus:ring-purple-500 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                <input type="email" name="email" value={formData.email} onChange={handleInputChange} placeholder="teacher@school.com" className="w-full border border-gray-300 rounded-md p-2 focus:ring-purple-500 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Basic Salary (৳)</label>
                <input type="number" name="basic_salary" value={formData.basic_salary} onChange={handleInputChange} required placeholder="Amount in BDT" className="w-full border border-gray-300 rounded-md p-2 focus:ring-purple-500 outline-none" />
              </div>
            </div>

            <div className="bg-purple-50 p-4 rounded-lg border border-purple-100 mt-4">
              <h4 className="text-sm font-semibold text-purple-800 mb-3">Teacher Portal Login Credentials</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Login Username (Must be unique)</label>
                  <input type="text" name="username" value={formData.username} onChange={handleInputChange} required placeholder="e.g. tr_rohim" className="w-full border border-gray-300 rounded-md p-2 text-sm focus:ring-purple-500 outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Default Password</label>
                  <input type="text" name="password" value={formData.password} onChange={handleInputChange} required className="w-full border border-gray-300 rounded-md p-2 text-sm focus:ring-purple-500 outline-none bg-white" />
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <button type="submit" disabled={loading} className="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 px-8 rounded-md transition-colors disabled:bg-purple-400 cursor-pointer">
                {loading ? "Saving..." : "Add Teacher"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Teachers Directory */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden mt-8">
        <div className="p-4 bg-gray-50 border-b border-gray-200">
          <h3 className="font-semibold text-gray-700">Teachers Directory</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-white">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Teacher Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact Info</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Joining Date</th>
                {/* শুধু অ্যাডমিন স্যালারি দেখতে পাবে */}
                {userRole === "Admin" && (
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Basic Salary</th>
                )}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {teachers.map((teacher) => (
                <tr key={teacher.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-purple-600">{teacher.first_name} {teacher.last_name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{teacher.phone}</div>
                    <div className="text-xs text-gray-500">{teacher.email || "N/A"}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                    {new Date(teacher.joining_date).toLocaleDateString()}
                  </td>
                  {userRole === "Admin" && (
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      ৳ {teacher.basic_salary}
                    </td>
                  )}
                </tr>
              ))}
              {teachers.length === 0 && (
                <tr>
                  <td colSpan={userRole === "Admin" ? "4" : "3"} className="px-6 py-8 text-center text-sm text-gray-500">
                    No teachers added yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}