import React, { useState, useEffect, useMemo } from 'react';
import { apiRequest as request } from '../api';
import { Dumbbell, Footprints, PersonStanding, Armchair, Zap, Timer, AlarmClock, Scale, Ruler, ChevronsDown, Leaf, Move, MoveUp, CheckCircle2, PlayCircle, ChevronLeft, ArrowRight, Check } from 'lucide-react';

// --- DATA LOGIC ---

const routines = {
  underweight: [
    { name: 'Squats', reps: '10–12 reps × 3 sets', time: null, type: 'strength' },
    { name: 'Knee Push-ups', reps: '8–10 reps × 3 sets', time: null, type: 'strength' },
    { name: 'Lunges', reps: '8 each leg × 3 sets', time: null, type: 'strength' },
    { name: 'Light Dumbbell/Water Bottle Curls', reps: '12 reps × 3 sets', time: null, type: 'strength' },
    { name: 'Basic Yoga & Stretching', reps: 'Hold each stretch', time: 180, type: 'flexibility' },
  ],
  normal: [
    { name: 'Jumping Jacks', reps: '3 sets', time: 30, type: 'cardio', highImpact: true },
    { name: 'Squats', reps: '12–15 reps × 3 sets', time: null, type: 'strength' },
    { name: 'Push-ups', reps: '10–12 reps × 3 sets', time: null, type: 'strength' },
    { name: 'Plank', reps: '3 sets', time: 45, type: 'core' },
    { name: 'Mountain Climbers', reps: '3 sets', time: 30, type: 'cardio', highImpact: true },
  ],
  overweight: [
    { name: 'Walking in Place', reps: 'Continuous', time: 300, type: 'cardio' },
    { name: 'Step Touch / Side Steps', reps: '3 sets', time: 60, type: 'cardio' },
    { name: 'Chair Squats', reps: '8–10 reps × 3 sets', time: null, type: 'strength' },
    { name: 'Wall Push-ups', reps: '10–12 reps × 3 sets', time: null, type: 'strength' },
    { name: 'Light Stretching', reps: 'Hold each stretch', time: 180, type: 'flexibility' },
  ]
};

const activities = {
  everyday: [
    { name: 'Take stairs instead of lifts', type: 'everyday' },
    { name: 'Walk while on phone calls', type: 'everyday' },
    { name: 'Stand instead of sitting continuously', type: 'everyday' },
    { name: 'Pace during short breaks', type: 'everyday' },
    { name: 'Park farther and walk', type: 'everyday' }
  ],
  desk: [
    { name: 'Neck rolls and shoulder shrugs', type: 'desk', time: 60 },
    { name: 'Stretch arms overhead', type: 'desk', time: 30 },
    { name: 'Torso twists', type: 'desk', reps: '10 each side' },
    { name: 'Ankle rotations under desk', type: 'desk', time: 60 },
    { name: 'Stand up and stretch', type: 'desk', time: 60 }
  ],
  life: [
    { name: 'Cleaning your room', type: 'life' },
    { name: 'Cooking and chopping', type: 'life' },
    { name: 'Doing laundry', type: 'life' },
    { name: 'Organizing personal space', type: 'life' }
  ]
};

function getExerciseIcon(name) {
  const n = name.toLowerCase();
  if (n.includes('squat') || n.includes('lunge')) return <PersonStanding size={22} color="#6B9E78" />;
  if (n.includes('push-up') || n.includes('push up')) return <ChevronsDown size={22} color="#6B9E78" />;
  if (n.includes('plank') || n.includes('yoga') || n.includes('stretch')) return <Leaf size={22} color="#6B9E78" />;
  if (n.includes('jack') || n.includes('climber') || n.includes('tuck') || n.includes('step jack')) return <Zap size={22} color="#6B9E78" />;
  if (n.includes('walk')) return <Footprints size={22} color="#6B9E78" />;
  if (n.includes('dumbbell') || n.includes('curl') || n.includes('bottle')) return <Dumbbell size={22} color="#6B9E78" />;
  return <Move size={22} color="#6B9E78" />;
}

