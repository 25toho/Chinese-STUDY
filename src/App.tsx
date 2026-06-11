import { useEffect, useMemo, useState, type CSSProperties, type FormEvent } from 'react';
import {
  Bell,
  BookOpen,
  Check,
  CircleHelp,
  Clapperboard,
  CreditCard,
  Download,
  GraduationCap,
  LayoutDashboard,
  Plus,
  RotateCcw,
  Save,
  Search,
  Settings,
  Sparkles,
  Timer,
  X,
} from 'lucide-react';
import backgroundImage from './assets/bright-landscape.png';

type PageName = 'Dashboard' | 'Lessons' | 'YouTube' | 'Vocabulary' | 'Anki' | 'Review' | 'Settings';
type ActivityStatus = 'Completed' | 'Pending' | 'Ready' | 'Reviewed';

type Lesson = {
  id: string;
  title: string;
  notes: string;
  newWords: string;
  grammar: string;
  mistakes: string;
  minutes: number;
  date: string;
};

type VocabularyItem = {
  id: string;
  hanzi: string;
  pinyin: string;
  meaning: string;
  example: string;
  hsk: string;
  status: 'Needs review' | 'Learned';
  date: string;
};

type YoutubeItem = {
  id: string;
  title: string;
  link: string;
  status: 'Not reviewed' | 'Reviewed';
  date: string;
};

type AnkiCard = {
  id: string;
  front: string;
  back: string;
  sourceId: string;
};

type Activity = {
  id: string;
  topic: string;
  type: string;
  status: ActivityStatus;
  date: string;
};

type StudioSettings = {
  goalMinutes: number;
  hskLevel: string;
  focus: string;
};

type LessonForm = Omit<Lesson, 'id' | 'date'>;
type VocabForm = Omit<VocabularyItem, 'id' | 'status' | 'date'>;

type YoutubeForm = Pick<YoutubeItem, 'title' | 'link'>;

const today = '2026-06-11';

const navigation: { label: PageName; icon: typeof LayoutDashboard }[] = [
  { label: 'Dashboard', icon: LayoutDashboard },
  { label: 'Lessons', icon: BookOpen },
  { label: 'YouTube', icon: Clapperboard },
  { label: 'Vocabulary', icon: GraduationCap },
  { label: 'Anki', icon: CreditCard },
  { label: 'Review', icon: RotateCcw },
  { label: 'Settings', icon: Settings },
];

const initialLessons: Lesson[] = [
  {
    id: 'lesson-4321',
    title: 'Shopping & Prices',
    notes: 'Practiced buying fruit and asking for discounts.',
    newWords: '\u591a\u5c11\u94b1, \u4fbf\u5b9c\u4e00\u70b9, \u82f9\u679c, \u4e00\u5171',
    grammar: 'Measure words with kuai and ge',
    mistakes: 'Numbers above 100, tone change in yi',
    minutes: 45,
    date: '2026-06-11',
  },
  {
    id: 'lesson-4319',
    title: 'Travel words',
    notes: 'Reviewed airport and hotel phrases.',
    newWords: '\u673a\u573a, \u62a4\u7167, \u9152\u5e97, \u51fa\u79df\u8f66',
    grammar: 'Using yao to request something',
    mistakes: '',
    minutes: 35,
    date: '2026-06-10',
  },
];

const initialVocabulary: VocabularyItem[] = [
  {
    id: 'vocab-1',
    hanzi: '\u4fbf\u5b9c',
    pinyin: 'pianyi',
    meaning: 'cheap; inexpensive',
    example: '\u8fd9\u4e2a\u82f9\u679c\u5f88\u4fbf\u5b9c\u3002',
    hsk: 'HSK 2',
    status: 'Needs review',
    date: '2026-06-11',
  },
  {
    id: 'vocab-2',
    hanzi: '\u673a\u573a',
    pinyin: 'jichang',
    meaning: 'airport',
    example: '\u6211\u660e\u5929\u53bb\u673a\u573a\u3002',
    hsk: 'HSK 2',
    status: 'Learned',
    date: '2026-06-10',
  },
];

