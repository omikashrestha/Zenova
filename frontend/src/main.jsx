import React, { useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { LogOut, User, Check, Droplets, Activity, Moon, Wind, Heart, Dumbbell, Brain } from 'lucide-react';
import PhysicalModule from './modules/PhysicalModule';
import HydrationModule from './modules/HydrationModule';
import SleepModule from './modules/SleepModule';
import CalmModule from './modules/CalmModule';
import MindModule from './modules/MindModule';
import ProfileModule from './modules/ProfileModule';
import { RadialBarChart, RadialBar, ResponsiveContainer } from 'recharts';
import './styles.css';
import imgMovement from './assets/img-movement.jpg';
import imgHydration from './assets/img-hydration.jpg';
import imgRest from './assets/img-rest.jpg';
import imgMeditation from './assets/img-meditation.jpg';
import imgCalm from './assets/img-calm.jpg';
import imgEmotional from './assets/img-emotional.jpg';
import imgMindful from './assets/img-mindful.jpg';

import { apiRequest as request } from "./api";
const API = import.meta.env.VITE_API_URL || 'http://localhost:5003/api';

const colors = {
  ivory: '#F7F5F0',
  sage: '#6B9E78',
  forest: '#2D4A35',
  lav: '#9B8FCA',
  sky: '#AACFE0',
  peach: '#E8CBBA',
  dew: '#D6EBDA',
};

const safeUser = () => {
  try {
    const raw = localStorage.getItem('user');
    if (!raw || raw === 'undefined') return {};
    return JSON.parse(raw);
  } catch {
    localStorage.removeItem('user');
    return {};
  }
};



function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/onboarding" element={<Guard><Onboarding /></Guard>} />
        <Route path="/dashboard" element={<Guard><Home /></Guard>} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}

function Guard({ children }) {
  return localStorage.getItem('token') ? children : <Navigate to="/" />;
}

function Logo() {
  return (
    <img
      src="/zenova_logo.svg"
      alt="Zenova"
      className="logo"
    />
  );
}

