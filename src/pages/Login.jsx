import { useState } from "react";
import { supabase } from "../lib/supabase";
import { toast } from "react-hot-toast";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("username", username)
      .eq("password", password)
      .single();

    setLoading(false);

    if (data) {
      toast.success(`Welcome back, ${data.role}!`);
      localStorage.setItem("userRole", data.role);
      localStorage.setItem("userName", data.username);
      window.location.href = "/"; 
    } else {
      toast.error("Invalid username or password!");
    }
  };

  return (
    <div className="flex min-h-screen w-full bg-gray-50">
      
      {/* Left Side: Premium Branding (Hidden on smaller screens) */}
      <div className="hidden lg:flex flex-col justify-center items-center w-1/2 bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 text-white p-12 relative overflow-hidden">
        {/* Abstract Background Shapes */}
        <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>
        
        <div className="z-10 text-center">
          <h1 className="text-5xl font-extrabold mb-6 tracking-tight">School ERP</h1>
          <p className="text-lg text-blue-200 max-w-md mx-auto leading-relaxed">
            A complete, modern, and intelligent management system for your institution. Streamline your academics, finance, and administration all in one place.
          </p>
        </div>
      </div>

      {/* Right Side: Login Form */}
      <div className="flex flex-col justify-center items-center w-full lg:w-1/2 p-6 sm:p-12">
        <div className="w-full max-w-md">
          {/* Mobile Header (Shows only on mobile) */}
          <div className="text-center lg:hidden mb-8">
            <h1 className="text-4xl font-extrabold text-slate-900 mb-2">School ERP</h1>
            <p className="text-gray-500">Sign in to your account</p>
          </div>

          <div className="bg-white p-8 sm:p-10 rounded-2xl shadow-xl shadow-blue-900/5 border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Welcome Back!</h2>
            <p className="text-sm text-gray-500 mb-8">Please enter your credentials to access the portal.</p>
            
            <form onSubmit={handleLogin} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Username</label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  placeholder="e.g. admin"
                  className="w-full border border-gray-200 rounded-lg p-3 text-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-gray-50 focus:bg-white"
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="w-full border border-gray-200 rounded-lg p-3 text-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-gray-50 focus:bg-white"
                />
              </div>

              <div className="flex items-center justify-between mt-2">
                <label className="flex items-center text-sm text-gray-600 cursor-pointer">
                  <input type="checkbox" className="mr-2 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                  Remember me
                </label>
                <a href="#" className="text-sm text-blue-600 hover:text-blue-800 font-medium">Forgot password?</a>
              </div>
              
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold py-3.5 rounded-lg transition-all shadow-md shadow-blue-500/30 disabled:opacity-70 disabled:cursor-not-allowed mt-4"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Signing in...
                  </span>
                ) : "Sign In to Dashboard"}
              </button>
            </form>
          </div>

          {/* Demo Credentials Info Box */}
          <div className="mt-8 bg-blue-50 border border-blue-100 p-4 rounded-xl text-sm text-blue-800 text-center">
            <p className="font-semibold mb-2">Test Accounts (Password: 1234)</p>
            <div className="flex flex-wrap justify-center gap-3">
              <span className="bg-white px-3 py-1 rounded-md shadow-sm border border-blue-100">admin</span>
              <span className="bg-white px-3 py-1 rounded-md shadow-sm border border-blue-100">teacher</span>
              <span className="bg-white px-3 py-1 rounded-md shadow-sm border border-blue-100">accountant</span>
              <span className="bg-white px-3 py-1 rounded-md shadow-sm border border-blue-100">student</span>
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
}