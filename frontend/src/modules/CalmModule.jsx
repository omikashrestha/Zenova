import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { apiRequest as request } from '../api';
import { ChevronLeft, Wind, Eye, Hand, Flower2, Cherry, CheckCircle2, PlayCircle, RotateCcw, Leaf, Sparkles, Zap, HeartHandshake, Timer, Smile, Meh, Frown } from 'lucide-react';
import PageWrapper from '../PageWrapper';

const EarIcon = ({ size = 20, stroke = "#6B9E78" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 8.5a6 6 0 0 1 12 0c0 4-3 5.5-3 9a3 3 0 0 1-6 0"/>
    <path d="M10 13.5a2 2 0 1 0 4 0"/>
  </svg>
);

const CHIME_URL = 'https://cdn.pixabay.com/download/audio/2022/01/18/audio_27ed1e95e8.mp3'; // soft bell

export default function CalmModule({ back }) {
  const [step, setStep] = useState(0); // 0 = Entry, 1-5 = Steps, 6 = Completion

  const nextStep = () => setStep(s => s + 1);
  const restart = () => setStep(0);

  const renderStep = () => {
    switch(step) {
      case 0: return <EntryScreen onStart={nextStep} back={back} />;
      case 1: return <Step1Breath onNext={nextStep} />;
      case 2: return <Step2Grounding onNext={nextStep} />;
      case 3: return <Step3Tension onNext={nextStep} />;
      case 4: return <Step4Thought onNext={nextStep} />;
      case 5: return <Step5Comfort onNext={nextStep} />;
      case 6: return <CompletionScreen back={back} restart={restart} />;
      default: return <EntryScreen onStart={nextStep} back={back} />;
    }
  };

  return (
    <PageWrapper>
      <div style={{ maxWidth: '800px', margin: '0 auto', paddingBottom: '4rem', paddingTop: '2rem' }}>
        {step > 0 && step < 6 && (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
            <button className="ghost" onClick={back}><ChevronLeft size={16}/> Exit Practice</button>
            <div style={{ fontWeight: 'bold', color: 'var(--muted)', fontSize: '0.9rem', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
              Step {step} of 5
            </div>
          </div>
        )}
        
        <AnimatePresence mode="wait">
          <motion.div 
            key={step}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.4 }}
          >
            {renderStep()}
          </motion.div>
        </AnimatePresence>
      </div>
    </PageWrapper>
  );
}

// --- SHARED TIMER COMPONENT ---
function StepTimer({ duration, onComplete, onNext }) {
  const [timeLeft, setTimeLeft] = useState(duration);
  const [isStarted, setIsStarted] = useState(false);
  const audioRef = useRef(null);

  useEffect(() => {
    audioRef.current = new Audio(CHIME_URL);
    audioRef.current.volume = 0.4;
  }, []);

  useEffect(() => {
    if (!isStarted) return;
    if (timeLeft <= 0) {
      if (audioRef.current) audioRef.current.play().catch(()=>{});
      onComplete();
      return;
    }
    const timer = setInterval(() => setTimeLeft(t => t - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft, isStarted, onComplete]);

  if (!isStarted) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '3rem' }}>
        <button className="primary" onClick={() => setIsStarted(true)} style={{ padding: '1rem 3rem', borderRadius: '999px', fontSize: '1.1rem' }}>
          Begin Step
        </button>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '3rem' }}>
      <div style={{ width: '80px', height: '80px', borderRadius: '50%', border: '4px solid #A8C5A0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--forest)', marginBottom: '0.5rem' }}>
        0:{timeLeft.toString().padStart(2, '0')}
      </div>
      <Timer size={18} color="#7A9B82" style={{ marginBottom: '1rem' }} />
      <button className="ghost" onClick={() => {
        if (audioRef.current) audioRef.current.play().catch(()=>{});
        onNext();
      }} style={{ color: 'var(--muted)' }}>
        Skip to Next Step
      </button>
    </div>
  );
}

// --- SCREENS ---

function EntryScreen({ onStart, back }) {
  return (
    <div className="card center" style={{ padding: '4rem 2rem', background: 'linear-gradient(135deg, var(--ivory), #f3f6f4)' }}>
      <button className="ghost" onClick={back} style={{ position: 'absolute', top: '1rem', left: '1rem' }}><ChevronLeft size={16}/> Back</button>
      
      <div style={{ width: '100px', height: '100px', background: 'var(--dew)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 2rem' }}>
        <Sparkles size={28} color="#6B9E78" />
      </div>
      <h1 style={{ fontSize: '2.5rem', color: 'var(--forest)', marginBottom: '1rem' }}>Calm & Reset Practice</h1>
      <p style={{ fontSize: '1.2rem', color: 'var(--muted)', maxWidth: '500px', margin: '0 auto 3rem', lineHeight: 1.6 }}>
        A guided 5-minute mindfulness technique to reduce anxiety and restore focus. 
        Follow the simple prompts to regain your calm.
      </p>
      <button className="primary" onClick={onStart} style={{ fontSize: '1.2rem', padding: '1rem 3rem', borderRadius: '999px', display: 'flex', alignItems: 'center', gap: '0.5rem', margin: '0 auto' }}>
        <PlayCircle size={20} color="#ffffff" /> Start Practice
      </button>
    </div>
  );
}