const initialYoutube: YoutubeItem[] = [
  {
    id: 'yt-1',
    title: 'Third tone practice',
    link: 'Mandarin tone drill session',
    status: 'Not reviewed',
    date: '2026-06-10',
  },
];

const initialActivities: Activity[] = [
  { id: '#MS4321', topic: 'Shopping & Prices', type: 'Lesson', status: 'Completed', date: '2026-06-11' },
  { id: '#MS4320', topic: 'Third tone practice', type: 'Review', status: 'Pending', date: '2026-06-10' },
  { id: '#MS4319', topic: 'Travel words', type: 'Vocabulary', status: 'Completed', date: '2026-06-10' },
  { id: '#MS4318', topic: 'HSK 2 cards', type: 'Anki', status: 'Ready', date: '2026-06-09' },
];

const defaultSettings: StudioSettings = {
  goalMinutes: 420,
  hskLevel: 'HSK 2',
  focus: 'Vocabulary',
};

function isPageName(value: string): value is PageName {
  return navigation.some((item) => item.label === value);
}

function getInitialPage(): PageName {
  const hash = decodeURIComponent(window.location.hash.replace('#', ''));
  return isPageName(hash) ? hash : 'Dashboard';
}

const emptyLessonForm: LessonForm = {
  title: '',
  notes: '',
  newWords: '',
  grammar: '',
  mistakes: '',
  minutes: 25,
};

const emptyVocabForm: VocabForm = {
  hanzi: '',
  pinyin: '',
  meaning: '',
  example: '',
  hsk: 'HSK 2',
};

const emptyYoutubeForm: YoutubeForm = {
  title: '',
  link: '',
};

function useStoredState<T>(key: string, fallback: T) {
  const [value, setValue] = useState<T>(() => {
    const stored = window.localStorage.getItem(key);
    if (!stored) return fallback;
    try {
      return JSON.parse(stored) as T;
    } catch {
      return fallback;
    }
  });

  useEffect(() => {
    window.localStorage.setItem(key, JSON.stringify(value));
  }, [key, value]);

  return [value, setValue] as const;
}

function createId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function createActivity(topic: string, type: string, status: ActivityStatus): Activity {
  return {
    id: `#MS${Math.floor(4300 + Math.random() * 600)}`,
    topic,
    type,
    status,
    date: today,
  };
}

function countWords(text: string) {
  return text
    .split(/[,\s]+/)
    .map((word) => word.trim())
    .filter(Boolean).length;
}

function StatusPill({ status }: { status: string }) {
  return <span className={`status ${status.toLowerCase().replace(/\s+/g, '-')}`}>{status}</span>;
}

function GlassButton({ children, onClick, type = 'button', variant = 'default' }: {
  children: React.ReactNode;
  onClick?: () => void;
  type?: 'button' | 'submit';
  variant?: 'default' | 'primary' | 'quiet';
}) {
  return (
    <button className={`glass-button ${variant}`} onClick={onClick} type={type}>
      {children}
    </button>
  );
}

function EmptyState({ title, action }: { title: string; action?: React.ReactNode }) {
  return (
    <div className="empty-state">
      <Sparkles size={18} />
      <p>{title}</p>
      {action}
    </div>
  );
}

