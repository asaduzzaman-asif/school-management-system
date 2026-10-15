import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { toast } from "react-hot-toast";

export default function Attendance() {
  const [classes, setClasses] = useState([]);
  const [students, setStudents] = useState([]);
  const [selectedClass, setSelectedClass] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [attendanceData, setAttendanceData] = useState({});
  const [loading, setLoading] = useState(false);
  const [userRole, setUserRole] = useState("");
  const [userName, setUserName] = useState("");

  useEffect(() => {
    setUserRole(localStorage.getItem("userRole") || "");
    setUserName(localStorage.getItem("userName") || "");
    fetchClasses();
  }, []);

  const fetchClasses = async () => {
    const { data } = await supabase.from("classes").select("*");
    if (data) setClasses(data);
  };

  // ক্লাস সিলেক্ট করলে সেই ক্লাসের স্টুডেন্টদের নিয়ে আসবে
  const fetchStudentsByClass = async (classId) => {
    const { data } = await supabase
      .from("students")
      .select("*, sections(section_name)")
      .eq("class_id", classId)
      .order("admission_no", { ascending: true });
    
    if (data) {
      setStudents(data);
      // বাই ডিফল্ট সবাইকে "Present" হিসেবে সিলেক্ট করে রাখা
      const initialAttendance = {};
      data.forEach(student => {
        initialAttendance[student.id] = "Present";
      });
      setAttendanceData(initialAttendance);
    }
  };

  const handleClassChange = (e) => {
    const classId = e.target.value;
    setSelectedClass(classId);
    if (classId) {
      fetchStudentsByClass(classId);
    } else {
      setStudents([]);
    }
  };

  const handleStatusChange = (studentId, status) => {
    setAttendanceData(prev => ({ ...prev, [studentId]: status }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (students.length === 0) {
      toast.error("No students found in this class!");
      return;
    }
    setLoading(true);

    // যিনি হাজিরা নিচ্ছেন তার ইউজার আইডি বের করা
    const { data: userData } = await supabase.from("users").select("id").eq("username", userName).single();
    const userId = userData ? userData.id : null;

    // ডাটাবেসে পাঠানোর জন্য ডেটা প্রস্তুত করা
    const records = students.map(student => ({
      student_id: student.id,
      class_id: parseInt(selectedClass),
      date: date,
      status: attendanceData[student.id],
      created_by: userId
    }));

    const { error } = await supabase.from("attendance").insert(records);

    setLoading(false);

    if (error) {
      toast.error("Error submitting attendance: " + error.message);
    } else {
      toast.success("Attendance submitted successfully!");
      // সাবমিট হওয়ার পর ফর্ম রিসেট
      setSelectedClass("");
      setStudents([]);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">Student Attendance</h2>

      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
            <input 
              type="date" 
              value={date} 
              onChange={(e) => setDate(e.target.value)} 
              className="w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 outline-none" 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Select Class</label>
            <select 
              value={selectedClass} 
              onChange={handleClassChange} 
              className="w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 outline-none"
            >
              <option value="">-- Choose a Class --</option>
              {classes.map(cls => (
                <option key={cls.id} value={cls.id}>{cls.class_name}</option>
              ))}
            </select>
          </div>
        </div>

        {students.length > 0 ? (
          <form onSubmit={handleSubmit}>
            <div className="overflow-x-auto border border-gray-200 rounded-lg mb-6">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Roll / ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Student Name</th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Attendance Status</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {students.map((student) => (
                    <tr key={student.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{student.admission_no}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                        {student.first_name} {student.last_name}
                        <span className="block text-xs text-gray-400">Section: {student.sections?.section_name}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <div className="flex items-center justify-center gap-4">
                          <label className="flex items-center gap-1 cursor-pointer">
                            <input type="radio" name={`status-${student.id}`} value="Present" checked={attendanceData[student.id] === "Present"} onChange={() => handleStatusChange(student.id, "Present")} className="text-emerald-600 focus:ring-emerald-500" />
                            <span className="text-sm font-medium text-emerald-600">Present</span>
                          </label>
                          <label className="flex items-center gap-1 cursor-pointer">
                            <input type="radio" name={`status-${student.id}`} value="Absent" checked={attendanceData[student.id] === "Absent"} onChange={() => handleStatusChange(student.id, "Absent")} className="text-red-600 focus:ring-red-500" />
                            <span className="text-sm font-medium text-red-600">Absent</span>
                          </label>
                          <label className="flex items-center gap-1 cursor-pointer">
                            <input type="radio" name={`status-${student.id}`} value="Late" checked={attendanceData[student.id] === "Late"} onChange={() => handleStatusChange(student.id, "Late")} className="text-orange-500 focus:ring-orange-500" />
                            <span className="text-sm font-medium text-orange-500">Late</span>
                          </label>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="flex justify-end">
              <button type="submit" disabled={loading} className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-8 rounded-md transition-colors disabled:bg-blue-400 cursor-pointer">
                {loading ? "Submitting..." : "Save Attendance"}
              </button>
            </div>
          </form>
        ) : (
          selectedClass && <div className="text-center text-gray-500 py-8 border-t border-gray-100">No students found in this class.</div>
        )}
      </div>
    </div>
  );
}