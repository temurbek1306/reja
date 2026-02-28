import React, { useState, useEffect, useRef } from 'react';

const DEFAULT_TASKS = [
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

const COLORS = ['#818cf8', '#c084fc', '#f87171', '#fb923c', '#fbbf24', '#34d399', '#38bdf8', '#f472b6', '#e879f9', '#a3e635'];
const BLANK = { icon: '🎯', label: '', norm: 60, color: '#818cf8' };

const MOTIV = [
  "Harakat — bu g'alaba kaliti. Olg'a! 💎",
  "Kichik qadamlar, ulkan natijalar. 🏔️",
  "Tajriba (XP) yig'ish vaqti keldi! 🌱",
  "O'z darajangni ko'tar! 🚀",
  "Har bir daqiqa qimmatli. 🏆",
];

function fmt(m) {
  if (!m || m < 0) return '0m';
  const h = Math.floor(m / 60), min = m % 60;
  return h > 0 ? `${h}s ${min}m` : `${min}m`;
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
  const [tasks, setTasks] = useState(() => JSON.parse(localStorage.getItem('reja_v9_tasks')) || DEFAULT_TASKS);
  const [prog, setProg] = useState(() => JSON.parse(localStorage.getItem('reja_v9_prog')) || {});
  const [xp, setXp] = useState(() => parseInt(localStorage.getItem('reja_v9_xp')) || 0);
  const [history, setHistory] = useState(() => JSON.parse(localStorage.getItem('reja_v9_history')) || []);

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

  const timerRef = useRef(null);

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

  // Sync Timer Logic
  useEffect(() => {
    const update = () => {
      if (timerStartTime) {
        const diff = Math.floor((Date.now() - timerStartTime) / 1000);
        setElapsedSecs(accumulatedSecs + diff);
      } else {
        setElapsedSecs(accumulatedSecs);
      }
    };
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, [timerStartTime, accumulatedSecs]);

  // Handle task change
  useEffect(() => {
    if (cur !== activeTimerTask) {
      if (timerStartTime) {
        // Automatically save if switching task? Or just stop? 
        // Better: Reset UI elapsed but keep background logic tied to activeTimerTask.
        // For simplicity: If we click a new task while another is running, we stop the old one.
        stopTimer(false);
      }
      setElapsedSecs(0);
      setAccumulatedSecs(0);
    }
  }, [cur]);

  function startTimer() {
    setTimerStartTime(Date.now());
    setActiveTimerTask(cur);
  }

  function pauseTimer() {
    if (timerStartTime) {
      const diff = Math.floor((Date.now() - timerStartTime) / 1000);
      setAccumulatedSecs(prev => prev + diff);
      setTimerStartTime(null);
    }
  }

  function stopTimer(save = true) {
    if (save && elapsedSecs > 0 && activeTimerTask) {
      addTime(activeTimerTask, Math.ceil(elapsedSecs / 60));
    }
    setTimerStartTime(null);
    setAccumulatedSecs(0);
    setElapsedSecs(0);
    setActiveTimerTask(null);
  }

  const UZ_MONTHS = ["Yanvar", "Fevral", "Mart", "Aprel", "May", "Iyun", "Iyul", "Avgust", "Sentyabr", "Oktyabr", "Noyabr", "Dekabr"];
  const UZ_DAYS_SHORT = ["Yak", "Dush", "Sesh", "Chor", "Pay", "Juma", "Shan"];

  const year = now.getFullYear();
  const month = now.getMonth();
  const dateNum = now.getDate();
  const day = now.getDay();
  const dateStr = `${year} M${(month + 1).toString().padStart(2, '0')} ${dateNum}, ${UZ_DAYS_SHORT[day]}`;
  const clockStr = now.toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' });
  const motivIdx = Math.floor((now.getMinutes() / 10)) % MOTIV.length;

  const endOfDay = new Date(year, month, dateNum, 23, 59, 59);
  const hoursLeftDay = Math.floor((endOfDay - now) / (1000 * 60 * 60));
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysLeftMonth = daysInMonth - dateNum;
  const endOfYear = new Date(year, 11, 31, 23, 59, 59);
  const daysLeftYear = Math.floor((endOfYear - now) / (1000 * 60 * 60 * 24));
  const daysLeftWeek = day === 0 ? 0 : 7 - day;

  const level = Math.floor(xp / 1000) + 1;
  const currentLevelXp = xp % 1000;
  const levelPct = (currentLevelXp / 1000) * 100;

  const totalNorm = tasks.reduce((s, t) => s + t.norm, 0);
  const totalDone = tasks.reduce((s, t) => s + Math.min(prog[t.id] || 0, t.norm), 0);
  const remaining = totalNorm - totalDone;

  const activeTasks = tasks.filter(t => (prog[t.id] || 0) < t.norm);
  const completedTasks = tasks.filter(t => (prog[t.id] || 0) >= t.norm);
  const isAllDone = activeTasks.length === 0 && tasks.length > 0;

  const selectedTask = tasks.find(t => t.id === cur);
  const selectedProg = selectedTask ? (prog[selectedTask.id] || 0) : 0;
  const selectedPct = selectedTask ? Math.min(100, Math.round((selectedProg / selectedTask.norm) * 100)) : 0;

  useEffect(() => {
    if (selectedTask && (prog[selectedTask.id] || 0) >= selectedTask.norm) {
      if (cur === activeTimerTask) stopTimer(false);
      setTimeout(() => setCur(null), 1500);
    }
  }, [prog, selectedTask]);

  function addTime(id, mins) {
    if (!id) return;
    const task = tasks.find(t => t.id === id);
    if (!task) return;
    setProg(p => {
      const curr = p[id] || 0;
      const addedXP = mins * 10;
      setXp(x => x + addedXP);
      setHistory(h => [...h, { taskId: id, addedMins: mins, addedXP }]);
      return { ...p, [id]: curr + mins };
    });
  }

  function undoLastAction() {
    if (history.length === 0) return;
    const lastAction = history[history.length - 1];
    setProg(p => ({ ...p, [lastAction.taskId]: Math.max(0, (p[lastAction.taskId] || 0) - lastAction.addedMins) }));
    setXp(x => Math.max(0, x - lastAction.addedXP));
    setHistory(h => h.slice(0, -1));
  }

  function resetDay() {
    if (window.confirm("Barcha bugungi natijalar o'chiriladi?")) {
      setProg({}); setCur(null); setHistory([]); setTimerStartTime(null); setAccumulatedSecs(0); setActiveTimerTask(null);
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

  function startEdit(task) {
    setForm({ label: task.label, icon: task.icon, norm: task.norm, color: task.color });
    setEditTaskId(task.id);
    setOpen(true);
  }

  function cancelEdit() { setForm(BLANK); setEditTaskId(null); }

  function moveTask(index, dir) {
    const newIndex = index + dir;
    if (newIndex < 0 || newIndex >= tasks.length) return;
    setTasks(t => {
      const arr = [...t];
      [arr[index], arr[newIndex]] = [arr[newIndex], arr[index]];
      return arr;
    });
  }

  function deleteTask(id) {
    setTasks(t => t.filter(x => x.id !== id));
    if (cur === id) setCur(null);
    if (editTaskId === id) cancelEdit();
  }

  return (
    <>
      <div className="aurora-bg"></div>

      <div className="dashboard-layout">
        <aside className="sidebar root-card">
          <div className="brand">
            <div className="brand-logo">🔹</div>
            <h1>Reja</h1>
          </div>

          <div className="sidebar-group">
            <h5 className="group-title">Profilingiz</h5>
            <div className="level-badge-large">LVL {level}</div>
            <div className="xp-bar-wrap">
              <div className="xp-bar-fill" style={{ width: `${levelPct}%` }} />
            </div>
            <div className="xp-text-large">{currentLevelXp} / 1000 XP</div>
          </div>

          <div className="sidebar-group">
            <h5 className="group-title">Vaqt</h5>
            <div className="sidebar-time">{clockStr}</div>
            <div className="sidebar-date">{dateStr}</div>
            <div className="countdown-mini">
              <div className="cd-item"><span>Kun</span> <span>{hoursLeftDay} soat</span></div>
              <div className="cd-item"><span>Hafta</span> <span>{daysLeftWeek} kun</span></div>
              <div className="cd-item"><span>Oy</span> <span>{daysLeftMonth} kun</span></div>
              <div className="cd-item"><span>Yil</span> <span>{daysLeftYear} kun</span></div>
            </div>
          </div>

          <div className="sidebar-actions">
            <button className="btn-secondary w-100" style={{ padding: '12px', marginBottom: '8px' }} onClick={() => setOpen(true)}>
              ⚙️ Sozlamalar
            </button>
            <button className="btn-undo-full" style={{ marginTop: 0 }} onClick={resetDay}>Kunni tozalash</button>
          </div>
        </aside>

        <main className={`main-content ${activeTab}-active`}>
          <nav className="mobile-nav">
            <button className={activeTab === 'home' ? 'active' : ''} onClick={() => setActiveTab('home')}>
              <span className="nav-icon">🏠</span><span className="nav-label">Asosiy</span>
            </button>
            <button className={activeTab === 'missions' ? 'active' : ''} onClick={() => setActiveTab('missions')}>
              <span className="nav-icon">📁</span><span className="nav-label">Missiyalar</span>
            </button>
            <button className={activeTab === 'stats' ? 'active' : ''} onClick={() => setActiveTab('stats')}>
              <span className="nav-icon">📊</span><span className="nav-label">Statistika</span>
            </button>
            <button className={activeTab === 'settings' ? 'active' : ''} onClick={() => setActiveTab('settings')}>
              <span className="nav-icon">⚙️</span><span className="nav-label">Sozlamalar</span>
            </button>
          </nav>

          {(!isMobile || activeTab === 'home') && (
            <div className="tab-pane">
              <header className="content-header">
                <div className="motiv-plate">{MOTIV[motivIdx]}</div>
                {history.length > 0 && <button className="btn-undo-top" onClick={undoLastAction}>↶ Bekor qilish</button>}
              </header>

              <section className="stats-board">
                {[
                  { label: 'Jami XP', value: xp, cls: 'vivid-purple' },
                  { label: 'Bajarildi', value: fmt(totalDone), cls: 'vivid-green' },
                  { label: 'Qoldi', value: fmt(remaining), cls: 'vivid-blue' },
                  { label: 'Vazifalar', value: `${completedTasks.length}/${tasks.length}`, cls: 'vivid-orange' },
                ].map(s => (
                  <div className="stat-card root-card" key={s.label}>
                    <div className="stat-label">{s.label}</div>
                    <div className={`stat-value ${s.cls}`}>{s.value}</div>
                  </div>
                ))}
              </section>

              {isAllDone ? (
                <div className="day-fin root-card">
                  <span className="trophy">🏆</span>
                  <h2>Kun yopildi!</h2>
                  <p>Barcha normativlar bajarildi.</p>
                  <button className="btn-primary-vivid" onClick={resetDay}>Yangi kunni boshlash</button>
                </div>
              ) : (
                <div className="task-workspace">
                  {selectedTask ? (
                    <div className="active-widget root-card" style={{ '--node-color': selectedTask.color }}>
                      <div className="widget-header">
                        <span className="badge-vivid">
                          {activeTimerTask === selectedTask.id && timerStartTime ? '🔴 Jonli Jarayon' : 'Faol Missiya'}
                        </span>
                        <button className="btn-close-vivid" onClick={() => setCur(null)}>✕</button>
                      </div>
                      <div className="widget-body">
                        <div className="widget-left">
                          <div className="widget-icon-vivid" style={{ color: selectedTask.color }}>{selectedTask.icon}</div>
                          <div className="widget-info">
                            <h2 className="widget-title" style={{ color: selectedTask.color }}>{selectedTask.label}</h2>
                            <div className="widget-prog-text">{fmt(selectedProg)} / {fmt(selectedTask.norm)}</div>
                            <div className="widget-prog-bar-vivid">
                              <div className="widget-prog-fill-vivid" style={{ width: `${selectedPct}%`, background: selectedTask.color }} />
                            </div>
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
                            {elapsedSecs > 0 && (
                              <>
                                <button className="btn-vivid btn-save" onClick={() => stopTimer(true)}>✓ Saqlash</button>
                                <button className="btn-vivid btn-cancel" onClick={() => stopTimer(false)}>✕ Bekor</button>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="empty-widget-vivid">
                      <div className="icon-xl">🎯</div>
                      <h3>Vazifa tanlanmagan</h3>
                      <p>Missiyalar bo'limidan bittasini tanlang.</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {(!isMobile || activeTab === 'missions') && (activeTab === 'missions' || !isMobile) && (
            <div className="tab-pane">
              <h3 className="section-title">Ochiq missiyalar</h3>
              <div className="missions-grid-vivid">
                {activeTasks.filter(t => t.id !== cur).map(task => (
                  <div key={task.id} className="mission-card-vivid" onClick={() => { setCur(task.id); if (isMobile) setActiveTab('home'); }}>
                    <div className="mc-icon-vivid" style={{ color: task.color }}>{task.icon}</div>
                    <div className="mc-info">
                      <h4>{task.label}</h4>
                      <div className="mc-meta">{fmt(prog[task.id] || 0)} / {fmt(task.norm)} <span className="mc-xp">+{task.norm * 10} XP</span></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {(!isMobile || activeTab === 'stats') && (activeTab === 'stats' || !isMobile) && (
            <div className="tab-pane">
              <h3 className="section-title">Statistika</h3>
              <div className="stats-list-vivid">
                {tasks.map(task => (
                  <div key={task.id} className="stat-row-vivid">
                    <div className="sr-icon-vivid">{task.icon}</div>
                    <div className="sr-info">
                      <h4>{task.label}</h4>
                      <div className={`sr-status ${(prog[task.id] || 0) >= task.norm ? 'status-done-vivid' : 'status-pending-vivid'}`}>
                        {(prog[task.id] || 0) >= task.norm ? 'Bajarildi' : `${fmt(prog[task.id] || 0)} / ${fmt(task.norm)}`}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {isMobile && activeTab === 'settings' && (
            <div className="tab-pane">
              <h3 className="section-title">Sozlamalar</h3>
              <button className="btn-vivid btn-secondary w-100" style={{ marginBottom: '12px' }} onClick={() => setOpen(true)}>⚙️ Missiyalarni boshqarish</button>
              <button className="btn-undo-full" onClick={resetDay}>Kunni qayta boshlash</button>
            </div>
          )}
        </main>
      </div>

      {open && (
        <div className="overlay" onClick={() => setOpen(false)}>
          <div className="drawer" onClick={e => e.stopPropagation()}>
            <div className="drawer-header">
              <h2 className="drawer-title">Sozlamalar</h2>
              <button className="drawer-close" onClick={() => setOpen(false)}>✕</button>
            </div>
            <div className="drawer-content">
              <section className="form-section">
                <h5 className="section-label">{editTaskId ? 'Tahrirlash' : 'Yangi qo\'shish'}</h5>
                <div className="form-card">
                  <div className="field">
                    <label>Nomi</label>
                    <input value={form.label} onChange={e => setForm({ ...form, label: e.target.value })} />
                  </div>
                  <div className="form-grid">
                    <div className="field"><label>Icon</label><input value={form.icon} onChange={e => setForm({ ...form, icon: e.target.value })} /></div>
                    <div className="field"><label>Daqiqa</label><input type="number" value={form.norm} onChange={e => setForm({ ...form, norm: Number(e.target.value) })} /></div>
                  </div>
                  <div className="field">
                    <label>Rangi</label>
                    <div className="color-picker">
                      {COLORS.map(c => <div key={c} className={`color-dot ${form.color === c ? 'active' : ''}`} style={{ background: c }} onClick={() => setForm({ ...form, color: c })} />)}
                    </div>
                  </div>
                  <button className="btn-add-task" onClick={addTask}>{editTaskId ? 'Saqlash' : 'Qo\'shish'}</button>
                  {editTaskId && <button className="btn-cancel" onClick={cancelEdit}>Bekor qilish</button>}
                </div>
              </section>

              <section className="form-section">
                <h5 className="section-label">Barcha Missiyalar ({tasks.length})</h5>
                <div className="task-list-pro">
                  {tasks.map((t, idx) => (
                    <div key={t.id} className="task-item-pro">
                      <div className="ti-icon" style={{ color: t.color }}>{t.icon}</div>
                      <div className="ti-info"><h4>{t.label}</h4><p>{t.norm}m</p></div>
                      <div className="ti-actions">
                        <div className="order-controls">
                          <button className="btn-order" onClick={() => moveTask(idx, -1)}>▲</button>
                          <button className="btn-order" onClick={() => moveTask(idx, 1)}>▼</button>
                        </div>
                        <button className="btn-icon-sm" onClick={() => startEdit(t)}>✏️</button>
                        <button className="btn-icon-sm btn-delete" onClick={() => deleteTask(t.id)}>✕</button>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