function StudyChart({ minutes }: { minutes: number[] }) {
  const points = minutes.length ? minutes : [35, 52, 42, 72, 60, 84, 88];
  const coords = points.map((value, index) => {
    const x = 58 + index * (677 / Math.max(points.length - 1, 1));
    const y = 252 - ((value - 30) / 60) * 216;
    return [x, Math.max(36, Math.min(252, y))] as const;
  });
  const line = coords.map(([x, y], index) => `${index === 0 ? 'M' : 'L'}${x.toFixed(1)} ${y.toFixed(1)}`).join(' ');
  const area = `${line} L735 252 L58 252 Z`;

  return (
    <svg viewBox="0 0 760 286" role="img" aria-label="Mock study minutes line chart">
      <defs>
        <linearGradient id="studyFill" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="#5d63ff" stopOpacity="0.46" />
          <stop offset="68%" stopColor="#8c4fff" stopOpacity="0.16" />
          <stop offset="100%" stopColor="#06182b" stopOpacity="0" />
        </linearGradient>
        <filter id="lineGlow" x="-20%" y="-80%" width="140%" height="260%">
          <feGaussianBlur stdDeviation="4" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      <g className="chart-grid">{[36, 72, 108, 144, 180, 216, 252].map((y) => <line key={y} x1="58" y1={y} x2="735" y2={y} />)}</g>
      <g className="chart-labels">
        {['90', '80', '70', '60', '50', '40', '30'].map((label, index) => <text key={label} x="14" y={40 + index * 36}>{label}</text>)}
        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((label, index) => <text key={label} x={58 + index * 112} y="279">{label}</text>)}
      </g>
      <path className="chart-area" d={area} />
      <path className="chart-line" d={line} />
    </svg>
  );
}

function LessonModal({ open, onClose, onSave }: { open: boolean; onClose: () => void; onSave: (lesson: LessonForm) => void }) {
  const [form, setForm] = useState<LessonForm>(emptyLessonForm);

  useEffect(() => {
    if (open) setForm(emptyLessonForm);
  }, [open]);

  if (!open) return null;

  const update = (field: keyof LessonForm, value: string | number) => setForm((current) => ({ ...current, [field]: value }));

  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (!form.title.trim()) return;
    onSave({ ...form, minutes: Number(form.minutes) || 0 });
    onClose();
  };

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true">
      <form className="modal-card" onSubmit={submit}>
        <div className="modal-header">
          <div>
            <p className="eyebrow">Lesson note</p>
            <h2>Add note</h2>
          </div>
          <button className="icon-close" type="button" onClick={onClose} aria-label="Close"><X size={16} /></button>
        </div>
        <div className="form-grid">
          <label className="field full">Lesson title<input value={form.title} onChange={(event) => update('title', event.target.value)} placeholder="Shopping & Prices" /></label>
          <label className="field full">Notes<textarea value={form.notes} onChange={(event) => update('notes', event.target.value)} placeholder="Key notes from this session" /></label>
          <label className="field">New words<input value={form.newWords} onChange={(event) => update('newWords', event.target.value)} placeholder="duoshao qian, pianyi" /></label>
          <label className="field">Grammar points<input value={form.grammar} onChange={(event) => update('grammar', event.target.value)} placeholder="Measure words" /></label>
          <label className="field full">Mistakes / weak areas<input value={form.mistakes} onChange={(event) => update('mistakes', event.target.value)} placeholder="Tones, numbers, word order" /></label>
          <label className="field">Minutes studied<input type="number" min="0" value={form.minutes} onChange={(event) => update('minutes', event.target.value)} /></label>
        </div>
        <div className="modal-actions">
          <GlassButton onClick={onClose} variant="quiet">Cancel</GlassButton>
          <GlassButton type="submit" variant="primary"><Save size={14} /> Save note</GlassButton>
        </div>
      </form>
    </div>
  );
}

