import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { toast } from "react-hot-toast";

export default function AcademicSetup() {
  const [classes, setClasses] = useState([]);
  const [sections, setSections] = useState([]);
  const [loadingClass, setLoadingClass] = useState(false);
  const [loadingSection, setLoadingSection] = useState(false);

  // ফর্মের ডেটা
  const [className, setClassName] = useState("");
  const [sectionData, setSectionData] = useState({
    class_id: "",
    section_name: "",
  });

  useEffect(() => {
    fetchClasses();
    fetchSections();
  }, []);

  // ডাটাবেস থেকে ক্লাসগুলো নিয়ে আসা
  const fetchClasses = async () => {
    const { data, error } = await supabase.from("classes").select("*").order("id", { ascending: true });
    if (!error) setClasses(data);
  };

  // ডাটাবেস থেকে সেকশনগুলো নিয়ে আসা (সাথে ক্লাসের নামও আসবে)
  const fetchSections = async () => {
    const { data, error } = await supabase
      .from("sections")
      .select("*, classes(class_name)")
      .order("class_id", { ascending: true });
    if (!error) setSections(data);
  };

  // নতুন ক্লাস অ্যাড করার ফাংশন
  const handleAddClass = async (e) => {
    e.preventDefault();
    setLoadingClass(true);

    const { error } = await supabase.from("classes").insert([{ class_name: className }]);
    
    setLoadingClass(false);
    if (error) {
      toast.error(error.message || "Failed to add class");
    } else {
      toast.success("Class added successfully!");
      setClassName("");
      fetchClasses();
    }
  };

  // নতুন সেকশন অ্যাড করার ফাংশন
  const handleAddSection = async (e) => {
    e.preventDefault();
    if (!sectionData.class_id) {
      toast.error("Please select a class first");
      return;
    }

    setLoadingSection(true);

    const { error } = await supabase.from("sections").insert([
      {
        class_id: parseInt(sectionData.class_id),
        section_name: sectionData.section_name,
      },
    ]);

    setLoadingSection(false);
    if (error) {
      toast.error(error.message || "Failed to add section");
    } else {
      toast.success("Section added successfully!");
      setSectionData({ ...sectionData, section_name: "" });
      fetchSections();
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">Academic Setup</h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* ================= ক্লাস ম্যানেজমেন্ট অংশ ================= */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold mb-4 text-blue-600 border-b pb-2">1. Manage Classes</h3>
          
          <form onSubmit={handleAddClass} className="flex gap-4 items-end mb-6">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">Class Name</label>
              <input
                type="text"
                value={className}
                onChange={(e) => setClassName(e.target.value)}
                required
                placeholder="e.g. Class 6, Class 7"
                className="w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 outline-none"
              />
            </div>
            <button
              type="submit"
              disabled={loadingClass}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-md transition-colors disabled:bg-blue-400 cursor-pointer"
            >
              {loadingClass ? "Adding..." : "Add Class"}
            </button>
          </form>

          <div className="border border-gray-200 rounded-md overflow-hidden max-h-64 overflow-y-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Class Name</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {classes.map((cls) => (
                  <tr key={cls.id}>
                    <td className="px-4 py-2 text-sm text-gray-500">{cls.id}</td>
                    <td className="px-4 py-2 text-sm font-medium text-gray-900">{cls.class_name}</td>
                  </tr>
                ))}
                {classes.length === 0 && (
                  <tr>
                    <td colSpan="2" className="px-4 py-2 text-center text-sm text-gray-500">No classes added yet.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* ================= সেকশন ম্যানেজমেন্ট অংশ ================= */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold mb-4 text-purple-600 border-b pb-2">2. Manage Sections</h3>
          
          <form onSubmit={handleAddSection} className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Select Class</label>
              <select
                value={sectionData.class_id}
                onChange={(e) => setSectionData({ ...sectionData, class_id: e.target.value })}
                required
                className="w-full border border-gray-300 rounded-md p-2 focus:ring-purple-500 outline-none"
              >
                <option value="" disabled>-- Select Class --</option>
                {classes.map((cls) => (
                  <option key={cls.id} value={cls.id}>{cls.class_name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Section Name</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={sectionData.section_name}
                  onChange={(e) => setSectionData({ ...sectionData, section_name: e.target.value })}
                  required
                  placeholder="e.g. A, B, Science"
                  className="w-full border border-gray-300 rounded-md p-2 focus:ring-purple-500 outline-none"
                />
                <button
                  type="submit"
                  disabled={loadingSection || classes.length === 0}
                  className="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 px-4 rounded-md transition-colors disabled:bg-purple-400 cursor-pointer"
                >
                  {loadingSection ? "Adding..." : "Add"}
                </button>
              </div>
            </div>
          </form>

          <div className="border border-gray-200 rounded-md overflow-hidden max-h-64 overflow-y-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Class</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Section Name</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {sections.map((sec) => (
                  <tr key={sec.id}>
                    <td className="px-4 py-2 text-sm text-gray-900">{sec.classes?.class_name}</td>
                    <td className="px-4 py-2 text-sm font-medium text-purple-600">Section {sec.section_name}</td>
                  </tr>
                ))}
                {sections.length === 0 && (
                  <tr>
                    <td colSpan="2" className="px-4 py-2 text-center text-sm text-gray-500">No sections added yet.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}