function getActivityIcon(name) {
  const n = name.toLowerCase();
  if (n.includes('stair')) return <MoveUp size={22} color="#6B9E78" />;
  if (n.includes('walk') || n.includes('pace') || n.includes('park')) return <Footprints size={22} color="#6B9E78" />;
  if (n.includes('stand')) return <PersonStanding size={22} color="#6B9E78" />;
  if (n.includes('stretch') || n.includes('roll') || n.includes('twist') || n.includes('rotation') || n.includes('arm')) return <Move size={22} color="#6B9E78" />;
  if (n.includes('clean') || n.includes('cook') || n.includes('laundry') || n.includes('organiz')) return <Zap size={22} color="#6B9E78" />;
  return <Move size={22} color="#6B9E78" />;
}

function getBMICategory(heightCm, weightKg) {
  if (!heightCm || !weightKg) return 'normal';
  const bmi = weightKg / ((heightCm / 100) ** 2);
  if (bmi < 18.5) return 'underweight';
  if (bmi >= 25) return 'overweight';
  return 'normal';
}

function adaptExercises(exercises, ageGroup, activityLevel) {
  let adapted = [...exercises];

  // Age adaptation
  const older = ['46–60', '60+'].includes(ageGroup);
  if (older) {
    adapted = adapted.map(ex => {
      if (ex.name === 'Jumping Jacks') return { ...ex, name: 'Step Jacks (Low Impact)' };
      if (ex.name === 'Mountain Climbers') return { ...ex, name: 'Slow Knee Tucks (Standing)' };
      return ex;
    });
  }

  // Activity level adaptation
  if (activityLevel === 'Active') {
    adapted = adapted.map(ex => {
      if (ex.time) return { ...ex, time: ex.time + 15 };
      if (ex.reps?.includes('× 3')) return { ...ex, reps: ex.reps.replace('× 3', '× 4') };
      return ex;
    });
  } else if (activityLevel === 'Low') {
    adapted = adapted.map(ex => {
      if (ex.time && ex.time > 30) return { ...ex, time: ex.time - 15 };
      if (ex.reps?.includes('× 3')) return { ...ex, reps: ex.reps.replace('× 3', '× 2') };
      return ex;
    });
  }

  return adapted;
}

// --- COMPONENTS ---

export default function PhysicalModule({ back, user }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [screen, setScreen] = useState('dashboard');
  const [activeAction, setActiveAction] = useState(null);

  useEffect(() => {
    request('/insights/weekly').then(w => {
      const p = w?.today?.physical || {};
      setData(p);
      setLoading(false);
      
      if (!p.height || !p.weight || !p.activityLevel || !p.timeAvailable) {
        setScreen('setup');
      }
    });
  }, []);

  const save = async (newData) => {
    const updated = { ...data, ...newData };
    setData(updated);
    await request('/physical', { method: 'POST', body: JSON.stringify(updated) });
  };

  const markComplete = async (actionName) => {
    const comps = data.completedActions || [];
    if (!comps.includes(actionName)) {
      await save({ completedActions: [...comps, actionName] });
    }
    setScreen('dashboard');
    setActiveAction(null);
  };

  if (loading) return <div className="card center" style={{marginTop:'2rem'}}><p>Loading module...</p></div>;

  if (screen === 'setup') {
    return <SetupScreen data={data} save={save} onComplete={() => setScreen('dashboard')} />;
  }

  if (screen === 'execute') {
    return <ExecutionView action={activeAction} onComplete={() => markComplete(activeAction.name)} back={() => setScreen('dashboard')} />;
  }

  return <DashboardView data={data} user={user} onStart={(a) => { setActiveAction(a); setScreen('execute'); }} back={back} save={save} />;
}

