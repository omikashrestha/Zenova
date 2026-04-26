import React, { useState, useEffect } from 'react';
import { 
  User, Mail, Calendar, Briefcase, Activity, 
  Smile, BookOpen, Wind, Dumbbell, Droplets, 
  ChevronRight, Save, LogOut, Clock, Target, 
  Zap, Moon, Settings
} from 'lucide-react';
import { apiRequest as request } from "../api";

export default function ProfileModule({ back }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editingPrefs, setEditingPrefs] = useState(false);
  const [prefs, setPrefs] = useState({
    activityLevel: '',
    sleepGoal: '',
    waterGoal: ''
  });

  const loadProfile = async () => {
    try {
      const res = await request('/user/profile-summary');
      setData(res);
      setPrefs(res.user.preferences || {
        activityLevel: 'Moderate',
        sleepGoal: '8',
        waterGoal: '8'
      });
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  const savePrefs = async () => {
    try {
      await request('/user/preferences', {
        method: 'PUT',
        body: JSON.stringify(prefs)
      });
      setEditingPrefs(false);
      loadProfile();
    } catch (e) {
      alert("Failed to save preferences");
    }
  };

  if (loading) return <div className="card center" style={{ padding: '4rem' }}>Loading Profile...</div>;
  if (!data) return <div className="card center">Error loading profile.</div>;

  const { user, counts, activities, insight, journalPreview, consistencyMsg } = data;

  const activityIcons = {
    'Check-in': <Smile size={18} color="var(--lav)" />,
    'Journal': <BookOpen size={18} color="var(--sage)" />,
    'Calm': <Wind size={18} color="var(--peach)" />,
    'Physical': <Dumbbell size={18} color="var(--sage)" />,
  };

  return (
    <div className="dash" style={{ maxWidth: '900px', margin: '0 auto', padding: '2rem 1rem' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
        <button className="ghost" onClick={back}>← Back to Focus</button>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button className="ghost" onClick={() => {
            localStorage.clear();
            sessionStorage.clear();
            window.location.replace('/');
          }}>
            <LogOut size={18} /> Log out
          </button>
        </div>
      </header>

      {/* 1. BASIC INFO */}
      <section className="card" style={{ padding: '2rem', marginBottom: '2rem', display: 'flex', flexWrap: 'wrap', gap: '2rem', alignItems: 'center' }}>
        <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'var(--sage)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', fontWeight: 'bold' }}>
          {user.name?.[0].toUpperCase()}
        </div>
        <div style={{ flex: 1 }}>
          <h1 style={{ margin: '0 0 0.5rem', fontSize: '1.8rem', color: 'var(--forest)' }}>{user.name}</h1>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.5rem', color: 'var(--muted)' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Mail size={16} /> {user.email}</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Calendar size={16} /> {user.ageGroup}</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Briefcase size={16} /> {user.occupation}</span>
          </div>
        </div>
      </section>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
        
        {/* LEFT COLUMN */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          
          {/* 2. ACTIVITY SNAPSHOT */}
          <section>
            <h3 style={{ marginBottom: '1rem', color: 'var(--forest)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Activity size={20} color="var(--sage)" /> Activity Snapshot
            </h3>
            <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: '1rem' }}>
              <StatCard icon={<Smile size={20} />} count={counts.checkins} label="Check-ins" color="var(--lav)" />
              <StatCard icon={<BookOpen size={20} />} count={counts.journals} label="Journals" color="var(--sage)" />
              <StatCard icon={<Wind size={20} />} count={counts.calm} label="Calm Sessions" color="var(--peach)" />
              <StatCard icon={<Dumbbell size={20} />} count={counts.physical} label="Workouts" color="var(--sage)" />
              <StatCard icon={<Droplets size={20} />} count={counts.water} label="Water Logs" color="var(--sky)" />
            </div>
          </section>

          {/* 6. CONSISTENCY SUMMARY */}
          <section className="card" style={{ padding: '1.5rem', background: 'var(--dew)', border: 'none' }}>
            <h4 style={{ margin: '0 0 0.5rem', color: 'var(--forest)' }}>Consistency Summary</h4>
            <p style={{ margin: 0, color: 'var(--forest)', opacity: 0.8 }}>{consistencyMsg}</p>
          </section>

          {/* 4. EMOTIONAL INSIGHT */}
          <section className="card" style={{ padding: '1.5rem', borderLeft: '6px solid var(--lav)' }}>
            <h4 style={{ margin: '0 0 0.5rem', color: 'var(--forest)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Zap size={18} color="var(--lav)" /> Emotional Insight
            </h4>
            <p style={{ margin: 0, color: 'var(--muted)', fontStyle: 'italic' }}>"{insight}"</p>
          </section>

          {/* 7. PREFERENCES */}
          <section className="card" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h4 style={{ margin: 0, color: 'var(--forest)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Settings size={18} color="var(--muted)" /> Wellness Preferences
              </h4>
              {!editingPrefs ? (
                <button className="ghost" onClick={() => setEditingPrefs(true)} style={{ padding: '0.25rem 0.5rem' }}>Edit</button>
              ) : (
                <button className="ghost" onClick={savePrefs} style={{ color: 'var(--sage)', fontWeight: 'bold' }}>
                  <Save size={16} /> Save
                </button>
              )}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <PrefItem 
                label="Activity Level" 
                value={prefs.activityLevel} 
                editing={editingPrefs} 
                icon={<Target size={16} />}
                onChange={v => setPrefs({...prefs, activityLevel: v})}
                options={['Sedentary', 'Light', 'Moderate', 'Active', 'Very Active']}
              />
              <PrefItem 
                label="Daily Sleep Goal" 
                value={prefs.sleepGoal} 
                editing={editingPrefs} 
                icon={<Moon size={16} />}
                onChange={v => setPrefs({...prefs, sleepGoal: v})}
                suffix="hours"
              />
              <PrefItem 
                label="Hydration Goal" 
                value={prefs.waterGoal} 
                editing={editingPrefs} 
                icon={<Droplets size={16} />}
                onChange={v => setPrefs({...prefs, waterGoal: v})}
                suffix="glasses"
              />
            </div>
          </section>

        </div>

        {/* RIGHT COLUMN */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          
          {/* 3. RECENT ACTIVITY */}
          <section>
            <h3 style={{ marginBottom: '1rem', color: 'var(--forest)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Clock size={20} color="var(--muted)" /> Recent Actions
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {activities.length === 0 ? (
                <p style={{ color: 'var(--muted)', textAlign: 'center', padding: '2rem' }}>No recent activity yet.</p>
              ) : (
                activities.map((act, i) => (
                  <div key={i} className="card" style={{ padding: '1rem', display: 'flex', alignItems: 'center', gap: '1rem', transition: 'none' }}>
                    <div style={{ padding: '0.5rem', background: 'var(--ivory)', borderRadius: '10px' }}>
                      {activityIcons[act.type] || <Activity size={18} />}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <b style={{ fontSize: '0.9rem' }}>{act.type}</b>
                        <small style={{ color: 'var(--muted)' }}>{new Date(act.time).toLocaleDateString([], { month: 'short', day: 'numeric' })}</small>
                      </div>
                      <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--muted)' }}>{act.label}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>

          {/* 5. JOURNAL PREVIEW */}
          <section>
            <h3 style={{ marginBottom: '1rem', color: 'var(--forest)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <BookOpen size={20} color="var(--sage)" /> Last Journals
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {journalPreview.length === 0 ? (
                <p style={{ color: 'var(--muted)', textAlign: 'center', padding: '2rem' }}>No journals written yet.</p>
              ) : (
                journalPreview.map((j, i) => (
                  <div key={i} className="card" style={{ padding: '1.25rem', cursor: 'pointer', borderLeft: '4px solid var(--sage)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                      <b style={{ color: 'var(--forest)' }}>{j.title}</b>
                      <ChevronRight size={16} color="var(--muted)" />
                    </div>
                    <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--muted)', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {j.content}
                    </p>
                  </div>
                ))
              )}
            </div>
          </section>

        </div>

      </div>
    </div>
  );
}

function StatCard({ icon, count, label, color }) {
  return (
    <div className="card" style={{ padding: '1.25rem', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
      <div style={{ color }}>{icon}</div>
      <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--forest)' }}>{count}</div>
      <div style={{ fontSize: '0.75rem', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</div>
    </div>
  );
}

function PrefItem({ label, value, editing, icon, onChange, options, suffix }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', color: 'var(--muted)' }}>
        {icon} {label}
      </div>
      {editing ? (
        options ? (
          <select 
            value={value} 
            onChange={e => onChange(e.target.value)}
            style={{ padding: '0.25rem', borderRadius: '4px', border: '1px solid #ddd' }}
          >
            {options.map(o => <option key={o} value={o}>{o}</option>)}
          </select>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <input 
              type="number" 
              value={value} 
              onChange={e => onChange(e.target.value)}
              style={{ width: '50px', padding: '0.25rem', borderRadius: '4px', border: '1px solid #ddd' }}
            />
            {suffix && <small>{suffix}</small>}
          </div>
        )
      ) : (
        <b style={{ fontSize: '0.9rem', color: 'var(--forest)' }}>{value} {suffix}</b>
      )}
    </div>
  );
}
