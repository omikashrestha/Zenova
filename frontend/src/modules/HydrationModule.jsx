import React, { useState, useEffect } from 'react';
import { apiRequest as request } from '../api';
import { Droplets, GlassWater, PlusCircle, Sun, CloudSun, Thermometer, Sunrise, Sunset, Coffee, Citrus, Link, Trophy, BarChart2, CheckCircle2, Timer, ChevronLeft, Armchair, PersonStanding, Zap } from 'lucide-react';

const TIPS = [
  { id: 'morning_water', title: 'Start Your Day Right', text: 'Drink water right after waking up to kickstart metabolism.', icon: <Coffee size={20} color="#6B9E78" /> },
  { id: 'bottle_sight', title: 'Keep Bottle Nearby', text: 'Having water in your line of sight makes hydration effortless.', icon: <GlassWater size={20} color="#AACFE0" /> },
  { id: 'flavor', title: 'Add Flavor', text: 'Bored of plain water? Add a slice of lemon, cucumber, or mint.', icon: <Citrus size={20} color="#6B9E78" /> },
  { id: 'habit_pair', title: 'Pair with Habits', text: 'Drink a glass of water every time you have a meal or coffee.', icon: <Link size={20} color="#7A9B82" /> }
];

function calculateGoal(activityLevel, weather) {
  if (weather === 'Very Hot' || activityLevel === 'Active') return 10;
  if (weather === 'Hot' || activityLevel === 'Moderate') return 8;
  return 6; // Low / Normal
}

function getNudgeIcon() {
  const hr = new Date().getHours();
  if (hr < 12) return <Sunrise size={20} color="#EF9F27" />;
  if (hr < 17) return <Sun size={20} color="#EF9F27" />;
  return <Sunset size={20} color="#9B8FCA" />;
}

function getSmartNudge(count, goal, lastDrinkTime) {
  const hr = new Date().getHours();
  
  if (count === 0) {
    if (hr < 10) return "Start your day right! Try your first glass of water.";
    if (hr < 15) return "You haven't had any water today! Let's get started.";
    return "It's late, but it's never too late for your first glass.";
  }

  if (count >= goal) {
    return "Amazing! You reached your hydration goal for today.";
  }

  if (lastDrinkTime) {
    const hoursSinceLast = (new Date() - new Date(lastDrinkTime)) / (1000 * 60 * 60);
    if (hoursSinceLast > 3) {
      return "You haven't had water in a while. Grab a glass now!";
    }
  }

  if (hr < 12) return "Great start to the morning! Keep sipping.";
  if (hr >= 12 && hr < 17) return "Hydrate to stay focused through the afternoon.";
  if (hr >= 17) return "One more glass to wind down the evening.";

  return "You're doing well today. Keep it up!";
}

function getMicroChallenge(hr, count, goal) {
  if (count >= goal) return null;
  if (hr < 12 && count < 3) return "Drink 3 glasses before lunch.";
  if (hr >= 12 && hr < 17) return "Finish 1 bottle (or 2 glasses) in the next 2 hours.";
  if (hr >= 17 && count < goal - 2) return "Drink 2 more glasses before dinner.";
  return "Have one more glass right now!";
}

export default function HydrationModule({ back, user }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    request('/insights/weekly').then(w => {
      const p = w?.today?.physical || {};
      setData(p);
      setLoading(false);
    });
  }, []);

  const save = async (newData) => {
    const updated = { ...data, ...newData };
    setData(updated);
    await request('/physical', { method: 'POST', body: JSON.stringify(updated) });
  };

  if (loading) return <div className="card center" style={{marginTop:'2rem'}}><p>Loading Hydration...</p></div>;

  if (!data.activityLevel || !data.weatherCondition) {
    return <SetupScreen data={data} save={save} />;
  }

  return <HydrationDashboard data={data} save={save} back={back} />;
}

function SetupScreen({ data, save }) {
  const [form, setForm] = useState({
    activityLevel: data.activityLevel || '',
    weatherCondition: data.weatherCondition || ''
  });

  const activityIcons = { Low: <Armchair size={20} color="#7A9B82" />, Moderate: <PersonStanding size={20} color="#7A9B82" />, Active: <Zap size={20} color="#AACFE0" /> };
  const weatherIcons = { Normal: <CloudSun size={20} color="#7A9B82" />, Hot: <Sun size={20} color="#EF9F27" />, 'Very Hot': <Thermometer size={20} color="#E8CBBA" /> };

  const submit = () => {
    save(form);
  };

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto' }}>
      <div className="card">
        <h2>Set up Smart Hydration</h2>
        <p style={{color:'var(--muted)', marginBottom:'2rem'}}>We just need two details to personalize your hydration goal.</p>

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
          <label style={{display:'block', marginBottom:'0.5rem', fontWeight:'bold', fontSize:'0.9rem'}}>Today's Weather Condition</label>
          <div className="pillgrid">
            {['Normal', 'Hot', 'Very Hot'].map(opt => (
              <button key={opt} className={form.weatherCondition === opt ? 'selected' : ''} onClick={() => setForm({...form, weatherCondition: opt})} style={{display:'flex', alignItems:'center', gap:'0.5rem'}}>
                {weatherIcons[opt]} {opt}
              </button>
            ))}
          </div>
        </div>

        <button className="primary wide" onClick={submit} disabled={!form.activityLevel || !form.weatherCondition}>
          Start Hydrating
        </button>
      </div>
    </div>
  );
}

