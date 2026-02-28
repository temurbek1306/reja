import React, { useState, useEffect, useRef } from 'react';

const WEEKDAY_TASKS = [
  { id: '1', icon: '🍳', label: 'Nonushta', norm: 20, color: '#fbbf24' },
  { id: '2', icon: '💼', label: 'Ish (1-qism)', norm: 180, color: '#818cf8' },
  { id: '3', icon: '☕', label: 'Dam olish', norm: 30, color: '#a78bfa' },
  { id: '4', icon: '🍱', label: 'Tushlik', norm: 45, color: '#f87171' },
  { id: '5', icon: '💻', label: 'Ish (2-qism)', norm: 180, color: '#818cf8' },
  { id: '6', icon: '📚', label: "Dars", norm: 90, color: '#34d399' },
  { id: '7', icon: '🌳', label: "Sayr", norm: 45, color: '#4ade80' },
  { id: '8', icon: '🍽️', label: 'Kechki ovqat', norm: 45, color: '#f472b6' },
  { id: '9', icon: '🌙', label: 'Uyqu', norm: 480, color: '#38bdf8' },
];

const SUNDAY_TASKS = [
  { id: '1', icon: '🍳', label: 'Nonushta', norm: 30, color: '#fbbf24' },
  { id: '2', icon: '💻', label: 'Dasturlash (1)', norm: 120, color: '#818cf8' },
  { id: '3', icon: '🏫', label: 'IT Park (Dars)', norm: 180, color: '#38bdf8' },
  { id: '4', icon: '🍱', label: 'Tushlik', norm: 30, color: '#f87171' },
  { id: '5', icon: '😴', label: 'Dam olish (1)', norm: 60, color: '#a78bfa' },
  { id: '6', icon: '🧼', label: 'Tozalik va tartib', norm: 60, color: '#34d399' },
  { id: '7', icon: '☕', label: 'Dam olish (2)', norm: 60, color: '#fb923c' },
  { id: '8', icon: '👨‍💻', label: 'Dasturlash (2)', norm: 120, color: '#818cf8' },
  { id: '9', icon: '🧘', label: 'Dam olish (3)', norm: 30, color: '#fb923c' },
  { id: '10', icon: '🇬🇧', label: 'Ingliz tili', norm: 120, color: '#c084fc' },
  { id: '11', icon: '🎐', label: 'Dam olish (4)', norm: 30, color: '#fb923c' },
  { id: '12', icon: '🍽️', label: 'Kechki ovqat', norm: 30, color: '#f87171' },
  { id: '13', icon: '🏋️', label: 'Zal (Mashg\'ulot)', norm: 60, color: '#4ade80' },
  { id: '14', icon: '🍿', label: 'Kino (Hordiq)', norm: 90, color: '#f472b6' },
];

function getTasksForDay(dayIdx) {
  return dayIdx === 0 ? SUNDAY_TASKS : WEEKDAY_TASKS;
}

const COLORS = ['#818cf8', '#c084fc', '#f87171', '#fb923c', '#fbbf24', '#34d399', '#38bdf8', '#f472b6', '#e879f9', '#a3e635'];
const BLANK = { icon: '🎯', label: '', norm: 60, color: '#818cf8' };

const MOTIV = [
  "Harakat — bu g'alaba kaliti. Olg'a! 💎",
  "Kichik qadamlar, ulkan natijalar. 🏔️",
  "Tajriba (XP) yig'ish vaqti keldi! 🌱",
  "O'z darajangni ko'tar! 🚀",
  "Har bir daqiqa qimmatli. 🏆",
];

const UZ_MONTHS = ["yanvar", "fevral", "mart", "aprel", "may", "iyun", "iyul", "avgust", "sentyabr", "oktyabr", "noyabr", "dekabr"];
const UZ_DAYS = ["yakshanba", "dushanba", "seshanba", "chorshanba", "payshanba", "juma", "shanba"];
const UZ_DAYS_SHORT = ["yak", "dush", "sesh", "chor", "pay", "jum", "shan"];

function fmt(s) {
  if (!s || s <= 0) return '0 min';
  const totalMins = Math.floor(s / 60);
  if (totalMins <= 0) return '< 1 min';
  const h = Math.floor(totalMins / 60), min = totalMins % 60;
  if (h > 0) {
    if (min === 0) return `${h} soat`;
    return `${h} soat ${min.toString().padStart(2, '0')} min`;
  }
  return `${totalMins} min`;
}

