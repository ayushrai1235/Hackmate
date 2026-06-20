import React, { useState, useContext } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { FcGoogle } from 'react-icons/fc';
import { FaGithub } from 'react-icons/fa';
import { AuthContext } from '../context/AuthContext';
import { FaEnvelope, FaLock, FaSpinner, FaArrowRight } from 'react-icons/fa';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLocalLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await login({ email, password });
    
    if (result.success) {
      const from = location.state?.from?.pathname || (result.user.onboardingComplete ? '/discover' : '/onboarding');
      navigate(from, { replace: true });
    } else {
      setError(result.error);
    }
    setLoading(false);
  };

  const googleLoginUrl = `${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/auth/google`;
  const githubLoginUrl = `${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/auth/github`;

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-[#030014] px-4 py-12 sm:px-6 lg:px-8 overflow-hidden font-sans">
      {/* Background Decorative Ambient Blurs */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-500/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-emerald-500/10 blur-[120px] pointer-events-none" />
      
      <div className="relative w-full max-w-md space-y-8 glass-panel card-glow-indigo p-8 sm:p-10 rounded-2xl border border-white/5 shadow-2xl">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-tr from-indigo-500 to-emerald-500 p-[1px] mb-4">
            <div className="w-full h-full bg-[#030014] rounded-xl flex items-center justify-center">
              <span className="text-lg font-black bg-gradient-to-tr from-indigo-400 to-emerald-400 bg-clip-text text-transparent font-cabinet">HM</span>
            </div>
          </div>
          <h2 className="text-3xl font-bold tracking-tight text-white font-cabinet">
            Welcome back
          </h2>
          <p className="mt-2 text-sm text-slate-400 font-outfit">
            Ready to build?{' '}
            <Link to="/register" className="font-semibold text-indigo-400 hover:text-indigo-300 transition-colors">
              Create a new account
            </Link>
          </p>
        </div>
        
        {error && (
          <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-400 font-outfit">
            {error}
          </div>
        )}

        <form className="space-y-6" onSubmit={handleLocalLogin}>
          <div className="space-y-4">
            <div>
              <label htmlFor="email-address" className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <FaEnvelope className="h-4 w-4 text-slate-505 text-slate-500" />
                </div>
                <input
                  id="email-address"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="premium-input block w-full pl-10 pr-4 py-3 text-sm"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>
            
            <div>
              <label htmlFor="password" className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <FaLock className="h-4 w-4 text-slate-500" />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  className="premium-input block w-full pl-10 pr-4 py-3 text-sm"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative flex w-full justify-center items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-650 hover:to-indigo-700 py-3.5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/20 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-[#030014] transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {loading ? (
                <FaSpinner className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  Sign in
                  <FaArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-1" />
                </>
              )}
            </button>
          </div>
        </form>

        <div className="mt-8">
          <div className="relative flex items-center justify-center">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/5" />
            </div>
            <div className="relative bg-[#090b1e] px-4 text-xs font-semibold uppercase tracking-widest text-slate-500 rounded-full py-0.5 border border-white/5">
              Or continue with
            </div>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-4">
            <a
              href={googleLoginUrl}
              className="inline-flex w-full justify-center items-center gap-2 rounded-xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.06] py-3 text-sm font-medium text-slate-300 shadow-sm transition-all hover:border-white/10"
            >
              <FcGoogle className="h-5 w-5" />
              <span className="font-outfit text-xs font-semibold">Google</span>
            </a>

            <a
              href={githubLoginUrl}
              className="inline-flex w-full justify-center items-center gap-2 rounded-xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.06] py-3 text-sm font-medium text-slate-300 shadow-sm transition-all hover:border-white/10"
            >
              <FaGithub className="h-5 w-5 text-white" />
              <span className="font-outfit text-xs font-semibold">GitHub</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
