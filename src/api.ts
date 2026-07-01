import { CallLog, Location, TranscriptMessage } from './types';

function parseTranscript(transcriptText: string | null | undefined): TranscriptMessage[] {
  if (!transcriptText) return [];
  const lines = transcriptText.split('\n').filter(l => l.trim().length > 0);
  const messages: TranscriptMessage[] = [];
  
  for (const line of lines) {
    if (line.startsWith('bot:')) {
      messages.push({ role: 'bot', text: line.substring(4).trim(), timestamp: '' });
    } else if (line.startsWith('human:')) {
      messages.push({ role: 'human', text: line.substring(6).trim(), timestamp: '' });
    } else {
      if (messages.length > 0) {
        messages[messages.length - 1].text += '\n' + line;
      }
    }
  }
  return messages;
}

function determineStatus(duration: number): 'Human Answered' | 'Voicemail' | 'No Answer' | 'Failed' {
  if (duration === 0) return 'Failed';
  if (duration > 0 && duration <= 60) return 'Voicemail';
  return 'Human Answered';
}

export async function fetchLocations(token?: string): Promise<Location[]> {
  try {
    const headers: Record<string, string> = {};
    if (token) headers['x-ghl-token'] = token;
    
    const res = await fetch('/api/locations', { headers });
    if (!res.ok) throw new Error('Failed to fetch locations');
    const data = await res.json();
    
    if (data.locations && Array.isArray(data.locations)) {
      return data.locations.map((loc: any) => ({ id: loc.id, name: loc.name }));
    }
    if (data.location) {
      return [{ id: data.location.id, name: data.location.name }];
    }
    return [];
  } catch (error) {
    console.error(error);
    return [];
  }
}

export async function fetchCallLogs(locationId: string, token?: string): Promise<CallLog[]> {
  if (!locationId) return [];
  try {
    const headers: Record<string, string> = {};
    if (token) headers['x-ghl-token'] = token;

    const res = await fetch(`/api/call-logs?locationId=${locationId}`, { headers });
    const data = await res.json();
    
    if (!res.ok) {
      console.error('API Error:', data);
      const errMsg = data.message || data.error || (data.error && data.error.message) || 'Failed to fetch call logs';
      throw new Error(typeof errMsg === 'string' ? errMsg : JSON.stringify(errMsg));
    }
    
    const logs = Array.isArray(data.callLogs) ? data.callLogs : [];
    
    return logs.map((log: any) => ({
      id: log.id || log.messageId,
      locationId: locationId,
      contactId: log.contactId,
      contactName: log.extractedData?.name || 'Unknown',
      fromNumber: log.fromNumber || 'Unknown',
      createdAt: log.createdAt || new Date().toISOString(),
      duration: log.duration || 0,
      agentId: log.agentId || '',
      agentName: 'AI Agent', 
      status: determineStatus(log.duration || 0),
      workflowName: 'Inbound / Outbound',
      actionsTriggered: log.executedCallActions?.length || 0,
      summary: log.summary || '',
      transcript: parseTranscript(log.transcript),
      extractedData: log.extractedData || {},
      trialCall: !!log.trialCall
    }));
  } catch (error) {
    console.error(error);
    return [];
  }
}
