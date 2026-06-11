import { useEffect, useMemo, useRef, useState, type CSSProperties, type FormEvent } from 'react';
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
  PenLine,
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

type PageName = 'Dashboard' | 'Lessons' | 'YouTube' | 'Vocabulary' | 'Anki' | 'Review' | 'Journal' | 'Settings';
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
  { label: 'Journal', icon: PenLine },
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

type JournalToken =
  | { kind: 'word'; hanzi: string; pinyin: string[] }
  | { kind: 'punct'; text: string };

type JournalEntry = {
  hanzi: string;
  pinyin: string[];
};

const punctuationMap: Record<string, string> = {
  ',': '\uff0c',
  '.': '\u3002',
  '?': '\uff1f',
  '!': '\uff01',
  ';': '\uff1b',
  ':': '\uff1a',
};

const journalDictionary: Record<string, JournalEntry> = {
  ni: { hanzi: '\u4f60', pinyin: ['n\u01d0'] },
  hao: { hanzi: '\u597d', pinyin: ['h\u01ceo'] },
  wo: { hanzi: '\u6211', pinyin: ['w\u01d2'] },
  yao: { hanzi: '\u8981', pinyin: ['y\u00e0o'] },
  xue: { hanzi: '\u5b66', pinyin: ['xu\u00e9'] },
  xi: { hanzi: '\u4e60', pinyin: ['x\u00ed'] },
  zhong: { hanzi: '\u4e2d', pinyin: ['zh\u014dng'] },
  wen: { hanzi: '\u6587', pinyin: ['w\u00e9n'] },
  yi: { hanzi: '\u4ee5', pinyin: ['y\u01d0'] },
  hou: { hanzi: '\u540e', pinyin: ['h\u00f2u'] },
  xiang: { hanzi: '\u60f3', pinyin: ['xi\u01ceng'] },
  zuo: { hanzi: '\u505a', pinyin: ['zu\u00f2'] },
  shen: { hanzi: '\u4ec0', pinyin: ['sh\u00e9n'] },
  me: { hanzi: '\u4e48', pinyin: ['me'] },
  shi: { hanzi: '\u662f', pinyin: ['sh\u00ec'] },
  ma: { hanzi: '\u5417', pinyin: ['ma'] },
  de: { hanzi: '\u7684', pinyin: ['de'] },
  le: { hanzi: '\u4e86', pinyin: ['le'] },
  zai: { hanzi: '\u5728', pinyin: ['z\u00e0i'] },
  qu: { hanzi: '\u53bb', pinyin: ['q\u00f9'] },
  lai: { hanzi: '\u6765', pinyin: ['l\u00e1i'] },
  kan: { hanzi: '\u770b', pinyin: ['k\u00e0n'] },
  ting: { hanzi: '\u542c', pinyin: ['t\u012bng'] },
  shuo: { hanzi: '\u8bf4', pinyin: ['shu\u014d'] },
  xie: { hanzi: '\u5199', pinyin: ['xi\u011b'] },
  du: { hanzi: '\u8bfb', pinyin: ['d\u00fa'] },
  jintian: { hanzi: '\u4eca\u5929', pinyin: ['j\u012bn', 'ti\u0101n'] },
  mingtian: { hanzi: '\u660e\u5929', pinyin: ['m\u00edng', 'ti\u0101n'] },
  xianzai: { hanzi: '\u73b0\u5728', pinyin: ['xi\u00e0n', 'z\u00e0i'] },
  yi_hou: { hanzi: '\u4ee5\u540e', pinyin: ['y\u01d0', 'h\u00f2u'] },
  shen_me: { hanzi: '\u4ec0\u4e48', pinyin: ['sh\u00e9n', 'me'] },
  xue_xi: { hanzi: '\u5b66\u4e60', pinyin: ['xu\u00e9', 'x\u00ed'] },
  zhong_wen: { hanzi: '\u4e2d\u6587', pinyin: ['zh\u014dng', 'w\u00e9n'] },
  ni_hao: { hanzi: '\u4f60\u597d', pinyin: ['n\u01d0', 'h\u01ceo'] },
  wo_yao: { hanzi: '\u6211\u8981', pinyin: ['w\u01d2', 'y\u00e0o'] },
  xiang_zuo: { hanzi: '\u60f3\u505a', pinyin: ['xi\u01ceng', 'zu\u00f2'] },
  shei: { hanzi: '\u8c01', pinyin: ['sh\u00e9i'] },
  ta: { hanzi: '\u4ed6', pinyin: ['t\u0101'] },
  men: { hanzi: '\u4eec', pinyin: ['men'] },
  women: { hanzi: '\u6211\u4eec', pinyin: ['w\u01d2', 'men'] },
  nimen: { hanzi: '\u4f60\u4eec', pinyin: ['n\u01d0', 'men'] },
  tamen: { hanzi: '\u4ed6\u4eec', pinyin: ['t\u0101', 'men'] },
  bu: { hanzi: '\u4e0d', pinyin: ['b\u00f9'] },
  mei: { hanzi: '\u6ca1', pinyin: ['m\u00e9i'] },
  you: { hanzi: '\u6709', pinyin: ['y\u01d2u'] },
  hen: { hanzi: '\u5f88', pinyin: ['h\u011bn'] },
  dou: { hanzi: '\u90fd', pinyin: ['d\u014du'] },
  ye: { hanzi: '\u4e5f', pinyin: ['y\u011b'] },
  he: { hanzi: '\u548c', pinyin: ['h\u00e9'] },
  gen: { hanzi: '\u8ddf', pinyin: ['g\u0113n'] },
  yinwei: { hanzi: '\u56e0\u4e3a', pinyin: ['y\u012bn', 'w\u00e8i'] },
  suoyi: { hanzi: '\u6240\u4ee5', pinyin: ['su\u01d2', 'y\u01d0'] },
  ruguo: { hanzi: '\u5982\u679c', pinyin: ['r\u00fa', 'gu\u01d2'] },
  danshi: { hanzi: '\u4f46\u662f', pinyin: ['d\u00e0n', 'sh\u00ec'] },
  xihuan: { hanzi: '\u559c\u6b22', pinyin: ['x\u01d0', 'huan'] },
  ai: { hanzi: '\u7231', pinyin: ['\u00e0i'] },
  chi: { hanzi: '\u5403', pinyin: ['ch\u012b'] },
  he_drink: { hanzi: '\u559d', pinyin: ['h\u0113'] },
  mai: { hanzi: '\u4e70', pinyin: ['m\u01cei'] },
  kanjian: { hanzi: '\u770b\u89c1', pinyin: ['k\u00e0n', 'ji\u00e0n'] },
  zhidao: { hanzi: '\u77e5\u9053', pinyin: ['zh\u012b', 'd\u00e0o'] },
  juede: { hanzi: '\u89c9\u5f97', pinyin: ['ju\u00e9', 'de'] },
  hui: { hanzi: '\u4f1a', pinyin: ['hu\u00ec'] },
  neng: { hanzi: '\u80fd', pinyin: ['n\u00e9ng'] },
  keyi: { hanzi: '\u53ef\u4ee5', pinyin: ['k\u011b', 'y\u01d0'] },
  yinggai: { hanzi: '\u5e94\u8be5', pinyin: ['y\u012bng', 'g\u0101i'] },
  laoshi: { hanzi: '\u8001\u5e08', pinyin: ['l\u01ceo', 'sh\u012b'] },
  xuesheng: { hanzi: '\u5b66\u751f', pinyin: ['xu\u00e9', 'sh\u0113ng'] },
  pengyou: { hanzi: '\u670b\u53cb', pinyin: ['p\u00e9ng', 'you'] },
  dian: { hanzi: '\u70b9', pinyin: ['di\u01cen'] },
  qian: { hanzi: '\u94b1', pinyin: ['qi\u00e1n'] },
  shijian: { hanzi: '\u65f6\u95f4', pinyin: ['sh\u00ed', 'ji\u0101n'] },
  mingzi: { hanzi: '\u540d\u5b57', pinyin: ['m\u00edng', 'zi'] },
  zhongguo: { hanzi: '\u4e2d\u56fd', pinyin: ['zh\u014dng', 'gu\u00f3'] },
  meiguo: { hanzi: '\u7f8e\u56fd', pinyin: ['m\u011bi', 'gu\u00f3'] },
  guo: { hanzi: '\u56fd', pinyin: ['gu\u00f3'] },
  zhong_guo: { hanzi: '\u4e2d\u56fd', pinyin: ['zh\u014dng', 'gu\u00f3'] },
  lao_shi: { hanzi: '\u8001\u5e08', pinyin: ['l\u01ceo', 'sh\u012b'] },
  xue_sheng: { hanzi: '\u5b66\u751f', pinyin: ['xu\u00e9', 'sh\u0113ng'] },
  ni_shi: { hanzi: '\u4f60\u662f', pinyin: ['n\u01d0', 'sh\u00ec'] },
  ni_shi_shei: { hanzi: '\u4f60\u662f\u8c01', pinyin: ['n\u01d0', 'sh\u00ec', 'sh\u00e9i'] },
  wo_yao_qu: { hanzi: '\u6211\u8981\u53bb', pinyin: ['w\u01d2', 'y\u00e0o', 'q\u00f9'] },
  qu_zhong_guo: { hanzi: '\u53bb\u4e2d\u56fd', pinyin: ['q\u00f9', 'zh\u014dng', 'gu\u00f3'] },
};

