import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { toast } from "react-hot-toast";

export default function Exams() {
  const [role, setRole] = useState("");
  const [exams, setExams] = useState([]);
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [students, setStudents] = useState([]);
  
  const [examName, setExamName] = useState("");
  const [subjectData, setSubjectData] = useState({ name: "", class_id: "" });
  
  const [filter, setFilter] = useState({ exam_id: "", class_id: "", subject_id: "" });
  const [marksData, setMarksData] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setRole(localStorage.getItem("userRole") || "");
    fetchData();
  }, []);

  const fetchData = async () => {
    const [examRes, classRes, subRes] = await Promise.all([
      supabase.from("exams").select("*"),
      supabase.from("classes").select("*"),
      supabase.from("subjects").select("*")
    ]);
    if (examRes.data) setExams(examRes.data);
    if (classRes.data) setClasses(classRes.data);
    if (subRes.data) setSubjects(subRes.data);
  };

  // ১. নতুন পরীক্ষা অ্যাড করা
  const handleAddExam = async (e) => {
    e.preventDefault();
    const { error } = await supabase.from("exams").insert([{ exam_name: examName }]);
    if (!error) { 
      toast.success("Exam added successfully!"); 
      setExamName(""); 
      fetchData(); 
    } else toast.error(error.message);
  };

  // ২. নতুন সাবজেক্ট অ্যাড করা
  const handleAddSubject = async (e) => {
    e.preventDefault();
    const { error } = await supabase.from("subjects").insert([{ 
      subject_name: subjectData.name, 
      class_id: parseInt(subjectData.class_id) 
    }]);
    if (!error) { 
      toast.success("Subject added successfully!"); 
      setSubjectData({ name: "", class_id: "" }); 
      fetchData(); 
    } else toast.error(error.message);
  };

  // ৩. মার্কস এন্ট্রির জন্য স্টুডেন্ট লিস্ট আনা
  const handleLoadStudents = async () => {
    if (!filter.exam_id || !filter.class_id || !filter.subject_id) {
      toast.error("Please select Exam, Class, and Subject first!"); 
      return;
    }
    
    const { data, error } = await supabase
      .from("students")
      .select("*")
      .eq("class_id", filter.class_id)
      .order("admission_no", { ascending: true });
      
    if (!error && data) {
      setStudents(data);
      const initialMarks = {};
      data.forEach(s => initialMarks[s.id] = "");
      setMarksData(initialMarks);
      if(data.length === 0) toast.error("No students found in this class.");
    }
  };

  // ৪. মার্কস ডাটাবেসে সেভ করা
  const handleSaveMarks = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    const records = students.map(s => ({
      exam_id: parseInt(filter.exam_id),
      subject_id: parseInt(filter.subject_id),
      student_id: s.id,
      marks_obtained: parseFloat(marksData[s.id]) || 0,
      max_marks: 100 // ডিফল্ট ১০০ মার্কের পরীক্ষা
    }));

    const { error } = await supabase.from("exam_marks").insert(records);
    setLoading(false);
    
    if (!error) { 
      toast.success("Marks saved successfully!"); 
      setStudents([]); // ফর্ম ক্লিয়ার করা
    } else toast.error(error.message);
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">Examinations & Marks</h2>

      {/* শুধুমাত্র অ্যাডমিন পরীক্ষা এবং সাবজেক্ট অ্যাড করতে পারবে */}
      {role === "Admin" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Add Exam Form */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold mb-4 text-blue-600 border-b pb-2">1. Create Exam</h3>
            <form onSubmit={handleAddExam} className="flex gap-4 items-end">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">Exam Name</label>
                <input type="text" value={examName} onChange={(e) => setExamName(e.target.value)} required placeholder="e.g. Mid Term Exam 2026" className="w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 outline-none" />
              </div>
              <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-md transition-colors cursor-pointer">
                Save
              </button>
            </form>
          </div>

          {/* Add Subject Form */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold mb-4 text-purple-600 border-b pb-2">2. Add Subject</h3>
            <form onSubmit={handleAddSubject} className="flex gap-4 items-end">
              <div className="w-1/3">
                <label className="block text-sm font-medium text-gray-700 mb-1">Class</label>
                <select value={subjectData.class_id} onChange={(e) => setSubjectData({ ...subjectData, class_id: e.target.value })} required className="w-full border border-gray-300 rounded-md p-2 focus:ring-purple-500 outline-none">
                  <option value="">Select...</option>
                  {classes.map(c => <option key={c.id} value={c.id}>{c.class_name}</option>)}
                </select>
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">Subject Name</label>
                <input type="text" value={subjectData.name} onChange={(e) => setSubjectData({ ...subjectData, name: e.target.value })} required placeholder="e.g. Mathematics" className="w-full border border-gray-300 rounded-md p-2 focus:ring-purple-500 outline-none" />
              </div>
              <button type="submit" className="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 px-6 rounded-md transition-colors cursor-pointer">
                Save
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Marks Entry Section (Admin ও Teacher উভয়ের জন্য) */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mt-6">
        <h3 className="text-lg font-semibold mb-4 text-emerald-600 border-b pb-2">Enter Student Marks</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Select Exam</label>
            <select value={filter.exam_id} onChange={(e) => setFilter({ ...filter, exam_id: e.target.value })} className="w-full border border-gray-300 rounded-md p-2 focus:ring-emerald-500 outline-none">
              <option value="">-- Choose --</option>
              {exams.map(ex => <option key={ex.id} value={ex.id}>{ex.exam_name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Select Class</label>
            <select value={filter.class_id} onChange={(e) => setFilter({ ...filter, class_id: e.target.value })} className="w-full border border-gray-300 rounded-md p-2 focus:ring-emerald-500 outline-none">
              <option value="">-- Choose --</option>
              {classes.map(c => <option key={c.id} value={c.id}>{c.class_name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Select Subject</label>
            <select value={filter.subject_id} onChange={(e) => setFilter({ ...filter, subject_id: e.target.value })} className="w-full border border-gray-300 rounded-md p-2 focus:ring-emerald-500 outline-none">
              <option value="">-- Choose --</option>
              {subjects.filter(s => s.class_id.toString() === filter.class_id).map(s => (
                <option key={s.id} value={s.id}>{s.subject_name}</option>
              ))}
            </select>
          </div>
          <button onClick={handleLoadStudents} className="bg-slate-800 hover:bg-slate-900 text-white font-semibold py-2 px-4 rounded-md transition-colors cursor-pointer">
            Fetch Students
          </button>
        </div>

        {students.length > 0 && (
          <form onSubmit={handleSaveMarks}>
            <table className="min-w-full divide-y divide-gray-200 mb-6 border border-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Roll No</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Student Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Marks Obtained (Out of 100)</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {students.map((student) => (
                  <tr key={student.id}>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{student.admission_no}</td>
                    <td className="px-6 py-4 text-sm text-gray-700">{student.first_name} {student.last_name}</td>
                    <td className="px-6 py-4">
                      <input 
                        type="number" 
                        max="100"
                        min="0"
                        required
                        value={marksData[student.id]} 
                        onChange={(e) => setMarksData({ ...marksData, [student.id]: e.target.value })} 
                        className="border border-gray-300 rounded-md p-2 w-32 focus:ring-emerald-500 outline-none"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="flex justify-end">
              <button type="submit" disabled={loading} className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2 px-8 rounded-md transition-colors cursor-pointer disabled:bg-emerald-400">
                {loading ? "Saving Marks..." : "Submit Marks"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}