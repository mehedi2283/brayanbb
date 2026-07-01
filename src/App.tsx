/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useMemo, useEffect, useRef } from 'react';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { MetricCard } from './components/MetricCard';
import { ChartRow } from './components/ChartRow';
import { CallsTable } from './components/CallsTable';
import { SummaryModal } from './components/SummaryModal';
import { SettingsView } from './components/SettingsView';
import { fetchLocations, fetchCallLogs } from './api';
import { CallLog, Location } from './types';
import { Edit2, Link as LinkIcon, Check, Copy, X } from 'lucide-react';

function SubAccountsView({ locations, selectedLocationId, onTokenChange }: { locations: Location[], selectedLocationId: string, onTokenChange: (val: string) => void }) {
  const [tokens, setTokens] = useState<Record<string, string>>({});
  const [loadingTokens, setLoadingTokens] = useState(true);

  useEffect(() => {
    fetch('/api/tokens')
      .then(res => res.json())
      .then(data => {
        const t: Record<string, string> = {};
        if (Array.isArray(data)) {
          data.forEach(item => {
            if (item.locationId && item.pitToken) t[item.locationId] = item.pitToken;
          });
        }
        setTokens(t);
        setLoadingTokens(false);
      })
      .catch(err => {
        console.error('Failed to load tokens from DB', err);
        setLoadingTokens(false);
      });
  }, []);

  const [editingLoc, setEditingLoc] = useState<Location | null>(null);
  const [editTokenValue, setEditTokenValue] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  
  const [linkLoc, setLinkLoc] = useState<Location | null>(null);
  const [copied, setCopied] = useState(false);

  const handleSaveToken = async () => {
    if (editingLoc) {
      setIsSaving(true);
      try {
        await fetch(`/api/tokens/${editingLoc.id}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ pitToken: editTokenValue })
        });
        setTokens(prev => ({ ...prev, [editingLoc.id]: editTokenValue }));
        if (editingLoc.id === selectedLocationId) {
          onTokenChange(editTokenValue);
        }
        setEditingLoc(null);
      } catch (err) {
        console.error('Failed to save token to DB', err);
      } finally {
        setIsSaving(false);
      }
    }
  };

  const getMagicLink = (locId: string) => {
    const baseUrl = window.location.origin + window.location.pathname;
    return `${baseUrl}?loc=${locId}`;
  };

  const handleCopy = (locId: string) => {
    const link = getMagicLink(locId);
    if (link) {
      navigator.clipboard.writeText(link);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <>
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-6 py-4 text-left font-semibold text-slate-600">Sub-Account Name</th>
              <th className="px-6 py-4 text-left font-semibold text-slate-600">Location ID</th>
              <th className="px-6 py-4 text-left font-semibold text-slate-600">API Key</th>
              <th className="px-6 py-4 text-right font-semibold text-slate-600">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {locations.map(loc => {
              const hasToken = !!tokens[loc.id];
              return (
                <tr key={loc.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4 font-medium text-slate-800">{loc.name}</td>
                  <td className="px-6 py-4 text-slate-500 font-mono text-xs">{loc.id}</td>
                  <td className="px-6 py-4 text-slate-500">
                    {hasToken ? <span className="text-green-600 font-medium flex items-center"><Check className="w-4 h-4 mr-1" /> Configured</span> : <span className="text-slate-400">Not Configured</span>}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end space-x-2">
                      <button 
                        onClick={() => {
                          setEditingLoc(loc);
                          setEditTokenValue(tokens[loc.id] || '');
                        }}
                        className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                        title="Edit API Key"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => setLinkLoc(loc)}
                        disabled={!hasToken}
                        className={`p-1.5 rounded-md transition-colors ${hasToken ? 'text-slate-400 hover:text-blue-600 hover:bg-blue-50' : 'text-slate-300 opacity-50 cursor-not-allowed'}`}
                        title={hasToken ? "Generate Magic Link" : "Configure API Key first"}
                      >
                        <LinkIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
            {locations.length === 0 && (
              <tr>
                <td colSpan={4} className="px-6 py-8 text-center text-slate-500">
                  No sub-accounts found. Ensure your Agency API Key is configured.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {editingLoc && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-slate-100">
              <h3 className="font-semibold text-slate-800">Configure API Key</h3>
              <button onClick={() => setEditingLoc(null)} className="text-slate-400 hover:text-slate-600 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Sub-Account</label>
                <div className="text-sm text-slate-500">{editingLoc.name}</div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Private Integration Token (PIT)</label>
                <input
                  type="password"
                  placeholder="Enter token..."
                  className="w-full bg-white border border-slate-200 text-sm rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                  value={editTokenValue}
                  onChange={(e) => setEditTokenValue(e.target.value)}
                />
              </div>
            </div>
            <div className="p-4 border-t border-slate-100 flex justify-end space-x-3 bg-slate-50">
              <button 
                onClick={() => setEditingLoc(null)}
                className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleSaveToken}
                disabled={isSaving}
                className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {isSaving ? 'Applying...' : 'Apply Token'}
              </button>
            </div>
          </div>
        </div>
      )}

      {linkLoc && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-slate-100">
              <h3 className="font-semibold text-slate-800">Magic Link</h3>
              <button onClick={() => { setLinkLoc(null); setCopied(false); }} className="text-slate-400 hover:text-slate-600 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 space-y-4">
              <p className="text-sm text-slate-600">
                Share this link with your client. They will only have access to call logs for <strong>{linkLoc.name}</strong>.
              </p>
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  readOnly
                  className="flex-1 bg-slate-50 border border-slate-200 text-sm rounded-md px-3 py-2 text-slate-500 outline-none"
                  value={getMagicLink(linkLoc.id)}
                />
                <button
                  onClick={() => handleCopy(linkLoc.id)}
                  className="p-2 bg-blue-50 text-blue-600 rounded-md hover:bg-blue-100 transition-colors flex items-center justify-center shrink-0 w-10 h-10"
                >
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <div className="p-4 border-t border-slate-100 flex justify-end bg-slate-50">
              <button 
                onClick={() => { setLinkLoc(null); setCopied(false); }}
                className="px-4 py-2 bg-slate-200 text-slate-800 text-sm font-medium rounded-md hover:bg-slate-300 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

const MOCK_CALL_LOGS: any[] = [
  {
    id: 'mock-1',
    locationId: 'loc-1',
    callId: 'call-1',
    contactId: 'contact-1',
    contactName: 'Alice Smith',
    conversationId: 'conv-1',
    callStatus: 'completed',
    toNumber: '+1234567890',
    fromNumber: '+1987654321',
    durationInSeconds: 145,
    recordingUrl: 'https://example.com/audio.mp3',
    startedAt: new Date(Date.now() - 3600000).toISOString(),
    updatedAt: new Date().toISOString(),
    agentId: 'agent-1',
    status: 'Human Answered',
    duration: 145,
    agentName: 'Mock Agent',
    workflowName: 'Test Workflow',
    actionsTriggered: 1,
    summary: 'Test summary',
    transcript: [],
    extractedData: {},
    createdAt: new Date().toISOString(),
  },
  {
    id: 'mock-2',
    locationId: 'loc-1',
    callId: 'call-2',
    contactId: 'contact-2',
    contactName: 'Bob Johnson',
    conversationId: 'conv-2',
    callStatus: 'voicemail',
    toNumber: '+1234567891',
    fromNumber: '+1987654322',
    durationInSeconds: 30,
    startedAt: new Date(Date.now() - 7200000).toISOString(),
    updatedAt: new Date().toISOString(),
    agentId: 'agent-1',
    status: 'Voicemail',
    duration: 30,
    agentName: 'Mock Agent',
    workflowName: 'Test Workflow 2',
    actionsTriggered: 0,
    summary: 'Left voicemail',
    transcript: [],
    extractedData: {},
    createdAt: new Date().toISOString(),
  }
];

export default function App() {
  const [locations, setLocations] = useState<Location[]>([]);
  const [selectedLocationId, setSelectedLocationId] = useState<string>(() => localStorage.getItem('ghl_location_id') || '');
  const [calls, setCalls] = useState<CallLog[]>([]);
  const [selectedCall, setSelectedCall] = useState<CallLog | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [showConfig, setShowConfig] = useState(() => !localStorage.getItem('ghl_sub_account_token'));
  const [configToken, setConfigToken] = useState(() => localStorage.getItem('ghl_sub_account_token') || '');
  const [debouncedToken, setDebouncedToken] = useState(configToken);
  const [currentView, setCurrentView] = useState<'call-logs' | 'sub-accounts' | 'settings'>('call-logs');
  const [isClientMode, setIsClientMode] = useState(() => sessionStorage.getItem('ghl_client_mode') === 'true');

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedToken(configToken), 600);
    return () => clearTimeout(timer);
  }, [configToken]);

  const handleTokenChange = (token: string) => {
    setConfigToken(token);
    if (selectedLocationId) {
      localStorage.setItem(`ghl_token_${selectedLocationId}`, token);
    }
  };

  useEffect(() => {
    if (selectedLocationId) {
      localStorage.setItem('ghl_location_id', selectedLocationId);
      const storedToken = localStorage.getItem(`ghl_token_${selectedLocationId}`);
      if (storedToken !== null) {
        setConfigToken(storedToken);
      } else {
        const legacy = localStorage.getItem('ghl_sub_account_token');
        if (legacy) {
          setConfigToken(legacy);
          localStorage.setItem(`ghl_token_${selectedLocationId}`, legacy);
        } else {
          setConfigToken('');
        }
      }
    }
  }, [selectedLocationId]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const magicLoc = params.get('loc');
    
    if (magicLoc) {
      localStorage.setItem('ghl_location_id', magicLoc);
      setSelectedLocationId(magicLoc);
      setCurrentView('call-logs');
      setIsClientMode(true);
      sessionStorage.setItem('ghl_client_mode', 'true');
      // Remove params from URL so it doesn't linger
      window.history.replaceState({}, '', window.location.pathname);
    }

    setLoading(true);
    fetchLocations().then(locs => {
      setLocations(locs);
      if (locs.length > 0) {
        if (!selectedLocationId || !locs.find(l => l.id === selectedLocationId)) {
          setSelectedLocationId(locs[0].id);
        } else {
          setLoading(false);
        }
      } else {
        setLoading(false);
        if (!configToken) setShowConfig(true);
      }
    });
  }, []);

  useEffect(() => {
    if (selectedLocationId) {
      setLoading(true);
      setErrorMsg(null);
      // We can optionally pass the token down, but for now we'll assume the server uses the configured one
      // If we entered a custom one, we would need to pass it to the API. 
      // For simplicity, let's just pass locationId to the API, and we will update fetchCallLogs to optionally take a token.
      fetchCallLogs(selectedLocationId, debouncedToken || undefined)
        .then(data => {
          setCalls(data);
          setLoading(false);
          setIsPreviewMode(false);
        })
        .catch(err => {
          console.error(err);
          const errMsg = err.message || '';
          if (errMsg.includes('not authorized')) {
            // Fallback to mock data to show the UI if the token doesn't have the right scopes
            setCalls(MOCK_CALL_LOGS);
            setIsPreviewMode(true);
            setErrorMsg(null);
          } else if (errMsg.includes('Invalid Private Integration token') || errMsg.includes('Invalid token')) {
            localStorage.removeItem('ghl_sub_account_token');
            setConfigToken('');
            setCalls([]);
            setIsPreviewMode(false);
            setShowConfig(true);
            setErrorMsg('Invalid Private Integration Token. Please enter a valid one.');
          } else {
            setErrorMsg(errMsg || 'An error occurred while fetching call logs.');
            setCalls([]);
            setIsPreviewMode(false);
          }
          setLoading(false);
        });
    }
  }, [selectedLocationId, debouncedToken]);

  const metrics = useMemo(() => {
    const total = calls.length;
    const humanAnswered = calls.filter(c => c.status === 'Human Answered').length;
    const voicemail = calls.filter(c => c.status === 'Voicemail').length;
    const noAnswer = calls.filter(c => c.status === 'No Answer').length;
    const failed = calls.filter(c => c.status === 'Failed').length;
    const actionsTriggered = calls.reduce((acc, call) => acc + call.actionsTriggered, 0);
    const unattempted = Math.floor(total * 0.15); // Mock unattempted

    return {
      attempted: total - unattempted,
      connected: humanAnswered,
      actionsTriggered,
      unattempted,
      humanAnswered,
      voicemail,
      noAnswer,
      failed
    };
  }, [calls]);

  return (
    <div className="flex h-screen w-full bg-[#F8FAFC] font-sans overflow-hidden text-slate-800">
      <Sidebar 
        currentView={currentView}
        onViewChange={setCurrentView}
        locations={locations}
        selectedLocationId={selectedLocationId}
        onLocationChange={setSelectedLocationId}
        isClientMode={isClientMode}
      />
      <main className="flex-1 flex flex-col min-w-0">
        <Header />
        
        <div className="p-5 space-y-5 overflow-auto flex-1 relative">
          {currentView === 'settings' ? (
            <SettingsView />
          ) : currentView === 'sub-accounts' ? (
            <SubAccountsView 
              locations={locations} 
              selectedLocationId={selectedLocationId}
              onTokenChange={handleTokenChange}
            />
          ) : (
            <>
              {errorMsg && (
                <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-red-700">
                        <span className="font-medium">Error:</span> {errorMsg}
                      </p>
                      <p className="text-xs text-red-600 mt-1">
                        Voice AI endpoints typically require a <strong>Sub-Account PIT</strong> with the <code>voice-ai-dashboard.readonly</code> scope. Agency-level tokens will fail here.
                      </p>
                    </div>
                  </div>
                </div>
              )}
              
              {isPreviewMode && (
                <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-md">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-amber-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-amber-700 font-medium">
                        Preview Mode (Unauthorized Token)
                      </p>
                      <p className="text-xs text-amber-600 mt-1">
                        Your token is missing the required scopes (<code>voice-ai-dashboard.readonly</code>) or is invalid. GoHighLevel restricts Agency API keys from accessing Sub-Account call logs. Showing mock data for demonstration. To view actual call logs, please enter a valid Sub-Account PIT in Settings.
                      </p>
                    </div>
                  </div>
                </div>
              )}
              {loading && (
                <div className="absolute inset-0 bg-white/50 backdrop-blur-sm z-10 flex items-center justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              )}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <select className="bg-white border border-slate-200 text-sm rounded-md px-3 py-1.5 font-medium outline-none focus:border-blue-500">
                    <option>All Agents</option>
                    <option>AI Agent</option>
                  </select>
                  <div className="text-xs text-slate-400 font-medium">Total {calls.length} records found</div>
                </div>
              </div>

              <div className="grid grid-cols-4 gap-4">
                <MetricCard title="Attempted Calls" value={metrics.attempted} trend={12} />
                <MetricCard title="Connected Calls" value={metrics.connected} trend={8.4} />
                <MetricCard title="Actions Triggered" value={metrics.actionsTriggered} trend={-2.1} />
                <MetricCard title="Unattempted" value={metrics.unattempted} trend={0} />
              </div>

              <ChartRow 
                humanAnswered={metrics.humanAnswered}
                voicemail={metrics.voicemail}
                noAnswer={metrics.noAnswer}
                failed={metrics.failed}
              />

              <CallsTable 
                calls={calls} 
                onOpenSummary={setSelectedCall} 
              />
            </>
          )}
        </div>
      </main>

      <SummaryModal call={selectedCall} onClose={() => setSelectedCall(null)} />

      {showConfig && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
            <h2 className="text-xl font-semibold mb-4 text-slate-800">Sub-Account API Required</h2>
            <p className="text-sm text-slate-600 mb-6">
              We successfully auto-detected your locations using your Agency API key. However, the Voice AI endpoint strictly requires a <strong>Sub-Account Private Integration Token (PIT)</strong> with the <code>voice-ai-dashboard.readonly</code> scope for the selected location. 
              <br /><br />
              Unfortunately, GHL does not allow auto-generating a Sub-Account PIT from an Agency PIT via the API. Please generate one in the Sub-Account Settings &rarr; Company &rarr; API Key.
            </p>
            {errorMsg && (
              <div className="mb-4 p-3 bg-red-50 text-red-700 text-sm rounded border border-red-200">
                {errorMsg}
              </div>
            )}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Sub-Account API Token</label>
                <input 
                  type="text"
                  value={configToken}
                  onChange={(e) => setConfigToken(e.target.value)}
                  placeholder="pit-..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="pt-2 flex space-x-3">
                <button 
                  onClick={() => setShowConfig(false)}
                  className="flex-1 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-medium py-2 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={() => {
                    if (configToken) {
                      if (selectedLocationId) {
                        localStorage.setItem(`ghl_token_${selectedLocationId}`, configToken);
                      }
                      localStorage.setItem('ghl_sub_account_token', configToken);
                      setShowConfig(false);
                      setLoading(true);
                    }
                  }}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 rounded-lg transition-colors"
                >
                  Save & Load
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