function parseJournalLine(line: string): JournalToken[] {
  const rawTokens = line.match(/[a-zA-Z]+|[0-9]+|[^\s]/g) ?? [];
  const tokens: JournalToken[] = [];

  for (let index = 0; index < rawTokens.length;) {
    const token = rawTokens[index];
    if (/^[a-zA-Z]+$/.test(token)) {
      let entry: JournalEntry | undefined;
      let consumed = 1;
      for (let size = Math.min(4, rawTokens.length - index); size > 0; size -= 1) {
        const slice = rawTokens.slice(index, index + size);
        if (!slice.every((part) => /^[a-zA-Z]+$/.test(part))) continue;
        const key = slice.join('_').toLowerCase();
        if (journalDictionary[key]) {
          entry = journalDictionary[key];
          consumed = size;
          break;
        }
      }

      if (entry) {
        tokens.push({ kind: 'word', hanzi: entry.hanzi, pinyin: entry.pinyin });
      } else {
        tokens.push({ kind: 'word', hanzi: token, pinyin: [token.toLowerCase()] });
      }
      index += consumed;
      continue;
    }

    tokens.push({ kind: 'punct', text: punctuationMap[token] ?? token });
    index += 1;
  }

  return tokens;
}

function parseJournalText(text: string) {
  return text.split(/\r?\n/).map(parseJournalLine);
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
  const [journalText, setJournalText] = useStoredState<string>('ms-journal-text', 'yi hou ni xiang zuo shen me?\nni yi hou xiang zuo shen me?\nyi hou wo yao xue xi zhong wen.\nwo yi hou yao xue xi zhong wen.');
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
        {activeNav === 'Journal' && <JournalPage text={journalText} setText={setJournalText} />}
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

function JournalPage({ text, setText }: { text: string; setText: React.Dispatch<React.SetStateAction<string>> }) {
  const [draft, setDraft] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const parsedLines = useMemo(() => parseJournalText(text), [text]);
  const visibleLines = parsedLines.length ? parsedLines : [[]];
  const commitDraft = (separator: string) => {
    setText((current) => {
      const addition = `${draft.trim()}${separator}`;
      if (!draft.trim()) return separator === '\n' ? `${current}\n` : current;
      return `${current}${addition}`;
    });
    setDraft('');
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === ' ') {
      event.preventDefault();
      commitDraft(' ');
      return;
    }
    if (event.key === 'Enter') {
      event.preventDefault();
      commitDraft('\n');
      return;
    }
    if (punctuationMap[event.key]) {
      event.preventDefault();
      commitDraft(event.key);
      return;
    }
    if (event.key === 'Backspace' && !draft) {
      event.preventDefault();
      setText((current) => current.slice(0, -1));
    }
  };

  return (
    <section className="page-stack journal-page">
      <article className="panel journal-editor-panel">
        <h2>Journal</h2>
        <div className="journal-paper journal-editor" aria-label="Romanized Chinese journal editor" onClick={() => inputRef.current?.focus()}>
          {visibleLines.map((line, lineIndex) => (
            <p className="journal-line" key={`${lineIndex}-${line.length}`}>
              {line.map((token, tokenIndex) => {
                if (token.kind === 'punct') return <span className="journal-punct" key={`${lineIndex}-${tokenIndex}`}>{token.text}</span>;
                return (
                  <span className="journal-word" key={`${lineIndex}-${tokenIndex}`}>
                    {Array.from(token.hanzi).map((char, charIndex) => (
                      <ruby key={`${char}-${charIndex}`}>{char}<rt>{token.pinyin[charIndex] ?? token.pinyin[0]}</rt></ruby>
                    ))}
                  </span>
                );
              })}
              {lineIndex === visibleLines.length - 1 && (
                <input
                  ref={inputRef}
                  className="journal-inline-input"
                  value={draft}
                  onChange={(event) => setDraft(event.target.value.toLowerCase())}
                  onKeyDown={handleKeyDown}
                  autoFocus
                  spellCheck={false}
                  placeholder={text ? '' : 'type ni hao and press space'}
                />
              )}
              {!line.length && lineIndex !== visibleLines.length - 1 && <span className="journal-placeholder">&nbsp;</span>}
            </p>
          ))}
        </div>
        <div className="journal-hints">
          <span>Space converts</span>
          <span>Enter new line</span>
          <span>Backspace removes</span>
        </div>
      </article>
    </section>
  );
}

