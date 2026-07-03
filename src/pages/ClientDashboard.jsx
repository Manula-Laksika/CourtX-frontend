import React, { useState, useEffect } from 'react';
import { 
  Scale, Briefcase, Calendar, Bell, ChevronRight, FileText, 
  MapPin, Clock, LogOut, CheckCircle, ShieldAlert
} from 'lucide-react';

export default function ClientDashboard({ user, onLogout }) {
  const [cases, setCases] = useState([]);
  const [hearings, setHearings] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [activeCase, setActiveCase] = useState(null);
  const [caseDetails, setCaseDetails] = useState(null);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInitialData();
  }, []);

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

      // Fetch Client's notifications
      const notifRes = await fetch('http://127.0.0.1:5001/api/notifications', { headers: authHeader });
      const notifData = await notifRes.json();
      if (notifRes.ok) setNotifications(notifData);

    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
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
      <header className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between shadow-md">
        <div className="flex items-center gap-3">
          <div className="bg-teal-600 p-2 rounded-lg flex items-center justify-center">
            <Scale size={20} className="text-white" />
          </div>
          <span className="text-lg font-extrabold tracking-widest font-heading">COURTX CLIENT PORTAL</span>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-xs text-slate-300 hidden sm:block">
            Logged in as: <strong className="text-white">{user.username}</strong>
          </div>
          <button 
            onClick={onLogout}
            className="flex items-center gap-1.5 px-3 py-1.5 border border-slate-700 rounded hover:bg-slate-800 text-slate-300 hover:text-white text-xs transition-colors"
          >
            <LogOut size={12} />
            Sign Out
          </button>
        </div>
      </header>

      {/* Main content grid */}
      <main className="flex-1 p-6 max-w-6xl w-full mx-auto space-y-6">
        
        {loading ? (
          <div className="text-center py-20 text-slate-400">Loading your case profile...</div>
        ) : !activeCase ? (
          <div className="courtx-card bg-white p-12 text-center max-w-lg mx-auto mt-12">
            <ShieldAlert size={48} className="mx-auto text-amber-500 mb-4" />
            <h3 className="text-lg font-bold text-slate-800 font-heading">No Active Case Found</h3>
            <p className="text-slate-500 text-sm leading-relaxed mt-2">
              Your account is registered but has not yet been linked to an active court case docket. Please contact your retaining counsel to file your complaint.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
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
