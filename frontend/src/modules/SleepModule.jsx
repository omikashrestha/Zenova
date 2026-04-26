import React, { useState, useEffect, useMemo } from 'react';
import { apiRequest as request } from '../api';
import { Moon, AlarmClock, Clock, AlertCircle, ShieldCheck, BatteryLow, CalendarClock, Lamp, PhoneOff, Coffee, Sunrise, BedDouble, Sparkles, AudioWaveform, CloudRain, Music, Wind, ScanLine, Brain, Play, Pause, CalendarDays, LayoutList, Download, CheckCircle2, Timer, ChevronLeft, Volume2, Settings } from 'lucide-react';
import PageWrapper from '../PageWrapper';
const AUDIO_TRACKS = [
  { id: 'white_noise', title: 'White Noise', url: '/audio/white-noise.mp3', icon: <AudioWaveform size={32} color="#AACFE0" /> },
  { id: 'rain', title: 'Rain Sounds', url: '/audio/rain.mp3', icon: <CloudRain size={32} color="#AACFE0" /> },
  { id: 'ambient', title: 'Calm Ambient', url: '/audio/ambient.mp3', icon: <Music size={32} color="#9B8FCA" /> }
];

const MAINTENANCE_CARDS = [
  { id: 'm_timing', title: 'Consistent Timing', desc: 'Sleep within ±30 minutes daily.', icon: <CalendarClock size={20} color="#9B8FCA" /> },
  { id: 'm_env', title: 'Optimize Environment', desc: 'Reduce light and noise.', icon: <Lamp size={20} color="#9B8FCA" /> },
  { id: 'm_screen', title: 'Limit Screen Usage', desc: 'Avoid screens before bedtime.', icon: <PhoneOff size={20} color="#9B8FCA" /> },
  { id: 'm_caf', title: 'Avoid Late Caffeine', desc: 'Reduce intake in evening.', icon: <Coffee size={20} color="#9B8FCA" /> },
  { id: 'm_light', title: 'Morning Light', desc: 'Get sunlight after waking.', icon: <Sunrise size={20} color="#EF9F27" /> },
  { id: 'm_posture', title: 'Sleep Posture', desc: 'Improve pillow and position.', icon: <BedDouble size={20} color="#9B8FCA" /> },
  { id: 'm_wind', title: 'Wind-down Routine', desc: 'Light calming activity before sleep.', icon: <Sparkles size={20} color="#9B8FCA" /> },
];

const RECOVERY_CARDS = [
  { id: 'r_screen', title: 'Reduce Screen Time', desc: 'Stop screens 30 mins before bed.', icon: <PhoneOff size={20} color="#E8CBBA" /> },
  { id: 'r_wind', title: 'Wind-down Routine', desc: 'Calm activity before sleeping.', icon: <Sparkles size={20} color="#9B8FCA" /> },
  { id: 'r_wake', title: 'Consistent Wake Time', desc: 'Wake at the same time daily.', icon: <AlarmClock size={20} color="#9B8FCA" /> },
  { id: 'r_meal', title: 'Avoid Heavy Meals', desc: 'Reduce late-night eating.', icon: <Coffee size={20} color="#E8CBBA" /> },
  { id: 'r_dim', title: 'Dim Lights', desc: 'Lower brightness in evening.', icon: <Lamp size={20} color="#9B8FCA" /> },
  { id: 'r_breathe', title: 'Breathing Exercise', desc: '2–5 minute calming practice.', icon: <Wind size={20} color="#9B8FCA" /> },
  { id: 'r_nap', title: 'Short Nap', desc: 'Limit to 20–30 minutes.', icon: <Moon size={20} color="#9B8FCA" /> },
];

function calcDuration(sleepTime, wakeTime) {
  if (!sleepTime || !wakeTime) return 0;
  let [sH, sM] = sleepTime.split(':').map(Number);
  let [wH, wM] = wakeTime.split(':').map(Number);
  
  if (wH < sH) wH += 24; // next day
  const diff = (wH * 60 + wM) - (sH * 60 + sM);
  return diff / 60;
}

function formatTime(timeStr) {
  if (!timeStr) return '';
  let [h, m] = timeStr.split(':').map(Number);
  const ampm = h >= 12 ? 'PM' : 'AM';
  h = h % 12 || 12;
  return `${h}:${m.toString().padStart(2, '0')} ${ampm}`;
}