function SettingsPage({ draft, setDraft, onSave, minutesStudied }: { draft: StudioSettings; setDraft: React.Dispatch<React.SetStateAction<StudioSettings>>; onSave: (event: FormEvent) => void; minutesStudied: number }) {
  return <section className="page-grid two-column"><form className="panel form-panel" onSubmit={onSave}><h2>Study settings</h2><label className="field">Weekly goal<input type="number" min="0" value={draft.goalMinutes} onChange={(event) => setDraft((current) => ({ ...current, goalMinutes: Number(event.target.value) }))} /></label><label className="field">HSK level<select value={draft.hskLevel} onChange={(event) => setDraft((current) => ({ ...current, hskLevel: event.target.value }))}>{['HSK 1', 'HSK 2', 'HSK 3', 'HSK 4', 'HSK 5', 'HSK 6'].map((level) => <option key={level}>{level}</option>)}</select></label><label className="field">Focus<select value={draft.focus} onChange={(event) => setDraft((current) => ({ ...current, focus: event.target.value }))}>{['Speaking', 'Listening', 'Vocabulary', 'Grammar', 'Tones'].map((focus) => <option key={focus}>{focus}</option>)}</select></label><GlassButton type="submit" variant="primary"><Save size={14} /> Save settings</GlassButton></form><article className="panel stat-panel"><h2>Weekly progress</h2><p>{minutesStudied} / {draft.goalMinutes} minutes</p><div className="progress-shell"><div style={{ width: `${Math.min(100, (minutesStudied / Math.max(draft.goalMinutes, 1)) * 100)}%` }} /></div><p>{draft.hskLevel} ? {draft.focus}</p></article></section>;
}

export default App;

