import React, { useState, useEffect, useRef } from 'react';
import { 
  Scale, Briefcase, Calendar, Bell, ChevronRight, FileText, 
  MapPin, Clock, LogOut, CheckCircle, ShieldAlert, User,
  MessageSquare, Plus, Trash2, Send, Sparkles, RefreshCw, Copy, Menu, X
} from 'lucide-react';

export default function ClientDashboard({ user, onLogout }) {
  const [cases, setCases] = useState([]);
  const [hearings, setHearings] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [activeCase, setActiveCase] = useState(null);
  const [caseDetails, setCaseDetails] = useState(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const [loading, setLoading] = useState(true);

  // AI Assistant state
  const [aiConvos, setAiConvos] = useState([]);
  const [activeConvoId, setActiveConvoId] = useState(null);
  const [aiMessages, setAiMessages] = useState([]);
  const [userInput, setUserInput] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const chatEndRef = useRef(null);

  // Suggested questions
  const suggestedQuestions = [
    "Can I file for divorce due to malicious desertion?",
    "What are the legal requirements for constructive malicious desertion?",
    "Which Act applies if the spouse committed adultery?",
    "What case law discusses malicious desertion ?"
  ];

  // Profile States
  const [viewMode, setViewMode] = useState('dashboard'); // dashboard, profile
  const [profileEmail, setProfileEmail] = useState(user.email || '');
  const [profilePhone, setProfilePhone] = useState('');
  const [profilePassword, setProfilePassword] = useState('');
  const [profileSuccess, setProfileSuccess] = useState('');
  const [profileError, setProfileError] = useState('');
  const [updatingProfile, setUpdatingProfile] = useState(false);

  useEffect(() => {
    fetchInitialData();
    fetchUserProfile();
    fetchConversations();
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [aiMessages]);

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      const authHeader = { 'Authorization': `Bearer ${localStorage.getItem('courtx_token')}` };
      
      // Fetch Client's cases
      const caseRes = await fetch('http://127.0.0.1:5001/api/cases', { headers: authHeader });
      const caseData = await caseRes.json();
      
      if (caseRes.ok && caseData.length > 0) {
        setCases(caseData);
        const selected = caseData[0];
        setActiveCase(selected);
        
        // Fetch detailed case view (documents, history)
        const detailRes = await fetch(`http://127.0.0.1:5001/api/cases/${selected.id}`, { headers: authHeader });
        const detailData = await detailRes.json();
        if (detailRes.ok) setCaseDetails(detailData);
      }

      // Fetch Client's hearings
      const hearingRes = await fetch('http://127.0.0.1:5001/api/hearings', { headers: authHeader });
      const hearingData = await hearingRes.json();
      if (hearingRes.ok) setHearings(hearingData);

      // Get client's notification
      const notifRes = await fetch('http://127.0.0.1:5001/api/notifications', { headers: authHeader });
      const notifData = await notifRes.json();
      if (notifRes.ok) setNotifications(notifData);

    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchConversations = async () => {
    try {
      const response = await fetch('http://127.0.0.1:5001/api/ai/conversations', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('courtx_token')}` }
      });
      const data = await response.json();
      if (response.ok) {
        setAiConvos(data);
        if (data.length > 0 && !activeConvoId) {
          selectConversation(data[0].id);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const selectConversation = async (id) => {
    setActiveConvoId(id);
    try {
      const response = await fetch(`http://127.0.0.1:5001/api/ai/conversations/${id}/messages`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('courtx_token')}` }
      });
      const data = await response.json();
      if (response.ok) {
        const parsedMsgs = data.map(m => {
          if (m.role === 'assistant') {
            try {
              return { ...m, content: JSON.parse(m.content) };
            } catch (e) {
              return m;
            }
          }
          return m;
        });
        setAiMessages(parsedMsgs);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const createNewConversation = async () => {
    try {
      const response = await fetch('http://127.0.0.1:5001/api/ai/conversations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('courtx_token')}`
        },
        body: JSON.stringify({ title: 'New Chat' })
      });
      const data = await response.json();
      if (response.ok) {
        setAiConvos([data, ...aiConvos]);
        setActiveConvoId(data.id);
        setAiMessages([]);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const clearConvoHistory = async () => {
    if (!window.confirm('Are you sure you want to clear your conversation history?')) return;
    try {
      const response = await fetch('http://127.0.0.1:5001/api/ai/conversations', {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('courtx_token')}` }
      });
      if (response.ok) {
        setAiConvos([]);
        setActiveConvoId(null);
        setAiMessages([]);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleAiChatSubmit = async (e, customText = '') => {
    if (e) e.preventDefault();
    const queryText = customText || userInput;
    if (!queryText.trim()) return;

    setUserInput('');
    setAiLoading(true);

    let activeId = activeConvoId;
    if (!activeId) {
      try {
        const response = await fetch('http://127.0.0.1:5001/api/ai/conversations', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('courtx_token')}`
          },
          body: JSON.stringify({ title: queryText.slice(0, 25) })
        });
        const data = await response.json();
        if (response.ok) {
          setAiConvos([data, ...aiConvos]);
          activeId = data.id;
          setActiveConvoId(data.id);
        }
      } catch (err) {
        console.error(err);
        setAiLoading(false);
        return;
      }
    }

    const tempUserMsg = { id: Date.now(), role: 'user', content: queryText };
    setAiMessages(prev => [...prev, tempUserMsg]);

    try {
      const response = await fetch('http://127.0.0.1:5001/api/ai/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('courtx_token')}`
        },
        body: JSON.stringify({ conversationId: activeId, question: queryText })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'AI Failed');

      setAiMessages(prev => [...prev, {
        id: data.id,
        role: 'assistant',
        content: data.content
      }]);
      fetchConversations();
    } catch (err) {
      console.error(err);
      setAiMessages(prev => [...prev, {
        id: Date.now(),
        role: 'assistant',
        content: {
          ground: 'Error',
          acts: 'N/A',
          sections: 'N/A',
          caseLaw: 'N/A',
          explanation: 'Failed to connect to the legal AI service. Please verify server connection.',
        }
      }]);
    } finally {
      setAiLoading(false);
    }
  };

  const handleCopyText = (content) => {
    let copyString = '';
    if (typeof content === 'object') {
      copyString = `Relevant Legal Ground: ${content.ground}\nRelevant Acts: ${content.acts}\nRelevant Section(s): ${content.sections}\nRelevant Case Law: ${content.caseLaw}\n\nExplanation:\n${content.explanation}`;
    } else {
      copyString = content;
    }
    navigator.clipboard.writeText(copyString);
    alert('Copied to clipboard!');
  };

  const handleDocDownload = async (docId, docName) => {
    try {
      const res = await fetch(`http://127.0.0.1:5001/api/documents/${docId}/download`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('courtx_token')}` }
      });
      if (!res.ok) { alert('Failed to download document.'); return; }
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = docName;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      alert('Download error. Please try again.');
    }
  };

  const fetchUserProfile = async () => {
    try {
      const response = await fetch('http://127.0.0.1:5001/api/auth/profile', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('courtx_token')}` }
      });
      const data = await response.json();
      if (response.ok) {
        setProfileEmail(data.email || '');
        setProfilePhone(data.phone || '');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setProfileError('');
    setProfileSuccess('');
    
    const trimmedEmail = profileEmail.trim();
    if (!trimmedEmail) {
      setProfileError('Email is required.');
      return;
    }
    if (profilePassword && profilePassword.length < 8) {
      setProfileError('Password must be at least 8 characters long.');
      return;
    }
    
    setUpdatingProfile(true);
    try {
      const response = await fetch('http://127.0.0.1:5001/api/auth/profile', {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('courtx_token')}`
        },
        body: JSON.stringify({
          email: trimmedEmail,
          phone: profilePhone.trim() || null,
          password: profilePassword || null
        })
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to update profile.');
      }
      
      setProfileSuccess('Your profile has been updated successfully!');
      setProfilePassword('');
      
      // Update local storage user details if email changed
      const storedUser = JSON.parse(localStorage.getItem('courtx_user') || '{}');
      storedUser.email = trimmedEmail;
      localStorage.setItem('courtx_user', JSON.stringify(storedUser));
    } catch (err) {
      setProfileError(err.message);
    } finally {
      setUpdatingProfile(false);
    }
  };

  const getStatusStep = (status) => {
    switch (status) {
      case 'pending': return 1;
      case 'approved': return 2;
      case 'in_progress': return 3;
      case 'closed': return 4;
      default: return 1;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FDFBF7] text-slate-800">
      {/* Top Header */}
      <header className="bg-slate-900 text-white px-6 py-4 shadow-md relative">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-teal-600 p-2 rounded-lg flex items-center justify-center">
              <Scale size={20} className="text-white" />
            </div>
            <span className="text-lg font-extrabold tracking-widest font-heading">COURTX CLIENT</span>
          </div>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <div className="text-xs font-semibold text-slate-400 uppercase">Litigant Portal</div>
              <div className="text-sm font-bold text-white">{user.username}</div>
            </div>
            <button 
              onClick={() => {
                setViewMode(viewMode === 'dashboard' ? 'profile' : 'dashboard');
                setProfileSuccess('');
                setProfileError('');
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 border border-slate-700 rounded hover:bg-slate-700 text-slate-300 hover:text-white text-xs transition-colors"
            >
              <User size={12} />
              {viewMode === 'dashboard' ? 'Edit Profile' : 'Back to Cases'}
            </button>
            <button 
              onClick={onLogout}
              className="flex items-center gap-1.5 px-3 py-1.5 border border-slate-700 rounded hover:bg-slate-800 text-slate-300 hover:text-white text-xs transition-colors"
            >
              <LogOut size={12} />
              Sign Out
            </button>
          </div>

          {/* Mobile Menu Toggle */}
          <button 
            className="md:hidden text-slate-300 hover:text-white focus:outline-none"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Dropdown Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden mt-4 pt-4 border-t border-slate-800 flex flex-col gap-3 pb-2 animate-fade-in">
            <div className="mb-2 text-center">
              <div className="text-xs font-semibold text-slate-400 uppercase">Litigant Portal</div>
              <div className="text-sm font-bold text-white">{user.username}</div>
            </div>
            <button 
              onClick={() => {
                setViewMode(viewMode === 'dashboard' ? 'profile' : 'dashboard');
                setProfileSuccess('');
                setProfileError('');
                setIsMobileMenuOpen(false);
              }}
              className="w-full flex items-center justify-center gap-1.5 px-3 py-2.5 bg-slate-800 border border-slate-700 rounded hover:bg-slate-700 text-slate-300 hover:text-white text-sm transition-colors"
            >
              <User size={16} />
              {viewMode === 'dashboard' ? 'Edit Profile' : 'Back to Cases'}
            </button>
            <button 
              onClick={onLogout}
              className="w-full flex items-center justify-center gap-1.5 px-3 py-2.5 border border-slate-700 rounded hover:bg-slate-800 text-slate-300 hover:text-white text-sm transition-colors"
            >
              <LogOut size={16} />
              Sign Out
            </button>
          </div>
        )}
      </header>

      {/* Main content grid */}
    <main className="flex-1 p-6 max-w-6xl w-full mx-auto space-y-6">
      
      {loading ? (
        <div className="text-center py-20 text-slate-400 animate-pulse">Loading your case profile...</div>
      ) : viewMode === 'profile' ? (
        <div className="max-w-md mx-auto courtx-card bg-white p-8 animate-scale-up">
          <div className="mb-6">
            <h3 className="text-xl font-bold font-heading text-slate-800">User Profile Settings</h3>
            <p className="text-slate-500 text-sm mt-1">Review and update your litigant registry account details.</p>
          </div>

          {profileError && <div className="mb-4 p-4 bg-amber-50 border-l-4 border-amber-500 text-amber-800 text-sm rounded">{profileError}</div>}
          {profileSuccess && <div className="mb-4 p-4 bg-teal-50 border-l-4 border-teal-500 text-teal-800 text-sm rounded">{profileSuccess}</div>}

          <form onSubmit={handleProfileUpdate} className="space-y-4">
            <div>
              <label className="courtx-label">Username (Read-Only)</label>
              <input
                type="text"
                disabled
                className="courtx-input bg-slate-100 text-slate-500 cursor-not-allowed"
                value={user.username}
              />
            </div>
            <div>
              <label className="courtx-label">E-mail Address</label>
              <input
                type="email"
                required
                className="courtx-input"
                value={profileEmail}
                onChange={(e) => setProfileEmail(e.target.value)}
              />
            </div>
            <div>
              <label className="courtx-label">Phone Number</label>
              <input
                type="text"
                className="courtx-input"
                value={profilePhone}
                onChange={(e) => setProfilePhone(e.target.value)}
              />
            </div>
            <div>
              <label className="courtx-label">New Password (Optional)</label>
              <input
                type="password"
                placeholder="Leave blank to keep current password"
                className="courtx-input"
                value={profilePassword}
                onChange={(e) => setProfilePassword(e.target.value)}
              />
            </div>
            <div>
              <label className="courtx-label">Role</label>
              <input
                type="text"
                disabled
                className="courtx-input bg-slate-100 text-slate-500 cursor-not-allowed capitalize"
                value={user.role}
              />
            </div>
            <button
              type="submit"
              disabled={updatingProfile}
              className="w-full courtx-btn courtx-btn-primary py-3 hover-glow"
            >
              {updatingProfile ? 'Updating Profile...' : 'Save Profile Changes'}
            </button>
          </form>
        </div>
      ) : !activeCase ? (
        <div className="courtx-card bg-white p-12 text-center max-w-lg mx-auto mt-12 animate-scale-up">
          <ShieldAlert size={48} className="mx-auto text-amber-500 mb-4" />
          <h3 className="text-lg font-bold text-slate-800 font-heading">No Active Case Found</h3>
          <p className="text-slate-500 text-sm leading-relaxed mt-2">
            Your account is registered but has not yet been linked to an active court case docket. Please contact your retaining counsel to file your complaint.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in">
            
            {/* Left 2 columns: Case details and tracker */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* Case Summary Card */}
              <div className="courtx-card bg-white p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest block">{activeCase.case_type}</span>
                    <h3 className="text-2xl font-serif text-slate-800 mt-1">{activeCase.title}</h3>
                    <div className="text-xs font-mono text-slate-500 font-semibold mt-1">DOCKET REFERENCE: {activeCase.case_number}</div>
                  </div>
                  <span className="courtx-badge courtx-badge-inprogress text-xs font-bold">
                    {activeCase.status.replace('_', ' ')}
                  </span>
                </div>
                
                <p className="text-slate-600 text-sm leading-relaxed mb-6 border-l-2 border-teal-600 pl-4 py-1.5">
                  {activeCase.description || 'Case filings successfully recorded in CourtX registry.'}
                </p>

                {/* Progress Timeline */}
                <div>
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Case Progress Tracker</h4>
                  <div className="relative flex justify-between items-center w-full max-w-lg mx-auto py-4">
                    {/* Line in background */}
                    <div className="absolute left-0 right-0 h-1 bg-slate-200 top-1/2 transform -translate-y-1/2 -z-10 rounded"></div>
                    <div 
                      className="absolute left-0 h-1 bg-teal-600 top-1/2 transform -translate-y-1/2 -z-10 rounded transition-all duration-500"
                      style={{ width: `${(getStatusStep(activeCase.status) - 1) * 33.33}%` }}
                    ></div>

                    {/* Step 1 */}
                    <div className="flex flex-col items-center">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center bg-teal-600 text-white font-bold text-xs shadow">1</div>
                      <span className="text-[10px] font-bold text-slate-700 mt-2 uppercase tracking-wide">Filed</span>
                    </div>

                    {/* Step 2 */}
                    <div className="flex flex-col items-center">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shadow ${getStatusStep(activeCase.status) >= 2 ? 'bg-teal-600 text-white' : 'bg-slate-200 text-slate-400'}`}>2</div>
                      <span className="text-[10px] font-bold text-slate-700 mt-2 uppercase tracking-wide">Approved</span>
                    </div>

                    {/* Step 3 */}
                    <div className="flex flex-col items-center">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shadow ${getStatusStep(activeCase.status) >= 3 ? 'bg-teal-600 text-white' : 'bg-slate-200 text-slate-400'}`}>3</div>
                      <span className="text-[10px] font-bold text-slate-700 mt-2 uppercase tracking-wide">Trial</span>
                    </div>

                    {/* Step 4 */}
                    <div className="flex flex-col items-center">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shadow ${getStatusStep(activeCase.status) >= 4 ? 'bg-teal-600 text-white' : 'bg-slate-200 text-slate-400'}`}>4</div>
                      <span className="text-[10px] font-bold text-slate-700 mt-2 uppercase tracking-wide">Closed</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Counsel & Annexed exhibits */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Lawyer Card */}
                <div className="courtx-card bg-white p-6">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Your Retained Counsel</h4>
                  <div className="space-y-3 text-sm">
                    <div>
                      <span className="text-xs text-slate-400">Attorney Name</span>
                      <div className="font-bold text-slate-800 mt-0.5">{activeCase.lawyer_name || 'Assigned Attorney'}</div>
                    </div>
                    <div>
                      <span className="text-xs text-slate-400">Contact Email</span>
                      <div className="font-semibold text-slate-700 mt-0.5">{activeCase.lawyer_email || 'lawyer@courtx.lk'}</div>
                    </div>
                    <div>
                      <span className="text-xs text-slate-400">Office Phone</span>
                      <div className="font-semibold text-slate-700 mt-0.5">{activeCase.lawyer_phone || '+94 77 123 4567'}</div>
                    </div>
                  </div>
                </div>

                {/* Case Exhibits list */}
                <div className="courtx-card bg-white p-6">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Matrimonial Pleadings & Exhibits</h4>
                  {caseDetails && caseDetails.documents.length > 0 ? (
                    <div className="space-y-2">
                      {caseDetails.documents.map(d => (
                        <div key={d.id} className="flex justify-between items-center p-2.5 bg-slate-50 border border-slate-100 rounded text-xs">
                          <div className="flex items-center gap-2 truncate">
                            <FileText size={14} className="text-slate-400 shrink-0" />
                            <span className="font-semibold text-slate-700 truncate">{d.name}</span>
                          </div>
                          <button
                            onClick={() => handleDocDownload(d.id, d.name)}
                            className="text-teal-600 hover:text-teal-700 font-bold uppercase tracking-wider text-[10px] shrink-0 ml-2"
                          >
                            Get file
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-400 italic">No public documents uploaded yet.</p>
                  )}
                </div>
              </div>
            </div>

            {/* Right column: Hearing schedule & notifications */}
            <div className="space-y-6">
              
              {/* Scheduled Hearings Card */}
              <div className="courtx-card bg-slate-900 text-white p-6 border-none relative overflow-hidden">
                <div className="absolute right-0 bottom-0 opacity-5 pointer-events-none transform translate-y-1/4">
                  <Calendar size={150} />
                </div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Trial Scheduling</h4>
                {hearings.filter(h => h.status === 'scheduled').length === 0 ? (
                  <p className="text-slate-400 text-xs">No scheduled hearing dates. Check back once case review is complete.</p>
                ) : (
                  hearings.filter(h => h.status === 'scheduled').map(h => (
                    <div key={h.id} className="space-y-4">
                      <div className="flex items-start gap-3">
                        <Calendar size={16} className="text-teal-400 mt-0.5" />
                        <div>
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Next Hearing Date</span>
                          <div className="text-sm font-bold text-white mt-0.5">{h.hearing_date}</div>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <Clock size={16} className="text-teal-400 mt-0.5" />
                        <div>
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Session Time</span>
                          <div className="text-sm font-semibold text-white mt-0.5">{h.hearing_time}</div>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <MapPin size={16} className="text-teal-400 mt-0.5" />
                        <div>
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Location / Courtroom</span>
                          <div className="text-sm text-slate-300 mt-0.5">{h.courtroom}</div>
                        </div>
                      </div>
                      <div className="text-xs bg-slate-800 p-2.5 rounded border border-slate-700 mt-2">
                        <strong>Judge:</strong> {h.judge || 'Registrar Office'}
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Litigant Notifications */}
              <div className="courtx-card bg-white p-6">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Client Notifications</h4>
                {notifications.length === 0 ? (
                  <p className="text-slate-400 text-xs">No notifications received.</p>
                ) : (
                  <div className="space-y-3">
                    {notifications.slice(0, 3).map(n => (
                      <div key={n.id} className="p-3 bg-slate-50 border border-slate-100 rounded text-xs">
                        <div className="font-bold text-slate-700 flex justify-between">
                          <span>{n.title}</span>
                          <span className="text-[9px] text-slate-400 font-normal">{n.created_at.slice(0, 10)}</span>
                        </div>
                        <div className="text-slate-500 mt-1 leading-relaxed">{n.message}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>

          </div>
        )}

      </main>
    </div>
  );
}