function HydrationDashboard({ data, save, back }) {
  const count = data.hydrationCount || 0;
  const goal = calculateGoal(data.activityLevel, data.weatherCondition);
  const completedTips = data.completedHydrationTips || [];

  const drinkWater = () => {
    save({
      hydrationCount: count + 1,
      lastDrinkTime: new Date().toISOString()
    });
  };

  const completeTip = (tipId) => {
    if (!completedTips.includes(tipId)) {
      save({ completedHydrationTips: [...completedTips, tipId] });
    }
  };

  const hr = new Date().getHours();
  const nudge = getSmartNudge(count, goal, data.lastDrinkTime);
  const challenge = getMicroChallenge(hr, count, goal);

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <button className="ghost" onClick={back} style={{ marginBottom: '1rem' }}><ChevronLeft size={16}/> Back to Focus</button>
      
      {/* HEADER CARD */}
      <div className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', padding: '3rem 2rem', background: 'linear-gradient(135deg, var(--sky) 0%, #82B9D3 100%)', color: 'white', borderRadius: '24px', marginBottom: '2rem' }}>
        <Droplets size={48} color="white" style={{ marginBottom: '1rem', opacity: 0.9 }} />
        
        <h2 style={{ fontSize: '2.5rem', margin: 0, color: 'white' }}>{count} <span style={{fontSize:'1.5rem', opacity:0.8}}>/ {goal} glasses</span></h2>
        
        {/* Visual Glasses */}
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', justifyContent: 'center', margin: '2rem 0' }}>
          {Array.from({ length: goal }).map((_, i) => (
            <div key={i} style={{ 
              width: '32px', height: '48px', borderRadius: '4px 4px 12px 12px',
              border: '2px solid rgba(255,255,255,0.4)',
              background: i < count ? 'white' : 'transparent',
              transition: 'background 0.3s ease',
              position: 'relative', overflow: 'hidden'
            }}>
              {i < count && <div style={{ position:'absolute', bottom:0, width:'100%', height:'100%', background:'white' }}></div>}
            </div>
          ))}
          {/* Overachiever glasses */}
          {Array.from({ length: Math.max(0, count - goal) }).map((_, i) => (
            <div key={`extra-${i}`} style={{ 
              width: '32px', height: '48px', borderRadius: '4px 4px 12px 12px',
              border: '2px solid rgba(255,255,255,0.8)', background: 'white'
            }}></div>
          ))}
        </div>

        <button onClick={drinkWater} style={{ 
          background: 'white', color: 'var(--sky)', fontSize: '1.2rem', fontWeight: 'bold', 
          padding: '1rem 3rem', borderRadius: '999px', border: 'none', cursor: 'pointer',
          boxShadow: '0 8px 24px rgba(0,0,0,0.1)', display: 'flex', alignItems: 'center', gap: '0.5rem'
        }}>
          <PlusCircle size={20} color="#AACFE0" /> Drink Water
        </button>
      </div>

      <div className="grid" style={{ gridTemplateColumns: '1fr', gap: '1.5rem', marginBottom: '2rem' }}>
        
        {/* SMART FEEDBACK NUDGE */}
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem', background: 'var(--ivory)', borderLeft: '6px solid var(--sage)' }}>
          {getNudgeIcon()}
          <div>
            <h4 style={{ margin: 0, color: 'var(--muted)', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Smart Nudge</h4>
            <p style={{ margin: 0, fontSize: '1.1rem', color: 'var(--forest)' }}>{nudge}</p>
          </div>
        </div>

        {/* MICRO CHALLENGE */}
        {challenge && (
          <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem', background: 'var(--ivory)', borderLeft: '6px solid var(--peach)' }}>
            <Trophy size={24} color="#EF9F27" />
            <div>
              <h4 style={{ margin: 0, color: 'var(--muted)', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Current Micro-Challenge</h4>
              <p style={{ margin: 0, fontSize: '1.1rem', color: 'var(--forest)' }}>{challenge}</p>
            </div>
          </div>
        )}

      </div>

      {/* TIPS GRID */}
      <h3 style={{ marginBottom: '1rem', color: 'var(--forest)' }}>Habit Building Tips</h3>
      <div className="grid" style={{ gap: '1rem' }}>
        {TIPS.map(tip => {
          const isDone = completedTips.includes(tip.id);
          return (
            <div key={tip.id} className="card" style={{ opacity: isDone ? 0.6 : 1, transition: 'all 0.2s' }}>
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                <div style={{ padding: '0.75rem', background: 'var(--dew)', borderRadius: '12px' }}>
                  {tip.icon}
                </div>
                <div style={{ flex: 1 }}>
                  <h4 style={{ margin: '0 0 0.5rem', fontSize: '1.1rem' }}>{tip.title}</h4>
                  <p style={{ margin: '0 0 1rem', color: 'var(--muted)' }}>{tip.text}</p>
                  
                  {isDone ? (
                    <span style={{ color: '#6B9E78', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      <CheckCircle2 size={16} color="#6B9E78" /> Applied
                    </span>
                  ) : (
                    <button className="ghost" onClick={() => completeTip(tip.id)} style={{ padding: '0.5rem 1rem', background: 'var(--ivory)', color: 'var(--forest)', fontWeight: 'bold', borderRadius: '8px' }}>
                      Mark as Applied
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
}