function App() {
  const [activeNav, setActiveNav] = useState<PageName>(getInitialPage);
  const [searchQuery, setSearchQuery] = useState('');
  const [lessonModalOpen, setLessonModalOpen] = useState(false);
  const [lessons, setLessons] = useStoredState<Lesson[]>('ms-lessons', initialLessons);
  const [vocabulary, setVocabulary] = useStoredState<VocabularyItem[]>('ms-vocabulary', initialVocabulary);
  const [youtubeItems, setYoutubeItems] = useStoredState<YoutubeItem[]>('ms-youtube', initialYoutube);
  const [ankiCards, setAnkiCards] = useStoredState<AnkiCard[]>('ms-anki', []);
  const [activities, setActivities] = useStoredState<Activity[]>('ms-activities', initialActivities);
  const [settings, setSettings] = useStoredState<StudioSettings>('ms-settings', defaultSettings);
  const [vocabForm, setVocabForm] = useState<VocabForm>(emptyVocabForm);
  const [youtubeForm, setYoutubeForm] = useState<YoutubeForm>(emptyYoutubeForm);
  const [settingsDraft, setSettingsDraft] = useState<StudioSettings>(settings);

  useEffect(() => setSettingsDraft(settings), [settings]);

  useEffect(() => {
    const syncHash = () => {
      const hash = decodeURIComponent(window.location.hash.replace('#', ''));
      if (isPageName(hash)) setActiveNav(hash);
    };
    window.addEventListener('hashchange', syncHash);
    return () => window.removeEventListener('hashchange', syncHash);
  }, []);

  const selectNav = (page: PageName) => {
    setActiveNav(page);
    window.history.replaceState(null, '', `#${page}`);
  };

  const lessonWordCount = lessons.reduce((total, lesson) => total + countWords(lesson.newWords), 0);
  const minutesStudied = lessons.reduce((total, lesson) => total + lesson.minutes, 0);
  const weeklyMinutes = [35, 52, 42, 72, 60, Math.max(65, Math.round(minutesStudied / 5)), Math.max(70, Math.round(minutesStudied / 4))];
  const weakAreas = lessons
    .flatMap((lesson) => lesson.mistakes.split(/[,]/).map((item) => item.trim()).filter(Boolean).map((item) => ({ id: `${lesson.id}-${item}`, label: item, source: lesson.title })));
  const needsReview = vocabulary.filter((item) => item.status === 'Needs review');
  const filteredActivities = activities.filter((activity) => [activity.topic, activity.type, activity.status].join(' ').toLowerCase().includes(searchQuery.toLowerCase()));
  const filteredVocabulary = vocabulary.filter((item) => [item.hanzi, item.pinyin, item.meaning, item.example, item.hsk].join(' ').toLowerCase().includes(searchQuery.toLowerCase()));
  const filteredLessons = lessons.filter((lesson) => [lesson.title, lesson.notes, lesson.newWords, lesson.grammar, lesson.mistakes].join(' ').toLowerCase().includes(searchQuery.toLowerCase()));
  const filteredYoutube = youtubeItems.filter((item) => [item.title, item.link, item.status].join(' ').toLowerCase().includes(searchQuery.toLowerCase()));

  const sourceDistribution = useMemo(() => ({
    lessons: Math.max(1, lessons.length),
    vocabulary: Math.max(1, vocabulary.length),
    anki: Math.max(1, ankiCards.length || Math.ceil(vocabulary.length / 2)),
    review: Math.max(1, needsReview.length + weakAreas.length),
  }), [ankiCards.length, lessons.length, needsReview.length, vocabulary.length, weakAreas.length]);

  const totalSources = sourceDistribution.lessons + sourceDistribution.vocabulary + sourceDistribution.anki + sourceDistribution.review;
  const firstStop = (sourceDistribution.lessons / totalSources) * 360;
  const secondStop = firstStop + (sourceDistribution.vocabulary / totalSources) * 360;
  const thirdStop = secondStop + (sourceDistribution.anki / totalSources) * 360;
  const donutStyle = {
    '--lessons-stop': `${firstStop}deg`,
    '--vocab-stop': `${secondStop}deg`,
    '--anki-stop': `${thirdStop}deg`,
  } as CSSProperties;

  const kpis = [
    { label: 'Lessons this week', value: lessons.length.toString(), icon: BookOpen, tone: 'green' },
    { label: 'New words', value: (vocabulary.length + lessonWordCount).toString(), icon: Sparkles, tone: 'blue' },
    { label: 'Anki cards', value: ankiCards.length.toString(), icon: CreditCard, tone: 'purple' },
    { label: 'Minutes studied', value: minutesStudied.toString(), icon: Timer, tone: 'yellow' },
  ];

  const addActivity = (activity: Activity) => setActivities((current) => [activity, ...current].slice(0, 12));

  const saveLesson = (lessonForm: LessonForm) => {
    const lesson: Lesson = { ...lessonForm, id: createId('lesson'), date: today };
    setLessons((current) => [lesson, ...current]);
    addActivity(createActivity(lesson.title, 'Lesson', 'Completed'));
  };

  const saveVocabulary = (event: FormEvent) => {
    event.preventDefault();
    if (!vocabForm.hanzi.trim() || !vocabForm.meaning.trim()) return;
    const item: VocabularyItem = { ...vocabForm, id: createId('vocab'), status: 'Needs review', date: today };
    setVocabulary((current) => [item, ...current]);
    setVocabForm(emptyVocabForm);
    addActivity(createActivity(item.hanzi, 'Vocabulary', 'Pending'));
  };

  const saveYoutube = (event: FormEvent) => {
    event.preventDefault();
    if (!youtubeForm.title.trim() && !youtubeForm.link.trim()) return;
    const item: YoutubeItem = {
      id: createId('youtube'),
      title: youtubeForm.title || youtubeForm.link,
      link: youtubeForm.link,
      status: 'Not reviewed',
      date: today,
    };
    setYoutubeItems((current) => [item, ...current]);
    setYoutubeForm(emptyYoutubeForm);
    addActivity(createActivity(item.title, 'YouTube', 'Pending'));
  };

  const generateAnkiCards = () => {
    const generated = vocabulary.map((item) => ({
      id: `anki-${item.id}`,
      sourceId: item.id,
      front: item.hanzi,
      back: `${item.pinyin} - ${item.meaning}\n${item.example}`,
    }));
    setAnkiCards(generated);
    addActivity(createActivity('Generated Anki deck', 'Anki', 'Ready'));
  };

  const exportDeck = () => {
    const csv = ankiCards.map((card) => `"${card.front}","${card.back.replace(/"/g, '""')}"`).join('\n');
    window.localStorage.setItem('ms-mock-anki-export', csv);
    addActivity(createActivity('Mock deck export', 'Anki', 'Completed'));
  };

  const markVocabulary = (id: string, status: VocabularyItem['status']) => {
    setVocabulary((current) => current.map((item) => item.id === id ? { ...item, status } : item));
    if (status === 'Learned') addActivity(createActivity('Vocabulary review completed', 'Review', 'Reviewed'));
  };

  const markYoutubeReviewed = (id: string) => {
    const item = youtubeItems.find((entry) => entry.id === id);
    setYoutubeItems((current) => current.map((entry) => entry.id === id ? { ...entry, status: 'Reviewed' } : entry));
    if (item) addActivity(createActivity(item.title, 'YouTube', 'Reviewed'));
  };

  const saveSettings = (event: FormEvent) => {
    event.preventDefault();
    setSettings({ ...settingsDraft, goalMinutes: Number(settingsDraft.goalMinutes) || 0 });
    addActivity(createActivity('Settings updated', 'Settings', 'Completed'));
  };

  const appStyle = { '--bg-image': `url(${backgroundImage})` } as CSSProperties;

  return (
    <main className="studio-app" style={appStyle}>
      <aside className="sidebar glass-sidebar" aria-label="Main navigation">
        <div className="brand">Mandarin Studio</div>
        <nav className="nav-list">
          {navigation.map((item) => {
            const Icon = item.icon;
            return (
              <button className={`nav-item ${activeNav === item.label ? 'active' : ''}`} key={item.label} type="button" onClick={() => selectNav(item.label)}>
                <Icon size={14} strokeWidth={2.5} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
        <div className="support-card">
          <div className="support-icon"><CircleHelp size={19} strokeWidth={3} /></div>
          <div><p>Help</p><span>Support</span></div>
        </div>
      </aside>

      <section className="dashboard" aria-label="Mandarin Studio app">
        <header className="topbar">
          <div>
            <p className="eyebrow">Mandarin Studio</p>
            <h1>{activeNav === 'Dashboard' ? 'Welcome back' : activeNav}</h1>
            <span>{activeNav === 'Dashboard' ? `${minutesStudied} / ${settings.goalMinutes} min weekly / ${settings.focus}` : `${activeNav} workspace`}</span>
          </div>
          <div className="header-actions">
            <label className="search-box">
              <Search size={13} />
              <input type="search" value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} placeholder="Search lessons, words, grammar..." />
            </label>
            <button className="round-button" aria-label="Notifications"><Bell size={13} /></button>
            <div className="avatar" aria-label="Mandarin Studio profile">MS</div>
          </div>
        </header>

        {activeNav === 'Dashboard' && (
          <>
            <section className="kpi-grid" aria-label="Study metrics">
              {kpis.map((kpi) => {
                const Icon = kpi.icon;
                return <article className="kpi-card" key={kpi.label}><span className={`kpi-icon ${kpi.tone}`}><Icon size={18} strokeWidth={2.5} /></span><div><p>{kpi.label}</p><strong>{kpi.value}</strong></div></article>;
              })}
            </section>
            <section className="analytics-row">
              <article className="panel chart-panel"><h2>Study Overview</h2><div className="chart-wrap"><StudyChart minutes={weeklyMinutes} /></div></article>
              <article className="panel sources-panel"><h2>Study Sources</h2><div className="donut" style={donutStyle} aria-label="Mock study sources donut chart" /><div className="legend"><span><i className="lessons" />Lessons</span><span><i className="vocab" />Vocabulary</span><span><i className="anki" />Anki</span><span><i className="review" />Review</span></div></article>
            </section>
            <section className="panel activity-panel"><h2>Recent Study Activity</h2><ActivityTable activities={filteredActivities} /></section>
          </>
        )}

        {activeNav === 'Lessons' && <LessonsPage lessons={filteredLessons} onAdd={() => setLessonModalOpen(true)} />}
        {activeNav === 'YouTube' && <YoutubePage items={filteredYoutube} form={youtubeForm} setForm={setYoutubeForm} onSave={saveYoutube} onReviewed={markYoutubeReviewed} />}
        {activeNav === 'Vocabulary' && <VocabularyPage items={filteredVocabulary} form={vocabForm} setForm={setVocabForm} onSave={saveVocabulary} onMark={markVocabulary} />}
        {activeNav === 'Anki' && <AnkiPage cards={ankiCards} vocabularyCount={vocabulary.length} onGenerate={generateAnkiCards} onExport={exportDeck} />}
        {activeNav === 'Review' && <ReviewPage weakAreas={weakAreas} needsReview={needsReview} onReviewed={(id) => markVocabulary(id, 'Learned')} onComplete={() => addActivity(createActivity('Weekly review checklist', 'Review', 'Completed'))} />}
        {activeNav === 'Settings' && <SettingsPage draft={settingsDraft} setDraft={setSettingsDraft} onSave={saveSettings} minutesStudied={minutesStudied} />}
      </section>

      <LessonModal open={lessonModalOpen} onClose={() => setLessonModalOpen(false)} onSave={saveLesson} />
    </main>
  );
}

function ActivityTable({ activities }: { activities: Activity[] }) {
  if (!activities.length) return <EmptyState title="No matching activity." />;
  return (
    <table>
      <thead><tr><th>Lesson / Topic</th><th>Type</th><th>Status</th><th>Date</th></tr></thead>
      <tbody>{activities.map((activity) => <tr key={`${activity.id}-${activity.topic}`}><td>{activity.topic}</td><td>{activity.type}</td><td><StatusPill status={activity.status} /></td><td>{activity.date}</td></tr>)}</tbody>
    </table>
  );
}

function LessonsPage({ lessons, onAdd }: { lessons: Lesson[]; onAdd: () => void }) {
  return (
    <section className="page-stack">
      <div className="page-actions"><GlassButton onClick={onAdd} variant="primary"><Plus size={14} /> Add lesson note</GlassButton></div>
      {lessons.length ? <div className="glass-list">{lessons.map((lesson) => <article className="panel list-card" key={lesson.id}><div><h2>{lesson.title}</h2><p>{lesson.notes}</p></div><div className="meta-grid"><span>{lesson.minutes} min</span><span>{lesson.date}</span><span>{lesson.grammar || 'Grammar notes'}</span></div><p className="soft-line">{lesson.newWords || 'No new words'}</p>{lesson.mistakes && <StatusPill status="Needs review" />}</article>)}</div> : <EmptyState title="No notes yet." action={<GlassButton onClick={onAdd}><Plus size={14} /> Add note</GlassButton>} />}
    </section>
  );
}

function YoutubePage({ items, form, setForm, onSave, onReviewed }: { items: YoutubeItem[]; form: YoutubeForm; setForm: React.Dispatch<React.SetStateAction<YoutubeForm>>; onSave: (event: FormEvent) => void; onReviewed: (id: string) => void }) {
  return (
    <section className="page-grid two-column">
      <form className="panel form-panel" onSubmit={onSave}><h2>Add YouTube material</h2><label className="field">Lesson title<input value={form.title} onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))} placeholder="Tone listening" /></label><label className="field">YouTube link or note<input value={form.link} onChange={(event) => setForm((current) => ({ ...current, link: event.target.value }))} placeholder="Link or title" /></label><GlassButton type="submit" variant="primary"><Plus size={14} /> Save material</GlassButton></form>
      <div className="glass-list">{items.length ? items.map((item) => <article className="panel list-card" key={item.id}><h2>{item.title}</h2><p>{item.link}</p><div className="split-row"><StatusPill status={item.status} />{item.status !== 'Reviewed' && <GlassButton onClick={() => onReviewed(item.id)}><Check size={14} /> Mark reviewed</GlassButton>}</div></article>) : <EmptyState title="No materials yet." />}</div>
    </section>
  );
}

