import React, { useState, useEffect } from 'react';
import { apiRequest as request } from '../api';
import { ChevronLeft, Smile, Frown, Angry, Meh, BookOpen, PenLine, Wind, Moon, Trash2, Pencil, X, Brain, Sparkles, GraduationCap, Briefcase, Users, Heart, HelpCircle, Lightbulb, Plus, CheckCircle2, CalendarDays, Clock, Tag, ChevronRight, ArrowRight } from 'lucide-react';

const AnxiousIcon = ({ size = 20, stroke = "#9B8FCA" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/>
    <path d="M8 15s1.5-2 4-2 4 2 4 2"/>
    <line x1="9" y1="9" x2="9.01" y2="9"/>
    <line x1="15" y1="9" x2="15.01" y2="9"/>
    <path d="M9.5 9.5c0-.5.5-1 1-1s1 .5 1 1"/>
    <path d="M13.5 9.5c0-.5.5-1 1-1s1 .5 1 1"/>
  </svg>
);

const EMOTIONS = [
  { id: 'happy', label: 'Happy', icon: <Smile size={28} color="#EF9F27" />, color: '#FFFBEA' },
  { id: 'sad', label: 'Sad', icon: <Frown size={28} color="#AACFE0" />, color: '#EAF4FB' },
  { id: 'angry', label: 'Angry', icon: <Angry size={28} color="#E8CBBA" />, color: '#FDECEA' },
  { id: 'anxious', label: 'Anxious', icon: <AnxiousIcon size={28} stroke="#9B8FCA" />, color: '#F0EEF9' },
  { id: 'neutral', label: 'Neutral', icon: <Meh size={28} color="#7A9B82" />, color: '#F5F5F5' },
];

const CAUSES = [
  { label: 'Academics / Studies', icon: <GraduationCap size={20} color="#6B9E78" /> },
  { label: 'Work / Pressure', icon: <Briefcase size={20} color="#6B9E78" /> },
  { label: 'Relationships', icon: <Users size={20} color="#6B9E78" /> },
  { label: 'Health', icon: <Heart size={20} color="#6B9E78" /> },
  { label: 'Overthinking', icon: <Brain size={20} color="#9B8FCA" /> },
  { label: 'No clear reason', icon: <HelpCircle size={20} color="#7A9B82" /> }
];

const EMOTION_COLORS = {
  happy: '#FFFBEA',
  sad: '#EAF4FB',
  angry: '#FDECEA',
  anxious: '#F0EEF9',
  neutral: '#F5F5F5'
};

function getInsightText(emotion, cause) {
  const emotionLabel = EMOTIONS.find(e => e.id === emotion)?.label || 'This way';
  if (!cause || cause === 'No clear reason') {
    return `You're feeling ${emotionLabel.toLowerCase()}. Sometimes emotions don't have a clear trigger — and that's completely okay.`;
  }
  return `You're feeling ${emotionLabel.toLowerCase()} due to ${cause.toLowerCase()}. This is a common and valid response.`;
}

function getCrossModuleSuggestions(emotion, cause) {
  const suggestions = [];
  if (['anxious', 'angry'].includes(emotion) || cause === 'Overthinking') {
    suggestions.push({ id: 'calm', title: 'Try Calm & Reset', desc: 'A 5-minute guided practice to ease your mind.', icon: <Wind size={18} color="#6B9E78" />, color: '#6B9E78' });
  }
  if (emotion === 'sad' || cause === 'Health') {
    suggestions.push({ id: 'sleep', title: 'Check your Sleep', desc: 'Rest can significantly improve how you feel.', icon: <Moon size={18} color="#9B8FCA" />, color: '#9B8FCA' });
  }
  suggestions.push({ id: 'journal', title: 'Write about it', desc: 'Journaling helps clear your thoughts.', icon: <PenLine size={20} color="#9B8FCA" />, color: '#9B8FCA' });
  return suggestions;
}

function generateSimpleInsights(emotions) {
  if (!emotions || emotions.length < 2) return null;
  const emotionCounts = {};
  const causeCounts = {};
  const hourCounts = { morning: 0, afternoon: 0, evening: 0 };
  emotions.forEach(e => {
    emotionCounts[e.emotion] = (emotionCounts[e.emotion] || 0) + 1;
    if (e.cause) causeCounts[e.cause] = (causeCounts[e.cause] || 0) + 1;
    const hr = new Date(e.createdAt).getHours();
    if (hr < 12) hourCounts.morning++;
    else if (hr < 17) hourCounts.afternoon++;
    else hourCounts.evening++;
  });
  const topEmotion = Object.entries(emotionCounts).sort((a, b) => b[1] - a[1])[0];
  const topCause = Object.entries(causeCounts).sort((a, b) => b[1] - a[1])[0];
  const topTime = Object.entries(hourCounts).sort((a, b) => b[1] - a[1])[0];
  const insights = [];
  if (topEmotion) insights.push(`You most frequently feel ${topEmotion[0]}.`);
  if (topCause && topCause[0] !== 'No clear reason') insights.push(`Most entries are related to ${topCause[0]}.`);
  if (topTime && topTime[1] > 1) insights.push(`You tend to check-in most in the ${topTime[0]}.`);
  return insights.length ? insights : null;
}

export default function MindModule({ back, onNavigate }) {
  const [tab, setTab] = useState('checkin');
  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <button className="ghost" onClick={back} style={{ marginBottom: '1rem' }}><ChevronLeft size={16}/> Back to Focus</button>
      <div style={{ display: 'flex', background: 'var(--ivory)', borderRadius: '999px', padding: '4px', marginBottom: '2rem' }}>
        <button className={tab === 'checkin' ? 'primary' : 'ghost'} onClick={() => setTab('checkin')} style={{ flex: 1, padding: '0.75rem', borderRadius: '999px', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
          <Smile size={20} color={tab === 'checkin' ? '#ffffff' : '#9B8FCA'} /> Check-in
        </button>
        <button className={tab === 'journals' ? 'primary' : 'ghost'} onClick={() => setTab('journals')} style={{ flex: 1, padding: '0.75rem', borderRadius: '999px', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
          <BookOpen size={20} color={tab === 'journals' ? '#ffffff' : '#9B8FCA'} /> Journals
        </button>
      </div>
      {tab === 'checkin' ? <CheckinFlow onNavigate={onNavigate} onSwitchToJournals={() => setTab('journals')} /> : <JournalsView />}
    </div>
  );
}

function CheckinFlow({ onNavigate, onSwitchToJournals }) {
  const [step, setStep] = useState(1);
  const [emotion, setEmotion] = useState(null);
  const [cause, setCause] = useState(null);
  const [saving, setSaving] = useState(false);

  const selectEmotion = (id) => { setEmotion(id); setStep(2); };
  
  const selectCause = async (c) => {
    setSaving(true);
    try {
      setCause(c);
      await request('/emotion', { method: 'POST', body: JSON.stringify({ emotion, cause: c, date: new Date().toISOString().slice(0, 10), time: new Date().toISOString() }) });
      setStep(3);
    } catch (e) {
      console.error("Failed to save emotion:", e);
      // Even if saving fails, let's show the insight to keep the flow going
      setStep(3);
    } finally {
      setSaving(false);
    }
  };

  const skipCause = async () => {
    setSaving(true);
    try {
      await request('/emotion', { method: 'POST', body: JSON.stringify({ emotion, cause: null, date: new Date().toISOString().slice(0, 10), time: new Date().toISOString() }) });
      setStep(3);
    } catch (e) {
      console.error("Failed to save emotion (skipped cause):", e);
      setStep(3);
    } finally {
      setSaving(false);
    }
  };

  if (step === 1) return <EmotionScreen onSelect={selectEmotion} />;
  if (step === 2) return <CauseScreen onSelect={selectCause} onSkip={skipCause} saving={saving} />;
  if (step === 3) return <InsightScreen emotion={emotion} cause={cause} onNavigate={onNavigate} onJournal={onSwitchToJournals} onDone={() => setStep(1)} />;
}

function EmotionScreen({ onSelect }) {
  return (
    <div className="card" style={{ padding: '3rem 2rem', textAlign: 'center' }}>
      <Smile size={22} color="#9B8FCA" style={{ marginBottom: '0.5rem' }} />
      <h2 style={{ fontSize: '1.8rem', marginBottom: '0.5rem', color: 'var(--forest)' }}>What are you feeling right now?</h2>
      <p style={{ color: 'var(--muted)', marginBottom: '2.5rem' }}>Tap the emotion that best matches.</p>
      <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: '1rem' }}>
        {EMOTIONS.map(em => (
          <button key={em.id} onClick={() => onSelect(em.id)}
            style={{ background: em.color, border: 'none', borderRadius: '16px', padding: '1.5rem 1rem', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem', transition: 'transform 0.2s, box-shadow 0.2s' }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(0,0,0,0.08)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
          >
            {em.icon}
            <b style={{ fontSize: '1rem' }}>{em.label}</b>
          </button>
        ))}
      </div>
    </div>
  );
}

function CauseScreen({ onSelect, onSkip, saving }) {
  return (
    <div className="card" style={{ padding: '3rem 2rem', textAlign: 'center', opacity: saving ? 0.7 : 1 }}>
      <HelpCircle size={22} color="#9B8FCA" style={{ marginBottom: '0.5rem' }} />
      <h2 style={{ fontSize: '1.8rem', marginBottom: '0.5rem', color: 'var(--forest)' }}>What might be causing this?</h2>
      <p style={{ color: 'var(--muted)', marginBottom: '2.5rem' }}>Select the most relevant trigger, or skip.</p>
      <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        {CAUSES.map(c => (
          <button key={c.label} onClick={() => onSelect(c.label)} disabled={saving}
            style={{ background: 'var(--ivory)', border: '2px solid transparent', borderRadius: '14px', padding: '1.25rem', cursor: 'pointer', fontWeight: '500', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '0.75rem', transition: 'border-color 0.2s' }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = '#6B9E78'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'transparent'; }}
          >
            {c.icon} {c.label}
          </button>
        ))}
      </div>
      <button className="ghost" onClick={onSkip} disabled={saving} style={{ color: 'var(--muted)' }}>
        {saving ? 'Saving...' : 'Skip this step'}
      </button>
    </div>
  );
}

function InsightScreen({ emotion, cause, onNavigate, onJournal, onDone }) {
  const insightText = getInsightText(emotion, cause);
  const suggestions = getCrossModuleSuggestions(emotion, cause);
  const emotionData = EMOTIONS.find(e => e.id === emotion);
  return (
    <div>
      <div className="card" style={{ padding: '2.5rem', background: emotionData?.color || '#F7F5F0', borderRadius: '20px', marginBottom: '2rem', textAlign: 'center' }}>
        <Lightbulb size={20} color="#EF9F27" style={{ marginBottom: '0.75rem' }} />
        <div style={{ marginBottom: '1rem' }}>{emotionData?.icon}</div>
        <p style={{ fontSize: '1.2rem', color: 'var(--forest)', lineHeight: 1.6, maxWidth: '500px', margin: '0 auto' }}>{insightText}</p>
      </div>
      <h3 style={{ marginBottom: '1rem', color: 'var(--forest)' }}>What would help right now?</h3>
      <div className="grid" style={{ gridTemplateColumns: '1fr', gap: '0.75rem', marginBottom: '2rem' }}>
        {suggestions.map(s => (
          <div key={s.id} className="card"
            onClick={() => { if (s.id === 'journal') { onJournal(); return; } if (onNavigate) onNavigate(s.id); }}
            style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1.25rem', cursor: 'pointer', borderLeft: `6px solid ${s.color}`, transition: 'transform 0.2s, box-shadow 0.2s' }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(0,0,0,0.06)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
          >
            <div style={{ padding: '0.75rem', background: `${s.color}22`, borderRadius: '12px', display: 'flex' }}>{s.icon}</div>
            <div style={{ flex: 1 }}>
              <b style={{ display: 'block', fontSize: '1.1rem' }}>{s.title}</b>
              <small style={{ color: 'var(--muted)' }}>{s.desc}</small>
            </div>
            <ChevronRight size={18} color="#6B9E78" />
          </div>
        ))}
      </div>
      <button className="primary wide" onClick={onDone} style={{ padding: '1rem', borderRadius: '12px', fontSize: '1.1rem' }}>Done</button>
    </div>
  );
}

function JournalsView() {
  const [journals, setJournals] = useState([]);
  const [emotions, setEmotions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [viewEntry, setViewEntry] = useState(null);
  const loadData = async () => {
    try {
      const [jRes, eRes] = await Promise.all([request('/journals'), request('/emotion')]);
      setJournals(jRes.history || []);
      setEmotions(eRes.history || []);
    } catch(e) { /* empty */ }
    setLoading(false);
  };
  useEffect(() => { loadData(); }, []);
  const saveJournal = async (entry) => {
    await request('/journal', { method: 'POST', body: JSON.stringify({ ...entry, date: new Date().toISOString().slice(0, 10), time: new Date().toISOString() }) });
    setShowAdd(false);
    setLoading(true);
    loadData();
  };
  const deleteJournal = async (id) => {
    setJournals(prev => prev.filter(j => j.id !== id));
    setViewEntry(null);
  };
  if (loading) return <div className="card center"><p>Loading Journals...</p></div>;
  if (showAdd) return <AddJournalScreen onSave={saveJournal} onCancel={() => setShowAdd(false)} />;
  if (viewEntry) return <ViewJournalScreen entry={viewEntry} onBack={() => setViewEntry(null)} onDelete={() => deleteJournal(viewEntry.id)} />;
  const insights = generateSimpleInsights(emotions);
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
        <div>
          <h2 style={{ margin: '0 0 0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><BookOpen size={22} color="#9B8FCA" /> Your Journals</h2>
          <p style={{ margin: 0, color: 'var(--muted)', maxWidth: '500px', lineHeight: 1.5 }}>Journaling helps you clear your thoughts and feel more in control.</p>
        </div>
        <button className="primary" onClick={() => setShowAdd(true)} style={{ padding: '0.75rem 1.5rem', borderRadius: '12px', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Plus size={20} color="#ffffff" /> New Journal
        </button>
      </div>
      {insights && (
        <div className="card" style={{ marginBottom: '2rem', background: 'var(--ivory)', borderLeft: '6px solid #EF9F27' }}>
          <h4 style={{ margin: '0 0 0.75rem', color: 'var(--muted)', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Lightbulb size={22} color="#EF9F27" /> Insights from your check-ins</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {insights.map((ins, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Lightbulb size={16} color="#EF9F27" />
                <span style={{ color: 'var(--forest)' }}>{ins}</span>
              </div>
            ))}
          </div>
        </div>
      )}
      {journals.length === 0 ? (
        <div className="card center" style={{ padding: '4rem 2rem' }}>
          <PenLine size={48} color="#ccc" style={{ marginBottom: '1rem' }} />
          <p style={{ color: 'var(--muted)', fontSize: '1.1rem' }}>No journal entries yet. Tap "New Journal" to start writing.</p>
        </div>
      ) : (
        <div className="grid" style={{ gridTemplateColumns: '1fr', gap: '0.75rem' }}>
          {journals.map(j => {
            const bgColor = EMOTION_COLORS[j.emotionTag] || '#F7F5F0';
            const preview = (j.content || '').slice(0, 100);
            return (
              <div key={j.id} className="card" onClick={() => setViewEntry(j)}
                style={{ cursor: 'pointer', background: bgColor, borderRadius: '14px', padding: '1.25rem', transition: 'transform 0.2s' }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <b style={{ fontSize: '1.1rem' }}>{(j.content || '').split('\n')[0].slice(0, 40) || 'Untitled'}</b>
                  <small style={{ color: 'var(--muted)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <CalendarDays size={14} color="#7A9B82" />
                    {j.createdAt ? new Date(j.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : ''}
                  </small>
                </div>
                {preview.length > 40 && <p style={{ margin: 0, color: 'var(--muted)', fontSize: '0.95rem' }}>{preview}...</p>}
                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem' }}>
                  {j.emotionTag && <span style={{ fontSize: '0.8rem', padding: '0.15rem 0.6rem', background: 'rgba(0,0,0,0.06)', borderRadius: '999px', display: 'flex', alignItems: 'center', gap: '0.25rem' }}><Smile size={14} color="#7A9B82" /> {j.emotionTag}</span>}
                  {j.triggerTag && <span style={{ fontSize: '0.8rem', padding: '0.15rem 0.6rem', background: 'rgba(0,0,0,0.06)', borderRadius: '999px' }}>{j.triggerTag}</span>}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function AddJournalScreen({ onSave, onCancel }) {
  const [content, setContent] = useState('');
  const [emotionTag, setEmotionTag] = useState('');
  const [triggerTag, setTriggerTag] = useState('');
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h2 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}><PenLine size={20} color="#9B8FCA" /> New Journal Entry</h2>
        <button className="ghost" onClick={onCancel}><X size={20}/></button>
      </div>
      <textarea value={content} onChange={e => setContent(e.target.value)} placeholder="Write what's on your mind…"
        style={{ width: '100%', minHeight: '200px', padding: '1.5rem', borderRadius: '16px', border: '2px solid #eee', fontSize: '1.1rem', lineHeight: 1.6, resize: 'vertical', fontFamily: 'inherit', marginBottom: '1.5rem' }}
      />
      <div style={{ marginBottom: '1.5rem' }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', fontWeight: 'bold', fontSize: '0.9rem', color: 'var(--muted)' }}><Smile size={18} color="#7A9B82" /> Emotion Tag (Optional)</label>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          {EMOTIONS.map(em => (
            <button key={em.id} onClick={() => setEmotionTag(emotionTag === em.id ? '' : em.id)}
              style={{ background: emotionTag === em.id ? em.color : 'var(--ivory)', border: emotionTag === em.id ? '2px solid #6B9E78' : '2px solid transparent', borderRadius: '999px', padding: '0.4rem 1rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.9rem' }}
            >
              {em.icon} {em.label}
            </button>
          ))}
        </div>
      </div>
      <div style={{ marginBottom: '2rem' }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', fontWeight: 'bold', fontSize: '0.9rem', color: 'var(--muted)' }}><Tag size={18} color="#7A9B82" /> Trigger Tag (Optional)</label>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          {CAUSES.filter(c => c.label !== 'No clear reason').map(c => (
            <button key={c.label} onClick={() => setTriggerTag(triggerTag === c.label ? '' : c.label)}
              style={{ background: triggerTag === c.label ? 'var(--dew)' : 'var(--ivory)', border: triggerTag === c.label ? '2px solid #6B9E78' : '2px solid transparent', borderRadius: '999px', padding: '0.4rem 1rem', cursor: 'pointer', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
            >
              {c.icon} {c.label}
            </button>
          ))}
        </div>
      </div>
      <button className="primary wide" onClick={() => onSave({ content, emotionTag, triggerTag })} disabled={!content.trim()} style={{ padding: '1rem', borderRadius: '12px', fontSize: '1.1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
        <CheckCircle2 size={20} color="#ffffff" /> Save Journal
      </button>
    </div>
  );
}

function ViewJournalScreen({ entry, onBack, onDelete }) {
  const bgColor = EMOTION_COLORS[entry.emotionTag] || '#F7F5F0';
  const emotionData = EMOTIONS.find(e => e.id === entry.emotionTag);
  return (
    <div>
      <button className="ghost" onClick={onBack} style={{ marginBottom: '1rem' }}><ChevronLeft size={16}/> Back to Journals</button>
      <div className="card" style={{ background: bgColor, padding: '2.5rem', borderRadius: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <small style={{ color: 'var(--muted)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <CalendarDays size={16} color="#7A9B82" />
            <Clock size={16} color="#7A9B82" />
            {entry.createdAt ? new Date(entry.createdAt).toLocaleString(undefined, { weekday: 'long', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : ''}
          </small>
          <button className="ghost" onClick={onDelete} style={{ color: '#E8CBBA', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            <Trash2 size={18} color="#E8CBBA" /> Delete
          </button>
        </div>
        <p style={{ fontSize: '1.15rem', lineHeight: 1.8, whiteSpace: 'pre-wrap', color: 'var(--forest)' }}>{entry.content}</p>
        {(entry.emotionTag || entry.triggerTag) && (
          <div style={{ display: 'flex', gap: '0.5rem', marginTop: '2rem' }}>
            {entry.emotionTag && <span style={{ fontSize: '0.85rem', padding: '0.25rem 0.75rem', background: 'rgba(0,0,0,0.06)', borderRadius: '999px', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>{emotionData?.icon} {entry.emotionTag}</span>}
            {entry.triggerTag && <span style={{ fontSize: '0.85rem', padding: '0.25rem 0.75rem', background: 'rgba(0,0,0,0.06)', borderRadius: '999px' }}>{entry.triggerTag}</span>}
          </div>
        )}
      </div>
    </div>
  );
}