function calcIdealSleep(wakeTime) {
  if (!wakeTime) return '';
  let [wH, wM] = wakeTime.split(':').map(Number);
  // Subtract 8 hours for ideal sleep window
  wH -= 8;
  if (wH < 0) wH += 24;
  return `${wH.toString().padStart(2,'0')}:${wM.toString().padStart(2,'0')}`;
}

export default function SleepModule({ back }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    request('/insights/weekly').then(w => {
      const p = w?.today?.sleep || {};
      setData(p);
      setLoading(false);
    });
  }, []);

  const save = async (newData) => {
    const updated = { ...data, ...newData };
    setData(updated);
    await request('/coach/sleep', { method: 'POST', body: JSON.stringify(updated) });
  };

  if (loading) return (
    <PageWrapper>
      <div className="card center" style={{marginTop:'2rem'}}><p>Loading Sleep Data...</p></div>
    </PageWrapper>
  );

  return (
    <PageWrapper>
      {(!data.sleepTime || !data.wakeTime || !data.difficultyAsleep) ? (
        <SetupScreen data={data} save={save} />
      ) : (
        <SleepDashboard data={data} save={save} back={back} />
      )}
    </PageWrapper>
  );
}

function SetupScreen({ data, save }) {
  const [form, setForm] = useState({
    sleepTime: data.sleepTime || '',
    wakeTime: data.wakeTime || '',
    difficultyAsleep: data.difficultyAsleep || ''
  });

  const canProceed = form.sleepTime && form.wakeTime && form.difficultyAsleep;

  const submit = () => save(form);

  return (
    <div style={{ maxWidth: '600px', margin: '2rem auto' }}>
      <div className="card">
        <h2>Sleep Profiling</h2>
        <p style={{color:'var(--muted)', marginBottom:'2rem'}}>Tell us about your current sleep habits to personalize your routine.</p>

        <div style={{display:'flex', gap:'1rem', marginBottom:'1.5rem'}}>
          <div style={{flex:1}}>
            <label style={{display:'flex', alignItems:'center', gap:'0.5rem', marginBottom:'0.5rem', fontWeight:'bold', fontSize:'0.9rem'}}><Clock size={20} color="#9B8FCA" /> Usual Sleep Time</label>
            <input type="time" value={form.sleepTime} onChange={e => setForm({...form, sleepTime: e.target.value})} style={{width:'100%', padding:'0.75rem', borderRadius:'8px', border:'1px solid #ccc'}} />
          </div>
          <div style={{flex:1}}>
            <label style={{display:'flex', alignItems:'center', gap:'0.5rem', marginBottom:'0.5rem', fontWeight:'bold', fontSize:'0.9rem'}}><AlarmClock size={20} color="#9B8FCA" /> Usual Wake Time</label>
            <input type="time" value={form.wakeTime} onChange={e => setForm({...form, wakeTime: e.target.value})} style={{width:'100%', padding:'0.75rem', borderRadius:'8px', border:'1px solid #ccc'}} />
          </div>
        </div>

        <div style={{marginBottom:'2rem'}}>
          <label style={{display:'block', marginBottom:'0.5rem', fontWeight:'bold', fontSize:'0.9rem'}}>Difficulty Falling Asleep?</label>
          <div className="pillgrid">
            {['Yes', 'No'].map(opt => (
              <button key={opt} className={form.difficultyAsleep === opt ? 'selected' : ''} onClick={() => setForm({...form, difficultyAsleep: opt})} style={{display:'flex', alignItems:'center', gap:'0.5rem'}}>
                {opt === 'Yes' ? <AlertCircle size={20} color="#E8CBBA" /> : <CheckCircle2 size={20} color="#6B9E78" />} {opt}
              </button>
            ))}
          </div>
        </div>

        <button className="primary wide" onClick={submit} disabled={!canProceed}>Generate Sleep Profile</button>
      </div>
    </div>
  );
}

