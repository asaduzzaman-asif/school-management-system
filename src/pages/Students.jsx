import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { toast } from "react-hot-toast";

export default function Students() {
  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [sections, setSections] = useState([]);
  const [filteredSections, setFilteredSections] = useState([]);
  const [loading, setLoading] = useState(false);
  const [userRole, setUserRole] = useState(""); // ইউজারের রোল চেক করার স্টেট

  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    admission_no: "",
    parent_name: "",
    parent_phone: "",
    class_id: "",
    section_id: "",
    username: "",
    password: "password123",
  });

  useEffect(() => {
    // লোকাল স্টোরেজ থেকে রোল সেট করা
    const role = localStorage.getItem("userRole");
    setUserRole(role || "");

    fetchClasses();
    fetchSections();
    fetchStudents();
  }, []);

  useEffect(() => {
    if (formData.class_id) {
      const filtered = sections.filter(sec => sec.class_id.toString() === formData.class_id);
      setFilteredSections(filtered);
    } else {
      setFilteredSections([]);
    }
  }, [formData.class_id, sections]);

  const fetchClasses = async () => {
    const { data } = await supabase.from("classes").select("*");
    if (data) setClasses(data);
  };

  const fetchSections = async () => {
    const { data } = await supabase.from("sections").select("*");
    if (data) setSections(data);
  };

  const fetchStudents = async () => {
    const { data, error } = await supabase
      .from("students")
      .select(`
        *,
        classes (class_name),
        sections (section_name)
      `)
      .order("created_at", { ascending: false });
    
    if (!error) setStudents(data);
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const { data: userData, error: userError } = await supabase
      .from("users")
      .insert([{ username: formData.username, password: formData.password, role: "Student" }])
      .select()
      .single();

    if (userError) {
      toast.error(`Login Error: Username already exists! Try a completely new one.`);
      setLoading(false);
      return;
    }

    const { error: studentError } = await supabase.from("students").insert([
      {
        user_id: userData.id,
        first_name: formData.first_name,
        last_name: formData.last_name,
        admission_no: formData.admission_no,
        parent_name: formData.parent_name,
        parent_phone: formData.parent_phone,
        class_id: parseInt(formData.class_id),
        section_id: parseInt(formData.section_id),
      },
    ]);

    setLoading(false);

    if (studentError) {
      await supabase.from("users").delete().eq("id", userData.id);
      toast.error(`Profile Error: ${studentError.message}`);
    } else {
      toast.success("Student admitted successfully!");
      fetchStudents();
      setFormData({
        ...formData,
        first_name: "", last_name: "", admission_no: "", parent_name: "", parent_phone: "", username: ""
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* রোল অনুযায়ী পেজের টাইটেল পরিবর্তন হবে */}
      <h2 className="text-2xl font-bold text-gray-800">
        {userRole === "Admin" ? "New Student Admission" : "My Class Students"}
      </h2>

      {/* শুধুমাত্র অ্যাডমিন হলেই ভর্তির ফর্মটি দেখাবে */}
      {userRole === "Admin" && (
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold mb-6 border-b pb-2 text-blue-600">Student Information</h3>
          <form onSubmit={handleSubmit} className="space-y-6">
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                <input type="text" name="first_name" value={formData.first_name} onChange={handleInputChange} required className="w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                <input type="text" name="last_name" value={formData.last_name} onChange={handleInputChange} required className="w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Admission No</label>
                <input type="text" name="admission_no" value={formData.admission_no} onChange={handleInputChange} required placeholder="e.g. ST-2026-001" className="w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 outline-none" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Assign Class</label>
                <select name="class_id" value={formData.class_id} onChange={handleInputChange} required className="w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 outline-none">
                  <option value="">-- Select Class --</option>
                  {classes.map(cls => <option key={cls.id} value={cls.id}>{cls.class_name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Assign Section</label>
                <select name="section_id" value={formData.section_id} onChange={handleInputChange} required disabled={!formData.class_id} className="w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 outline-none disabled:bg-gray-100">
                  <option value="">-- Select Section --</option>
                  {filteredSections.map(sec => <option key={sec.id} value={sec.id}>{sec.section_name}</option>)}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Guardian / Parent Name</label>
                <input type="text" name="parent_name" value={formData.parent_name} onChange={handleInputChange} required className="w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Parent Phone No</label>
                <input type="text" name="parent_phone" value={formData.parent_phone} onChange={handleInputChange} required className="w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 outline-none" />
              </div>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 mt-4">
              <h4 className="text-sm font-semibold text-blue-800 mb-3">Student Portal Login Credentials</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Login Username (Must be unique)</label>
                  <input type="text" name="username" value={formData.username} onChange={handleInputChange} required placeholder="e.g. student_asif" className="w-full border border-gray-300 rounded-md p-2 text-sm focus:ring-blue-500 outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Default Password</label>
                  <input type="text" name="password" value={formData.password} onChange={handleInputChange} required className="w-full border border-gray-300 rounded-md p-2 text-sm focus:ring-blue-500 outline-none bg-white" />
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <button type="submit" disabled={loading} className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-8 rounded-md transition-colors disabled:bg-blue-400 cursor-pointer">
                {loading ? "Enrolling..." : "Complete Admission"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* স্টুডেন্টদের ডিরেক্টরি বা লিস্ট সবাই দেখতে পাবে */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden mt-8">
        <div className="p-4 bg-gray-50 border-b border-gray-200 flex justify-between items-center">
          <h3 className="font-semibold text-gray-700">
            {userRole === "Admin" ? "Admitted Students Directory" : "Enrolled Students List"}
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-white">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Admission No</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Class & Section</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Guardian Info</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {students.map((student) => (
                <tr key={student.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">{student.admission_no}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{student.first_name} {student.last_name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                    <span className="font-medium">{student.classes?.class_name}</span> - {student.sections?.section_name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{student.parent_name}</div>
                    <div className="text-xs text-gray-500">{student.parent_phone}</div>
                  </td>
                </tr>
              ))}
              {students.length === 0 && (
                <tr>
                  <td colSpan="4" className="px-6 py-8 text-center text-sm text-gray-500">No students found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}