function VocabularyPage({ items, form, setForm, onSave, onMark }: { items: VocabularyItem[]; form: VocabForm; setForm: React.Dispatch<React.SetStateAction<VocabForm>>; onSave: (event: FormEvent) => void; onMark: (id: string, status: VocabularyItem['status']) => void }) {
  const update = (field: keyof VocabForm, value: string) => setForm((current) => ({ ...current, [field]: value }));
  return (
    <section className="page-grid two-column wide-left">
      <form className="panel form-panel" onSubmit={onSave}><h2>Add vocabulary</h2><div className="form-grid"><label className="field">Hanzi<input value={form.hanzi} onChange={(event) => update('hanzi', event.target.value)} placeholder="hanzi" /></label><label className="field">Pinyin<input value={form.pinyin} onChange={(event) => update('pinyin', event.target.value)} placeholder="pianyi" /></label><label className="field full">English meaning<input value={form.meaning} onChange={(event) => update('meaning', event.target.value)} placeholder="cheap; inexpensive" /></label><label className="field full">Example sentence<input value={form.example} onChange={(event) => update('example', event.target.value)} placeholder="Example sentence" /></label><label className="field">HSK level<select value={form.hsk} onChange={(event) => update('hsk', event.target.value)}><option>HSK 1</option><option>HSK 2</option><option>HSK 3</option><option>HSK 4</option><option>HSK 5</option></select></label></div><GlassButton type="submit" variant="primary"><Plus size={14} /> Add word</GlassButton></form>
      <div className="panel table-panel"><h2>Vocabulary</h2>{items.length ? <table><thead><tr><th>Hanzi</th><th>Pinyin</th><th>Meaning</th><th>Status</th><th>Action</th></tr></thead><tbody>{items.map((item) => <tr key={item.id}><td>{item.hanzi}</td><td>{item.pinyin}</td><td>{item.meaning}</td><td><StatusPill status={item.status} /></td><td><GlassButton onClick={() => onMark(item.id, item.status === 'Learned' ? 'Needs review' : 'Learned')}>{item.status === 'Learned' ? 'Review' : 'Learned'}</GlassButton></td></tr>)}</tbody></table> : <EmptyState title="No vocabulary yet." />}</div>
    </section>
  );
}

