import React, { useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { LogOut, User, Check, Droplets, Activity } from 'lucide-react';
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
        <Route path="/dashboard" element={<Guard><Dashboard /></Guard>} />
        <Route path="/profile" element={<Guard><Profile /></Guard>} />
        <Route path="*" element={<Navigate to="/" />} />
        <Route path="/coach" element={<Coach />} />
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

function Avatar() {
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
          <a href="/profile"><User size={15}/> My Profile</a>

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

function AppNav() {
  return (
    <nav className="nav">
      <Logo />
      <div>
        <a href="/dashboard">Home</a>
        <a href="/profile">Profile</a>
        <a href="/coach">Coach</a>
      </div>
      <Avatar />
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
const coachModules = [
  {
    id: 'sleep',
    title: 'Sleep & Recovery',
    emoji: '🌙',
    color: 'sky',
    description: 'Understand sleep quality, recovery, and rest patterns.',
  },
  {
    id: 'energy',
    title: 'Energy / Stamina',
    emoji: '⚡',
    color: 'sage',
    description: 'Track body energy, fatigue, movement, and stamina.',
  },
  {
    id: 'hydration',
    title: 'Water Intake',
    emoji: '💧',
    color: 'sky',
    description: 'Track hydration and get gentle water goals.',
  },
  {
    id: 'journal',
    title: 'Journaling / Worry Release',
    emoji: '📓',
    color: 'lav',
    description: 'Release one worry and receive a calming reframe.',
  },
  {
    id: 'mindfulness',
    title: 'Meditation & Mindfulness',
    emoji: '🧘',
    color: 'lav',
    description: 'Choose a short calming practice based on your need.',
  },
  {
    id: 'emotional',
    title: 'Emotional Wellbeing',
    emoji: '💗',
    color: 'peach',
    description: 'Track mood, connection, gratitude, and emotional energy.',
  },
  {
    id: 'stress',
    title: 'Stress / Overload',
    emoji: '🌩️',
    color: 'peach',
    description: 'Understand overload and get clinician-lite suggestions.',
  },
];

const activeModuleIds = (weekly) => {
  const t = weekly?.today || {};
  const ids = [];

  if (t.physical?.sleepScore || t.physical?.sleepHours || t.physical?.sleepIssue) ids.push('sleep');
  if (t.physical?.bodyEnergy || t.physical?.movement || t.physical?.fatigueCause) ids.push('energy');
  if (t.physical?.hydration) ids.push('hydration');
  if (t.mental?.worryText || t.mental?.worryEmotion || t.mental?.worryIntensity) ids.push('journal');
  if (t.mental?.mindfulnessGoal) ids.push('mindfulness');
  if (t.emotional?.mood || t.checkin?.mood || t.emotional?.socialConnection || t.emotional?.gratitude || t.emotional?.energyEmotion) ids.push('emotional');
  if (t.mental?.stressLevel || t.mental?.cognitiveLoad || t.checkin?.mood === 'Stressed') ids.push('stress');

  return [...new Set(ids)];
};

const moduleScores = (weekly) => {
  const t = weekly?.today || {};
  const p = t.physical || {};
  const m = t.mental || {};
  const e = t.emotional || {};
  const c = t.checkin || {};

  const scoreMap = {};

  if (p.sleepScore || p.sleepHours || p.sleepIssue) {
    const sleepParts = [
        p.sleepScore ? p.sleepScore * 20 : null,
        p.sleepHours ? Math.min((p.sleepHours / 8) * 100, 100) : null,
        p.refreshed === 'Yes' ? 100 : p.refreshed === 'Somewhat' ? 60 : p.refreshed === 'No' ? 20 : null,
    ].filter((x) => x !== null);

    scoreMap.sleep = Math.round(sleepParts.length ? avg(sleepParts) : 0);
  }

  if (p.bodyEnergy || p.movement || p.fatigueCause) {
    scoreMap.energy = Math.round(avg([
      { Light: 85, Normal: 100, Heavy: 45, Drained: 15 }[p.bodyEnergy] || 0,
      { Yes: 100, 'A little': 55, No: 20 }[p.movement] || 0,
    ]));
  }

  if (p.hydration) {
    scoreMap.hydration = Math.round(Math.min((p.hydration / 8) * 100, 100));
  }

  if (m.worryText || m.worryEmotion || m.worryIntensity) {
    scoreMap.journal = Math.round(avg([
      m.worryText ? 70 : 0,
      m.worryIntensity ? Math.max(100 - (m.worryIntensity * 10), 10) : 50,
    ]));
  }

  if (m.mindfulnessGoal || m.mindfulnessIntensity || m.mindfulnessTime || m.mindfulnessState) {
  const intensityScore = m.mindfulnessIntensity
    ? Math.max(100 - m.mindfulnessIntensity * 8, 10)
    : null;

  const stateScore =
    {
      Calm: 90,
      Restless: 55,
      Overthinking: 45,
      Tense: 40,
      Exhausted: 35,
    }[m.mindfulnessState] ?? null;

  const timeScore =
    {
      '1 minute': 45,
      '3 minutes': 60,
      '5 minutes': 75,
      '10 minutes': 90,
    }[m.mindfulnessTime] ?? null;

  const parts = [intensityScore, stateScore, timeScore].filter((x) => x !== null);

  scoreMap.mindfulness = Math.round(parts.length ? avg(parts) : 65);
}

  if (e.mood || c.mood || e.socialConnection || e.gratitude || e.energyEmotion) {
    const moodScore = { Good: 100, Neutral: 60, Stressed: 20 }[e.mood || c.mood] ?? null;
const socialScore = { Yes: 100, Brief: 60, 'Not today': 20 }[e.socialConnection] ?? null;
const gratitudeScore = e.gratitude ? 70 : null;
const energyScore = { Excited: 100, Calm: 85, Flat: 45, Drained: 20 }[e.energyEmotion] ?? null;

const emotionalParts = [];

if (moodScore !== null) emotionalParts.push(moodScore * 0.45);
if (socialScore !== null) emotionalParts.push(socialScore * 0.20);
if (gratitudeScore !== null) emotionalParts.push(gratitudeScore * 0.10);
if (energyScore !== null) emotionalParts.push(energyScore * 0.25);

const emotionalWeight =
  (moodScore !== null ? 0.45 : 0) +
  (socialScore !== null ? 0.20 : 0) +
  (gratitudeScore !== null ? 0.10 : 0) +
  (energyScore !== null ? 0.25 : 0);

scoreMap.emotional = Math.round(
  emotionalWeight ? emotionalParts.reduce((a, b) => a + b, 0) / emotionalWeight : 0
);
  }

  if (m.stressLevel || m.cognitiveLoad || c.mood === 'Stressed') {
    scoreMap.stress = Math.round(avg([
      m.stressLevel ? Math.max(100 - (m.stressLevel * 10), 5) : 50,
      { Calm: 100, Manageable: 65, Overloaded: 20 }[m.cognitiveLoad] || 0,
      c.mood === 'Stressed' ? 20 : c.mood === 'Neutral' ? 60 : c.mood === 'Good' ? 100 : 50,
    ]));
  }

  return scoreMap;
};

const coachFeedback = (moduleId, weekly) => {
  const t = weekly?.today || {};
  const p = t.physical || {};
  const m = t.mental || {};
  const e = t.emotional || {};
  const c = t.checkin || {};
  const scores = moduleScores(weekly);
  const s = scores[moduleId] ?? 0;

  const level = s < 40 ? 'Needs support' : s < 65 ? 'Moderate' : 'Stable';

  const base = {
    sleep: {
      title: 'Sleep recovery check',
      reason: `Your sleep score is influenced by quality, hours, and how refreshed you felt.`,
      action: s < 40 ? 'Tonight, reduce screen exposure 30 minutes before bed and try 4-7-8 breathing.' : 'Keep your sleep routine consistent tonight.',
      why: 'Sleep affects emotional regulation, focus, and stress recovery.',
    },
    energy: {
      title: 'Energy pattern',
      reason: `Your energy is shaped by body heaviness, movement, and fatigue cause.`,
      action: s < 40 ? 'Try a 5–10 minute gentle walk and hydrate before using caffeine.' : 'Maintain light movement to preserve stamina.',
      why: 'Low movement and drained body signals commonly reduce mental focus.',
    },
    hydration: {
      title: 'Hydration status',
      reason: `You logged ${p.hydration || 0}/8 cups today.`,
      action: (p.hydration || 0) < 4 ? 'Drink 1 glass now and aim for 2 more within the next 2 hours.' : 'You are progressing well. Keep sipping steadily.',
      why: 'Hydration supports energy, headache prevention, and concentration.',
    },
    journal: {
      title: 'Worry release',
      reason: m.worryText ? `You named a worry linked to ${m.worryEmotion || 'mental load'}.` : 'Journaling works best when one specific worry is named.',
      action: 'Ask: “What is one small thing I can control in the next 10 minutes?”',
      why: 'Naming a worry reduces emotional intensity and makes it easier to act.',
    },
    mindfulness: {
        title: 'Mindfulness recommendation',
        reason: `You selected ${m.mindfulnessGoal || 'support'} with intensity ${
            m.mindfulnessIntensity || 5
        }/10 and current state: ${m.mindfulnessState || 'not specified'}.`,
        action:
            m.mindfulnessGoal === 'Sleep'
            ? 'Try a 3-minute body scan: relax your forehead, jaw, shoulders, chest, and legs slowly.'
            : m.mindfulnessGoal === 'Focus'
            ? 'Try box breathing: inhale 4s, hold 4s, exhale 4s, hold 4s for 3 rounds.'
            : m.mindfulnessGoal === 'Anxiety relief'
            ? 'Try 5-4-3-2-1 grounding: notice 5 things you see, 4 you feel, 3 you hear, 2 you smell, 1 you taste.'
            : m.mindfulnessGoal === 'Emotional reset'
            ? 'Place one hand on your chest, name the emotion, and say: “This is temporary. I can take one gentle step.”'
            : 'Try slow breathing: inhale for 4 seconds and exhale for 6 seconds for 2 minutes.',
        why: 'Different mindfulness goals need different techniques; intensity and current state help Zenova choose a calmer next step.',
    },
    emotional: {
      title: 'Emotional wellbeing',
      reason: `Your emotional state reflects mood, social connection, gratitude, and emotional energy.`,
      action: s < 40 ? 'Send one simple message to someone safe or write one thing that felt okay today.' : 'Protect what helped your mood today.',
      why: 'Connection and gratitude act as protective factors during stress.',
    },
    stress: {
      title: 'Stress / overload scan',
      reason: `Stress is influenced by mood, task load, and intensity.`,
      action: s < 40 ? 'Do not add more tasks. Pick one priority and pause everything else for 30 minutes.' : 'Use a short reset before continuing work.',
      why: 'When cognitive load is high, reducing decision load is more effective than forcing productivity.',
    },
  };

  const item = base[moduleId];

  return {
    level,
    score: s,
    ...item,
  };
};

const smartSummary = (weekly) => {
  const scores = moduleScores(weekly);
  const entries = Object.entries(scores).sort((a, b) => a[1] - b[1]);

  if (!entries.length) {
    return 'Start by choosing one area Zenova can support today.';
  }

  const lowest = entries.slice(0, 2).map(([id]) => coachModules.find((m) => m.id === id)?.title).filter(Boolean);

  if (entries[0][1] < 40) {
    return `Your current state needs support mainly around ${lowest.join(' and ')}. Start with one small action, not a full lifestyle change.`;
  }

  if (entries[0][1] < 65) {
    return `You are moderately balanced, but ${lowest[0]} may need attention today.`;
  }

  return 'Your tracked areas look stable today. Keep the routine gentle and consistent.';
};
function Weekly({ weekly }) {
  return (
    <div className="card">
      <h3>Weekly Reflection</h3>
      <p>{weekly?.summary || 'No check-ins this week. Start your wellness journey today!'}</p>

      <div className="chips">
        <span>😊 {weekly?.counts?.Good || 0} Good</span>
        <span>😐 {weekly?.counts?.Neutral || 0} Neutral</span>
        <span>😰 {weekly?.counts?.Stressed || 0} Stressed</span>
      </div>
    </div>
  );
}

function Dashboard() {
  const [view, setView] = useState('Overview');
  const [weekly, setWeekly] = useState(null);
  const [result, setResult] = useState(null);
  const [err, setErr] = useState('');
  const [focus, setFocus] = useState([]);

    const toggleFocus = (item) => {
    setFocus((prev) =>
        prev.includes(item)
        ? prev.filter((i) => i !== item)
        : [...prev, item]
    );
    };


  const user = safeUser ? safeUser() : JSON.parse(localStorage.getItem('user') || '{}');

  const load = () =>
    request('/insights/weekly')
      .then(setWeekly)
      .catch((e) => setErr(e.message));

  useEffect(load, []);

  const score = useMemo(() => calcScore(weekly), [weekly]);

  return (
    <>
      <AppNav />

      <main className="dash">
        <div className="card">
            <h3>What do you want to focus on today?</h3>

            {["Sleep", "Stress", "Energy", "Hydration", "Mood"].map((item) => (
                <button
                    key={item}
                    className={`chip ${focus.includes(item) ? "active" : ""}`}
                    onClick={() => toggleFocus(item)}
                >
                    {item}
                </button>
            ))}
        </div>
        {focus.length > 0 && (
  <div className="card">
    <h3>Your selected focus</h3>
    <p>
      Zenova will personalize today’s overview based on:{" "}
      <b>{focus.join(", ")}</b>
    </p>

    {focus.includes("Sleep") && (
      <p>🌙 Sleep support will look at recovery, sleep quality, and rest patterns.</p>
    )}

    {focus.includes("Stress") && (
      <p>🌩️ Stress support will check overload, mood pressure, and recovery needs.</p>
    )}

    {focus.includes("Energy") && (
      <p>⚡ Energy support will connect movement, fatigue, and body heaviness.</p>
    )}

    {focus.includes("Hydration") && (
      <p>💧 Hydration support will track water intake and low-energy signals.</p>
    )}

    {focus.includes("Mood") && (
      <p>💗 Mood support will track emotional state, connection, and gratitude.</p>
    )}
  </div>
)}
        {err && <div className="banner">{err}</div>}

        <div className="tabbar">
          {['Overview', 'Smart Coach', 'Physical', 'Mental', 'Emotional'].map((item) => (
            <button
              key={item}
              className={view === item ? 'active ' + item.replace(' ', '') : ''}
              onClick={() => setView(item)}
            >
              {item}
            </button>
          ))}
        </div>

        {view === 'Overview' && (
          <Overview
            user={user}
            weekly={weekly}
            result={result}
            setResult={setResult}
            load={load}
            score={score}
            goCoach={() => setView('Smart Coach')}
          />
        )}

        {view === 'Smart Coach' && (
          <SmartCoach weekly={weekly} load={load} setResult={setResult} goOverview={() => setView('Overview')} />
        )}

        {view === 'Physical' && (
  focus.length === 0 || focus.some((x) => ["Sleep", "Energy", "Hydration"].includes(x)) ? (
    <Physical weekly={weekly} load={load} />
  ) : (
    <div className="card">
      <h3>Physical tracking is hidden today</h3>
      <p>Select Sleep, Energy, or Hydration above to use this section.</p>
    </div>
  )
)}

{view === 'Mental' && (
  focus.length === 0 || focus.some((x) => ["Stress"].includes(x)) ? (
    <Mental weekly={weekly} load={load} />
  ) : (
    <div className="card">
      <h3>Mental tracking is hidden today</h3>
      <p>Select Stress above to use this section.</p>
    </div>
  )
)}

{view === 'Emotional' && (
  focus.length === 0 || focus.some((x) => ["Mood", "Stress"].includes(x)) ? (
    <Emotional weekly={weekly} load={load} setResult={setResult} />
  ) : (
    <div className="card">
      <h3>Emotional tracking is hidden today</h3>
      <p>Select Mood or Stress above to use this section.</p>
    </div>
  )
)}
      </main>
    </>
  );
}
function Overview({ user, weekly, result, setResult, load, score, goCoach }) {
  const hr = new Date().getHours();
  const greeting = hr < 12 ? 'Good morning' : hr < 17 ? 'Good afternoon' : 'Good evening';
  const selected = activeModuleIds(weekly);
  const scores = moduleScores(weekly);

  const check = async (mood) => {
    try {
      const j = await request('/checkin', {
        method: 'POST',
        body: JSON.stringify({ mood }),
      });

      setTimeout(() => setResult({ ...j, mood }), 300);
      load();
    } catch {
      alert('Could not save check-in. Please try again.');
    }
  };

  return (
    <div className="overview">
      <section className="greet card">
        <div>
          <h1>
            {greeting}, {(user.name || 'there').split(' ')[0]}.
          </h1>
          <p>What would you like Zenova to help you understand today?</p>
        </div>

        <button className="primary" onClick={goCoach}>
          Open Smart Coach
        </button>
      </section>

      <section className="card coachSummary">
        <h2>Today’s wellness picture</h2>
        <p>{smartSummary(weekly)}</p>

        <div className="chips">
          {selected.length ? (
            selected.map((id) => {
              const mod = coachModules.find((m) => m.id === id);
              return <span key={id}>{mod?.emoji} {mod?.title}</span>;
            })
          ) : (
            <span>No areas tracked yet</span>
          )}
        </div>
      </section>

      <Wellness score={score} moduleScores={scores} selectedModules={selected} />

      {!result ? <MoodBox check={check} /> : <Result result={result} again={() => setResult(null)} />}

      <Insights weekly={weekly} score={score} />

      <Weekly weekly={weekly} />
    </div>
  );
}
function MoodBox({ check }) {
  return (
    <div className="card micro">
      <h3>Daily check-in</h3>
      <p>Tap to log your mood — takes just a second</p>

      <div className="moods">
        {['Good', 'Neutral', 'Stressed'].map((mood) => (
          <button key={mood} onClick={() => check(mood)}>
            {moodEm[mood]} {mood}
          </button>
        ))}
      </div>
    </div>
  );
}

function Result({ result, again }) {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      {result.recoveryMode && (
        <div className="card recovery">
          <h2>🔄 Recovery mode activated</h2>
          <p>You have logged stressed 3 times in a row. One thing at a time.</p>
          <b>Take a 2-minute break — step away from everything.</b>
        </div>
      )}

      <div className={'card weather ' + result.mood}>
        <span>{result.weather.emoji}</span>
        <h2>{result.weather.label}</h2>
        <p>{result.weather.description}</p>
      </div>

      {!result.recoveryMode && (
        <div className="card recommend">
          <h3>Recommendation</h3>
          <p>{result.suggestion}</p>
        </div>
      )}

      <button onClick={again} className="ghost">
        ← Check in again
      </button>
    </motion.div>
  );
}

function Wellness({ score, moduleScores: scores = {}, selectedModules = [] }) {
  const selected = selectedModules.length ? selectedModules : Object.keys(scores);

  return (
    <div className="card wellness">
      <h3>Unified Wellness Score</h3>

      <div className="ring">
        <ResponsiveContainer>
          <RadialBarChart
            innerRadius="70%"
            outerRadius="95%"
            data={[{ name: 'score', value: score.total, fill: colors.sage }]}
            startAngle={90}
            endAngle={-270}
          >
            <RadialBar dataKey="value" cornerRadius={18} />
          </RadialBarChart>
        </ResponsiveContainer>

        <b>{score.total}</b>
      </div>

      <p>
        {selected.length
          ? `Calculated from ${selected.length} active area${selected.length > 1 ? 's' : ''} you chose to track.`
          : 'Choose one area in Smart Coach to build your wellness score.'}
      </p>

      {selected.length ? (
        selected.map((id) => {
          const mod = coachModules.find((m) => m.id === id);
          const value = scores[id] || 0;

          return (
            <div className="bar" key={id}>
              <span>{mod?.emoji} {mod?.title || id}</span>
              <i style={{ width: value + '%' }} />
              <small>{value}</small>
            </div>
          );
        })
      ) : (
        <div className="emptyHint">No active modules yet.</div>
      )}
    </div>
  );
}
function Insights({ weekly, score }) {
  const today = weekly?.today || {};
  const out = [];

  if (today.physical?.sleepScore <= 2 && (weekly?.counts?.Stressed || 0) >= 3) {
    out.push([
      'Sleep → Stress',
      'Low sleep is amplifying your stress. Recent stressed days followed nights of poor sleep.',
      'Physical → Emotional',
    ]);
  }

  if (today.physical?.movement === 'Yes' && today.mental?.focus >= 4) {
    out.push([
      'Movement → Focus',
      'Your movement today boosted your focus. Focus is stronger on days you move.',
      'Physical → Mental',
    ]);
  }

  if ((weekly?.emotional || []).filter((x) => x.socialConnection === 'Yes').length >= 3 && score.emotional > 55) {
    out.push([
      'Social Connection → Mood',
      'Social connection is protecting your mood. Emotional scores improve on connected days.',
      'Emotional',
    ]);
  }

  if (today.mental?.digitalFatigue === 'Draining' && today.physical?.bodyEnergy === 'Drained') {
    out.push([
      'Digital Fatigue → Energy',
      'Screen time is draining your physical energy. Both signals are low today.',
      'Mental → Physical',
    ]);
  }

  if (today.mental?.cognitiveLoad === 'Overloaded' && today.checkin?.mood === 'Stressed') {
    out.push([
      'Cognitive Load → Stress',
      'Task overwhelm and emotional stress are occurring together. Break your task list into smaller steps.',
      'Mental → Emotional',
    ]);
  }

  return (
    <section>
      <h2>Cross-domain insights</h2>

      {out.length ? (
        out.map((item) => (
          <div className="card insight" key={item[0]}>
            <b>{item[0]}</b>
            <p>{item[1]}</p>
            <span>{item[2]}</span>
          </div>
        ))
      ) : (
        <div className="card">
          Keep logging daily to unlock personalised connections between your physical, mental, and emotional health.
        </div>
      )}
    </section>
  );
}
function SmartCoach({ weekly, load, setResult, goOverview }) {
  const [active, setActive] = useState(null);

  return (
    <section className="coachPage">
      <div className="coachHero card">
        <div>
          <h1>Zenova Smart Coach</h1>
          <p>Choose what you want support with today. Zenova will track only that area and give personalized feedback.</p>
        </div>
        <button className="ghost" onClick={goOverview}>View overview</button>
      </div>

      {!active ? (
        <div className="coachGrid">
          {coachModules.map((m) => (
            <button className={'coachCard ' + m.color} key={m.id} onClick={() => setActive(m.id)}>
              <span>{m.emoji}</span>
              <h3>{m.title}</h3>
              <p>{m.description}</p>
            </button>
          ))}
        </div>
      ) : (
        <CoachModule
          id={active}
          weekly={weekly}
          load={load}
          setResult={setResult}
          back={() => setActive(null)}
        />
      )}
    </section>
  );
}

function CoachModule({ id, weekly, load, setResult, back }) {
  const today = weekly?.today || {};
  const [physical, setPhysical] = useState(today.physical || {});
  const [mental, setMental] = useState(today.mental || {});
  const [emotional, setEmotional] = useState(today.emotional || {});
  const [feedback, setFeedback] = useState(coachFeedback(id, weekly));

  useEffect(() => {
    setFeedback(coachFeedback(id, weekly));
  }, [weekly, id]);

  const savePhysical = async (data) => {
  const updated = { ...physical, ...data };
  setPhysical(updated);

  const tempWeekly = {
    ...weekly,
    today: {
      ...(weekly?.today || {}),
      physical: updated,
    },
  };

  setFeedback(coachFeedback(id, tempWeekly));

  await request('/physical', {
    method: 'POST',
    body: JSON.stringify(updated),
  });

  await load();
};

  const saveMental = async (data) => {
  const updated = { ...mental, ...data };
  setMental(updated);

  const tempWeekly = {
    ...weekly,
    today: {
      ...(weekly?.today || {}),
      mental: updated,
    },
  };

  setFeedback(coachFeedback(id, tempWeekly));

  await request('/mental', {
    method: 'POST',
    body: JSON.stringify(updated),
  });

  await load();
};

  const saveEmotional = async (data) => {
  const updated = { ...emotional, ...data };
  setEmotional(updated);

  const tempWeekly = {
    ...weekly,
    today: {
      ...(weekly?.today || {}),
      emotional: updated,
    },
  };

  setFeedback(coachFeedback(id, tempWeekly));

  await request('/emotional', {
    method: 'POST',
    body: JSON.stringify(updated),
  });

  await load();
};

  const saveMood = async (mood) => {
    const j = await request('/checkin', { method: 'POST', body: JSON.stringify({ mood }) });
    setResult({ ...j, mood });
    await load();
  };

  const mod = coachModules.find((m) => m.id === id);

  return (
    <div className="moduleFlow">
      <button className="ghost" onClick={back}>← Choose another area</button>

      <div className="card moduleHeader">
        <span>{mod?.emoji}</span>
        <div>
          <h1>{mod?.title}</h1>
          <p>{mod?.description}</p>
        </div>
      </div>

      {id === 'sleep' && (
        <div className="grid">
          <Choice title="How did you sleep last night?" opts={[1, 2, 3, 4, 5]} val={physical.sleepScore} save={(v) => savePhysical({ sleepScore: v })} />
          <div className="card">
            <h3>How many hours did you sleep?</h3>
            <input type="number" min="0" max="12" value={physical.sleepHours || ''} onChange={(e) => savePhysical({ sleepHours: Number(e.target.value) })} placeholder="Example: 6" />
          </div>
          <Choice title="Did you wake up refreshed?" opts={['Yes', 'Somewhat', 'No']} val={physical.refreshed} save={(v) => savePhysical({ refreshed: v })} />
          <Choice title="Main sleep issue" opts={['Late sleep', 'Waking up', 'Phone use', 'Stress', 'None']} val={physical.sleepIssue} save={(v) => savePhysical({ sleepIssue: v })} />
        </div>
      )}

      {id === 'energy' && (
        <div className="grid">
          <Choice title="How does your body feel right now?" opts={['Light', 'Normal', 'Heavy', 'Drained']} val={physical.bodyEnergy} save={(v) => savePhysical({ bodyEnergy: v })} />
          <Choice title="Did your body move today?" opts={['Yes', 'A little', 'No']} val={physical.movement} save={(v) => savePhysical({ movement: v })} />
          <Choice title="What is likely causing fatigue?" opts={['Sleep', 'Workload', 'Emotions', 'Screen time', 'Unknown']} val={physical.fatigueCause} save={(v) => savePhysical({ fatigueCause: v })} />
        </div>
      )}

      {id === 'hydration' && (
        <div className="grid">
          <Cups val={physical.hydration || 0} save={(v) => savePhysical({ hydration: v })} />
          <Choice title="Any dehydration signs?" opts={['Headache', 'Dry mouth', 'Low energy', 'None']} val={physical.hydrationSign} save={(v) => savePhysical({ hydrationSign: v })} />
        </div>
      )}

      {id === 'journal' && (
        <div className="grid">
          <div className="card">
            <h3>What is weighing on you?</h3>
            <input maxLength="150" placeholder="Name one worry..." value={mental.worryText || ''} onChange={(e) => saveMental({ worryText: e.target.value })} />
          </div>
          <Choice title="What emotion is attached to it?" opts={['Anxious', 'Sad', 'Angry', 'Overwhelmed', 'Unsure']} val={mental.worryEmotion} save={(v) => saveMental({ worryEmotion: v })} />
          <div className="card">
            <h3>Intensity from 1–10</h3>
            <input type="range" min="1" max="10" value={mental.worryIntensity || 5} onChange={(e) => saveMental({ worryIntensity: Number(e.target.value) })} />
            <b>{mental.worryIntensity || 5}</b>
          </div>
        </div>
      )}

      {id === 'mindfulness' && (
  <div className="grid">
    <Choice
      title="What do you need right now?"
      opts={['Calm down', 'Focus', 'Sleep', 'Anxiety relief', 'Emotional reset']}
      val={mental.mindfulnessGoal}
      save={(v) => saveMental({ mindfulnessGoal: v })}
    />

    <div className="card">
      <h3>How intense is this need?</h3>
      <input
        type="range"
        min="1"
        max="10"
        value={mental.mindfulnessIntensity || 5}
        onChange={(e) => saveMental({ mindfulnessIntensity: Number(e.target.value) })}
      />
      <b>{mental.mindfulnessIntensity || 5}/10</b>
    </div>

    <Choice
      title="How much time do you have?"
      opts={['1 minute', '3 minutes', '5 minutes', '10 minutes']}
      val={mental.mindfulnessTime}
      save={(v) => saveMental({ mindfulnessTime: v })}
    />

    <Choice
      title="What is your current state?"
      opts={['Calm', 'Restless', 'Overthinking', 'Tense', 'Exhausted']}
      val={mental.mindfulnessState}
      save={(v) => saveMental({ mindfulnessState: v })}
    />
  </div>
)}

      {id === 'emotional' && (
        <div className="grid">
        <Choice
        title="Mood Check-In"
        opts={['Good', 'Neutral', 'Stressed']}
        val={emotional.mood || today.checkin?.mood}
        save={(v) => {
            setEmotional({ ...emotional, mood: v });
            saveMood(v);
        }}
        />          
        <Choice title="Did you have a meaningful interaction today?" opts={['Yes', 'Brief', 'Not today']} val={emotional.socialConnection} save={(v) => saveEmotional({ socialConnection: v })} />
          <div className="card">
            <h3>Did something good happen today?</h3>
            <button
                className={emotional.gratitude ? 'primary' : 'ghost'}
                onClick={() => saveEmotional({ gratitude: !emotional.gratitude })}
            >
                {emotional.gratitude ? 'Marked ✓' : 'Mark today ✓'}
            </button>
          </div>
          <Choice title="What is your emotional energy right now?" opts={['Excited', 'Calm', 'Flat', 'Drained']} val={emotional.energyEmotion} save={(v) => saveEmotional({ energyEmotion: v })} />
        </div>
      )}

      {id === 'stress' && (
        <div className="grid">
          <div className="card">
            <h3>Stress level from 1–10</h3>
            <input type="range" min="1" max="10" value={mental.stressLevel || 5} onChange={(e) => saveMental({ stressLevel: Number(e.target.value) })} />
            <b>{mental.stressLevel || 5}</b>
          </div>
          <Choice title="How loaded is your mind with tasks?" opts={['Calm', 'Manageable', 'Overloaded']} val={mental.cognitiveLoad} save={(v) => saveMental({ cognitiveLoad: v })} />
          <Choice title="Main trigger" opts={['Deadlines', 'Studies', 'Family', 'Health', 'Money', 'Unknown']} val={mental.stressTrigger} save={(v) => saveMental({ stressTrigger: v })} />
          <Choice title="Body signal" opts={['Tense', 'Tired', 'Restless', 'Heavy', 'None']} val={mental.bodySignal} save={(v) => saveMental({ bodySignal: v })} />
        </div>
      )}

      <CoachFeedback feedback={feedback} />
    </div>
  );
}

function CoachFeedback({ feedback }) {
  return (
    <div className={'card coachFeedback ' + (feedback.score < 40 ? 'critical' : feedback.score < 65 ? 'moderate' : 'stable')}>
      <div className="feedbackTop">
        <div>
          <span className="miniLabel">Smart Coach Response</span>
          <h2>{feedback.title}</h2>
        </div>
        <b>{feedback.score}/100</b>
      </div>

      <div className="feedbackLevel">{feedback.level}</div>

      <h3>What Zenova noticed</h3>
      <p>{feedback.reason}</p>

      <h3>Suggested next step</h3>
      <p>{feedback.action}</p>

      <h3>Why this suggestion?</h3>
      <p>{feedback.why}</p>
    </div>
  );
}
function Physical({ weekly, load }) {
  const [data, setData] = useState(weekly?.today?.physical || {});

  useEffect(() => setData(weekly?.today?.physical || {}), [weekly]);

  const save = (newData) => {
    const updated = { ...data, ...newData };
    setData(updated);
    request('/physical', { method: 'POST', body: JSON.stringify(updated) }).then(load);
  };

  return (
    <Grid
      title="Physical Health"
      icon={<Activity />}
      insight="You logged good sleep across the week. On those days, stress check-ins were lower."
    >
      <Choice title="How did you sleep last night?" opts={[1, 2, 3, 4, 5]} val={data.sleepScore} save={(v) => save({ sleepScore: v })} />
      <Cups val={data.hydration || 0} save={(v) => save({ hydration: v })} />
      <Choice title="Did your body move today?" opts={['Yes', 'A little', 'No']} val={data.movement} save={(v) => save({ movement: v })} />
      <Choice title="How does your body feel right now?" opts={['Light', 'Normal', 'Heavy', 'Drained']} val={data.bodyEnergy} save={(v) => save({ bodyEnergy: v })} />
    </Grid>
  );
}

function Mental({ weekly, load }) {
  const [data, setData] = useState(weekly?.today?.mental || {});

  useEffect(() => setData(weekly?.today?.mental || {}), [weekly]);

  const save = (newData) => {
    const updated = { ...data, ...newData };
    setData(updated);
    request('/mental', { method: 'POST', body: JSON.stringify(updated) }).then(load);
  };

  return (
    <Grid title="Mental Health" insight="Your cognitive load patterns are tracked separately from emotional stress.">
      <div className="card">
        <h3>How sharp did your mind feel today?</h3>
        <input type="range" min="1" max="5" value={data.focus || 3} onChange={(e) => save({ focus: +e.target.value })} />
        <b>{data.focus || 3}</b>
      </div>

      <Choice title="How loaded is your mind with tasks?" opts={['Calm', 'Manageable', 'Overloaded']} val={data.cognitiveLoad} save={(v) => save({ cognitiveLoad: v })} />
      <Choice title="How did screen time feel today?" opts={['Fine', 'Heavy', 'Draining']} val={data.digitalFatigue} save={(v) => save({ digitalFatigue: v })} />

      <div className="card">
        <h3>Release it — naming a worry reduces its intensity.</h3>
        <input
          maxLength="150"
          placeholder="Name one thing weighing on you (optional)."
          value={data.worryText || ''}
          onChange={(e) => save({ worryText: e.target.value })}
        />
      </div>
    </Grid>
  );
}

function Emotional({ weekly, load, setResult }) {
  const [data, setData] = useState(weekly?.today?.emotional || {});

  useEffect(() => setData(weekly?.today?.emotional || {}), [weekly]);

  const save = (newData) => {
    const updated = { ...data, ...newData };
    setData(updated);
    request('/emotional', { method: 'POST', body: JSON.stringify(updated) }).then(load);
  };

  const check = async (mood) => {
    const json = await request('/checkin', {
      method: 'POST',
      body: JSON.stringify({ mood }),
    });

    setResult({ ...json, mood });
    load();
  };

  return (
    <Grid title="Emotional Health" insight="Days with social connection usually show stronger emotional scores.">
      <Choice title="Mood Check-In" opts={['Good', 'Neutral', 'Stressed']} val={data.mood} save={check} />
      <Choice title="Did you have a meaningful interaction today?" opts={['Yes', 'Brief', 'Not today']} val={data.socialConnection} save={(v) => save({ socialConnection: v })} />

      <div className="card">
        <h3>Did something good happen today?</h3>
        <button className={data.gratitude ? 'primary' : 'ghost'} onClick={() => save({ gratitude: true })}>
          {data.gratitude ? 'Marked ✓' : 'Mark today ✓'}
        </button>
      </div>

      <Choice title="What is your emotional energy right now?" opts={['Excited', 'Calm', 'Flat', 'Drained']} val={data.energyEmotion} save={(v) => save({ energyEmotion: v })} />
    </Grid>
  );
}

function Grid({ title, children, insight }) {
  return (
    <section>
      <h1>{title}</h1>
      <div className="grid">{children}</div>

      <div className="card insight">
        <b>Pattern insight</b>
        <p>{insight}</p>
      </div>
    </section>
  );
}

function Choice({ title, opts, val, save }) {
  return (
    <div className="card">
      <h3>{title}</h3>

      <div className="choices">
        {opts.map((option) => (
          <button key={option} className={val === option ? 'selected' : ''} onClick={() => save(option)}>
            {option}
          </button>
        ))}
      </div>
    </div>
  );
}

function Cups({ val, save }) {
  return (
    <div className="card">
      <h3>Hydration Tracker</h3>

      <div className="cups">
        {Array.from({ length: 8 }, (_, index) => (
          <button key={index} className={index < val ? 'filled' : ''} onClick={() => save(val === index + 1 ? index : index + 1)}>
            <Droplets size={18} />
          </button>
        ))}
      </div>

      <p>{val}/8 cups</p>
    </div>
  );
}

function Profile() {
  const [profile, setProfile] = useState(null);
  const [hist, setHist] = useState([]);
  const [weekly, setWeekly] = useState(null);
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function loadProfile() {
      try {
        const profileRes = await request('/user/profile');
        const historyRes = await request('/checkin/history');
        const weeklyRes = await request('/insights/weekly');

        if (!mounted) return;

        setProfile(profileRes.user);
        setHist(historyRes.history || []);
        setWeekly(weeklyRes);
      } catch (e) {
        if (mounted) setErr(e.message || 'Could not load profile.');
      } finally {
        if (mounted) setLoading(false);
      }
    }

    loadProfile();

    return () => {
      mounted = false;
    };
  }, []);

  if (loading) {
    return (
      <>
        <AppNav />
        <main className="dash">
          <div className="card">
            <p>Loading profile...</p>
          </div>
        </main>
      </>
    );
  }

  if (err) {
    return (
      <>
        <AppNav />
        <main className="dash">
          <div className="banner">{err}</div>
        </main>
      </>
    );
  }

  if (!profile) {
    return (
      <>
        <AppNav />
        <main className="dash">
          <div className="card">
            <p>No profile found. Please log in again.</p>
          </div>
        </main>
      </>
    );
  }

  const init = (profile.name || 'Zenova User')
    .split(' ')
    .map((x) => x[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <>
      <AppNav />

      <main className="dash profile">
        <div className="card center">
          <div className="bigavatar">{init}</div>
          <h1>{profile.name}</h1>
          <p>{profile.email}</p>
        </div>

        <div className="grid four">
          {[
            ['Age Group', profile.ageGroup],
            ['Occupation', profile.occupation],
            ['Member Since', profile.createdAt ? new Date(profile.createdAt).toDateString() : '—'],
            ['Total Check-Ins', profile.totalCheckins || 0],
          ].map((item) => (
            <div className="card" key={item[0]}>
              <b>{item[0]}</b>
              <p>{item[1] || '—'}</p>
            </div>
          ))}
        </div>

        <section className="card">
          <h2>Check-in history</h2>

          {hist.length ? (
            hist.map((item) => (
              <div className={'history ' + item.mood} key={item.id}>
                <span>{moodEm[item.mood]}</span>
                <b>{item.mood}</b>
                <small>
                  {item.createdAt
                    ? new Date(item.createdAt).toLocaleDateString(undefined, {
                        weekday: 'short',
                        month: 'short',
                        day: 'numeric',
                      })
                    : item.date}
                </small>
              </div>
            ))
          ) : (
            <p>No check-ins yet. Start from the dashboard!</p>
          )}
        </section>

        <Weekly weekly={weekly} />
      </main>
    </>
  );
}
function Coach() {
  const [input, setInput] = useState("");
  const [response, setResponse] = useState("");

  const generateAdvice = async () => {
  try {
    const data = await request('/insights/weekly'); // backend data

    const text = input.toLowerCase();
    let advice = "";

    // 🔹 combine USER DATA + INPUT

    if (data?.summary?.includes("low sleep") || text.includes("sleep")) {
      advice += "Your recent sleep pattern looks disturbed. ";
      advice += "Try fixed sleep timing + reduce screen use before bed.\n\n";
    }

    if (data?.summary?.includes("stress") || text.includes("stress")) {
      advice += "Your stress levels seem elevated. ";
      advice += "Break tasks into smaller steps and try 4-6 breathing.\n\n";
    }

    if (data?.summary?.includes("low activity")) {
      advice += "Low physical activity detected. ";
      advice += "Even a 10-minute walk can improve energy.\n\n";
    }

    if (!advice) {
      advice = "You're doing okay overall. Try maintaining consistency and small daily improvements.";
    }

    setResponse(advice);

  } catch (err) {
    setResponse("Unable to fetch insights. Try again.");
  }
};

  return (
    <>
      <AppNav />
      <main className="dash">
        <div className="card">
          <h2>Smart Coach</h2>
          <p>Tell me what you're struggling with</p>

          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="e.g. I'm stressed about deadlines and not sleeping well"
            style={{ width: "100%", padding: "12px", borderRadius: "10px" }}
          />

          <button className="btn primary" onClick={generateAdvice}>
            Get Guidance
          </button>

          {response && (
            <div className="banner" style={{ marginTop: "12px" }}>
              {response}
            </div>
          )}
        </div>
      </main>
    </>
  );
}

function calcScore(w) {
  const scores = moduleScores(w);
  const values = Object.values(scores).filter((v) => typeof v === 'number' && !Number.isNaN(v));

  if (!values.length) {
    return {
      physical: 0,
      mental: 0,
      emotional: 0,
      total: 0,
    };
  }

  const t = w?.today || {};
  const p = t.physical || {};
  const m = t.mental || {};
  const e = t.emotional || {};
  const c = t.checkin || {};

  const physicalParts = [scores.sleep, scores.energy, scores.hydration].filter(Boolean);
  const mentalParts = [scores.journal, scores.mindfulness, scores.stress].filter(Boolean);
  const emotionalParts = [scores.emotional].filter(Boolean);

  return {
    physical: Math.round(physicalParts.length ? avg(physicalParts) : 0),
    mental: Math.round(mentalParts.length ? avg(mentalParts) : 0),
    emotional: Math.round(emotionalParts.length ? avg(emotionalParts) : 0),
    total: Math.round(avg(values)),
  };
}
const avg = (arr) => arr.reduce((x, y) => x + y, 0) / arr.length;

createRoot(document.getElementById('root')).render(<App />);