function Splash() {
  const [show, setShow] = useState(!sessionStorage.getItem('introDone'));

  useEffect(() => {
    if (show) {
      setTimeout(() => {
        sessionStorage.setItem('introDone', '1');
        setShow(false);
      }, 3600);
    }
  }, [show]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div className="splash" exit={{ opacity: 0 }}>
          <div className="letters">
            {'ZENOVA'.split('').map((letter, index) => (
              <motion.span
                key={index}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.06 }}
              >
                {letter}
              </motion.span>
            ))}
          </div>

          <motion.img
            src="/zenova_logo.svg"
            alt="Zenova logo"
            initial={{ scale: 0.3, opacity: 0 }}
            animate={{ scale: 0.6, opacity: 1 }}
            transition={{ delay: 1.6, type: 'spring', duration: 0.7 }}
          />

          <motion.div
            className="reveal"
            initial={{ clipPath: 'circle(0% at 50% 50%)' }}
            animate={{ clipPath: 'circle(120% at 50% 50%)' }}
            transition={{ delay: 2.6, duration: 0.8 }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function PublicNav({ openAuth }) {
  return (
    <nav className="nav public">
      <Logo />
      <div>
        <a href="#about">About</a>
        <a href="#features">Features</a>
        <a href="#how">How it works</a>
      </div>
      <button onClick={openAuth}>Join us</button>
    </nav>
  );
}

function Avatar({ onProfileClick }) {
  const nav = useNavigate();
  const [user] = useState(safeUser());
  const [open, setOpen] = useState(false);

  const initials = (user.name || 'Zenova User')
    .split(' ')
    .map((x) => x[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="avatarBox">
      <button className="avatar" onClick={() => setOpen(!open)}>
        {initials}
      </button>

      {open && (
        <div className="drop">
          <button onClick={() => { onProfileClick(); setOpen(false); }}>
            <User size={15} /> View Profile
          </button>
          <button
            onClick={() => {
                localStorage.clear();
                sessionStorage.clear();
                window.location.replace('/');
            }}
         >
            <LogOut size={15} /> Log out
          </button>
        </div>
      )}
    </div>
  );
}

function AppNav({ onProfileClick }) {
  return (
    <nav className="nav">
      <Logo />
      <div>
        <a href="/dashboard">Home</a>
      </div>
      <Avatar onProfileClick={onProfileClick} />
    </nav>
  );
}

function AuthModal({ onClose }) {
  const nav = useNavigate();

  const [tab, setTab] = useState(localStorage.getItem('token') ? 'login' : 'signup');
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [err, setErr] = useState('');

  useEffect(() => {
    const esc = (e) => e.key === 'Escape' && onClose();
    addEventListener('keydown', esc);
    return () => removeEventListener('keydown', esc);
  }, [onClose]);

  const submit = async () => {
    setErr('');

    if (tab === 'signup' && !form.name.trim()) return setErr('Name cannot be empty.');
    if (!/^[^@]+@[^@]+\.[^@]+$/.test(form.email)) return setErr('Enter a valid email.');
    if (form.password.length < 6) return setErr('Password must be at least 6 characters.');

    try {
      const json = await request('/auth/' + (tab === 'signup' ? 'signup' : 'login'), {
        method: 'POST',
        body: JSON.stringify(form),
      });

      localStorage.setItem('token', json.token);
      localStorage.setItem('user', JSON.stringify(json.user));

      nav(tab === 'signup' || !json.user.onboardingComplete ? '/onboarding' : '/dashboard');
    } catch (e) {
      setErr(e.message);
    }
  };

  return (
    <div className="modalShade" onMouseDown={onClose}>
      <motion.div
        className="modal"
        onMouseDown={(e) => e.stopPropagation()}
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
      >
        <div className="tabs">
          <button className={tab === 'signup' ? 'active' : ''} onClick={() => setTab('signup')}>
            Create account
          </button>
          <button className={tab === 'login' ? 'active' : ''} onClick={() => setTab('login')}>
            Log in
          </button>
        </div>

        {tab === 'signup' && (
          <input
            placeholder="Full name"
            onBlur={() => !form.name && setErr('Name cannot be empty.')}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
        )}

        <input
          placeholder="Email"
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />

        <input
          type="password"
          placeholder="Password"
          onChange={(e) => setForm({ ...form, password: e.target.value })}
        />

        {err && <p className="error">{err}</p>}

        <button className="primary wide" onClick={submit}>
          {tab === 'signup' ? 'Create account' : 'Log in'}
        </button>
      </motion.div>
    </div>
  );
}

function Landing(){
  const [auth, setAuth] = useState(false);
  const [tip, setTip] = useState(null);

  const featureImages = [
  {
    img: imgMovement,
    title: "Move your body, reset your energy",
    text: "Small movements that reconnect you with your body and boost daily vitality.",
    className: "movementText"
  },
  {
    img: imgHydration,
    title: "Hydrate your system, restore balance",
    text: "Track your water intake and support your energy, focus, and recovery.",
    className: "hydrationText"
  },
  {
    img: imgRest,
    title: "Rest deeply, recover fully",
    text: "Understand your sleep patterns and gently improve your recovery.",
    className: "restText"
  },
  {
    img: imgMeditation,
    title: "Pause, breathe, and center yourself",
    text: "Simple mindfulness practices to calm your mind and reduce stress.",
    className: "meditationText"
  },
  {
    img: imgCalm,
    title: "Release stress, find your calm",
    text: "Personalized suggestions to help you unwind and regain control.",
    className: "calmText"
  },
  {
    img: imgEmotional,
    title: "Understand your emotions, not suppress them",
    text: "Track your mood, connection, and emotional patterns with clarity.",
    className: "emotionalText"
  },
  {
    img: imgMindful,
    title: "Be present, not overwhelmed",
    text: "Build awareness of your thoughts and habits — one small step at a time.",
    className: "mindfulText"
  }
];

  useEffect(() => {
    if (localStorage.getItem('token')) location.href = '/dashboard';
    const onScroll = () => {
      const nav = document.querySelector('.nav.public');
      if (nav) nav.classList.toggle('nav-scrolled', window.scrollY > 40);
    };
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const features = [
    { img: imgMovement, label: 'PHYSICAL', title: 'One tap. One question.', desc: "Check in daily in under 30 seconds. No forms, no friction. One mood tap and you're done.", name: 'Micro Check-In' },
    { img: imgHydration, label: 'PHYSICAL', title: 'Track everything that matters.', desc: 'Sleep, water, movement, energy. All in one calm place, logged in seconds.', name: 'Holistic Tracking' },
    { img: imgRest, label: 'OVERVIEW', title: 'See your week clearly.', desc: 'Patterns, trends, and gentle insights from your last 7 days — served every week.', name: 'Weekly Reflection' },
    { img: imgMeditation, label: 'MENTAL', title: 'Your mind, measured softly.', desc: 'Focus rating, cognitive load, digital fatigue. Mental clarity starts with awareness.', name: 'Mental Health Tab' },
    { img: imgCalm, label: 'EMOTIONAL', title: 'When stress builds, Zenova shifts.', desc: 'Three stressed check-ins triggers Recovery Mode — a calmer UI with one gentle task.', name: 'Recovery Mode' },
    { img: imgEmotional, label: 'EMOTIONAL', title: 'Your inner weather, visualised.', desc: 'Sunny, cloudy, or stormy — your mood becomes a weather metaphor that just makes sense.', name: 'Wellness Weather' },
  ];

  const quotes = [
    { q: 'I want something simple that gives reminders', who: 'Wellness seeker, age 24' },
    { q: 'Apps are useful but many features are paid or too complex', who: 'Student, age 21' },
    { q: 'I struggle with discipline and maintaining a proper routine.', who: 'Professional, age 29' },
  ];

  return (
    <>
      <Splash />
      <PublicNav openAuth={() => setAuth(true)} />
      {auth && <AuthModal onClose={() => setAuth(false)} />}
      {tip && <div className='toast' onClick={() => setTip(null)}><b>{tip.name}</b><p>{tip.desc}</p></div>}

      <main className='landing'>

        {/* HERO */}
        <section className='hero'>
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.7 }}>
            <h1>Your wellness.<br />Simplified.</h1>
            <p>Zenova helps you understand your physical, mental, and emotional state through tiny daily check-ins. Calm insights, gentle routines, and a unified score keep wellness simple.</p>
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginTop: '2rem' }}>
              <button className='primary' onClick={() => document.getElementById('features').scrollIntoView({ behavior: 'smooth' })}>Explore features</button>
              <button className='ghost' onClick={() => setAuth(true)}>Join us</button>
            </div>
          </motion.div>
        </section>
        
        {/* FEATURES */}
        <section id="features" className="featureStory">
        <div className="featureIntro">
            <p>WHAT ZENOVA DOES</p>
            <h1>Your wellness, in one gentle flow.</h1>
            <span>
            A simple, holistic system designed to support your body, mind, and emotions — without overwhelm.
            </span>
        </div>

        {featureImages.map((item, index) => (
            <motion.div
                className="featureImageBlock"
                key={index}
                initial={{ opacity: 0.92 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: false, margin: '-120px' }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
                >
            
                <motion.img
                    src={item.img}
                    alt={item.title}
                    initial={{ scale: 1.08 }}
                    whileInView={{ scale: 1 }}
                    viewport={{ once: false, margin: '-120px' }}
                    transition={{ duration: 1.2, ease: 'easeOut' }}
                />

                <div className={`featureImageText ${item.className}`}>
                <h2>{item.title}</h2>
                <p>{item.text}</p>
            </div>
            </motion.div>
        ))}

        <div className="featureClosing">
            <h2>Not separate tools. One connected system.</h2>
            <p>
            Zenova brings together physical, mental, and emotional wellness into a single,
            simple experience — so you do not have to manage multiple apps or routines.
            </p>
        </div>
        </section>

        {/* HOW IT WORKS */}
        <section id='how' style={{ background: 'var(--dew)', padding: '6rem 0' }}>
          <motion.div style={{ textAlign: 'center', marginBottom: '3rem', padding: '0 8vw' }} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <p style={{ fontSize: '0.8rem', letterSpacing: '0.2em', color: 'var(--sage)', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.5rem' }}>How it works</p>
            <h2 style={{ fontSize: 'clamp(2rem,4vw,3rem)', margin: 0 }}>Simple by design.</h2>
          </motion.div>
          <div className='how-steps'>
            {[
              { n: '01', title: 'Check in in 30 seconds', desc: 'One tap on how you feel. No long forms. No judgment. Just honesty.' },
              { n: '02', title: 'See your wellness weather', desc: 'Your mood becomes a weather metaphor — sunny, cloudy, or stormy.' },
              { n: '03', title: 'Get your personalised tip', desc: 'A calm, rule-based suggestion tailored to exactly where you are today.' },
            ].map((s, i) => (
              <motion.div key={s.n} className='card' style={{ background: 'white', padding: '2.5rem', borderRadius: 28 }}
                initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.12 }}>
                <div className='step-num'>{s.n}</div>
                <h3 style={{ fontSize: '1.3rem', margin: '0.75rem 0 0.5rem' }}>{s.title}</h3>
                <p style={{ color: 'var(--muted)', lineHeight: 1.7, margin: 0 }}>{s.desc}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* ABOUT */}
        <section id='about'>
          <div className='about-dark'>
            <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
              <p style={{ fontSize: '0.8rem', letterSpacing: '0.2em', color: 'rgba(255,255,255,0.5)', fontWeight: 700, textTransform: 'uppercase', marginBottom: '1rem' }}>About Zenova</p>
              <h2>Built around<br />real people.</h2>
              <p style={{ color: 'rgba(255,255,255,0.7)', maxWidth: 600, fontSize: '1.1rem', lineHeight: 1.8, marginTop: '1rem' }}>
                Design Thinking guided every decision: Empathy → Define → Ideate → Prototype → Test.
                Zenova was shaped by listening to real people before a single line of code was written.
              </p>
            </motion.div>
          </div>

          <img className='about-banner' src={imgMindful} alt='Mindful wellness' />

          <div className='about-quotes'>
            {quotes.map((q, i) => (
              <motion.div key={i} className='quote-card'
                initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.1 }}>
                <blockquote>"{q.q}"</blockquote>
                <p style={{ fontSize: '0.85rem', color: 'var(--muted)', margin: 0, fontWeight: 600 }}>— {q.who}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* GALLERY — horizontal photo scroll */}
        <section style={{ padding: '4rem 0 2rem' }}>
          <motion.div style={{ textAlign: 'center', padding: '0 8vw 2rem' }} initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}>
            <p style={{ fontSize: '0.8rem', letterSpacing: '0.2em', color: 'var(--sage)', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.5rem' }}>Wellness gallery</p>
            <h2 style={{ fontSize: 'clamp(1.5rem,3vw,2.5rem)', margin: 0 }}>Moments that matter.</h2>
          </motion.div>
          <div className='gallery' style={{ paddingLeft: '8vw', paddingRight: '8vw', gap: '1rem' }}>
            {features.map((f, i) => (
              <div key={i} className='galleryCard' style={{ minWidth: 220, borderRadius: 20, overflow: 'hidden', border: '1px solid #d7ddcf', cursor: 'pointer' }} onClick={() => setTip(f)}>
                <img src={f.img} alt={f.name} style={{ width: '100%', height: 160, objectFit: 'cover', display: 'block' }} />
                <div style={{ padding: '0.75rem 1rem' }}>
                  <p style={{ fontSize: '0.7rem', color: 'var(--sage)', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', margin: '0 0 0.2rem' }}>{f.label}</p>
                  <b style={{ color: 'var(--forest)', fontSize: '0.95rem' }}>{f.name}</b>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* CTA BANNER */}
        <section style={{
          margin: '4rem 8vw', borderRadius: 32,
          background: 'linear-gradient(135deg, var(--forest) 0%, #3d6b4a 100%)',
          padding: '5rem 6vw', textAlign: 'center',
          boxShadow: '0 20px 60px rgba(45,74,53,0.2)',
        }}>
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <h2 style={{ color: 'white', fontSize: 'clamp(1.8rem,4vw,3rem)', marginBottom: '1rem' }}>
              Ready to feel better,<br />one day at a time?
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.7)', marginBottom: '2rem', fontSize: '1.1rem' }}>
              Start your wellness journey in under a minute.
            </p>
            <button style={{
              background: 'white', color: 'var(--forest)', fontWeight: 700,
              fontSize: '1rem', padding: '0.9rem 2.5rem', borderRadius: 999,
              boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
            }} onClick={() => setAuth(true)}>
              Begin Your Journey 🌱
            </button>
          </motion.div>
        </section>

        {/* FOOTER */}
        <footer>
          Zenova — every colour should feel like a deep breath.
          <button onClick={() => setAuth(true)}>Join us</button>
        </footer>

      </main>
    </>
  );
}


function Onboarding() {
  const nav = useNavigate();

  const [step, setStep] = useState(0);
  const [data, setData] = useState({});

  const opts = [
    ['Under 18', '18–25', '26–35', '36–45', '46–60', '60+'],
    ['Student', 'Working Professional', 'Self-employed', 'Homemaker', 'Retired', 'Other'],
  ];

  const finish = async () => {
    const json = await request('/user/onboarding', {
      method: 'PUT',
      body: JSON.stringify(data),
    });

    localStorage.setItem('user', JSON.stringify(json.user));
    nav('/dashboard');
  };

  return (
    <main className="onboard">
      <div className="dots">
        <i className="on" />
        <i className={step ? 'on' : ''} />
      </div>

      <h1>{step ? 'What is your occupation?' : 'What is your age group?'}</h1>

      <div className="pillgrid">
        {opts[step].map((option) => (
          <button
            className={Object.values(data).includes(option) ? 'selected' : ''}
            onClick={() => setData({ ...data, [step ? 'occupation' : 'ageGroup']: option })}
            key={option}
          >
            {Object.values(data).includes(option) && <Check size={16} />} {option}
          </button>
        ))}
      </div>

      <button
        className="primary"
        disabled={!data[step ? 'occupation' : 'ageGroup']}
        onClick={() => (step ? finish() : setStep(1))}
      >
        {step ? 'Finish →' : 'Next →'}
      </button>
    </main>
  );
}

const moodEm = {
  Good: '😊',
  Neutral: '😐',
  Stressed: '😰',
};

// --- ACTION-BASED REFACTOR ---

function Home() {
  const [activeModule, setActiveModule] = useState(null);
  const [user] = useState(safeUser());
  const hr = new Date().getHours();
  const greeting = hr < 12 ? 'Good morning' : hr < 17 ? 'Good afternoon' : 'Good evening';

  const cards = [
    { id: 'physical', title: 'Physical Activity', icon: <Dumbbell size={28} color="#6B9E78" />, color: 'var(--sage)' },
    { id: 'hydration', title: 'Hydration', icon: <Droplets size={28} color="#AACFE0" />, color: 'var(--sky)' },
    { id: 'sleep', title: 'Sleep', icon: <Moon size={28} color="#9B8FCA" />, color: 'var(--lav)' },
    { id: 'calm', title: 'Calm & Reset', icon: <Wind size={28} color="#6B9E78" />, color: 'var(--peach)' },
    { id: 'mind', title: 'Mind & Emotions', icon: <Brain size={28} color="#9B8FCA" />, color: 'var(--dew)' },
  ];

  if (activeModule === 'physical') {
    return <PhysicalModule back={() => setActiveModule(null)} user={user} />;
  }

  if (activeModule === 'hydration') {
    return <HydrationModule back={() => setActiveModule(null)} user={user} />;
  }

  if (activeModule === 'sleep') {
    return <SleepModule back={() => setActiveModule(null)} />;
  }

  if (activeModule === 'calm') {
    return <CalmModule back={() => setActiveModule(null)} />;
  }

  if (activeModule === 'mind') {
    return <MindModule back={() => setActiveModule(null)} onNavigate={(id) => setActiveModule(id)} />;
  }

  if (activeModule === 'profile') {
    return <ProfileModule back={() => setActiveModule(null)} />;
  }


  if (activeModule) {
    return <ModuleView moduleId={activeModule} back={() => setActiveModule(null)} />;
  }

  return (
    <>
      <AppNav onProfileClick={() => setActiveModule('profile')} />

      <main className="dash">
        <section className="greet card" style={{ padding: '2.5rem', marginBottom: '2rem' }}>
          <div>
            <h1>{greeting}, {(user.name || 'there').split(' ')[0]}.</h1>
            <p style={{ fontSize: '1.1rem', color: 'var(--muted)', marginTop: '0.5rem' }}>
              Today's Focus: Take one small action for your wellbeing.
            </p>
          </div>
        </section>

        <div className="grid" style={{ gridTemplateColumns: '1fr', maxWidth: '800px', margin: '0 auto' }}>
          {cards.map((c) => (
            <div 
              key={c.id} 
              className="card" 
              style={{ 
                cursor: 'pointer', 
                display: 'flex', 
                alignItems: 'center', 
                gap: '1.25rem', 
                borderLeft: `6px solid ${c.color}`,
                padding: '1.5rem',
                transition: 'transform 0.2s, box-shadow 0.2s'
              }}
              onClick={() => setActiveModule(c.id)}
              onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.06)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
            >
              <div style={{ padding: '1rem', background: `${c.color}22`, borderRadius: '14px', color: c.color, display: 'flex' }}>
                {c.icon}
              </div>
              <h3 style={{ margin: 0, fontSize: '1.2rem', color: 'var(--forest)' }}>{c.title}</h3>
            </div>
          ))}
        </div>
      </main>
    </>
  );
}

function ModuleView({ moduleId, back }) {
  // Placeholder for future feature specifications
  return (
    <>
      <AppNav />
      <main className="dash">
        <button className="ghost" onClick={back} style={{ marginBottom: '1rem' }}>← Back to Focus</button>
        <div className="card center" style={{ padding: '6rem 2rem', maxWidth: '800px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '2rem', marginBottom: '1rem' }}>{moduleId.toUpperCase()} Module</h2>
          <p style={{ color: 'var(--muted)', fontSize: '1.1rem' }}>
            Awaiting feature specification for this action-based module.
          </p>
        </div>
      </main>
    </>
  );
}

createRoot(document.getElementById('root')).render(<App />);