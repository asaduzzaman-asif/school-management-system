import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { toast } from "react-hot-toast";

export default function Students() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    class_name: "1",
    batch: "2026",
    id: "", 
  });

  useEffect(() => {
    fetchStudents();
  }, []);

  useEffect(() => {
    generateId(formData.class_name);
  }, [formData.class_name]);

  const fetchStudents = async () => {
    const { data, error } = await supabase
      .from("students")
      .select("*")
      .order("created_at", { ascending: false });
    if (!error) setStudents(data);
  };

  const generateId = async (className) => {
    const classNum = parseInt(className);
    const startingId = classNum * 100 + 1; 

    const { data, error } = await supabase
      .from("students")
      .select("id")
      .eq("class_name", className)
      .order("id", { ascending: false })
      .limit(1);

    if (data && data.length > 0) {
      setFormData((prev) => ({ ...prev, id: data[0].id + 1 }));
    } else {
      setFormData((prev) => ({ ...prev, id: startingId }));
    }
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    const { error } = await supabase.from("students").insert([
      {
        id: formData.id,
        name: formData.name,
        class_name: formData.class_name,
        batch: formData.batch,
      },
    ]);

    setLoading(false);
    if (error) {
      toast.error(error.message || "Something went wrong");
    } else {
      toast.success("Student added successfully!");
      fetchStudents(); 
      generateId(formData.class_name); 
      setFormData({ ...formData, name: "" }); 
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">Students Management</h2>

      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold mb-4">Add New Student</h3>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Class</label>
            <select
              name="class_name"
              value={formData.class_name}
              onChange={handleInputChange}
              className="w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            >
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                <option key={num} value={num}>Class {num}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Student ID</label>
            <input
              type="number"
              name="id"
              value={formData.id}
              onChange={handleInputChange}
              required
              className="w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-50 outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Student Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              required
              placeholder="Enter name"
              className="w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-md transition-colors disabled:bg-blue-400 cursor-pointer"
          >
            {loading ? "Adding..." : "Add Student"}
          </button>
        </form>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Class</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Batch</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {students.map((student) => (
              <tr key={student.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{student.id}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{student.name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">Class {student.class_name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{student.batch}</td>
              </tr>
            ))}
            {students.length === 0 && (
              <tr>
                <td colSpan="4" className="px-6 py-4 text-center text-sm text-gray-500">No students found</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}