function fmtTimer(seconds) {
  const m = Math.floor(seconds / 60).toString().padStart(2, '0');
  const s = (seconds % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

function useNow() {
  const [now, setNow] = useState(new Date());
  useEffect(() => { const id = setInterval(() => setNow(new Date()), 1000); return () => clearInterval(id); }, []);
  return now;
}

function useWindowWidth() {
  const [width, setWidth] = useState(window.innerWidth);
  useEffect(() => {
    const handleResize = () => setWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  return width;
}

export default function App() {
  const now = useNow();
  const width = useWindowWidth();
  const isMobile = width <= 900;

  // Persistent States
  const [tasks, setTasks] = useState(() => {
    const saved = localStorage.getItem('reja_v9_tasks');
    if (saved) return JSON.parse(saved);
    return getTasksForDay(now.getDay());
  });
  const [prog, setProg] = useState(() => JSON.parse(localStorage.getItem('reja_v9_prog')) || {});
  const [xp, setXp] = useState(() => parseInt(localStorage.getItem('reja_v9_xp')) || 0);
  const [history, setHistory] = useState(() => JSON.parse(localStorage.getItem('reja_v9_history')) || []);
  const [lastDate, setLastDate] = useState(() => localStorage.getItem('reja_v9_last_date') || "");

  // Persistence for Timer
  const [activeTimerTask, setActiveTimerTask] = useState(() => localStorage.getItem('reja_v9_timer_task'));
  const [timerStartTime, setTimerStartTime] = useState(() => parseInt(localStorage.getItem('reja_v9_timer_start')) || null);
  const [accumulatedSecs, setAccumulatedSecs] = useState(() => parseInt(localStorage.getItem('reja_v9_timer_accum')) || 0);

  const [cur, setCur] = useState(activeTimerTask || null);
  const [elapsedSecs, setElapsedSecs] = useState(0);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(BLANK);
  const [editTaskId, setEditTaskId] = useState(null);
  const [activeTab, setActiveTab] = useState('home');

  // Sync Timer Logic
  useEffect(() => {
    const update = () => {
      if (timerStartTime) {
        const diff = Math.floor((Date.now() - timerStartTime) / 1000);
        setElapsedSecs(accumulatedSecs + diff);
      } else setElapsedSecs(accumulatedSecs);
    };
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, [timerStartTime, accumulatedSecs]);

  // Sync to LocalStorage
  useEffect(() => { localStorage.setItem('reja_v9_tasks', JSON.stringify(tasks)); }, [tasks]);
  useEffect(() => { localStorage.setItem('reja_v9_prog', JSON.stringify(prog)); }, [prog]);
  useEffect(() => { localStorage.setItem('reja_v9_xp', xp.toString()); }, [xp]);
  useEffect(() => { localStorage.setItem('reja_v9_history', JSON.stringify(history)); }, [history]);
  useEffect(() => {
    if (activeTimerTask) localStorage.setItem('reja_v9_timer_task', activeTimerTask);
    else localStorage.removeItem('reja_v9_timer_task');
  }, [activeTimerTask]);
  useEffect(() => {
    if (timerStartTime) localStorage.setItem('reja_v9_timer_start', timerStartTime.toString());
    else localStorage.removeItem('reja_v9_timer_start');
  }, [timerStartTime]);
  useEffect(() => { localStorage.setItem('reja_v9_timer_accum', accumulatedSecs.toString()); }, [accumulatedSecs]);
  useEffect(() => { localStorage.setItem('reja_v9_last_date', lastDate); }, [lastDate]);

  // Day Change Auto-Switch Logic
  useEffect(() => {
    const todayStr = new Date().toDateString();
    if (lastDate !== todayStr) {
      const hasProgress = Object.values(prog).some(v => v > 0);
      if (!hasProgress) {
        setTasks(getTasksForDay(new Date().getDay()));
        setProg({});
        setHistory([]);
      }
    }
    setLastDate(todayStr);
  }, [lastDate]);

  // Date & Countdown Calculations
  const year = now.getFullYear();
  const monthIdx = now.getMonth();
  const dateNum = now.getDate();
  const dayIdx = now.getDay();

  const dateStr = `${dateNum}-${UZ_MONTHS[monthIdx]}, ${UZ_DAYS[dayIdx]}`;
  const clockStr = now.toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

  // Countdowns
  const endOfDay = new Date(year, monthIdx, dateNum, 23, 59, 59);
  const diffDay = endOfDay - now;
  const hLeft = Math.floor(diffDay / (1000 * 60 * 60));
  const mLeft = Math.floor((diffDay % (1000 * 60 * 60)) / (1000 * 60));

  const daysInMonth = new Date(year, monthIdx + 1, 0).getDate();
  const dLeftMonth = daysInMonth - dateNum;

  const endOfYear = new Date(year, 11, 31, 23, 59, 59);
  const dLeftYear = Math.floor((endOfYear - now) / (1000 * 60 * 60 * 24));

  const dLeftWeek = dayIdx === 0 ? 0 : 7 - dayIdx;

  // Stats
  const level = Math.floor(xp / 1000) + 1;
  const currentLevelXp = xp % 1000;
  const levelPct = (currentLevelXp / 1000) * 100;

  const totalNorm = tasks.reduce((s, t) => s + t.norm * 60, 0);
  const totalDone = tasks.reduce((s, t) => s + Math.min(prog[t.id] || 0, t.norm * 60), 0);
  const remaining = totalNorm - totalDone;

  const activeTasks = tasks.filter(t => (prog[t.id] || 0) < t.norm * 60);
  const completedTasks = tasks.filter(t => (prog[t.id] || 0) >= t.norm * 60);
  const isAllDone = activeTasks.length === 0 && tasks.length > 0;

  const selectedTask = tasks.find(t => t.id === cur);
  const selectedProg = selectedTask ? (prog[selectedTask.id] || 0) : 0;
  const selectedPct = selectedTask ? Math.min(100, Math.round((selectedProg / (selectedTask.norm * 60)) * 100)) : 0;

  useEffect(() => {
    if (selectedTask && (prog[selectedTask.id] || 0) >= selectedTask.norm * 60) {
      if (cur === activeTimerTask) stopTimer(false);
      setTimeout(() => setCur(null), 1500);
    }
  }, [prog, selectedTask, cur]);

  // Handlers
  function addTime(id, secs) {
    if (!id) return;
    const task = tasks.find(t => t.id === id);
    if (!task) return;
    setProg(p => {
      const curr = p[id] || 0;
      const addedXP = Math.floor(secs * (10 / 60)); // 10 XP per minute
      if (addedXP > 0) setXp(x => x + addedXP);
      setHistory(h => [...h, { taskId: id, addedSecs: secs, addedXP }]);
      return { ...p, [id]: curr + secs };
    });
  }

  function startTimer() { setTimerStartTime(Date.now()); setActiveTimerTask(cur); }
  function pauseTimer() {
    if (timerStartTime) {
      const diff = Math.floor((Date.now() - timerStartTime) / 1000);
      setAccumulatedSecs(prev => prev + diff);
      setTimerStartTime(null);
    }
  }
  function stopTimer(save = true) {
    if (save && elapsedSecs > 0 && activeTimerTask) addTime(activeTimerTask, elapsedSecs);
    setTimerStartTime(null); setAccumulatedSecs(0); setElapsedSecs(0); setActiveTimerTask(null);
  }

  function undoLastAction() {
    if (history.length === 0) return;
    const lastAction = history[history.length - 1];
    setProg(p => ({ ...p, [lastAction.taskId]: Math.max(0, (p[lastAction.taskId] || 0) - (lastAction.addedSecs || 0)) }));
    setXp(x => Math.max(0, x - lastAction.addedXP));
    setHistory(h => h.slice(0, -1));
  }

  function resetDay() {
    if (window.confirm("Barcha bugungi natijalar o'chiriladi. Rozimisiz?")) {
      setProg({});
      setCur(null);
      setHistory([]);
      setTimerStartTime(null);
      setAccumulatedSecs(0);
      setActiveTimerTask(null);
      setTasks(getTasksForDay(new Date().getDay()));
    }
  }

  function addTask(e) {
    e.preventDefault();
    if (!form.label.trim()) return;
    if (editTaskId) {
      setTasks(t => t.map(task => task.id === editTaskId ? { ...task, ...form, norm: parseInt(form.norm) || 60 } : task));
      setEditTaskId(null);
    } else {
      setTasks(t => [...t, { ...form, id: Date.now().toString(), norm: parseInt(form.norm) || 60 }]);
    }
    setForm(BLANK);
  }

  function startEdit(task) { setForm(task); setEditTaskId(task.id); setOpen(true); }
  function deleteTask(id) { if (window.confirm("O'chirilsinmi?")) setTasks(t => t.filter(x => x.id !== id)); }
  function moveTask(index, dir) {
    const newIdx = index + dir;
    if (newIdx < 0 || newIdx >= tasks.length) return;
    setTasks(t => { const arr = [...t];[arr[index], arr[newIdx]] = [arr[newIdx], arr[index]]; return arr; });
  }

  return (
    <>
      <div className="aurora-bg"></div>
      <div className="dashboard-layout">
        <aside className="sidebar root-card">
          <div className="brand"><div className="brand-logo">🔹</div><h1>Reja</h1></div>

          <div className="sidebar-group">
            <h5 className="group-title">Profilingiz</h5>
            <div className="level-badge-large">LVL {level}</div>
            <div className="xp-bar-wrap">
              <div className="xp-bar-fill" style={{ width: `${levelPct}%` }} />
            </div>
            <div className="xp-text-large">
              <span>{currentLevelXp} XP</span>
              <span>1000 XP gacha</span>
            </div>
          </div>

          <div className="sidebar-group">
            <h5 className="group-title">Vaqt</h5>
            <div className="sidebar-time">{clockStr}</div>
            <div className="sidebar-date">{dateStr}</div>
            <div className="countdown-mini">
              <div className="cd-item" title="Kun tugashiga">
                <span className="cd-icon">☀️</span>
                <span className="cd-label">Kun yakuniga</span>
                <span className="cd-val">{hLeft} soat {mLeft} min</span>
              </div>
              <div className="cd-item" title="Hafta tugashiga">
                <span className="cd-icon">📅</span>
                <span className="cd-label">Hafta yakuniga</span>
                <span className="cd-val">{dLeftWeek} kun</span>
              </div>
              <div className="cd-item" title="Oy tugashiga">
                <span className="cd-icon">🌙</span>
                <span className="cd-label">Oy yakuniga</span>
                <span className="cd-val">{dLeftMonth} kun</span>
              </div>
              <div className="cd-item" title="Yil tugashiga">
                <span className="cd-icon">🚀</span>
                <span className="cd-label">Yil yakuniga</span>
                <span className="cd-val">{dLeftYear} kun</span>
              </div>
            </div>
          </div>

          <div className="sidebar-actions">
            <button className="btn-vivid btn-secondary w-100" onClick={() => setOpen(true)}>⚙️ Sozlamalar</button>
            <button className="btn-undo-full" onClick={resetDay}>Kunni tozalash</button>
          </div>
        </aside>

        <main className={`main-content ${activeTab}-active`}>
          {(!isMobile || activeTab === 'home') && (
            <div className="tab-pane">
              <header className="content-header">
                {isMobile && (
                  <div className="mobile-time-date-wrap">
                    <div className="sidebar-time">{clockStr}</div>
                    <div className="sidebar-date">{dateStr}</div>
                  </div>
                )}
                <div className="motiv-plate">{MOTIV[Math.floor(now.getMinutes() / 12) % MOTIV.length]}</div>
                {history.length > 0 && <button className="btn-undo-top" onClick={undoLastAction}>↶ Bekor qilish</button>}
              </header>

              <section className="stats-board">
                <div className="stat-card root-card"><div className="stat-label">Jami XP</div><div className="stat-value vivid-purple">{xp}</div></div>
                <div className="stat-card root-card"><div className="stat-label">Bajarildi</div><div className="stat-value vivid-green">{fmt(totalDone)}</div></div>
                <div className="stat-card root-card"><div className="stat-label">Qoldi</div><div className="stat-value vivid-blue">{fmt(remaining)}</div></div>
                <div className="stat-card root-card"><div className="stat-label">Missiyalar</div><div className="stat-value vivid-orange">{completedTasks.length}/{tasks.length}</div></div>
              </section>

              <div className="split-view">
                <div className="split-left">
                  {selectedTask ? (
                    <div className="active-widget root-card">
                      <div className="widget-header">
                        <span className="badge-vivid">{timerStartTime ? '🔴 JONLI' : 'FAOL'}</span>
                        <button className="btn-close-vivid" onClick={() => setCur(null)}>✕</button>
                      </div>
                      <div className="widget-body">
                        <div className="widget-left">
                          <div className="widget-icon-vivid" style={{ color: selectedTask.color }}>{selectedTask.icon}</div>
                          <div className="widget-info">
                            <h2 className="widget-title">{selectedTask.label}</h2>
                            <div className="widget-prog-text">{fmt(selectedProg)} / {fmt(selectedTask.norm * 60)}</div>
                            <div className="widget-prog-bar-vivid"><div className="widget-prog-fill-vivid" style={{ width: `${selectedPct}%`, background: selectedTask.color }} /></div>
                          </div>
                        </div>
                        <div className="widget-right">
                          <div className="timer-face-vivid">{fmtTimer(elapsedSecs)}</div>
                          <div className="timer-controls">
                            {!timerStartTime ? (
                              <button className="btn-vivid btn-play" onClick={startTimer}>▶ Boshlash</button>
                            ) : (
                              <button className="btn-vivid btn-pause" onClick={pauseTimer}>⏸ To'xtash</button>
                            )}
                            <button className="btn-vivid btn-save" onClick={() => stopTimer(true)}>✓ Saqlash</button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="empty-widget-vivid">
                      <div className="icon-xl">🎯</div>
                      <h3>Vazifa tanlanmagan</h3>
                      <p>Pastki menyudan missiya tanlang.</p>
                    </div>
                  )}
                </div>

                {!isMobile && (
                  <div className="split-right">
                    <h3 className="section-title">Missiyalar</h3>
                    <div className="missions-grid-vivid">
                      {activeTasks.map(t => (
                        <div key={t.id} className={`mission-card-vivid ${cur === t.id ? 'active' : ''}`} onClick={() => setCur(t.id)}>
                          <div className="mc-icon-vivid" style={{ color: t.color }}>{t.icon}</div>
                          <div className="mc-info">
                            <h4>{t.label}</h4>
                            <div className="mc-meta">{fmt(prog[t.id] || 0)} / {fmt(t.norm * 60)}</div>
                          </div>
                        </div>
                      ))}
                      {activeTasks.length === 0 && <div className="day-fin root-card" style={{ padding: '20px' }}>🏆 Hamma vazifa bajarildi!</div>}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {isMobile && activeTab === 'missions' && (
            <div className="tab-pane">
              <h3 className="section-title">Missiyalar</h3>
              <div className="missions-grid-vivid">
                {activeTasks.map(t => (
                  <div key={t.id} className="mission-card-vivid" onClick={() => { setCur(t.id); setActiveTab('home'); }}>
                    <div className="mc-icon-vivid" style={{ color: t.color }}>{t.icon}</div>
                    <div className="mc-info"><h4>{t.label}</h4><div className="mc-meta">{fmt(prog[t.id] || 0)} / {fmt(t.norm * 60)}</div></div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {isMobile && activeTab === 'stats' && (
            <div className="tab-pane">
              <h3 className="section-title">Statistika</h3>

              <div className="mobile-profile-card root-card">
                <h5 className="group-title">Profilingiz</h5>
                <div className="level-badge-large">LVL {level}</div>
                <div className="xp-bar-wrap">
                  <div className="xp-bar-fill" style={{ width: `${levelPct}%` }} />
                </div>
                <div className="xp-text-large">
                  <span>{currentLevelXp} XP</span>
                  <span>1000 XP gacha</span>
                </div>
              </div>

              <div className="mobile-time-card root-card">
                <h5 className="group-title">Vaqt ko'rsatkichlari</h5>
                <div className="countdown-mini">
                  <div className="cd-item">
                    <span className="cd-icon">☀️</span>
                    <span className="cd-label">Kun yakuniga</span>
                    <span className="cd-val">{hLeft} soat {mLeft} min</span>
                  </div>
                  <div className="cd-item">
                    <span className="cd-icon">📅</span>
                    <span className="cd-label">Hafta yakuniga</span>
                    <span className="cd-val">{dLeftWeek} kun</span>
                  </div>
                  <div className="cd-item">
                    <span className="cd-icon">🌙</span>
                    <span className="cd-label">Oy yakuniga</span>
                    <span className="cd-val">{dLeftMonth} kun</span>
                  </div>
                  <div className="cd-item">
                    <span className="cd-icon">🚀</span>
                    <span className="cd-label">Yil yakuniga</span>
                    <span className="cd-val">{dLeftYear} kun</span>
                  </div>
                </div>
              </div>

              <h3 className="section-title" style={{ marginTop: '32px' }}>Missiyalar hisoboti</h3>
              <div className="stats-list-vivid">
                {tasks.map(t => {
                  const isDone = (prog[t.id] || 0) >= t.norm * 60;
                  return (
                    <div key={t.id} className={`stat-row-vivid ${isDone ? 'completed' : ''}`}>
                      <div className="sr-icon-vivid">{isDone ? '✅' : t.icon}</div>
                      <div className="sr-info">
                        <h4>{t.label}</h4>
                        <div className="sr-status">{isDone ? 'Muvaffaqiyatli yakunlandi!' : `${fmt(prog[t.id] || 0)} / ${fmt(t.norm * 60)}`}</div>
                      </div>
                      {isDone && <div className="completed-badge">BAJARILDI</div>}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {isMobile && activeTab === 'settings' && (
            <div className="tab-pane">
              <h3 className="section-title">Sozlamalar</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <button className="btn-vivid btn-secondary w-100" onClick={() => setOpen(true)}>⚙️ Missiyalarni boshqarish</button>
                <button className="btn-undo-full w-100" onClick={resetDay}>Kunni tozalash</button>
              </div>
            </div>
          )}
        </main>

        <nav className="mobile-nav">
          <button className={activeTab === 'home' ? 'active' : ''} onClick={() => { setActiveTab('home'); setOpen(false); }}>🏠<span>Asosiy</span></button>
          <button className={activeTab === 'missions' ? 'active' : ''} onClick={() => { setActiveTab('missions'); setOpen(false); }}>📁<span>Missiyalar</span></button>
          <button className={activeTab === 'stats' ? 'active' : ''} onClick={() => { setActiveTab('stats'); setOpen(false); }}>📊<span>Statistika</span></button>
          <button className={activeTab === 'settings' ? 'active' : ''} onClick={() => { setActiveTab('settings'); setOpen(false); }}>⚙️<span>Sozlamalar</span></button>
        </nav>
      </div>

      {open && (
        <div className="overlay" onClick={() => setOpen(false)}>
          <div className="drawer" onClick={e => e.stopPropagation()}>
            <div className="drawer-header"><h2 className="drawer-title">Sozlamalar</h2><button className="drawer-close" onClick={() => setOpen(false)}>✕</button></div>
            <div className="drawer-content">
              <form className="form-card" onSubmit={addTask}>
                <div className="field"><label>Nomi</label><input value={form.label} onChange={e => setForm({ ...form, label: e.target.value })} /></div>
                <div className="form-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div className="field"><label>Icon</label><input value={form.icon} onChange={e => setForm({ ...form, icon: e.target.value })} /></div>
                  <div className="field"><label>Daqiqa</label><input type="number" value={form.norm} onChange={e => setForm({ ...form, norm: parseInt(e.target.value) || 0 })} /></div>
                </div>
                <div className="field">
                  <label>Rangi</label>
                  <div className="color-picker">{COLORS.map(c => <div key={c} className={`color-dot ${form.color === c ? 'active' : ''}`} style={{ background: c }} onClick={() => setForm({ ...form, color: c })} />)}</div>
                </div>
                <button className="btn-add-task">{editTaskId ? 'Saqlash' : 'Qo\'shish'}</button>
              </form>
              <div className="task-list-pro">
                <h3 className="section-label">Barcha vazifalar</h3>
                {tasks.map((t, idx) => (
                  <div key={t.id} className="task-item-pro">
                    <div className="ti-icon" style={{ color: t.color }}>{t.icon}</div>
                    <div className="ti-info"><h4>{t.label}</h4><p>{t.norm}m</p></div>
                    <div className="ti-actions">
                      <button className="btn-icon-sm" onClick={() => moveTask(idx, -1)}>▲</button>
                      <button className="btn-icon-sm" onClick={() => moveTask(idx, 1)}>▼</button>
                      <button className="btn-icon-sm" onClick={() => startEdit(t)}>✏️</button>
                      <button className="btn-icon-sm btn-delete" onClick={() => deleteTask(t.id)}>✕</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
