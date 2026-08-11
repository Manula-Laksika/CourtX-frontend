import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, Plus, Trash2, Send, Sparkles, RefreshCw, Copy, X } from 'lucide-react';

export default function FloatingAIAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [aiConvos, setAiConvos] = useState([]);
  const [activeConvoId, setActiveConvoId] = useState(null);
  const [aiMessages, setAiMessages] = useState([]);
  const [userInput, setUserInput] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const chatEndRef = useRef(null);

  const suggestedQuestions = [
    "Can I file for divorce due to malicious desertion?",
    "What are the legal requirements for constructive malicious desertion?",
    "Which Act applies if the spouse committed adultery?",
    "What case law discusses malicious desertion?"
  ];

  useEffect(() => {
    if (isOpen && aiConvos.length === 0) {
      fetchConversations();
    }
  }, [isOpen]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [aiMessages]);

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

  return (
    <>
      {/* Floating Action Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-6 right-6 p-4 rounded-full shadow-2xl z-[101] transition-all duration-300 transform hover:scale-105 ${
          isOpen ? 'bg-slate-800 text-white' : 'bg-teal-600 text-white hover:bg-teal-700'
        }`}
        title="AI Legal Assistant"
      >
        {isOpen ? <X size={24} /> : <Sparkles size={24} />}
      </button>

      {/* Background Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-[100] transition-opacity animate-fade-in"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed top-4 bottom-24 left-4 right-4 md:top-auto md:left-auto md:bottom-24 md:right-6 md:w-[700px] md:h-[600px] bg-white border border-slate-200 rounded-xl shadow-2xl z-[101] flex flex-col md:flex-row overflow-hidden animate-fade-in">
          
          {/* Left Chat History Pane (Hidden on very small screens, visible on md+) */}
          <div className="hidden md:flex w-64 border-r border-slate-200 bg-slate-50 flex-col justify-between shrink-0">
            <div>
              <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-[#FDFBF7]">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Consultations</span>
                <button
                  onClick={createNewConversation}
                  className="p-1 text-teal-600 hover:bg-teal-50 rounded transition-colors"
                  title="New Consultation"
                >
                  <Plus size={18} />
                </button>
              </div>

              <div className="p-2 space-y-1 overflow-y-auto max-h-[400px]">
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
                Clear History
              </button>
            </div>
          </div>

          {/* Middle Chat Interface */}
          <div className="flex-1 flex flex-col h-full bg-[#FDFBF7] relative">
            {/* Mobile Top Bar for History Toggle / New Chat */}
            <div className="md:hidden p-3 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
              <span className="text-sm font-bold font-heading text-slate-800">CourtX AI</span>
              <div className="flex gap-2">
                <button
                  onClick={createNewConversation}
                  className="p-1.5 bg-teal-50 text-teal-700 rounded-md shadow-sm border border-teal-200 text-xs flex items-center gap-1"
                >
                  <Plus size={12} /> New
                </button>
                <button
                  onClick={clearConvoHistory}
                  className="p-1.5 text-red-600 bg-red-50 rounded-md border border-red-200"
                >
                  <Trash2 size={12} />
                </button>
              </div>
            </div>

            {/* Chat Message Window */}
            <div className="flex-1 p-4 md:p-6 overflow-y-auto space-y-6">
              {aiMessages.length === 0 ? (
                <div className="h-full flex flex-col justify-center items-center text-center max-w-sm mx-auto">
                  <div className="p-4 bg-teal-50 border border-teal-100 rounded-full text-teal-600 mb-4">
                    <Sparkles size={32} />
                  </div>
                  <h4 className="text-lg font-serif text-slate-800 mb-2">CourtX AI Legal Assistant</h4>
                  <p className="text-slate-500 text-xs leading-relaxed mb-6">
                    Welcome to your specialized legal assistant for Sri Lankan Divorce Law. Ask me anything.
                  </p>

                  <div className="w-full grid grid-cols-1 gap-2 text-left">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Suggested Questions:</span>
                    {suggestedQuestions.map((q, i) => (
                      <button
                        key={i}
                        onClick={() => handleAiChatSubmit(null, q)}
                        className="p-2.5 bg-white border border-slate-200 rounded hover:border-teal-600 text-[11px] text-slate-700 hover:bg-teal-50 text-left transition-all leading-tight"
                      >
                        {q}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {aiMessages.map((m) => (
                    <div key={m.id} className={`flex flex-col ${m.role === 'user' ? 'items-end' : 'items-start'}`}>
                      <div className={`p-3 md:p-4 rounded-lg max-w-[90%] shadow-sm border ${
                        m.role === 'user' 
                          ? 'bg-slate-900 border-slate-800 text-white rounded-br-none' 
                          : 'bg-white border-slate-200 rounded-bl-none'
                      }`}>
                        {m.role === 'user' ? (
                          <p className="text-xs md:text-sm font-sans leading-relaxed whitespace-pre-wrap">{m.content}</p>
                        ) : (
                          <div className="space-y-3 text-slate-800">
                            <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                              <div className="flex items-center gap-1.5 text-[10px] md:text-xs text-teal-700 font-bold uppercase tracking-wider">
                                <Sparkles size={12} />
                                AI Result
                              </div>
                              <button 
                                onClick={() => handleCopyText(m.content)}
                                className="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded transition-colors"
                                title="Copy Response"
                              >
                                <Copy size={12} />
                              </button>
                            </div>

                            <div className="grid grid-cols-1 gap-2 text-[11px] md:text-xs">
                              <div>
                                <span className="font-bold text-slate-400 uppercase tracking-wider block">Legal Ground & Acts:</span>
                                <span className="text-slate-800 font-semibold mt-0.5 block">{m.content.ground || 'N/A'} - {m.content.acts || 'N/A'}</span>
                              </div>
                              <div>
                                <span className="font-bold text-slate-400 uppercase tracking-wider block">Sections & Case Law:</span>
                                <span className="text-slate-800 font-semibold mt-0.5 block">{m.content.sections || 'N/A'}</span>
                                <span className="text-slate-800 font-semibold mt-0.5 block italic">{m.content.caseLaw || 'N/A'}</span>
                              </div>
                            </div>

                            <div className="text-[11px] md:text-xs bg-slate-50/50 p-2.5 rounded border border-slate-100">
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
                      <div className="bg-white border border-slate-200 p-3 rounded-lg rounded-bl-none flex items-center gap-2">
                        <RefreshCw size={14} className="text-teal-600 animate-spin" />
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest animate-pulse">Researching...</span>
                      </div>
                    </div>
                  )}
                  <div ref={chatEndRef} />
                </div>
              )}
            </div>

            {/* Question Input Box */}
            <form onSubmit={handleAiChatSubmit} className="p-3 md:p-4 border-t border-slate-200 bg-white flex gap-2">
              <input
                type="text"
                required
                disabled={aiLoading}
                placeholder="Ask a question..."
                className="flex-1 courtx-input text-sm"
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
              />
              <button
                type="submit"
                disabled={aiLoading}
                className="courtx-btn courtx-btn-teal flex items-center justify-center px-4"
              >
                <Send size={16} />
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