function SleepDashboard({ data, save, back }) {
  const [view, setView] = useState('dashboard'); // dashboard, routine, audio

  const duration = calcDuration(data.sleepTime, data.wakeTime);
  const isRecovery = duration < 7;
  const cards = isRecovery ? RECOVERY_CARDS : MAINTENANCE_CARDS;
  const completed = data.completedActions || [];

  const markComplete = (cardId) => {
    if (!completed.find(c => c.id === cardId)) {
      save({ completedActions: [...completed, { id: cardId, timestamp: new Date().toISOString() }] });
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (view === 'routine') {
    return <RoutineGenerator data={data} save={save} back={() => setView('dashboard')} onPrint={handlePrint} />;
  }

  if (view === 'audio') {
    return <AudioHub back={() => setView('dashboard')} />;
  }

  return (
    <div className="print-container" style={{ maxWidth: '800px', margin: '0 auto' }}>
      <button className="ghost no-print" onClick={back} style={{ marginBottom: '1rem' }}><ChevronLeft size={16}/> Back</button>
      
      {/* STATUS HERO */}
      <div className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: isRecovery ? 'linear-gradient(135deg, #1a2a6c, #b21f1f, #fdbb2d)' : 'linear-gradient(135deg, var(--lav), var(--sky))', color: 'white', borderRadius: '24px', padding: '2rem 3rem', marginBottom: '2rem' }}>
        <div>
          <h2 style={{margin:0, color:'white', fontSize:'2rem'}}>{duration.toFixed(1)} Hours</h2>
          <p style={{margin:0, opacity:0.9, fontSize:'1.1rem'}}>Average Sleep Duration</p>
          <div style={{ marginTop:'1rem', display:'inline-flex', alignItems:'center', gap:'0.4rem', padding:'0.25rem 1rem', background:'rgba(255,255,255,0.2)', borderRadius:'999px', fontWeight:'bold' }}>
            {isRecovery ? <BatteryLow size={20} color="white" /> : <ShieldCheck size={20} color="white" />}
            {isRecovery ? 'Recovery Mode' : 'Maintenance Mode'}
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <p style={{margin:0, opacity:0.8}}>Sleep: {formatTime(data.sleepTime)}</p>
          <p style={{margin:0, opacity:0.8}}>Wake: {formatTime(data.wakeTime)}</p>
          {isRecovery && (
            <div style={{ marginTop:'1rem', padding:'1rem', background:'rgba(0,0,0,0.3)', borderRadius:'12px' }}>
              <p style={{margin:0, fontSize:'0.85rem', opacity:0.9}}>Suggested Target Sleep</p>
              <b style={{fontSize:'1.2rem'}}>{formatTime(calcIdealSleep(data.wakeTime))}</b>
            </div>
          )}
        </div>
      </div>

      {/* QUICK ACTIONS */}
      <div className="grid no-print" style={{ gridTemplateColumns: '1fr 1fr', gap:'1rem', marginBottom:'2rem' }}>
        {data.difficultyAsleep === 'Yes' && (
          <button className="card" style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:'0.5rem', background:'var(--ivory)', border:'none', cursor:'pointer' }} onClick={() => setView('audio')}>
            <Volume2 color="var(--peach)"/> <b>Sleep Assistance Hub</b>
          </button>
        )}
        <button className="card" style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:'0.5rem', background:'var(--ivory)', border:'none', cursor:'pointer' }} onClick={() => setView('routine')}>
          <Settings color="var(--sage)"/> <b>Routine Generator</b>
        </button>
      </div>

      {/* ACTION CARDS */}
      <h3 style={{marginBottom:'1rem'}}>{isRecovery ? 'Recovery Actions' : 'Maintenance Actions'}</h3>
      <div className="grid" style={{ gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
        {cards.map(card => {
          const doneRecord = completed.find(c => c.id === card.id);
          return (
            <div key={card.id} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', opacity: doneRecord ? 0.6 : 1, transition: 'all 0.2s' }}>
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                <div style={{ padding: '0.75rem', background: 'var(--dew)', borderRadius: '12px', color: 'var(--forest)' }}>
                  {card.icon}
                </div>
                <div>
                  <h4 style={{ margin: '0 0 0.25rem', fontSize: '1.1rem' }}>{card.title}</h4>
                  <p style={{ margin: 0, color: 'var(--muted)', fontSize:'0.95rem' }}>{card.desc}</p>
                </div>
              </div>
              <div style={{ marginTop: 'auto' }}>
                {doneRecord ? (
                  <span style={{ color: 'var(--sage)', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <CheckCircle2 size={16}/> Completed
                  </span>
                ) : (
                  <button className="primary wide" onClick={() => markComplete(card.id)} style={{ padding: '0.5rem', borderRadius: '8px' }}>
                    Complete Action
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function RoutineGenerator({ data, save, back, onPrint }) {
  const [routine, setRoutine] = useState(data.routine || {
    '5–8 AM': '', '9–11 AM': '', '12–2 PM': '', '3–6 PM': '', '7–9 PM': '', '10–12 AM': '', '12–5 AM': ''
  });

  const acts = {
    '5–8 AM': ['Wake up', 'Exercise', 'Breakfast', 'Light Reading'],
    '9–11 AM': ['Work/Study', 'Deep Work', 'Meeting'],
    '12–2 PM': ['Lunch', 'Short Walk', 'Rest'],
    '3–6 PM': ['Work/Study', 'Coffee/Tea Break', 'Errands'],
    '7–9 PM': ['Dinner', 'Socializing', 'Family Time', 'Relaxing'],
    '10–12 AM': ['Wind-down', 'Reading', 'Light Stretching', 'Screen Time'],
    '12–5 AM': ['Sleep', 'Late Night Work', 'Screen Time']
  };

  const submit = () => {
    const optimized = { ...routine };
    if (optimized['12–5 AM'] === 'Late Night Work' || optimized['12–5 AM'] === 'Screen Time') {
      optimized['12–5 AM'] = 'Rest / Early Sleep (Gradual)';
    }
    if (optimized['10–12 AM'] === 'Screen Time') {
      optimized['10–12 AM'] = 'Wind-down / Reading (Optimized)';
    }
    save({ routine: optimized });
    setRoutine(optimized);
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <button className="ghost no-print" onClick={back} style={{ marginBottom: '1rem' }}><ChevronLeft size={16}/> Back</button>
      
      <div className="card no-print" style={{ marginBottom:'2rem' }}>
        <h2>Personalized Routine Generator</h2>
        <p style={{color:'var(--muted)', marginBottom:'1.5rem'}}>Select your typical activities for each time block. We only optimize sleep-disrupting habits.</p>
        
        <div className="grid" style={{ gridTemplateColumns: '1fr 1fr', gap:'1rem', marginBottom:'2rem' }}>
          {Object.keys(acts).map(block => (
            <div key={block}>
              <label style={{display:'block', marginBottom:'0.25rem', fontWeight:'bold'}}>{block}</label>
              <select value={routine[block]} onChange={e => setRoutine({...routine, [block]: e.target.value})} style={{width:'100%', padding:'0.75rem', borderRadius:'8px', border:'1px solid #ccc'}}>
                <option value="">Select activity...</option>
                {acts[block].map(a => <option key={a} value={a}>{a}</option>)}
              </select>
            </div>
          ))}
        </div>
        <button className="primary" onClick={submit}>Generate Optimized Timeline</button>
      </div>

      {/* TIMELINE OUTPUT */}
      <div className="card print-target">
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'2rem' }}>
          <h2 style={{margin:0}}>Your Sleep-Optimized Timeline</h2>
          <button className="ghost no-print" onClick={onPrint} style={{ display:'flex', alignItems:'center', gap:'0.5rem' }}><Download size={16}/> Export PDF</button>
        </div>

        <div style={{ position:'relative', borderLeft:'4px solid var(--dew)', marginLeft:'20px', paddingLeft:'30px', display:'flex', flexDirection:'column', gap:'2rem' }}>
          {Object.keys(acts).map((block, idx) => {
            const val = routine[block] || 'No activity set';
            const isAdjusted = val.includes('(Gradual)') || val.includes('(Optimized)');
            return (
              <div key={block} style={{ position:'relative' }}>
                <div style={{ position:'absolute', left:'-42px', top:'0', width:'20px', height:'20px', borderRadius:'50%', background: isAdjusted ? 'var(--peach)' : 'var(--sage)' }}></div>
                <h4 style={{ margin:'0 0 0.25rem', textTransform:'uppercase', color:'var(--muted)', fontSize:'0.85rem' }}>{block}</h4>
                <div style={{ display:'flex', alignItems:'center', gap:'0.75rem', padding:'1rem', background: isAdjusted ? '#FFF5F5' : 'var(--ivory)', borderRadius:'12px', border: isAdjusted ? '1px solid var(--peach)' : '1px solid #eee' }}>
                  <b style={{ fontSize:'1.1rem', color: isAdjusted ? 'var(--peach)' : 'var(--forest)' }}>{val}</b>
                  {isAdjusted && <span style={{ fontSize:'0.8rem', background:'var(--peach)', color:'white', padding:'0.15rem 0.5rem', borderRadius:'999px' }}>Optimized</span>}
                </div>
              </div>
            );
          })}
        </div>
      </div>
      
      <style>{`
        @media print {
          body * { visibility: hidden; }
          .print-target, .print-target * { visibility: visible; }
          .print-target { position: absolute; left: 0; top: 0; width: 100%; box-shadow: none; }
          .no-print { display: none !important; }
        }
      `}</style>
    </div>
  );
}

function AudioHub({ back }) {
  const [playing, setPlaying] = useState(null);
  const [timeLeft, setTimeLeft] = useState(0); 
  const audioRef = React.useRef(null);

  useEffect(() => {
    let interval;
    if (playing && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            setPlaying(null);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [playing, timeLeft]);

  const toggle = (id) => {
    if (playing === id) {
      setPlaying(null);
    } else {
      setPlaying(id);
      if (timeLeft === 0) setTimeLeft(20 * 60);
    }
  };

  const formatTimer = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <button className="ghost" onClick={back} style={{ marginBottom: '1rem' }}><ChevronLeft size={16}/> Back</button>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h2 style={{ margin: 0 }}>Sleep Assistance Hub</h2>
        {playing && (
          <div style={{ background: 'var(--dew)', padding: '0.5rem 1rem', borderRadius: '999px', fontSize: '0.9rem', fontWeight: 'bold', color: 'var(--forest)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Timer size={16} /> Stops in: {formatTimer(timeLeft)}
          </div>
        )}
      </div>
      
      <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1rem' }}>
        {AUDIO_TRACKS.map(track => {
          const isPlaying = playing === track.id;
          return (
            <div key={track.id} className="card" style={{ 
              textAlign:'center', 
              padding:'2rem 1rem', 
              border: isPlaying ? '2px solid var(--sage)' : '2px solid transparent',
              transition: 'border-color 0.3s'
            }}>
              <div style={{ marginBottom:'1rem' }}>{track.icon}</div>
              <h3 style={{ margin:'0 0 1rem' }}>{track.title}</h3>
              
              <div style={{ display:'flex', justifyContent:'center', gap:'0.5rem', marginBottom:'1.5rem' }}>
                {[10, 20, 30].map(mins => (
                  <button 
                    key={mins}
                    className={timeLeft === mins * 60 ? 'primary' : 'ghost'} 
                    onClick={() => setTimeLeft(mins * 60)} 
                    style={{ padding:'0.25rem 0.5rem', fontSize:'0.8rem' }}
                  >
                    {mins}m
                  </button>
                ))}
              </div>

              <button 
                className={isPlaying ? 'ghost' : 'primary'} 
                onClick={() => toggle(track.id)} 
                style={{ width:'64px', height:'64px', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto', boxShadow: isPlaying ? 'none' : '0 4px 12px rgba(0,0,0,0.1)' }}
              >
                {isPlaying ? <Pause size={24} color="var(--forest)" /> : <Play size={24} color="#ffffff" style={{ marginLeft: '4px' }} />}
              </button>
              
              {isPlaying && (
                <audio 
                  src={track.url} 
                  autoPlay 
                  loop 
                  ref={audioRef}
                  onPlay={() => { if (audioRef.current) audioRef.current.volume = track.id === 'ambient' ? 0.3 : 0.5; }}
                />
              )}
            </div>
          );
        })}
      </div>

      <h3 style={{ marginTop:'3rem', marginBottom:'1rem' }}>Quick Sleep Aids</h3>
      <div className="grid">
        <div className="card">
          <div style={{ display:'flex', alignItems:'center', gap:'1rem', marginBottom:'1rem' }}>
            <div style={{ padding:'1rem', background:'var(--ivory)', borderRadius:'12px' }}><Wind size={20} color="#9B8FCA" /></div>
            <h3 style={{margin:0}}>4-7-8 Breathing</h3>
          </div>
          <p style={{margin:0, color:'var(--muted)'}}>1. Breathe in for 4s.<br/>2. Hold for 7s.<br/>3. Exhale for 8s.</p>
        </div>
        <div className="card">
          <div style={{ display:'flex', alignItems:'center', gap:'1rem', marginBottom:'1rem' }}>
            <div style={{ padding:'1rem', background:'var(--ivory)', borderRadius:'12px' }}><ScanLine size={20} color="#9B8FCA" /></div>
            <h3 style={{margin:0}}>Body Relaxation Scan</h3>
          </div>
          <p style={{margin:0, color:'var(--muted)'}}>Focus on each body part and release tension progressively.</p>
        </div>
        <div className="card">
          <div style={{ display:'flex', alignItems:'center', gap:'1rem', marginBottom:'1rem' }}>
            <div style={{ padding:'1rem', background:'var(--ivory)', borderRadius:'12px' }}><Brain size={20} color="#9B8FCA" /></div>
            <h3 style={{margin:0}}>Mind Clearing</h3>
          </div>
          <p style={{margin:0, color:'var(--muted)'}}>Write down your thoughts to clear your mind before sleep.</p>
        </div>
      </div>
    </div>
  );
}