function AnkiPage({ cards, vocabularyCount, onGenerate, onExport }: { cards: AnkiCard[]; vocabularyCount: number; onGenerate: () => void; onExport: () => void }) {
  return <section className="page-stack"><div className="page-actions"><GlassButton onClick={onGenerate} variant="primary"><CreditCard size={14} /> Generate Anki cards</GlassButton><GlassButton onClick={onExport}><Download size={14} /> Export mock deck</GlassButton></div><article className="panel stat-panel"><h2>{cards.length} cards ready</h2><p>{vocabularyCount} words available.</p></article>{cards.length ? <div className="card-grid">{cards.map((card) => <article className="panel anki-card" key={card.id}><h2>{card.front}</h2><p>{card.back}</p></article>)}</div> : <EmptyState title="No cards yet." />}</section>;
}

function ReviewPage({ weakAreas, needsReview, onReviewed, onComplete }: { weakAreas: { id: string; label: string; source: string }[]; needsReview: VocabularyItem[]; onReviewed: (id: string) => void; onComplete: () => void }) {
  return <section className="page-grid two-column"><div className="panel table-panel"><h2>Weak areas</h2>{weakAreas.length ? <div className="glass-list compact">{weakAreas.map((area) => <article className="mini-card" key={area.id}><strong>{area.label}</strong><span>{area.source}</span></article>)}</div> : <EmptyState title="No weak areas." />}</div><div className="panel table-panel"><h2>Needs review</h2>{needsReview.length ? <div className="glass-list compact">{needsReview.map((item) => <article className="mini-card" key={item.id}><strong>{item.hanzi} - {item.meaning}</strong><span>{item.pinyin}</span><GlassButton onClick={() => onReviewed(item.id)}><Check size={14} /> Mark reviewed</GlassButton></article>)}</div> : <EmptyState title="Nothing to review." />}<div className="checklist"><h2>Weekly checklist</h2>{['Tone shadowing', 'Vocabulary recall', 'Grammar correction'].map((item) => <label className="check-row" key={item}><input type="checkbox" />{item}</label>)}<GlassButton onClick={onComplete} variant="primary"><Check size={14} /> Complete review</GlassButton></div></div></section>;
}