function SetupScreen({ data, save, onComplete }) {
  const [form, setForm] = useState({
    height: data.height || '',
    weight: data.weight || '',
    activityLevel: data.activityLevel || '',
    timeAvailable: data.timeAvailable || ''
  });

  const canProceed = form.height && form.weight && form.activityLevel && form.timeAvailable;

  const submit = () => {
    save({
      height: Number(form.height),
      weight: Number(form.weight),
      activityLevel: form.activityLevel,
      timeAvailable: form.timeAvailable
    });
    onComplete();
  };

  const activityIcons = { Low: <Armchair size={20} color="#7A9B82" />, Moderate: <PersonStanding size={20} color="#7A9B82" />, Active: <Zap size={20} color="#6B9E78" /> };
  const timeIcons = { '5–10 minutes': <Timer size={20} color="#7A9B82" />, '10–20 minutes': <Timer size={20} color="#6B9E78" />, '20+ minutes': <AlarmClock size={20} color="#6B9E78" /> };

  return (
    <>
      <div className="card" style={{ maxWidth: '600px', margin: '2rem auto' }}>
        <h2>Personalize Your Physical Module</h2>
        <p style={{color:'var(--muted)', marginBottom:'2rem'}}>We need a few details to generate your adaptive routines.</p>

        <div style={{display:'flex', gap:'1rem', marginBottom:'1.5rem'}}>
          <div style={{flex:1}}>
            <label style={{display:'flex', alignItems:'center', gap:'0.5rem', marginBottom:'0.5rem', fontWeight:'bold', fontSize:'0.9rem'}}><Ruler size={20} color="#7A9B82" /> Height (cm)</label>
            <input type="number" placeholder="e.g. 175" value={form.height} onChange={e => setForm({...form, height: e.target.value})} style={{width:'100%', padding:'0.75rem', borderRadius:'8px', border:'1px solid #ccc'}} />
          </div>
          <div style={{flex:1}}>
            <label style={{display:'flex', alignItems:'center', gap:'0.5rem', marginBottom:'0.5rem', fontWeight:'bold', fontSize:'0.9rem'}}><Scale size={20} color="#7A9B82" /> Weight (kg)</label>
            <input type="number" placeholder="e.g. 70" value={form.weight} onChange={e => setForm({...form, weight: e.target.value})} style={{width:'100%', padding:'0.75rem', borderRadius:'8px', border:'1px solid #ccc'}} />
          </div>
        </div>

        <div style={{marginBottom:'1.5rem'}}>
          <label style={{display:'block', marginBottom:'0.5rem', fontWeight:'bold', fontSize:'0.9rem'}}>Current Activity Level</label>
          <div className="pillgrid">
            {['Low', 'Moderate', 'Active'].map(opt => (
              <button key={opt} className={form.activityLevel === opt ? 'selected' : ''} onClick={() => setForm({...form, activityLevel: opt})} style={{display:'flex', alignItems:'center', gap:'0.5rem'}}>
                {activityIcons[opt]} {opt}
              </button>
            ))}
          </div>
        </div>

        <div style={{marginBottom:'2rem'}}>
          <label style={{display:'block', marginBottom:'0.5rem', fontWeight:'bold', fontSize:'0.9rem'}}>Daily Time Available</label>
          <div className="pillgrid">
            {['5–10 minutes', '10–20 minutes', '20+ minutes'].map(opt => (
              <button key={opt} className={form.timeAvailable === opt ? 'selected' : ''} onClick={() => setForm({...form, timeAvailable: opt})} style={{display:'flex', alignItems:'center', gap:'0.5rem'}}>
                {timeIcons[opt]} {opt}
              </button>
            ))}
          </div>
        </div>

        <button className="primary wide" onClick={submit} disabled={!canProceed}>
          Save & Continue
        </button>
      </div>
    </>
  );
}

