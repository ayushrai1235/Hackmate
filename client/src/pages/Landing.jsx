import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { AuthContext } from '../context/AuthContext';
import { 
  FaCompass, FaUsers, FaGithub, FaComments, FaRobot, FaBell, 
  FaPlay, FaArrowRight, FaChevronDown, FaCheckCircle, FaStar 
} from 'react-icons/fa';

const Landing = () => {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [activeFaq, setActiveFaq] = useState(null);
  const [showDemoVideo, setShowDemoVideo] = useState(false);

  const toggleFaq = (index) => {
    setActiveFaq(activeFaq === index ? null : index);
  };

  const features = [
    {
      icon: FaCompass,
      title: "Swipe Discovery Feed",
      description: "Quickly browse and discover developers using a beautiful, interactive card swipe feed.",
      color: "from-blue-500 to-indigo-500",
      glow: "hover:border-blue-500/30 hover:shadow-blue-500/10"
    },
    {
      icon: FaRobot,
      title: "AI Matchmaking Engine",
      description: "Get matched based on roles, skills, and technical compatibility using our matchmaking algorithm.",
      color: "from-emerald-500 to-teal-500",
      glow: "hover:border-emerald-500/30 hover:shadow-emerald-500/10"
    },
    {
      icon: FaGithub,
      title: "GitHub Verification",
      description: "Sync your repositories, verify commits, and showcase a verified score to potential teams.",
      color: "from-purple-500 to-pink-500",
      glow: "hover:border-purple-500/30 hover:shadow-purple-500/10"
    },
    {
      icon: FaComments,
      title: "Real-time Messaging",
      description: "Connect instantly with your matches in real-time, features-rich chat room once mutual interest is confirmed.",
      color: "from-amber-500 to-orange-500",
      glow: "hover:border-amber-500/30 hover:shadow-amber-500/10"
    },
    {
      icon: FaUsers,
      title: "Synergy Team Builder",
      description: "Form official hackathon teams, recruit missing roles, and track composite team health stats.",
      color: "from-cyan-500 to-blue-500",
      glow: "hover:border-cyan-500/30 hover:shadow-cyan-500/10"
    },
    {
      icon: FaBell,
      title: "Real-time Alert Center",
      description: "Get notified immediately when you receive a message, match request, or super-like invitation.",
      color: "from-rose-500 to-red-500",
      glow: "hover:border-rose-500/30 hover:shadow-rose-500/10"
    }
  ];

  const steps = [
    { number: "01", title: "Quick Onboarding", text: "Create your developer profile, select your core roles and select skills." },
    { number: "02", title: "Verify via GitHub", text: "Link your GitHub portfolio to sync statistics and generate a profile score badge." },
    { number: "03", title: "Find Matches", text: "Search with advanced filter combinations or discover hackers via the swipe feed." },
    { number: "04", title: "Assemble Team", text: "Initiate direct chats with mutual matches and create team rosters with synergy scores." }
  ];

  const testimonials = [
    {
      name: "Sarah Jenkins",
      role: "Backend Engineer",
      team: "1st Place Winner, HackFest 2025",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150",
      quote: "I found my co-developer on HackMate in 10 minutes. The GitHub verification and skills alignment tool made sorting through candidates incredibly reliable."
    },
    {
      name: "Alex Rivera",
      role: "UI/UX Designer",
      team: "Finalist, Global AI Hackathon",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150",
      quote: "As a designer, it's usually hard to filter for developers who actually build mockups properly. The compatibility index predicted our team synergy accurately!"
    },
    {
      name: "Pranav Patel",
      role: "Product Lead",
      team: "Winner, Build-a-thon",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150",
      quote: "Setting up our roster and tracking which roles we lacked made recruiting developers simple. Our team health score went from 50% to 95% in one afternoon."
    }
  ];

  const faqs = [
    {
      q: "How does the AI Matchmaking Engine work?",
      a: "Our algorithm analyzes skills, role configurations, past hackathon experience levels, and availability metrics to calculate a compatibility percentage between potential teammates, ensuring optimal work alignment."
    },
    {
      q: "What is the GitHub score and how is it computed?",
      a: "The score is computed securely using repositories count, total stars, open-source commits, and overall project metadata. It filters bot accounts and gives recruiters confidence in a developer's real-world skills."
    },
    {
      q: "Can I manage multiple hackathon teams simultaneously?",
      a: "You can create or join one primary team per hackathon project, but you can request matches with multiple users until your team slots are full."
    },
    {
      q: "Is my personal contact information kept private?",
      a: "Yes! Your contact details are hidden. Team conversations occur safely inside HackMate's real-time messaging hub, and you have the ability to toggle profile visibility or ban malicious profiles."
    },
    {
      q: "How do I invite matches into a team?",
      a: "Once you have a mutual match, navigate to the Teams tab, create a new team instance, and select 'Invite Teammate' to search through your active matches and request they join your roster."
    }
  ];

  return (
    <div className="min-h-screen bg-[#030014] text-slate-100 flex flex-col font-sans overflow-x-hidden selection:bg-indigo-500 selection:text-white relative">
      {/* Background Gradients & Mesh */}
      <div className="absolute top-0 left-0 right-0 h-[80vh] bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(99,102,241,0.18),rgba(255,255,255,0))] pointer-events-none z-0" />
      <div className="absolute top-[20%] left-[-10%] w-[45vw] h-[45vw] rounded-full bg-indigo-500/[0.04] blur-[140px] pointer-events-none" />
      <div className="absolute top-[40%] right-[-10%] w-[40vw] h-[40vw] rounded-full bg-emerald-500/[0.03] blur-[140px] pointer-events-none" />

      {/* Floating Header */}
      <header className="sticky top-4 z-40 mx-4 sm:mx-8 my-4 px-6 py-3.5 bg-slate-950/40 backdrop-blur-2xl border border-white/5 rounded-2xl flex items-center justify-between transition-all duration-300">
        <div className="flex items-center gap-3 select-none group cursor-pointer" onClick={() => navigate('/')}>
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-emerald-500 flex items-center justify-center font-bold text-white shadow-lg shadow-indigo-500/20 group-hover:rotate-[12deg] group-hover:scale-105 transition-all duration-300">
            H
          </div>
          <span className="font-cabinet text-lg font-black tracking-tight bg-gradient-to-r from-white via-indigo-100 to-emerald-250 bg-clip-text text-transparent">
            HackMate <span className="font-sans text-[9px] px-1.5 py-0.5 ml-1 bg-white/5 border border-white/10 rounded-md text-indigo-300 font-bold uppercase tracking-wider">AI</span>
          </span>
        </div>
        
        <button
          onClick={() => navigate(user ? '/discover' : '/login')}
          className="text-xs font-bold bg-white/5 hover:bg-indigo-500 hover:text-white border border-white/10 hover:border-indigo-500 px-4 py-2 rounded-xl transition-all duration-300 shadow-md active:scale-95"
        >
          {user ? 'Enter Dashboard' : 'Sign In'}
        </button>
      </header>

      {/* 1. Hero Section */}
      <section className="relative py-20 md:py-32 px-4 max-w-7xl mx-auto w-full flex flex-col items-center text-center justify-center z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="space-y-6 max-w-4xl"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/[0.03] border border-white/5 text-xs font-bold text-indigo-300 rounded-full shadow-inner">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            HackMate v1.0.0 Live
          </div>

          <h1 className="text-4xl sm:text-6xl md:text-7xl font-cabinet font-black tracking-tight leading-[1.05] text-white">
            Find Your Next <br />
            <span className="bg-gradient-to-r from-indigo-200 via-purple-300 to-emerald-250 bg-clip-text text-transparent">
              Hackathon Teammates
            </span>
          </h1>

          <p className="text-sm sm:text-lg text-slate-400 leading-relaxed max-w-2xl mx-auto font-light">
            Assemble high-performance rosters using verified GitHub profiles, automated compatibility scoring, and seamless team synergy insights.
          </p>

          <div className="flex flex-col sm:flex-row gap-3.5 pt-6 justify-center">
            <button
              onClick={() => navigate(user ? '/discover' : '/register')}
              className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-500 hover:opacity-95 text-white font-bold px-7 py-3.5 rounded-xl transition-all duration-300 text-xs tracking-wider uppercase shadow-lg shadow-indigo-500/20 active:scale-95"
            >
              Get Started Free <FaArrowRight />
            </button>
            <button
              onClick={() => setShowDemoVideo(true)}
              className="inline-flex items-center justify-center gap-2 bg-white/[0.02] hover:bg-white/[0.06] border border-white/5 text-slate-300 font-bold px-7 py-3.5 rounded-xl transition-all duration-300 text-xs tracking-wider uppercase active:scale-95"
            >
              <FaPlay className="text-[9px]" /> Watch Demo
            </button>
          </div>
        </motion.div>
      </section>

      {/* 2. Features Grid */}
      <section className="py-24 px-4 max-w-7xl mx-auto w-full z-10">
        <div className="text-center space-y-4 mb-20">
          <h2 className="text-3xl sm:text-5xl font-cabinet font-black text-white">
            Supercharged Matching Suite
          </h2>
          <p className="text-sm text-slate-400 max-w-xl mx-auto font-light">
            Streamlined features designed by hackers, for hackers, to eliminate team building bottlenecks.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feat, idx) => {
            const Icon = feat.icon;
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: idx * 0.08 }}
                className={`glass-panel p-8 hover:-translate-y-1 transition-all duration-300 group relative overflow-hidden ${feat.glow}`}
              >
                {/* Accent glow corner */}
                <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${feat.color} opacity-0 group-hover:opacity-[0.04] blur-xl transition-opacity duration-500`} />
                
                <div className="w-12 h-12 rounded-2xl bg-white/[0.02] border border-white/5 flex items-center justify-center text-slate-300 group-hover:text-indigo-400 group-hover:border-indigo-500/25 group-hover:scale-105 transition-all duration-300">
                  <Icon className="text-xl" />
                </div>
                <h3 className="text-lg font-cabinet font-bold text-white mt-6 mb-3 group-hover:text-indigo-200 transition-colors">{feat.title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed font-light">{feat.description}</p>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* 3. How It Works */}
      <section className="py-24 px-4 max-w-7xl mx-auto w-full z-10">
        <div className="text-center space-y-4 mb-20">
          <h2 className="text-3xl sm:text-5xl font-cabinet font-black text-white">How HackMate Works</h2>
          <p className="text-sm text-slate-400 max-w-xl mx-auto font-light">
            Four simple steps to transition from solo developer to ready team.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 relative">
          {steps.map((step, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: idx * 0.1 }}
              className="glass-panel p-8 relative overflow-hidden"
            >
              <div className="text-4xl font-cabinet font-black text-indigo-500/10 group-hover:text-indigo-500/20 select-none mb-6">{step.number}</div>
              <h3 className="text-sm font-cabinet font-bold text-white uppercase tracking-wider mb-2.5">{step.title}</h3>
              <p className="text-xs text-slate-400 leading-relaxed font-light">{step.text}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* 4. Testimonials */}
      <section className="py-24 px-4 max-w-7xl mx-auto w-full z-10">
        <div className="text-center space-y-4 mb-20">
          <h2 className="text-3xl sm:text-5xl font-cabinet font-black text-white">Trusted by Top Hackers</h2>
          <p className="text-sm text-slate-400 max-w-xl mx-auto font-light">
            Hear from teams who found synergy and went on to win top developer awards.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((test, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, scale: 0.96 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: idx * 0.1 }}
              className="glass-panel p-8 flex flex-col justify-between hover:border-white/10 transition-colors"
            >
              <p className="text-sm text-slate-350 leading-relaxed italic mb-8 font-light">
                "{test.quote}"
              </p>
              <div className="flex items-center gap-3">
                <img src={test.avatar} alt={test.name} className="w-10 h-10 rounded-full object-cover border border-white/10 shadow-lg" />
                <div>
                  <h4 className="text-xs font-bold text-white">{test.name}</h4>
                  <p className="text-[10px] text-slate-500 font-semibold">{test.role} • {test.team}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* 5. FAQs Accordion */}
      <section className="py-24 px-4 max-w-4xl mx-auto w-full z-10">
        <div className="text-center space-y-4 mb-20">
          <h2 className="text-3xl sm:text-5xl font-cabinet font-black text-white">Frequently Asked Questions</h2>
          <p className="text-sm text-slate-400 font-light">
            Got questions about matches, scores, or setups? We have answers.
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, idx) => {
            const isOpen = activeFaq === idx;
            return (
              <div 
                key={idx} 
                className="bg-white/[0.01] hover:bg-white/[0.02] border border-white/5 rounded-2xl overflow-hidden transition-all duration-300"
              >
                <button
                  onClick={() => toggleFaq(idx)}
                  className="w-full flex justify-between items-center p-6 text-left transition-colors"
                >
                  <span className="text-sm sm:text-base font-cabinet font-bold text-slate-200">{faq.q}</span>
                  <FaChevronDown className={`text-slate-400 text-xs transition-transform duration-350 ${isOpen ? 'rotate-180 text-indigo-400' : ''}`} />
                </button>
                
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <div className="p-6 pt-0 border-t border-white/5 text-sm text-slate-400 leading-relaxed font-light">
                        {faq.a}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </section>

      {/* 6. Footer Section */}
      <footer className="py-16 px-4 max-w-7xl mx-auto w-full flex flex-col sm:flex-row justify-between items-center gap-6 text-slate-500 text-xs z-10 border-t border-white/5 mt-10">
        <div className="flex items-center gap-2.5">
          <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-indigo-500 to-emerald-500 flex items-center justify-center font-bold text-white shadow-md">H</div>
          <span className="font-cabinet font-black text-slate-300 text-sm">HackMate AI</span>
        </div>
        <div className="flex gap-6">
          <a href="#" className="hover:text-slate-300 transition-colors">Privacy</a>
          <a href="#" className="hover:text-slate-300 transition-colors">Terms</a>
          <a href="#" className="hover:text-slate-300 transition-colors">Support</a>
        </div>
        <p className="font-light">© {new Date().getFullYear()} HackMate AI. All rights reserved.</p>
      </footer>

      {/* Watch Demo Modal Player */}
      {showDemoVideo && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-slate-950 border border-white/10 max-w-2xl w-full rounded-2xl overflow-hidden p-6 relative shadow-2xl">
            <button
              onClick={() => setShowDemoVideo(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-2 text-xl font-light"
            >
              ×
            </button>
            <h3 className="font-cabinet font-bold text-white text-lg mb-4">HackMate Demo Walkthrough</h3>
            
            {/* Embed beautiful video simulation or graphic representation */}
            <div className="aspect-video bg-slate-950 border border-white/5 rounded-xl flex flex-col items-center justify-center p-8 gap-4 text-center relative overflow-hidden">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(99,102,241,0.1),transparent)] pointer-events-none" />
              <div className="w-16 h-16 rounded-full bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400 text-xl animate-pulse">
                <FaCompass />
              </div>
              <div className="z-10">
                <h4 className="text-sm font-cabinet font-bold text-white">Simulation Showcase</h4>
                <p className="text-xs text-slate-400 max-w-xs leading-relaxed mt-1 font-light">
                  Discover developers cards, toggle filter sidebar, review synergy scoring, match and instantly chat!
                </p>
              </div>
              <button 
                onClick={() => {
                  setShowDemoVideo(false);
                  navigate('/register');
                }}
                className="mt-2 text-xs font-bold text-white bg-indigo-500 hover:bg-indigo-650 px-5 py-2.5 rounded-xl transition-all shadow-lg active:scale-95"
              >
                Launch App Now
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Landing;