function Step1Breath({ onNext }) {
  return (
    <div className="card center" style={{ padding: '3rem 2rem', minHeight: '60vh', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
      <Wind size={24} color="#9B8FCA" style={{ margin: '0 auto 1rem' }} />
      <h2 style={{ fontSize: '2rem', marginBottom: '1rem', color: 'var(--forest)' }}>Safety Breath</h2>
      <p style={{ color: 'var(--muted)', fontSize: '1.1rem', marginBottom: '3rem' }}>
        Inhale for 4s. Exhale for 8s. Repeat: "I am safe right now."
      </p>

      <div style={{ position: 'relative', width: '200px', height: '200px', margin: '0 auto' }}>
        <motion.div 
          animate={{ scale: [1, 1.5, 1] }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
          style={{ position: 'absolute', inset: 0, background: '#D6EBDA', borderRadius: '50%', opacity: 0.5, border: '2px solid #A8C5A0' }}
        />
        <div style={{ position: 'absolute', inset: '20px', background: '#D6EBDA', borderRadius: '50%', border: '2px solid #A8C5A0', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--forest)', fontWeight: 'bold', fontSize: '1.2rem', boxShadow: '0 10px 30px rgba(119, 153, 131, 0.3)' }}>
          Breathe
        </div>
      </div>

      <StepTimer duration={60} onComplete={onNext} onNext={onNext} />
    </div>
  );
}

function Step2Grounding({ onNext }) {
  return (
    <div className="card center" style={{ padding: '3rem 2rem', minHeight: '60vh', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
      <Eye size={24} color="#9B8FCA" style={{ margin: '0 auto 1rem' }} />
      <h2 style={{ fontSize: '2rem', marginBottom: '1rem', color: 'var(--forest)' }}>5-4-3-2-1 Grounding</h2>
      <p style={{ color: 'var(--muted)', fontSize: '1.1rem', marginBottom: '3rem' }}>
        Look around and quietly name things you notice.
      </p>

      <div className="grid" style={{ gridTemplateColumns: 'repeat(5, 1fr)', gap: '1rem', textAlign: 'center' }}>
        {[
          { num: 5, icon: <Eye size={20} color="#6B9E78" />, text: 'See' },
          { num: 4, icon: <Hand size={20} color="#6B9E78" />, text: 'Feel' },
          { num: 3, icon: <EarIcon size={20} stroke="#6B9E78" />, text: 'Hear' },
          { num: 2, icon: <Flower2 size={20} color="#6B9E78" />, text: 'Smell' },
          { num: 1, icon: <Cherry size={20} color="#6B9E78" />, text: 'Taste' }
        ].map(item => (
          <div key={item.text} style={{ padding: '1rem 0.5rem', background: 'var(--ivory)', borderRadius: '16px' }}>
            <b style={{ fontSize: '1.5rem', color: '#6B9E78', display: 'block', marginBottom: '0.5rem' }}>{item.num}</b>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '0.5rem' }}>{item.icon}</div>
            <small style={{ fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{item.text}</small>
          </div>
        ))}
      </div>

      <StepTimer duration={60} onComplete={onNext} onNext={onNext} />
    </div>
  );
}

function Step3Tension({ onNext }) {
  const [cueIdx, setCueIdx] = useState(0);
  const cues = [
    "Clench your fists tight... now release.",
    "Shrug shoulders to ears... now drop them.",
    "Tighten your jaw... now relax it.",
    "Press feet hard into the floor... now release."
  ];

  useEffect(() => {
    const int = setInterval(() => {
      setCueIdx(i => (i + 1) % cues.length);
    }, 10000); // switch cue every 10s
    return () => clearInterval(int);
  }, []);

  return (
    <div className="card center" style={{ padding: '3rem 2rem', minHeight: '60vh', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
      <Zap size={24} color="#9B8FCA" style={{ margin: '0 auto 1rem' }} />
      <h2 style={{ fontSize: '2rem', marginBottom: '1rem', color: 'var(--forest)' }}>Tension Release</h2>
      <p style={{ color: 'var(--muted)', fontSize: '1.1rem', marginBottom: '4rem' }}>
        Follow the prompt, hold for 5 seconds, then let go completely.
      </p>

      <AnimatePresence mode="wait">
        <motion.div 
          key={cueIdx}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 1.1 }}
          transition={{ duration: 0.5 }}
          style={{ fontSize: '1.8rem', color: '#6B9E78', fontWeight: 'bold', minHeight: '80px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem' }}
        >
          <Zap size={18} color="#E8CBBA" /> {cues[cueIdx]}
        </motion.div>
      </AnimatePresence>

      <StepTimer duration={60} onComplete={onNext} onNext={onNext} />
    </div>
  );
}

function Step4Thought({ onNext }) {
  return (
    <div className="card center" style={{ padding: '3rem 2rem', minHeight: '60vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', overflow: 'hidden' }}>
      <Leaf size={24} color="#9B8FCA" style={{ margin: '0 auto 1rem' }} />
      <h2 style={{ fontSize: '2rem', marginBottom: '1rem', color: 'var(--forest)' }}>Thought Softening</h2>
      <p style={{ color: 'var(--muted)', fontSize: '1.1rem', marginBottom: '3rem' }}>
        Notice an anxious thought. Say: "This is a thought, not a fact." <br/>
        Place it on the leaf, and watch it float away.
      </p>

      <div style={{ position: 'relative', height: '150px', width: '100%', maxWidth: '400px', margin: '0 auto', background: 'var(--ivory)', borderRadius: '16px', overflow: 'hidden' }}>
        <motion.div
          animate={{ x: [0, 400], y: [-20, 0, -20], opacity: [0.8, 1, 0.3] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          style={{ position: 'absolute', top: '50px', left: '-50px' }}
        >
          <Leaf size={32} color="#A8C5A0" />
        </motion.div>
      </div>

      <StepTimer duration={60} onComplete={onNext} onNext={onNext} />
    </div>
  );
}

function Step5Comfort({ onNext }) {
  return (
    <div className="card center" style={{ padding: '3rem 2rem', minHeight: '60vh', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
      <HeartHandshake size={24} color="#9B8FCA" style={{ margin: '0 auto 1rem' }} />
      <h2 style={{ fontSize: '2rem', marginBottom: '1rem', color: 'var(--forest)' }}>Comfort & Reassurance</h2>
      <p style={{ color: 'var(--muted)', fontSize: '1.1rem', marginBottom: '3rem' }}>
        Place one hand on your chest, and one on your belly.<br/>
        Breathe slowly and deeply.
      </p>

      <div style={{ width: '150px', height: '150px', background: '#D6EBDA', borderRadius: '50%', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid #A8C5A0' }}>
        <motion.div 
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 4, repeat: Infinity }}
          style={{ width: '100px', height: '100px', background: 'white', borderRadius: '50%' }}
        />
      </div>

      <StepTimer duration={60} onComplete={onNext} onNext={onNext} />
    </div>
  );
}

function CompletionScreen({ back, restart }) {
  const [reflection, setReflection] = useState(null);
  const [saving, setSaving] = useState(false);

  const reflectionOptions = [
    { label: 'Better', icon: <Smile size={24} color="#6B9E78" /> },
    { label: 'Same', icon: <Meh size={24} color="#7A9B82" /> },
    { label: 'Still stressed', icon: <Frown size={24} color="#E8CBBA" /> }
  ];

  const complete = async () => {
    setSaving(true);
    try {
      const sessionData = {
        date: new Date().toISOString(),
        reflection: reflection || 'Skipped'
      };
      
      await request('/coach/calm', { 
        method: 'POST', 
        body: JSON.stringify({
          sessions: [sessionData]
        }) 
      });
      back();
    } catch(e) {
      back();
    }
  };

  return (
    <div className="card center" style={{ padding: '4rem 2rem' }}>
      <CheckCircle2 size={32} color="#6B9E78" style={{ margin: '0 auto 2rem' }} />
      <h2 style={{ fontSize: '2rem', marginBottom: '1rem', color: 'var(--forest)' }}>Practice Complete</h2>
      
      <div style={{ background: 'var(--ivory)', padding: '2rem', borderRadius: '16px', maxWidth: '400px', margin: '0 auto 3rem' }}>
        <h3 style={{ marginBottom: '1.5rem' }}>How do you feel now?</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {reflectionOptions.map(opt => (
            <button 
              key={opt.label} 
              className={reflection === opt.label ? 'primary' : 'ghost'} 
              style={{ border: reflection === opt.label ? 'none' : '1px solid #ddd', padding: '1rem', borderRadius: '12px', fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '0.75rem', justifyContent: 'center' }}
              onClick={() => setReflection(opt.label)}
            >
              {opt.icon} {opt.label}
            </button>
          ))}
        </div>
      </div>

      <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
        <button className="ghost" onClick={restart} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '1rem 2rem' }}>
          <RotateCcw size={18} color="#7A9B82" /> Restart
        </button>
        <button className="primary" onClick={complete} disabled={saving} style={{ padding: '1rem 3rem', borderRadius: '999px', fontSize: '1.1rem' }}>
          {saving ? 'Saving...' : 'Done'}
        </button>
      </div>
    </div>
  );
}
