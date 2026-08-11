import React, { useState, useEffect, useRef } from 'react';
import { 
  Scale, BookOpen, Briefcase, Calendar as CalendarIcon, MessageSquare, 
  Plus, Upload, Copy, Trash2, Send, FileText, ChevronRight, LogOut, 
  Search, ShieldAlert, Sparkles, User, UserCheck, RefreshCw, Layers, Menu
} from 'lucide-react';
import Modal from '../components/Modal';
import ReactMarkdown from 'react-markdown';

export default function LawyerDashboard({ user, onLogout }) {
  const [activeTab, setActiveTab] = useState('overview'); // overview, file_case, my_cases, calendar, ai_assistant
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [cases, setCases] = useState([]);
  const [hearings, setHearings] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loadingCases, setLoadingCases] = useState(false);
  const [loadingHearings, setLoadingHearings] = useState(false);

  // New Case form state
  const [newCaseTitle, setNewCaseTitle] = useState('');
  const [newCaseType, setNewCaseType] = useState('Divorce/Matrimonial');
  const [newCaseDesc, setNewCaseDesc] = useState('');
  const [clientName, setClientName] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [clientsList, setClientsList] = useState([]);
  const [fileToUpload, setFileToUpload] = useState(null);
  const [filingError, setFilingError] = useState('');
  const [filingSuccess, setFilingSuccess] = useState('');

  // Selected case state for details modal
  const [selectedCase, setSelectedCase] = useState(null);
  const [caseDetails, setCaseDetails] = useState(null);
  const [uploadError, setUploadError] = useState('');
  const [uploadSuccess, setUploadSuccess] = useState('');

  // AI Assistant state
  const [aiConvos, setAiConvos] = useState([]);
  const [activeConvoId, setActiveConvoId] = useState(null);
  const [aiMessages, setAiMessages] = useState([]);
  const [userInput, setUserInput] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [selectedSourceText, setSelectedSourceText] = useState('');
  const chatEndRef = useRef(null);

  // Profile update states
  const [profileEmail, setProfileEmail] = useState(user.email || '');
  const [profilePhone, setProfilePhone] = useState('');
  const [profilePassword, setProfilePassword] = useState('');
  const [profileSuccess, setProfileSuccess] = useState('');
  const [profileError, setProfileError] = useState('');
  const [updatingProfile, setUpdatingProfile] = useState(false);

  // Suggested questions
  const suggestedQuestions = [
    "Can I file for divorce due to malicious desertion?",
    "What are the legal requirements for constructive malicious desertion?",
    "Which Act applies if the spouse committed adultery?",
    "What case law discusses malicious desertion?"
  ];

  // Fetch initial data
  useEffect(() => {
    fetchCases();
    fetchHearings();
    fetchNotifications();
    fetchConversations();
    fetchUserProfile();
    fetchClients();
  }, []);

  // Scroll to bottom of chat when messages change
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [aiMessages]);

  const fetchCases = async () => {
    setLoadingCases(true);
    try {
      const response = await fetch('http://127.0.0.1:5001/api/cases', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('courtx_token')}` }
      });
      const data = await response.json();
      if (response.ok) setCases(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingCases(false);
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

  const fetchClients = async () => {
    try {
      const response = await fetch('http://127.0.0.1:5001/api/users/clients', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('courtx_token')}` }
      });
      const data = await response.json();
      if (response.ok) setClientsList(data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleClientSelect = (clientId) => {
    const client = clientsList.find(c => c.id.toString() === clientId);
    if (client) {
      setClientName(client.username);
      setClientEmail(client.email);
    } else {
      setClientName('');
      setClientEmail('');
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

  const fetchHearings = async () => {
    setLoadingHearings(true);
    try {
      const response = await fetch('http://127.0.0.1:5001/api/hearings', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('courtx_token')}` }
      });
      const data = await response.json();
      if (response.ok) setHearings(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingHearings(false);
    }
  };

  const fetchNotifications = async () => {
    try {
      const response = await fetch('http://127.0.0.1:5001/api/notifications', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('courtx_token')}` }
      });
      const data = await response.json();
      if (response.ok) setNotifications(data);
    } catch (err) {
      console.error(err);
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
        // Parse content field from JSON strings back to objects where applicable
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

  const handleCaseSelect = async (c) => {
    setSelectedCase(c);
    try {
      const response = await fetch(`http://127.0.0.1:5001/api/cases/${c.id}`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('courtx_token')}` }
      });
      const data = await response.json();
      if (response.ok) {
        setCaseDetails(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleFileChange = (e) => {
    setFileToUpload(e.target.files[0]);
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

  const handleFileFilingSubmit = async (caseId, file) => {
    const formData = new FormData();
    formData.append('file', file);
    try {
      const res = await fetch(`http://127.0.0.1:5001/api/cases/${caseId}/documents`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('courtx_token')}` },
        body: formData
      });
      return res.ok;
    } catch (e) {
      console.error(e);
      return false;
    }
  };

  const handleFileCaseSubmit = async (e) => {
    e.preventDefault();
    setFilingError('');
    setFilingSuccess('');

    try {
      const response = await fetch('http://127.0.0.1:5001/api/cases', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('courtx_token')}`
        },
        body: JSON.stringify({
          title: newCaseTitle,
          caseType: newCaseType,
          description: newCaseDesc,
          clientName,
          clientEmail,
          clientPhone
        })
      });
      const data = await response.json();

      if (!response.ok) throw new Error(data.error || 'Failed to file case');

      // Upload file if selected
      if (fileToUpload) {
        const fileSuccess = await handleFileFilingSubmit(data.id, fileToUpload);
        if (!fileSuccess) {
          setFilingError('Case created but initial document upload failed. Please add it from case details.');
        }
      }

      setFilingSuccess(`Case successfully filed with Case Number: ${data.caseNumber}`);
      setNewCaseTitle('');
      setNewCaseDesc('');
      setClientName('');
      setClientEmail('');
      setClientPhone('');
      setFileToUpload(null);
      fetchCases();
    } catch (err) {
      setFilingError(err.message);
    }
  };

  const handleAdditionalDocUpload = async (e) => {
    e.preventDefault();
    setUploadError('');
    setUploadSuccess('');
    
    const fileInput = e.target.elements.docFile;
    if (!fileInput.files || fileInput.files.length === 0) {
      setUploadError('Please select a file to upload.');
      return;
    }

    const formData = new FormData();
    formData.append('file', fileInput.files[0]);

    try {
      const response = await fetch(`http://127.0.0.1:5001/api/cases/${selectedCase.id}/documents`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('courtx_token')}` },
        body: formData
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Upload failed');
      
      setUploadSuccess('Document successfully uploaded.');
      fileInput.value = '';
      // Refresh case details
      handleCaseSelect(selectedCase);
    } catch (err) {
      setUploadError(err.message);
    }
  };

  const handleAiChatSubmit = async (e, customText = '') => {
    if (e) e.preventDefault();
    const queryText = customText || userInput;
    if (!queryText.trim()) return;

    setUserInput('');
    setAiLoading(true);

    let activeId = activeConvoId;
    // If no convo active, create one first
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

    // Add temporary client message
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
        content: data.content,
        sources: data.sources
      }]);
      fetchConversations(); // refresh sidebar list to show updated titles
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
          sources: []
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

  const getStatusClass = (status) => {
    switch (status) {
      case 'pending': return 'courtx-badge-pending';
      case 'approved': return 'courtx-badge-approved';
      case 'in_progress': return 'courtx-badge-inprogress';
      case 'closed': return 'courtx-badge-closed';
      case 'rejected': return 'courtx-badge-rejected';
      default: return '';
    }
  };

  return (
    <div className="min-h-screen flex bg-[#FDFBF7] text-slate-800">
      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 z-40 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 text-white flex flex-col justify-between py-6 px-4 transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div>
          {/* Logo & Close Button */}
          <div className="flex items-center justify-between mb-8 px-2">
            <div className="flex items-center gap-3">
              <div className="bg-teal-600 p-2 rounded-lg flex items-center justify-center">
                <Scale size={20} className="text-white" />
              </div>
              <span className="text-lg font-extrabold tracking-widest font-heading">COURTX</span>
            </div>
            <button className="md:hidden text-slate-400 hover:text-white" onClick={() => setIsMobileMenuOpen(false)}>
              ✕
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1">
            <button
              onClick={() => { setActiveTab('overview'); setIsMobileMenuOpen(false); }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded transition-all text-left text-sm font-medium ${activeTab === 'overview' ? 'bg-teal-700 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
            >
              <Layers size={18} />
              Overview
            </button>
            <button
              onClick={() => { setActiveTab('file_case'); setIsMobileMenuOpen(false); }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded transition-all text-left text-sm font-medium ${activeTab === 'file_case' ? 'bg-teal-700 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
            >
              <Plus size={18} />
              File New Case
            </button>
            <button
              onClick={() => { setActiveTab('my_cases'); setIsMobileMenuOpen(false); }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded transition-all text-left text-sm font-medium ${activeTab === 'my_cases' ? 'bg-teal-700 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
            >
              <Briefcase size={18} />
              My Cases
            </button>
            <button
              onClick={() => { setActiveTab('calendar'); setIsMobileMenuOpen(false); }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded transition-all text-left text-sm font-medium ${activeTab === 'calendar' ? 'bg-teal-700 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
            >
              <CalendarIcon size={18} />
              Hearing Calendar
            </button>
            <button
              onClick={() => { setActiveTab('ai_assistant'); setIsMobileMenuOpen(false); }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded transition-all text-left text-sm font-medium ${activeTab === 'ai_assistant' ? 'bg-teal-700 text-white font-bold' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
            >
              <MessageSquare size={18} className="text-teal-400" />
              AI Legal Assistant
            </button>
            <button
              onClick={() => { setActiveTab('profile_settings'); setIsMobileMenuOpen(false); }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded transition-all text-left text-sm font-medium ${activeTab === 'profile_settings' ? 'bg-teal-700 text-white font-bold' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
            >
              <User size={18} className="text-teal-400" />
              Profile Settings
            </button>
          </nav>
        </div>

        {/* User profile section */}
        <div className="border-t border-slate-800 pt-4 px-2">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-9 h-9 rounded-full bg-slate-700 flex items-center justify-center font-heading font-bold text-teal-400">
              {user.username.slice(0, 2).toUpperCase()}
            </div>
            <div className="truncate">
              <div className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Lawyer</div>
              <div className="text-sm font-bold truncate text-white">{user.username}</div>
            </div>
          </div>
          <button 
            onClick={onLogout}
            className="w-full flex items-center justify-center gap-2 py-2 border border-slate-700 rounded hover:bg-slate-800 text-slate-400 hover:text-white text-xs transition-colors"
          >
            <LogOut size={14} />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main content body */}
      <main className="flex-1 flex flex-col overflow-y-auto w-full">
        {/* Top Header */}
        <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between shadow-sm shrink-0">
          <div className="flex items-center gap-4">
            <button 
              className="md:hidden text-slate-500 hover:text-slate-800 focus:outline-none"
              onClick={() => setIsMobileMenuOpen(true)}
            >
              <Menu size={24} />
            </button>
            <h2 className="text-xl font-bold text-slate-900 uppercase tracking-wide font-heading">
              {activeTab.replaceAll('_', ' ')}
            </h2>
          </div>
          <div className="flex items-center gap-4">
            <div className="bg-teal-50 border border-teal-200 px-3 py-1 rounded-full flex items-center gap-1.5 text-xs text-teal-700 font-semibold">
              <UserCheck size={14} />
              <span>BAR Active: {user.barNumber || 'Approved'}</span>
            </div>
          </div>
        </header>

        {/* Dashboard Panels */}
        <div className="flex-1 p-6">
          
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div className="bg-slate-900 text-white rounded-lg p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center shadow-lg relative overflow-hidden">
                <div className="absolute right-0 bottom-0 opacity-5 pointer-events-none transform translate-y-1/4">
                  <Scale size={300} />
                </div>
                <div className="z-10 mb-4 sm:mb-0">
                  <h2 className="text-2xl font-serif mb-2">Welcome Back, Counselor {user.username}</h2>
                  <p className="text-slate-400 text-sm">Review your active schedules, pending case reviews, and divorce law documents.</p>
                </div>
                <button
                  onClick={() => setActiveTab('ai_assistant')}
                  className="z-10 courtx-btn courtx-btn-amber bg-amber-600 hover:bg-amber-700 flex items-center gap-2 text-sm shadow-md"
                >
                  <Sparkles size={16} />
                  AI RAG Assistant
                </button>
              </div>

              {/* Status Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div 
                  className="courtx-card courtx-card-teal bg-white cursor-pointer hover:scale-105 transition-transform" 
                  onClick={() => setActiveTab('my_cases')}
                >
                  <div className="text-sm font-bold text-slate-400 uppercase tracking-wider">Total Active Cases</div>
                  <div className="text-3xl font-bold font-heading text-slate-800 mt-2">
                    {cases.filter(c => c.status === 'in_progress').length}
                  </div>
                </div>
                <div 
                  className="courtx-card courtx-card-gold bg-white cursor-pointer hover:scale-105 transition-transform"
                  onClick={() => setActiveTab('my_cases')}
                >
                  <div className="text-sm font-bold text-slate-400 uppercase tracking-wider">Pending Court Reviews</div>
                  <div className="text-3xl font-bold font-heading text-slate-800 mt-2">
                    {cases.filter(c => c.status === 'pending').length}
                  </div>
                </div>
                <div 
                  className="courtx-card bg-white cursor-pointer hover:scale-105 transition-transform"
                  onClick={() => setActiveTab('calendar')}
                >
                  <div className="text-sm font-bold text-slate-400 uppercase tracking-wider">Upcoming Hearings</div>
                  <div className="text-3xl font-bold font-heading text-slate-800 mt-2">
                    {hearings.filter(h => h.status === 'scheduled').length}
                  </div>
                </div>
              </div>

              {/* Recent Notifications & Alerts */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="courtx-card bg-white p-6">
                  <h3 className="text-lg font-bold text-slate-800 font-heading mb-4">Latest System Updates</h3>
                  {notifications.length === 0 ? (
                    <p className="text-slate-400 text-sm">No new updates or alerts.</p>
                  ) : (
                    <div className="space-y-4">
                      {notifications.slice(0, 4).map(n => (
                        <div key={n.id} className="p-3 bg-slate-50 border border-slate-100 rounded text-sm cursor-pointer hover:bg-slate-100 transition-colors">
                          <div className="font-bold text-slate-700 flex justify-between">
                            <span>{n.title}</span>
                            <span className="text-[10px] text-slate-400 font-normal">{n.created_at.slice(0, 10)}</span>
                          </div>
                          <div className="text-slate-500 mt-1 leading-normal text-xs">{n.message}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="courtx-card bg-white p-6">
                  <h3 className="text-lg font-bold text-slate-800 font-heading mb-4">Immediate Calendared Hearings</h3>
                  {hearings.filter(h => h.status === 'scheduled').length === 0 ? (
                    <p className="text-slate-400 text-sm">No scheduled hearings on files.</p>
                  ) : (
                    <div className="space-y-3">
                      {hearings.filter(h => h.status === 'scheduled').slice(0, 3).map(h => (
                        <div 
                          key={h.id} 
                          className="flex justify-between items-center p-3 bg-teal-50/50 border border-teal-100/50 rounded cursor-pointer hover:bg-teal-50 transition-colors"
                          onClick={() => setActiveTab('calendar')}
                        >
                          <div>
                            <div className="text-sm font-bold text-slate-800">{h.case_title}</div>
                            <div className="text-xs text-slate-500 mt-1">
                              {h.hearing_date} &bull; {h.hearing_time} &bull; {h.courtroom}
                            </div>
                          </div>
                          <ChevronRight size={18} className="text-teal-600" />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: FILE CASE */}
          {activeTab === 'file_case' && (
            <div className="max-w-2xl mx-auto courtx-card bg-white p-8">
              <div className="mb-6">
                <h3 className="text-xl font-bold font-heading text-slate-800">Electronic Court Case Filing</h3>
                <p className="text-slate-500 text-sm mt-1">Submit case details and client credentials to register a case docket.</p>
              </div>

              {filingError && (
                <div className="mb-4 p-4 bg-amber-50 border-l-4 border-amber-500 text-amber-800 text-sm rounded">
                  {filingError}
                </div>
              )}
              {filingSuccess && (
                <div className="mb-4 p-4 bg-teal-50 border-l-4 border-teal-500 text-teal-800 text-sm rounded">
                  {filingSuccess}
                </div>
              )}

              <form onSubmit={handleFileCaseSubmit} className="space-y-5">
                <div>
                  <label className="courtx-label">Case Title / Docket Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Perera v. Perera"
                    className="courtx-input"
                    value={newCaseTitle}
                    onChange={(e) => setNewCaseTitle(e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="courtx-label">Case Classification</label>
                    <select
                      className="courtx-input"
                      value={newCaseType}
                      onChange={(e) => setNewCaseType(e.target.value)}
                    >
                      <option value="Divorce/Matrimonial">Divorce/Matrimonial</option>
                      <option value="Civil/Property">Civil/Property Dispute</option>
                      <option value="Commercial">Commercial/Contract</option>
                    </select>
                  </div>
                  <div>
                    <label className="courtx-label">Select Client</label>
                    <select
                      required
                      className="courtx-input"
                      onChange={(e) => handleClientSelect(e.target.value)}
                    >
                      <option value="">-- Choose Existing Client --</option>
                      {clientsList.map(c => (
                        <option key={c.id} value={c.id}>{c.username} ({c.email})</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="courtx-label">Client E-mail</label>
                    <input
                      type="email"
                      required
                      readOnly
                      placeholder="Client email"
                      className="courtx-input bg-slate-50 text-slate-500 cursor-not-allowed"
                      value={clientEmail}
                      onChange={(e) => setClientEmail(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="courtx-label">Client Phone</label>
                    <input
                      type="tel"
                      placeholder="+94 77 111 2222"
                      className="courtx-input"
                      value={clientPhone}
                      onChange={(e) => setClientPhone(e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <label className="courtx-label">Initial Pleadings / Case Details Summary</label>
                  <textarea
                    rows={4}
                    placeholder="Describe specific grounds (e.g., date of desertion, acts of adultery, cruelty summary)"
                    className="courtx-input"
                    value={newCaseDesc}
                    onChange={(e) => setNewCaseDesc(e.target.value)}
                  />
                </div>

                <div className="border border-dashed border-slate-300 rounded p-4 text-center bg-slate-50">
                  <label className="cursor-pointer block">
                    <Upload size={32} className="mx-auto text-slate-400 mb-2" />
                    <span className="text-sm font-bold text-slate-700 block">Upload Initial Complaint (PDF/Image)</span>
                    <span className="text-xs text-slate-400 block mt-1">Maximum file size: 5MB</span>
                    <input
                      type="file"
                      className="hidden"
                      onChange={handleFileChange}
                    />
                  </label>
                  {fileToUpload && (
                    <div className="mt-3 text-xs bg-teal-50 border border-teal-200 text-teal-700 px-3 py-1.5 rounded inline-flex items-center gap-2">
                      <FileText size={14} />
                      <span>{fileToUpload.name} ({(fileToUpload.size / (1024 * 1024)).toFixed(2)} MB)</span>
                    </div>
                  )}
                </div>

                <button
                  type="submit"
                  className="w-full courtx-btn courtx-btn-primary py-3"
                >
                  File Complaint Docket &rarr;
                </button>
              </form>
            </div>
          )}

          {/* TAB 3: MY CASES */}
          {activeTab === 'my_cases' && (
            <div className="space-y-6">
              {loadingCases ? (
                <div className="text-center py-12 text-slate-400">Loading cases list...</div>
              ) : cases.length === 0 ? (
                <div className="text-center py-12 courtx-card bg-white text-slate-400">No cases filed yet.</div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {cases.map(c => (
                    <div key={c.id} className="courtx-card bg-white flex flex-col justify-between">
                      <div>
                        <div className="flex justify-between items-center mb-4">
                          <span className="text-xs font-bold text-slate-400 tracking-wider uppercase">{c.case_type}</span>
                          <span className={`courtx-badge ${getStatusClass(c.status)}`}>
                            {c.status.replace('_', ' ')}
                          </span>
                        </div>
                        <h4 className="text-lg font-bold text-slate-800 font-heading mb-1">{c.title}</h4>
                        <div className="text-xs text-slate-500 font-mono font-semibold mb-3">DOCKET: {c.case_number}</div>
                        <p className="text-slate-600 text-sm leading-relaxed mb-4 truncate-3-lines">{c.description || 'No description supplied.'}</p>
                      </div>

                      <div className="border-t border-slate-100 pt-4 flex justify-between items-center">
                        <div className="text-xs">
                          <span className="text-slate-400 block uppercase tracking-wider font-bold">Client</span>
                          <span className="text-slate-700 font-semibold">{c.client_name}</span>
                        </div>
                        <button
                          onClick={() => handleCaseSelect(c)}
                          className="courtx-btn courtx-btn-secondary text-xs py-1.5 px-3"
                        >
                          View Details
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 4: CALENDAR */}
          {activeTab === 'calendar' && (
            <div className="courtx-card bg-white p-6">
              <h3 className="text-lg font-bold text-slate-800 font-heading mb-4">Scheduled Hearings Calendar</h3>
              {loadingHearings ? (
                <div className="text-center py-8 text-slate-400">Loading schedules...</div>
              ) : hearings.length === 0 ? (
                <p className="text-slate-400 text-sm">No scheduled hearing dates.</p>
              ) : (
                <div className="courtx-table-container">
                  <table className="courtx-table">
                    <thead>
                      <tr>
                        <th>Case Reference</th>
                        <th>Hearing Date</th>
                        <th>Hearing Time</th>
                        <th>Courtroom Location</th>
                        <th>Presiding Judge</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {hearings.map(h => (
                        <tr key={h.id}>
                          <td className="font-bold text-slate-800">
                            {h.case_title} <br />
                            <span className="text-xs font-mono text-slate-400">{h.case_number}</span>
                          </td>
                          <td className="font-semibold">{h.hearing_date}</td>
                          <td>{h.hearing_time}</td>
                          <td>{h.courtroom}</td>
                          <td className="italic">{h.judge || 'Registrar Office'}</td>
                          <td>
                            <span className={`courtx-badge ${h.status === 'scheduled' ? 'courtx-badge-inprogress' : 'courtx-badge-approved'}`}>
                              {h.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* TAB 5: AI LEGAL ASSISTANT (RAG MODULE) */}
          {activeTab === 'ai_assistant' && (
            <div className="flex flex-col lg:flex-row h-[78vh] border border-slate-200 rounded-lg overflow-hidden bg-white shadow-md">
              
              {/* Left Chat History Pane */}
              <div className="w-full lg:w-64 border-r border-slate-200 bg-slate-50 flex flex-col justify-between shrink-0">
                <div>
                  <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-[#FDFBF7]">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Research Sessions</span>
                    <button
                      onClick={createNewConversation}
                      className="p-1 text-teal-600 hover:bg-teal-50 rounded transition-colors"
                      title="New Consultation"
                    >
                      <Plus size={18} />
                    </button>
                  </div>

                  <div className="p-2 space-y-1 overflow-y-auto max-h-[50vh]">
                    {aiConvos.map(c => (
                      <button
                        key={c.id}
                        onClick={() => selectConversation(c.id)}
                        className={`w-full text-left p-3 rounded text-xs transition-colors flex items-center gap-2 truncate ${activeConvoId === c.id ? 'bg-teal-700 text-white font-bold' : 'text-slate-600 hover:bg-slate-200'}`}
                      >
                        <MessageSquare size={14} className={activeConvoId === c.id ? 'text-white' : 'text-slate-400'} />
                        <span className="truncate">{c.title}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="p-4 border-t border-slate-200">
                  <button
                    onClick={clearConvoHistory}
                    className="w-full flex items-center justify-center gap-2 py-2 border border-slate-200 rounded hover:bg-red-50 text-red-600 hover:text-red-700 text-xs transition-colors"
                  >
                    <Trash2 size={14} />
                    Clear Chat History
                  </button>
                </div>
              </div>

              {/* Middle Chat Interface */}
              <div className="flex-1 flex flex-col justify-between h-full bg-[#FDFBF7]">
                
                {/* Chat Message Window */}
                <div className="flex-1 p-6 overflow-y-auto space-y-6">
                  {aiMessages.length === 0 ? (
                    <div className="h-full flex flex-col justify-center items-center text-center max-w-lg mx-auto">
                      <div className="p-4 bg-teal-50 border border-teal-100 rounded-full text-teal-600 mb-4 animate-pulse">
                        <Sparkles size={36} />
                      </div>
                      <h4 className="text-xl font-serif text-slate-800 mb-2">CourtX AI Legal Assistant</h4>
                      <p className="text-slate-500 text-sm leading-relaxed mb-6">
                        Welcome to your specialized legal assistant for **Sri Lankan Divorce Law**. I research using the statutes (Marriage Registration Ordinance), Roman-Dutch common law, and Supreme Court case precedents.
                      </p>

                      <div className="w-full grid grid-cols-1 gap-2 text-left">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1.5">Suggested Questions:</span>
                        {suggestedQuestions.map((q, i) => (
                          <button
                            key={i}
                            onClick={() => handleAiChatSubmit(null, q)}
                            className="p-3 bg-white border border-slate-200 rounded hover:border-teal-600 text-xs text-slate-700 hover:bg-teal-50/20 text-left transition-all"
                          >
                            {q}
                          </button>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {aiMessages.map((m) => (
                        <div key={m.id} className={`flex flex-col ${m.role === 'user' ? 'items-end' : 'items-start'}`}>
                          
                          {/* Message bubble */}
                          <div className={`p-4 rounded-lg max-w-2xl shadow-sm border ${
                            m.role === 'user' 
                              ? 'bg-slate-900 border-slate-800 text-white rounded-br-none' 
                              : 'bg-white border-slate-200 rounded-bl-none'
                          }`}>
                            {m.role === 'user' ? (
                              <p className="text-sm font-sans leading-relaxed whitespace-pre-wrap">{m.content}</p>
                            ) : (
                              // Assistant Response - Render structured card format
                              <div className="space-y-4 text-slate-800">
                                <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                                  <div className="flex items-center gap-1.5 text-xs text-teal-700 font-bold uppercase tracking-wider">
                                    <Sparkles size={14} />
                                    AI Search Result
                                  </div>
                                  <button 
                                    onClick={() => handleCopyText(m.content)}
                                    className="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded transition-colors"
                                    title="Copy Response"
                                  >
                                    <Copy size={14} />
                                  </button>
                                </div>

                                <div className="grid grid-cols-2 gap-4 text-xs">
                                  <div>
                                    <span className="font-bold text-slate-400 uppercase tracking-wider block">Relevant Legal Ground:</span>
                                    <span className="text-slate-800 font-semibold mt-0.5 block">{m.content.ground || 'N/A'}</span>
                                  </div>
                                  <div>
                                    <span className="font-bold text-slate-400 uppercase tracking-wider block">Relevant Acts:</span>
                                    <span className="text-slate-800 font-semibold mt-0.5 block">{m.content.acts || 'N/A'}</span>
                                  </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4 text-xs">
                                  <div>
                                    <span className="font-bold text-slate-400 uppercase tracking-wider block">Relevant Section(s):</span>
                                    <span className="text-slate-800 font-semibold mt-0.5 block">{m.content.sections || 'N/A'}</span>
                                  </div>
                                  <div>
                                    <span className="font-bold text-slate-400 uppercase tracking-wider block">Relevant Case Law:</span>
                                    <span className="text-slate-800 font-semibold mt-0.5 block italic">{m.content.caseLaw || 'N/A'}</span>
                                  </div>
                                </div>

                                <div className="text-xs bg-slate-50/50 p-3 rounded border border-slate-100">
                                  <span className="font-bold text-slate-400 uppercase tracking-wider block mb-1">Explanation:</span>
                                  <p className="text-slate-700 leading-relaxed font-sans">{m.content.explanation}</p>
                                </div>


                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                      {aiLoading && (
                        <div className="flex justify-start">
                          <div className="bg-white border border-slate-200 p-4 rounded-lg rounded-bl-none flex items-center gap-3">
                            <RefreshCw size={16} className="text-teal-600 animate-spin" />
                            <span className="text-xs text-slate-400 font-bold uppercase tracking-widest animate-pulse">Retrieving and composing legal research...</span>
                          </div>
                        </div>
                      )}
                      <div ref={chatEndRef} />
                    </div>
                  )}
                </div>

                {/* Question Input Box */}
                <form onSubmit={handleAiChatSubmit} className="p-4 border-t border-slate-200 bg-white flex gap-3">
                  <input
                    type="text"
                    required
                    disabled={aiLoading}
                    placeholder="Ask a question (e.g. Can I file for divorce due to malicious desertion?)"
                    className="flex-1 courtx-input"
                    value={userInput}
                    onChange={(e) => setUserInput(e.target.value)}
                  />
                  <button
                    type="submit"
                    disabled={aiLoading}
                    className="courtx-btn courtx-btn-teal flex items-center justify-center"
                  >
                    <Send size={18} />
                  </button>
                </form>
              </div>


            </div>
          )}

          {/* TAB 6: PROFILE SETTINGS */}
          {activeTab === 'profile_settings' && (
            <div className="max-w-md mx-auto courtx-card bg-white p-8 animate-scale-up">
              <div className="mb-6">
                <h3 className="text-xl font-bold font-heading text-slate-800">User Profile Settings</h3>
                <p className="text-slate-500 text-sm mt-1">Review and update your registry account information.</p>
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
                {user.barNumber && (
                  <div>
                    <label className="courtx-label">Bar Council Number</label>
                    <input
                      type="text"
                      disabled
                      className="courtx-input bg-slate-100 text-slate-500 cursor-not-allowed"
                      value={user.barNumber}
                    />
                  </div>
                )}
                <button
                  type="submit"
                  disabled={updatingProfile}
                  className="w-full courtx-btn courtx-btn-primary py-3 hover-glow"
                >
                  {updatingProfile ? 'Updating Profile...' : 'Save Profile Changes'}
                </button>
              </form>
            </div>
          )}

        </div>
      </main>

      {/* Case Details Modal */}
      {selectedCase && caseDetails && (
        <Modal 
          isOpen={!!selectedCase} 
          onClose={() => { setSelectedCase(null); setCaseDetails(null); setUploadError(''); setUploadSuccess(''); }} 
          title={`Case File: ${selectedCase.case_number}`}
        >
          <div className="space-y-6">
            <div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Title / Incident Name</span>
              <span className="text-base font-bold text-slate-800 block mt-0.5">{selectedCase.title}</span>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-slate-400 block font-bold text-xs uppercase tracking-wider">Classification</span>
                <span className="text-slate-700 font-semibold">{selectedCase.case_type}</span>
              </div>
              <div>
                <span className="text-slate-400 block font-bold text-xs uppercase tracking-wider">Filing Status</span>
                <span className={`courtx-badge ${getStatusClass(selectedCase.status)} mt-0.5`}>
                  {selectedCase.status.replace('_', ' ')}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-slate-400 block font-bold text-xs uppercase tracking-wider">Client Name</span>
                <span className="text-slate-700 font-semibold">{selectedCase.client_name}</span>
              </div>
              <div>
                <span className="text-slate-400 block font-bold text-xs uppercase tracking-wider">Filing Date</span>
                <span className="text-slate-700 font-semibold">{selectedCase.filed_date.slice(0, 16).replace('T', ' ')}</span>
              </div>
            </div>

            {selectedCase.description && (
              <div>
                <span className="text-slate-400 block font-bold text-xs uppercase tracking-wider mb-1">Details Summary</span>
                <p className="text-sm text-slate-600 bg-slate-50 p-3 rounded border border-slate-100 leading-relaxed">
                  {selectedCase.description}
                </p>
              </div>
            )}

            {/* Uploaded Documents List */}
            <div>
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Pleadings & Annexed Exhibits ({caseDetails.documents.length})</h4>
              {caseDetails.documents.length === 0 ? (
                <p className="text-xs text-slate-500 italic">No files annexed to docket yet.</p>
              ) : (
                <div className="space-y-2">
                  {caseDetails.documents.map(d => (
                    <div key={d.id} className="flex justify-between items-center p-2.5 bg-slate-50 border border-slate-100 rounded text-xs">
                      <div className="flex items-center gap-2">
                        <FileText size={16} className="text-slate-400" />
                        <span className="font-semibold text-slate-700">{d.name}</span>
                        <span className="text-[10px] text-slate-400">({(d.file_size / (1024 * 1024)).toFixed(2)} MB)</span>
                      </div>
                      <button
                        onClick={() => handleDocDownload(d.id, d.name)}
                        className="text-teal-600 hover:text-teal-700 font-bold uppercase tracking-wider text-[10px]"
                      >
                        Download
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Annex Additional File Form */}
            {selectedCase.status !== 'closed' && (
              <div className="border-t border-slate-100 pt-4">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Annex Additional Exhibit Document</h4>
                
                {uploadError && <div className="text-xs text-red-600 mb-2">{uploadError}</div>}
                {uploadSuccess && <div className="text-xs text-teal-600 mb-2">{uploadSuccess}</div>}

                <form onSubmit={handleAdditionalDocUpload} className="flex gap-2">
                  <input
                    type="file"
                    name="docFile"
                    required
                    className="flex-1 courtx-input text-xs py-1.5"
                  />
                  <button
                    type="submit"
                    className="courtx-btn courtx-btn-teal text-xs py-1.5 px-4 flex items-center gap-1.5"
                  >
                    <Upload size={14} />
                    Upload
                  </button>
                </form>
              </div>
            )}
          </div>
        </Modal>
      )}

    </div>
  );
}
