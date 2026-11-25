import { useEffect, useState } from 'react';
import { FileText, Sparkles, LogOut, UploadCloud, BriefcaseBusiness, Trash2, CheckCircle2, AlertCircle } from 'lucide-react';
import api from './api';

export default function App() {
  const [user, setUser] = useState(null);
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [file, setFile] = useState(null);
  const [jobTitle, setJobTitle] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [analyses, setAnalyses] = useState([]);
  const [active, setActive] = useState(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');

  async function loadHistory() {
    const { data } = await api.get('/analyses');
    setAnalyses(data.analyses);
  }

  useEffect(() => {
    if (localStorage.getItem('hs_token')) {
      api.get('/auth/me').then(({ data }) => { setUser(data.user); loadHistory(); })
        .catch(() => localStorage.removeItem('hs_token'));
    }
  }, []);

  async function authenticate(e) {
    e.preventDefault(); setBusy(true); setMessage('');
    try {
      const endpoint = mode === 'login' ? '/auth/login' : '/auth/register';
      const { data } = await api.post(endpoint, form);
      localStorage.setItem('hs_token', data.token); setUser(data.user); await loadHistory();
    } catch (err) { setMessage(err.response?.data?.message || 'Could not authenticate'); }
    finally { setBusy(false); }
  }

  async function analyze(e) {
    e.preventDefault();
    if (!file) return setMessage('Choose a PDF or DOCX resume first.');
    const body = new FormData();
    body.append('resume', file); body.append('jobTitle', jobTitle); body.append('jobDescription', jobDescription);
    setBusy(true); setMessage('Analyzing resume…');
    try {
      const { data } = await api.post('/analyses', body, { headers: { 'Content-Type': 'multipart/form-data' } });
      setActive(data.analysis); await loadHistory();
      setMessage(data.aiEnhanced ? 'Analysis complete with AI feedback.' : 'Analysis complete. Add an LLM API key for richer AI feedback.');
      setFile(null); e.target.reset();
    } catch (err) { setMessage(err.response?.data?.message || 'Analysis failed'); }
    finally { setBusy(false); }
  }

  async function remove(id) {
    if (!confirm('Delete this analysis?')) return;
    await api.delete(`/analyses/${id}`);
    setAnalyses(items => items.filter(x => x.id !== id));
    if (active?.id === id) setActive(null);
  }

  function logout() { localStorage.removeItem('hs_token'); setUser(null); setAnalyses([]); setActive(null); }

  if (!user) return <main className="auth-wrap"><section className="auth-card">
    <div className="brand"><span className="brand-icon"><Sparkles/></span><span>HireSense <b>AI</b></span></div>
    <p className="eyebrow">CAREER INTELLIGENCE WORKSPACE</p><h1>{mode === 'login' ? 'Welcome back' : 'Create your account'}</h1>
    <p className="muted">Analyze your resume against a job description with transparent skill matching.</p>
    <form onSubmit={authenticate} className="stack">
      {mode === 'register' && <label>Full name<input required value={form.name} onChange={e=>setForm({...form,name:e.target.value})}/></label>}
      <label>Email<input type="email" required value={form.email} onChange={e=>setForm({...form,email:e.target.value})}/></label>
      <label>Password<input type="password" minLength="8" required value={form.password} onChange={e=>setForm({...form,password:e.target.value})}/></label>
      {message && <p className="notice error">{message}</p>}
      <button disabled={busy}>{busy ? 'Please wait…' : mode === 'login' ? 'Sign in' : 'Create account'}</button>
    </form>
    <p className="switch">{mode === 'login' ? 'New to HireSense?' : 'Already registered?'} <button className="link" onClick={()=>{setMode(mode==='login'?'register':'login');setMessage('')}}>{mode==='login'?'Create account':'Sign in'}</button></p>
  </section></main>;

  return <div className="app-shell">
    <aside className="sidebar">
      <div className="brand"><span className="brand-icon"><Sparkles/></span><span>HireSense <b>AI</b></span></div>
      <div className="side-label">WORKSPACE</div><div className="nav-active"><FileText size={18}/> Resume analyzer</div>
      <div className="side-bottom"><div className="avatar">{user.name?.[0]?.toUpperCase()}</div><div className="user-meta"><b>{user.name}</b><small>{user.email}</small></div><button className="icon-btn" title="Sign out" onClick={logout}><LogOut size={17}/></button></div>
    </aside>
    <main className="main">
      <header className="topbar"><div><p className="eyebrow">YOUR CAREER, WITH MORE CLARITY</p><h1>Resume analyzer</h1></div><span className="pill"><span className="dot"/> Workspace active</span></header>
      <div className="grid">
        <section className="panel form-panel">
          <div className="panel-heading"><div className="heading-icon"><UploadCloud/></div><div><h2>New analysis</h2><p className="muted">Upload your resume and add the target role.</p></div></div>
          <form onSubmit={analyze} className="stack">
            <label>Resume file <span className="muted">(PDF or DOCX, max 5 MB)</span>
              <input type="file" accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document" required onChange={e=>setFile(e.target.files[0])}/>
            </label>
            {file && <div className="file-chip"><FileText size={16}/>{file.name}</div>}
            <label>Target job title<input value={jobTitle} onChange={e=>setJobTitle(e.target.value)} placeholder="e.g. Software Development Engineer Intern"/></label>
            <label>Job description<textarea rows="9" minLength="30" required value={jobDescription} onChange={e=>setJobDescription(e.target.value)} placeholder="Paste the job responsibilities, requirements and skills here…"/></label>
            <button disabled={busy}>{busy ? 'Analyzing…' : <><Sparkles size={17}/> Analyze my resume</>}</button>
            {message && <p className="notice">{message}</p>}
          </form>
          <p className="fineprint">Your resume is used to generate this analysis. The app stores extracted text and results in your account history. Avoid uploading sensitive information you do not need analyzed.</p>
        </section>
        <section className="panel result-panel">
          <div className="panel-heading"><div className="heading-icon"><BriefcaseBusiness/></div><div><h2>Match insights</h2><p className="muted">Evidence-based skills comparison</p></div></div>
          {!active ? <div className="empty"><div className="empty-icon"><FileText size={28}/></div><h3>Your analysis will appear here</h3><p>Upload a resume and paste a job description to see matched skills, skill gaps and suggestions.</p></div> :
            <div className="results">
              <div className="score-row"><div><span className="eyebrow">SKILL MATCH ESTIMATE</span><div className="score">{active.score}<small>/100</small></div></div><div className="score-ring" style={{'--score':`${active.score}%`}}><span>{active.score}%</span></div></div>
              <h3>{active.jobTitle}</h3><p className="muted">{active.summary}</p>
              <div className="skill-columns">
                <div><h4><CheckCircle2 size={16}/> Matched skills</h4><div className="chips">{active.matchedSkills.length ? active.matchedSkills.map(s=><span className="chip good" key={s}>{s}</span>) : <span className="muted">No recognized matches</span>}</div></div>
                <div><h4><AlertCircle size={16}/> Potential gaps</h4><div className="chips">{active.missingSkills.length ? active.missingSkills.map(s=><span className="chip gap" key={s}>{s}</span>) : <span className="muted">No recognized gaps</span>}</div></div>
              </div>
              <h4>Suggestions</h4><ul className="suggestions">{active.suggestions.map((s,i)=><li key={i}>{s}</li>)}</ul>
              <p className="fineprint">This is a heuristic estimate based on recognized terms, not an actual ATS score or prediction of hiring outcomes.</p>
            </div>}
        </section>
      </div>
      <section className="panel history-panel"><div className="panel-heading"><div><h2>Recent analyses</h2><p className="muted">Your saved resume comparisons</p></div><span className="count">{analyses.length} saved</span></div>
        {analyses.length===0 ? <p className="muted">No analyses yet.</p> : <div className="history-list">{analyses.map(a=><div className="history-item" key={a.id}><button className="history-open" onClick={()=>setActive(a)}><span className="history-score">{a.score}%</span><span><b>{a.jobTitle}</b><small>{a.fileName} · {new Date(a.createdAt).toLocaleDateString()}</small></span></button><button className="icon-btn danger" onClick={()=>remove(a.id)} title="Delete"><Trash2 size={17}/></button></div>)}</div>}
      </section>
      <footer>HireSense AI · A decision-support tool, not a hiring decision system.</footer>
    </main>
  </div>;
}