function DashboardView({ data, user, onStart, back, save }) {
  const isShortTime = data.timeAvailable === '5–10 minutes';
  const [activeMode, setActiveMode] = useState(data.modeOverride || (isShortTime ? 'activities' : 'exercise'));

  const bmiCat = getBMICategory(data.height, data.weight);
  const baseRoutine = routines[bmiCat];
  const routine = useMemo(() => adaptExercises(baseRoutine, user?.ageGroup || '18-25', data.activityLevel), [baseRoutine, user, data.activityLevel]);

  const comps = data.completedActions || [];

  const toggleMode = (mode) => {
    setActiveMode(mode);
    save({ modeOverride: mode });
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <button className="ghost" onClick={back} style={{ marginBottom: '1rem' }}><ChevronLeft size={16}/> Back to Focus</button>
      
      <div className="card" style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{margin:0}}>Physical Wellness</h2>
          <p style={{margin:0, color:'var(--muted)', fontSize:'0.95rem'}}>Based on your profile, you are in <b>{activeMode === 'exercise' ? 'Exercise Mode' : 'Activities Mode'}</b>.</p>
        </div>
        <div style={{ display: 'flex', background: 'var(--ivory)', borderRadius: '999px', padding: '4px' }}>
          <button className={activeMode === 'exercise' ? 'primary' : 'ghost'} onClick={() => toggleMode('exercise')} style={{padding:'0.5rem 1rem', borderRadius:'999px', display:'flex', alignItems:'center', gap:'0.4rem'}}><Dumbbell size={16} color={activeMode === 'exercise' ? '#ffffff' : '#6B9E78'} /> Exercise</button>
          <button className={activeMode === 'activities' ? 'primary' : 'ghost'} onClick={() => toggleMode('activities')} style={{padding:'0.5rem 1rem', borderRadius:'999px', display:'flex', alignItems:'center', gap:'0.4rem'}}><Footprints size={16} color={activeMode === 'activities' ? '#ffffff' : '#6B9E78'} /> Activities</button>
        </div>
      </div>

      {activeMode === 'exercise' ? (
        <section>
          <h3 style={{marginBottom:'1rem', display:'flex', alignItems:'center', gap:'0.5rem'}}><Dumbbell size={24} color="#6B9E78" /> Your Personalized Routine</h3>
          <div className="grid" style={{ gridTemplateColumns: '1fr' }}>
            {routine.map(ex => {
              const isDone = comps.includes(ex.name);
              return (
                <div key={ex.name} className="card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem 1.5rem', opacity: isDone ? 0.6 : 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ width:'40px', height:'40px', borderRadius:'50%', background:'var(--dew)', display:'flex', alignItems:'center', justifyContent:'center'}}>
                      {isDone ? <CheckCircle2 size={20} color="#6B9E78" /> : getExerciseIcon(ex.name)}
                    </div>
                    <div>
                      <b style={{display:'block', fontSize:'1.1rem'}}>{ex.name}</b>
                      <small style={{color:'var(--muted)'}}>{ex.time ? `${ex.time} seconds` : ex.reps}</small>
                    </div>
                  </div>
                  {!isDone && (
                    <button className="primary" onClick={() => onStart(ex)} style={{padding:'0.5rem 1.5rem', borderRadius:'999px', display:'flex', alignItems:'center', gap:'0.4rem'}}>
                      <PlayCircle size={20} color="#ffffff" /> Start
                    </button>
                  )}
                  {isDone && <span style={{color:'#6B9E78', fontWeight:'bold', display:'flex', alignItems:'center', gap:'0.25rem'}}><CheckCircle2 size={18} color="#6B9E78" /> Done</span>}
                </div>
              );
            })}
          </div>
        </section>
      ) : (
        <section>
          <h3 style={{marginBottom:'1rem', display:'flex', alignItems:'center', gap:'0.5rem'}}><Footprints size={24} color="#6B9E78" /> Low-Effort Movement</h3>
          
          <div className="grid" style={{ gridTemplateColumns: '1fr', gap:'2rem' }}>
            <div>
              <h4 style={{marginBottom:'0.75rem', color:'var(--muted)', textTransform:'uppercase', fontSize:'0.8rem', letterSpacing:'0.05em'}}>Everyday Movement</h4>
              {activities.everyday.map(ac => (
                <ActivityCard key={ac.name} action={ac} isDone={comps.includes(ac.name)} onStart={() => onStart(ac)} />
              ))}
            </div>
            <div>
              <h4 style={{marginBottom:'0.75rem', color:'var(--muted)', textTransform:'uppercase', fontSize:'0.8rem', letterSpacing:'0.05em'}}>Quick Desk / Study Breaks</h4>
              {activities.desk.map(ac => (
                <ActivityCard key={ac.name} action={ac} isDone={comps.includes(ac.name)} onStart={() => onStart(ac)} />
              ))}
            </div>
            <div>
              <h4 style={{marginBottom:'0.75rem', color:'var(--muted)', textTransform:'uppercase', fontSize:'0.8rem', letterSpacing:'0.05em'}}>Daily Life Activities</h4>
              {activities.life.map(ac => (
                <ActivityCard key={ac.name} action={ac} isDone={comps.includes(ac.name)} onStart={() => onStart(ac)} />
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}

function ActivityCard({ action, isDone, onStart }) {
  return (
    <div className="card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem', marginBottom: '0.5rem', opacity: isDone ? 0.6 : 1 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        {isDone ? <CheckCircle2 size={20} color="#6B9E78" /> : getActivityIcon(action.name)}
        <span style={{ fontWeight: isDone ? 'normal' : '500' }}>{action.name}</span>
      </div>
      {!isDone && (
        <button onClick={onStart} style={{ background:'transparent', border:'none', color:'#6B9E78', fontWeight:'bold', cursor:'pointer', display:'flex', alignItems:'center', gap:'0.25rem' }}>
          Do it <ArrowRight size={16} color="#6B9E78" />
        </button>
      )}
    </div>
  );
}

function ExecutionView({ action, onComplete, back }) {
  const [timeLeft, setTimeLeft] = useState(action.time || 0);
  const [running, setRunning] = useState(false);

  useEffect(() => {
    let timer;
    if (running && timeLeft > 0) {
      timer = setInterval(() => setTimeLeft(t => t - 1), 1000);
    } else if (timeLeft === 0 && running) {
      setRunning(false);
    }
    return () => clearInterval(timer);
  }, [running, timeLeft]);

  const toggleTimer = () => {
    if (timeLeft === 0) setTimeLeft(action.time);
    setRunning(!running);
  };

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto' }}>
      <button className="ghost" onClick={back} style={{ marginBottom: '1rem' }}><ChevronLeft size={16}/> Back</button>
      
      <div className="card center" style={{ padding: '4rem 2rem' }}>
        <div style={{ width:'80px', height:'80px', borderRadius:'50%', background:'var(--dew)', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 2rem'}}>
          <Dumbbell size={40} color="#6B9E78" />
        </div>
        
        <h2 style={{ fontSize:'2rem', marginBottom:'0.5rem' }}>{action.name}</h2>
        <p style={{ color:'var(--muted)', fontSize:'1.1rem', marginBottom:'2rem' }}>
          {action.reps || 'Complete this activity now.'}
        </p>

        {action.time && (
          <div style={{ marginBottom:'2rem' }}>
            <div style={{ fontSize:'4rem', fontWeight:'bold', fontFamily:'monospace', lineHeight:1, display:'flex', alignItems:'center', justifyContent:'center', gap:'0.5rem' }}>
              <Timer size={20} color="#2D4A35" />
              {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
            </div>
            <button className="ghost" onClick={toggleTimer} style={{ marginTop:'1rem' }}>
              {running ? 'Pause Timer' : timeLeft === 0 ? 'Reset Timer' : 'Start Timer'}
            </button>
          </div>
        )}

        <button className="primary wide" onClick={onComplete} style={{ fontSize:'1.2rem', padding:'1rem', borderRadius:'16px', display:'flex', alignItems:'center', justifyContent:'center', gap:'0.5rem' }}>
          <CheckCircle2 size={20} color="#ffffff" /> Mark as Completed
        </button>
      </div>
    </div>
  );
}