function SettingsPage({ draft, setDraft, onSave, minutesStudied }: { draft: StudioSettings; setDraft: React.Dispatch<React.SetStateAction<StudioSettings>>; onSave: (event: FormEvent) => void; minutesStudied: number }) {
  return <section className="page-grid two-column"><form className="panel form-panel" onSubmit={onSave}><h2>Study settings</h2><label className="field">Weekly goal<input type="number" min="0" value={draft.goalMinutes} onChange={(event) => setDraft((current) => ({ ...current, goalMinutes: Number(event.target.value) }))} /></label><label className="field">HSK level<select value={draft.hskLevel} onChange={(event) => setDraft((current) => ({ ...current, hskLevel: event.target.value }))}>{['HSK 1', 'HSK 2', 'HSK 3', 'HSK 4', 'HSK 5', 'HSK 6'].map((level) => <option key={level}>{level}</option>)}</select></label><label className="field">Focus<select value={draft.focus} onChange={(event) => setDraft((current) => ({ ...current, focus: event.target.value }))}>{['Speaking', 'Listening', 'Vocabulary', 'Grammar', 'Tones'].map((focus) => <option key={focus}>{focus}</option>)}</select></label><GlassButton type="submit" variant="primary"><Save size={14} /> Save settings</GlassButton></form><article className="panel stat-panel"><h2>Weekly progress</h2><p>{minutesStudied} / {draft.goalMinutes} minutes</p><div className="progress-shell"><div style={{ width: `${Math.min(100, (minutesStudied / Math.max(draft.goalMinutes, 1)) * 100)}%` }} /></div><p>{draft.hskLevel} ? {draft.focus}</p></article></section>;
}

export default App;
