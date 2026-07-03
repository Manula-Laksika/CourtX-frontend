import React, { useState, useEffect } from 'react';
import { 
  Scale, Briefcase, Calendar as CalendarIcon, UserCheck, Search, 
  BarChart3, Check, X, Plus, AlertCircle, FileText, Calendar, Compass, 
  Clock, ShieldAlert, CheckSquare, Layers, LogOut
} from 'lucide-react';
import Modal from '../components/Modal';

export default function StaffDashboard({ user, onLogout }) {
  const [activeTab, setActiveTab] = useState('overview'); // overview, review_cases, schedule_hearings, approve_lawyers, search, analytics
  const [cases, setCases] = useState([]);
  const [hearings, setHearings] = useState([]);
  const [pendingLawyers, setPendingLawyers] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  
  // Search query states
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);

  // Selected case state for scheduling hearing
  const [selectedCaseForHearing, setSelectedCaseForHearing] = useState(null);
  const [hearingDate, setHearingDate] = useState('');
  const [hearingTime, setHearingTime] = useState('09:30 AM');
  const [courtroom, setCourtroom] = useState('Courtroom No. 01 (District Court)');
  const [judge, setJudge] = useState('');
  const [schedError, setSchedError] = useState('');
  const [schedSuccess, setSchedSuccess] = useState('');

  // Selected case state for details review
  const [selectedCaseReview, setSelectedCaseReview] = useState(null);
  const [caseReviewDetails, setCaseReviewDetails] = useState(null);

  useEffect(() => {
    fetchCases();
    fetchHearings();
    fetchPendingLawyers();
    fetchAnalytics();
  }, []);

  const fetchCases = async () => {
    try {
      const response = await fetch('http://127.0.0.1:5001/api/cases', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('courtx_token')}` }
      });
      const data = await response.json();
      if (response.ok) setCases(data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchHearings = async () => {
    try {
      const response = await fetch('http://127.0.0.1:5001/api/hearings', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('courtx_token')}` }
      });
      const data = await response.json();
      if (response.ok) setHearings(data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchPendingLawyers = async () => {
    try {
      const response = await fetch('http://127.0.0.1:5001/api/lawyers/pending', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('courtx_token')}` }
      });
      const data = await response.json();
      if (response.ok) setPendingLawyers(data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchAnalytics = async () => {
    try {
      const response = await fetch('http://127.0.0.1:5001/api/analytics', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('courtx_token')}` }
      });
      const data = await response.json();
      if (response.ok) setAnalytics(data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleApproveCase = async (caseId) => {
    if (!window.confirm('Approve this filed complaint? Status will update to "Approved".')) return;
    try {
      const response = await fetch(`http://127.0.0.1:5001/api/cases/${caseId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('courtx_token')}`
        },
        body: JSON.stringify({ status: 'approved' })
      });
      if (response.ok) {
        fetchCases();
        fetchAnalytics();
        setSelectedCaseReview(null);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleApproveLawyer = async (lawyerId) => {
    if (!window.confirm('Approve registration for this Lawyer?')) return;
    try {
      const response = await fetch(`http://127.0.0.1:5001/api/lawyers/${lawyerId}/approve`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('courtx_token')}` }
      });
      if (response.ok) {
        fetchPendingLawyers();
        fetchAnalytics();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleScheduleHearingSubmit = async (e) => {
    e.preventDefault();
    setSchedError('');
    setSchedSuccess('');

    try {
      const response = await fetch(`http://127.0.0.1:5001/api/cases/${selectedCaseForHearing.id}/hearings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('courtx_token')}`
        },
        body: JSON.stringify({
          hearingDate,
          hearingTime,
          courtroom,
          judge
        })
      });
      const data = await response.json();

      if (!response.ok) throw new Error(data.error || 'Failed to schedule');

      setSchedSuccess('Hearing has been successfully scheduled.');
      setHearingDate('');
      setJudge('');
      fetchHearings();
      fetchAnalytics();
      // Auto transition to "in_progress" if currently approved
      if (selectedCaseForHearing.status === 'approved') {
        await fetch(`http://127.0.0.1:5001/api/cases/${selectedCaseForHearing.id}/status`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('courtx_token')}`
          },
          body: JSON.stringify({ status: 'in_progress' })
        });
        fetchCases();
      }
    } catch (err) {
      setSchedError(err.message);
    }
  };

  const handleCaseReviewSelect = async (c) => {
    setSelectedCaseReview(c);
    try {
      const response = await fetch(`http://127.0.0.1:5001/api/cases/${c.id}`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('courtx_token')}` }
      });
      const data = await response.json();
      if (response.ok) {
        setCaseReviewDetails(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSearchSubmit = (e) => {
    if (e) e.preventDefault();
    const queryStr = searchQuery.toLowerCase().trim();
    if (!queryStr) {
      setSearchResults([]);
      return;
    }

    const filtered = cases.filter(c => 
      c.case_number.toLowerCase().includes(queryStr) ||
      c.title.toLowerCase().includes(queryStr) ||
      c.client_name.toLowerCase().includes(queryStr) ||
      (c.lawyer_name && c.lawyer_name.toLowerCase().includes(queryStr))
    );
    setSearchResults(filtered);
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
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-white shrink-0 hidden md:flex flex-col justify-between py-6 px-4">
        <div>
          {/* Logo */}
          <div className="flex items-center gap-3 px-2 mb-8">
            <div className="bg-teal-600 p-2 rounded-lg flex items-center justify-center">
              <Scale size={20} className="text-white" />
            </div>
            <span className="text-lg font-extrabold tracking-widest font-heading">COURTX</span>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1">
            <button
              onClick={() => setActiveTab('overview')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded transition-all text-left text-sm font-medium ${activeTab === 'overview' ? 'bg-teal-700 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
            >
              <Layers size={18} />
              Overview
            </button>
            <button
              onClick={() => setActiveTab('review_cases')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded transition-all text-left text-sm font-medium ${activeTab === 'review_cases' ? 'bg-teal-700 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
            >
              <CheckSquare size={18} />
              Review Filed Cases
            </button>
            <button
              onClick={() => setActiveTab('schedule_hearings')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded transition-all text-left text-sm font-medium ${activeTab === 'schedule_hearings' ? 'bg-teal-700 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
            >
              <CalendarIcon size={18} />
              Schedule Hearings
            </button>
            <button
              onClick={() => setActiveTab('approve_lawyers')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded transition-all text-left text-sm font-medium ${activeTab === 'approve_lawyers' ? 'bg-teal-700 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
            >
              <UserCheck size={18} />
              Approve Lawyers ({pendingLawyers.length})
            </button>
            <button
              onClick={() => setActiveTab('search')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded transition-all text-left text-sm font-medium ${activeTab === 'search' ? 'bg-teal-700 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
            >
              <Search size={18} />
              Search Records
            </button>
            <button
              onClick={() => setActiveTab('analytics')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded transition-all text-left text-sm font-medium ${activeTab === 'analytics' ? 'bg-teal-700 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
            >
              <BarChart3 size={18} />
              Analytics & Reports
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
              <div className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Registry Staff</div>
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
      <main className="flex-1 flex flex-col overflow-y-auto">
        {/* Top Header */}
        <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between shadow-sm shrink-0">
          <h2 className="text-xl font-bold text-slate-900 uppercase tracking-wide font-heading">
            {activeTab.replaceAll('_', ' ')}
          </h2>
          <div className="text-xs text-slate-500 font-semibold bg-slate-100 px-3 py-1.5 rounded border border-slate-200">
            District Court Clerk Office
          </div>
        </header>

        {/* Dashboard Panels */}
        <div className="flex-1 p-6">
          
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Dashboard Banner */}
              <div className="bg-slate-900 text-white rounded-lg p-6 flex justify-between items-center shadow-lg">
                <div>
                  <h2 className="text-2xl font-serif mb-2">Court Registrar Workspace</h2>
                  <p className="text-slate-400 text-sm">Review case filings, verify lawyer credentials, and coordinates schedules for active courtrooms.</p>
                </div>
              </div>

              {/* Stats Cards */}
              {analytics && (
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
                  <div className="courtx-card courtx-card-teal bg-white">
                    <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Pending Approvals</div>
                    <div className="text-3xl font-bold font-heading text-slate-800 mt-2">{analytics.totals.pending}</div>
                  </div>
                  <div className="courtx-card courtx-card-gold bg-white">
                    <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Active Trials</div>
                    <div className="text-3xl font-bold font-heading text-slate-800 mt-2">{analytics.totals.active}</div>
                  </div>
                  <div className="courtx-card bg-white">
                    <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Registered Lawyers</div>
                    <div className="text-3xl font-bold font-heading text-slate-800 mt-2">{analytics.totals.lawyers}</div>
                  </div>
                  <div className="courtx-card bg-white">
                    <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Hearings Logged</div>
                    <div className="text-3xl font-bold font-heading text-slate-800 mt-2">{analytics.totals.hearings}</div>
                  </div>
                </div>
              )}

              {/* Double Column layout */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="courtx-card bg-white">
                  <h3 className="text-base font-bold text-slate-800 mb-4 font-heading">Cases Pending Verification</h3>
                  <div className="space-y-3">
                    {cases.filter(c => c.status === 'pending').length === 0 ? (
                      <p className="text-slate-400 text-sm">No cases currently pending review.</p>
                    ) : (
                      cases.filter(c => c.status === 'pending').slice(0, 3).map(c => (
                        <div key={c.id} className="flex justify-between items-center p-3 border border-slate-100 bg-slate-50 rounded text-sm">
                          <div>
                            <div className="font-bold text-slate-800">{c.title}</div>
                            <div className="text-xs text-slate-500 mt-0.5">Filed by: {c.lawyer_name || 'Counsel'} &bull; {c.case_type}</div>
                          </div>
                          <button
                            onClick={() => handleCaseReviewSelect(c)}
                            className="courtx-btn courtx-btn-secondary text-[10px] py-1.5 px-3 uppercase tracking-wider font-bold"
                          >
                            Review File
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                <div className="courtx-card bg-white">
                  <h3 className="text-base font-bold text-slate-800 mb-4 font-heading">New Bar Members to Authorize</h3>
                  <div className="space-y-3">
                    {pendingLawyers.length === 0 ? (
                      <p className="text-slate-400 text-sm">No lawyer registrations pending verification.</p>
                    ) : (
                      pendingLawyers.slice(0, 3).map(l => (
                        <div key={l.id} className="flex justify-between items-center p-3 border border-slate-100 bg-slate-50 rounded text-sm">
                          <div>
                            <div className="font-bold text-slate-800">{l.username}</div>
                            <div className="text-xs text-slate-500 mt-0.5">Bar No: {l.bar_number} &bull; Reg: {l.reg_date}</div>
                          </div>
                          <button
                            onClick={() => handleApproveLawyer(l.id)}
                            className="p-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded transition-colors"
                            title="Approve User Credentials"
                          >
                            <Check size={16} />
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: REVIEW FILED CASES */}
          {activeTab === 'review_cases' && (
            <div className="courtx-card bg-white p-6">
              <h3 className="text-lg font-bold text-slate-800 font-heading mb-4">Case Registry Approval Desk</h3>
              <div className="space-y-4">
                {cases.filter(c => c.status === 'pending').length === 0 ? (
                  <p className="text-slate-400 text-sm text-center py-8">All case filings verified.</p>
                ) : (
                  <div className="courtx-table-container">
                    <table className="courtx-table">
                      <thead>
                        <tr>
                          <th>Filing Reference</th>
                          <th>Classification</th>
                          <th>Litigant Profile</th>
                          <th>Filing Counsel</th>
                          <th>Details Summary</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {cases.filter(c => c.status === 'pending').map(c => (
                          <tr key={c.id}>
                            <td className="font-bold text-slate-800">{c.case_number}</td>
                            <td>{c.case_type}</td>
                            <td>
                              <strong>{c.client_name}</strong> <br />
                              <span className="text-xs text-slate-400">{c.client_email}</span>
                            </td>
                            <td>{c.lawyer_name || 'Registry Clerk'}</td>
                            <td className="max-w-xs truncate text-xs">{c.description || 'No summary'}</td>
                            <td>
                              <div className="flex gap-2">
                                <button
                                  onClick={() => handleCaseReviewSelect(c)}
                                  className="courtx-btn courtx-btn-secondary text-[10px] py-1 px-2.5 uppercase tracking-wider font-bold"
                                >
                                  Details
                                </button>
                                <button
                                  onClick={() => handleApproveCase(c.id)}
                                  className="courtx-btn courtx-btn-teal text-[10px] py-1 px-2.5 flex items-center gap-1 uppercase tracking-wider font-bold"
                                >
                                  <Check size={12} />
                                  Approve
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: SCHEDULE HEARINGS */}
          {activeTab === 'schedule_hearings' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Left Case list for scheduling */}
              <div className="courtx-card bg-white p-6 lg:col-span-2">
                <h3 className="text-lg font-bold text-slate-800 font-heading mb-4">Approved Cases Awaiting Calendaring</h3>
                {cases.filter(c => c.status === 'approved').length === 0 ? (
                  <p className="text-slate-400 text-sm py-8 text-center">No approved cases currently awaiting scheduling.</p>
                ) : (
                  <div className="space-y-3">
                    {cases.filter(c => c.status === 'approved').map(c => (
                      <div 
                        key={c.id} 
                        className={`p-4 border rounded cursor-pointer transition-all flex justify-between items-center ${selectedCaseForHearing?.id === c.id ? 'border-teal-600 bg-teal-50/20' : 'border-slate-200 bg-white hover:bg-slate-50'}`}
                        onClick={() => { setSelectedCaseForHearing(c); setSchedError(''); setSchedSuccess(''); }}
                      >
                        <div>
                          <div className="font-bold text-slate-800">{c.title}</div>
                          <div className="text-xs text-slate-500 mt-1">
                            Docket: {c.case_number} &bull; Client: {c.client_name} &bull; Counsel: {c.lawyer_name || 'Counsel'}
                          </div>
                        </div>
                        <Plus size={18} className="text-teal-600" />
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Right Scheduling Form */}
              <div className="courtx-card bg-white p-6">
                <h3 className="text-lg font-bold text-slate-800 font-heading mb-4">Schedule Docket</h3>
                
                {selectedCaseForHearing ? (
                  <form onSubmit={handleScheduleHearingSubmit} className="space-y-4">
                    <div className="p-3 bg-slate-50 border border-slate-100 rounded text-xs">
                      <strong>Target File:</strong> {selectedCaseForHearing.title} <br />
                      <strong>Docket:</strong> {selectedCaseForHearing.case_number}
                    </div>

                    {schedError && <div className="p-3 bg-amber-50 text-amber-800 text-xs rounded border border-amber-200">{schedError}</div>}
                    {schedSuccess && <div className="p-3 bg-teal-50 text-teal-800 text-xs rounded border border-teal-200">{schedSuccess}</div>}

                    <div>
                      <label className="courtx-label">Hearing Date</label>
                      <input
                        type="date"
                        required
                        className="courtx-input text-sm"
                        value={hearingDate}
                        onChange={(e) => setHearingDate(e.target.value)}
                      />
                    </div>

                    <div>
                      <label className="courtx-label">Hearing Session Time</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. 09:30 AM or 02:00 PM"
                        className="courtx-input text-sm"
                        value={hearingTime}
                        onChange={(e) => setHearingTime(e.target.value)}
                      />
                    </div>

                    <div>
                      <label className="courtx-label">Courtroom Assignment</label>
                      <select
                        className="courtx-input text-sm"
                        value={courtroom}
                        onChange={(e) => setCourtroom(e.target.value)}
                      >
                        <option value="Courtroom No. 01 (District Court)">Courtroom No. 01</option>
                        <option value="Courtroom No. 02 (District Court)">Courtroom No. 02</option>
                        <option value="Courtroom No. 03 (District Court)">Courtroom No. 03</option>
                        <option value="Courtroom No. 04 (District Court)">Courtroom No. 04</option>
                      </select>
                    </div>

                    <div>
                      <label className="courtx-label">Presiding Magistrate/Judge</label>
                      <input
                        type="text"
                        placeholder="e.g. Hon. Judge K. Silva"
                        className="courtx-input text-sm"
                        value={judge}
                        onChange={(e) => setJudge(e.target.value)}
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full courtx-btn courtx-btn-primary text-xs font-bold uppercase tracking-wider"
                    >
                      Publish Schedule
                    </button>
                  </form>
                ) : (
                  <p className="text-slate-400 text-xs text-center py-12">
                    Select a case from the list on the left to schedule its hearing dates.
                  </p>
                )}
              </div>
            </div>
          )}

          {/* TAB 4: APPROVE LAWYERS */}
          {activeTab === 'approve_lawyers' && (
            <div className="courtx-card bg-white p-6">
              <h3 className="text-lg font-bold text-slate-800 font-heading mb-4">Lawyer Bar Association Registrations</h3>
              {pendingLawyers.length === 0 ? (
                <p className="text-slate-400 text-sm text-center py-8">No pending registrations awaiting approval.</p>
              ) : (
                <div className="courtx-table-container">
                  <table className="courtx-table">
                    <thead>
                      <tr>
                        <th>Username</th>
                        <th>Email Address</th>
                        <th>Bar Council ID</th>
                        <th>Registration Date</th>
                        <th>Phone</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pendingLawyers.map(l => (
                        <tr key={l.id}>
                          <td className="font-bold text-slate-800">{l.username}</td>
                          <td>{l.email}</td>
                          <td className="font-mono text-xs">{l.bar_number}</td>
                          <td>{l.reg_date}</td>
                          <td>{l.phone || 'N/A'}</td>
                          <td>
                            <button
                              onClick={() => handleApproveLawyer(l.id)}
                              className="courtx-btn courtx-btn-teal text-xs py-1 px-3 flex items-center gap-1 font-bold uppercase tracking-wider"
                            >
                              <Check size={12} />
                              Verify &amp; Approve
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* TAB 5: SEARCH RECORDS */}
          {activeTab === 'search' && (
            <div className="space-y-6">
              <div className="courtx-card bg-white p-6">
                <h3 className="text-lg font-bold text-slate-800 font-heading mb-4">Search Registry Archives</h3>
                
                <form onSubmit={handleSearchSubmit} className="flex gap-3">
                  <div className="relative flex-1">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                      <Search size={18} />
                    </span>
                    <input
                      type="text"
                      className="courtx-input pl-10"
                      placeholder="Search by Docket No, Title, Litigant, or Attorney Name..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  <button
                    type="submit"
                    className="courtx-btn courtx-btn-teal px-6 font-bold"
                  >
                    Search
                  </button>
                </form>
              </div>

              {searchResults.length > 0 && (
                <div className="courtx-card bg-white p-6 animate-fade-in">
                  <h4 className="text-sm font-bold text-slate-700 font-heading mb-4">Search Results ({searchResults.length})</h4>
                  <div className="courtx-table-container">
                    <table className="courtx-table">
                      <thead>
                        <tr>
                          <th>Docket</th>
                          <th>Case Title</th>
                          <th>Case Type</th>
                          <th>Client Name</th>
                          <th>Filing Attorney</th>
                          <th>Filing Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {searchResults.map(c => (
                          <tr key={c.id}>
                            <td className="font-bold text-slate-800">{c.case_number}</td>
                            <td className="font-semibold text-teal-800 cursor-pointer hover:underline" onClick={() => handleCaseReviewSelect(c)}>{c.title}</td>
                            <td>{c.case_type}</td>
                            <td>{c.client_name}</td>
                            <td>{c.lawyer_name || 'Registry'}</td>
                            <td>
                              <span className={`courtx-badge ${getStatusClass(c.status)}`}>
                                {c.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 6: ANALYTICS & REPORTS */}
          {activeTab === 'analytics' && (
            <div className="space-y-6">
              {analytics ? (
                <>
                  {/* Summary row */}
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
                    <div className="courtx-card bg-white text-center">
                      <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">Total Cases Filed</div>
                      <div className="text-4xl font-extrabold text-slate-800 mt-2 font-heading">{analytics.totals.cases}</div>
                    </div>
                    <div className="courtx-card bg-white text-center">
                      <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">Active Trials</div>
                      <div className="text-4xl font-extrabold text-teal-700 mt-2 font-heading">{analytics.totals.active}</div>
                    </div>
                    <div className="courtx-card bg-white text-center">
                      <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">Pending Verification</div>
                      <div className="text-4xl font-extrabold text-amber-600 mt-2 font-heading">{analytics.totals.pending}</div>
                    </div>
                    <div className="courtx-card bg-white text-center">
                      <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">Closed Dockets</div>
                      <div className="text-4xl font-extrabold text-slate-400 mt-2 font-heading">{analytics.totals.closed}</div>
                    </div>
                  </div>

                  {/* Graphical Mock Sections */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Distribution chart */}
                    <div className="courtx-card bg-white p-6">
                      <h4 className="text-sm font-bold text-slate-700 font-heading uppercase tracking-wider mb-6">Filings by Case Classification</h4>
                      <div className="space-y-4">
                        {analytics.caseTypes.map((t, idx) => {
                          const percentage = Math.round((t.count / analytics.totals.cases) * 100);
                          return (
                            <div key={idx} className="space-y-1">
                              <div className="flex justify-between text-xs font-semibold text-slate-600">
                                <span>{t.case_type}</span>
                                <span>{t.count} ({percentage}%)</span>
                              </div>
                              <div className="w-full bg-slate-100 rounded-full h-2">
                                <div 
                                  className="bg-teal-600 h-2 rounded-full" 
                                  style={{ width: `${percentage}%` }}
                                ></div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Room Schedule volume */}
                    <div className="courtx-card bg-white p-6">
                      <h4 className="text-sm font-bold text-slate-700 font-heading uppercase tracking-wider mb-6">Courtroom Allocation Load</h4>
                      <div className="space-y-4">
                        {analytics.courtrooms.map((r, idx) => (
                          <div key={idx} className="flex justify-between items-center text-xs p-3 bg-slate-50 border border-slate-100 rounded">
                            <span className="font-semibold text-slate-700">{r.courtroom}</span>
                            <span className="px-2.5 py-1 bg-teal-50 border border-teal-200 text-teal-700 font-bold rounded">
                              {r.count} Hearings Scheduled
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center py-12 text-slate-400">Loading system metrics report...</div>
              )}
            </div>
          )}

        </div>
      </main>

      {/* Case Details Review Modal */}
      {selectedCaseReview && caseReviewDetails && (
        <Modal 
          isOpen={!!selectedCaseReview} 
          onClose={() => { setSelectedCaseReview(null); setCaseReviewDetails(null); }} 
          title={`Verify File: ${selectedCaseReview.case_number}`}
        >
          <div className="space-y-6">
            <div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Title / Incident Name</span>
              <span className="text-base font-bold text-slate-800 block mt-0.5">{selectedCaseReview.title}</span>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-slate-400 block font-bold text-xs uppercase tracking-wider">Classification</span>
                <span className="text-slate-700 font-semibold">{selectedCaseReview.case_type}</span>
              </div>
              <div>
                <span className="text-slate-400 block font-bold text-xs uppercase tracking-wider">Current Status</span>
                <span className={`courtx-badge ${getStatusClass(selectedCaseReview.status)} mt-0.5`}>
                  {selectedCaseReview.status}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-slate-400 block font-bold text-xs uppercase tracking-wider">Client Name</span>
                <span className="text-slate-700 font-semibold">{selectedCaseReview.client_name}</span>
              </div>
              <div>
                <span className="text-slate-400 block font-bold text-xs uppercase tracking-wider">Filing Counsel</span>
                <span className="text-slate-700 font-semibold">{selectedCaseReview.lawyer_name || 'Counsel'}</span>
              </div>
            </div>

            {selectedCaseReview.description && (
              <div>
                <span className="text-slate-400 block font-bold text-xs uppercase tracking-wider mb-1">Details Summary</span>
                <p className="text-sm text-slate-600 bg-slate-50 p-3 rounded border border-slate-100 leading-relaxed">
                  {selectedCaseReview.description}
                </p>
              </div>
            )}

            {/* Uploaded Documents List */}
            <div>
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Annexed Complaint Documents</h4>
              {caseReviewDetails.documents.length === 0 ? (
                <p className="text-xs text-slate-500 italic">No complaint files annexed.</p>
              ) : (
                <div className="space-y-2">
                  {caseReviewDetails.documents.map(d => (
                    <div key={d.id} className="flex justify-between items-center p-2.5 bg-slate-50 border border-slate-100 rounded text-xs">
                      <div className="flex items-center gap-2">
                        <FileText size={16} className="text-slate-400" />
                        <span className="font-semibold text-slate-700">{d.name}</span>
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

            {/* Approval Action buttons */}
            {selectedCaseReview.status === 'pending' && (
              <div className="flex gap-4 pt-4 border-t border-slate-100">
                <button
                  onClick={() => handleApproveCase(selectedCaseReview.id)}
                  className="flex-1 courtx-btn courtx-btn-teal flex items-center justify-center gap-2"
                >
                  <Check size={16} />
                  Verify &amp; Approve File
                </button>
                <button
                  onClick={async () => {
                    if (!window.confirm('Reject this filing? The lawyer will be notified.')) return;
                    try {
                      const response = await fetch(`http://127.0.0.1:5001/api/cases/${selectedCaseReview.id}/status`, {
                        method: 'PUT',
                        headers: {
                          'Content-Type': 'application/json',
                          'Authorization': `Bearer ${localStorage.getItem('courtx_token')}`
                        },
                        body: JSON.stringify({ status: 'rejected' })
                      });
                      if (response.ok) {
                        fetchCases();
                        fetchAnalytics();
                        setSelectedCaseReview(null);
                        setCaseReviewDetails(null);
                      }
                    } catch (err) {
                      console.error(err);
                    }
                  }}
                  className="flex-1 courtx-btn bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 flex items-center justify-center gap-2 text-sm font-bold"
                >
                  <X size={16} />
                  Reject Filing
                </button>
              </div>
            )}
          </div>
        </Modal>
      )}

    </div>
  );
}
