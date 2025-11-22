import type { EvanEvent, EvanContent, EvanSession, EvanPaper, EvanKeynote } from '../types';

const API_BASE = 'https://evan.ugent.be/api/v1/';

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public statusText: string,
    public data?: unknown,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    let data;
    try {
      data = await response.json();
    } catch {
      data = undefined;
    }
    throw new ApiError(`API request failed: ${response.statusText}`, response.status, response.statusText, data);
  }
  return response.json();
}

let eventCode: string | null = null;

export function setEventCode(code: string) {
  eventCode = code;
}

function getEventCode(): string {
  if (!eventCode) {
    throw new Error('Event code not set. Call setEventCode() first.');
  }
  return eventCode;
}

function getEventBaseUrl(): string {
  return `${API_BASE}events/${getEventCode()}/`;
}

async function fetchData<T>(url: string): Promise<T> {
  const response = await fetch(url);
  return handleResponse<T>(response);
}

async function fetchArray<T>(endpoint: string): Promise<T[]> {
  const data = await fetchData<{ results?: T[] } | T[]>(`${getEventBaseUrl()}${endpoint}`);
  return Array.isArray(data) ? data : data.results || [];
}

export async function fetchEvent(): Promise<EvanEvent> {
  return fetchData<EvanEvent>(getEventBaseUrl());
}

export async function fetchContents(): Promise<EvanContent[]> {
  return fetchArray<EvanContent>('contents/');
}

export async function fetchSessions(): Promise<EvanSession[]> {
  return fetchArray<EvanSession>('sessions/');
}

export async function fetchPapers(): Promise<EvanPaper[]> {
  return fetchArray<EvanPaper>('papers/');
}

export async function fetchKeynotes(): Promise<EvanKeynote[]> {
  return fetchArray<EvanKeynote>('keynotes/');
}

export async function fetchSessionDetail(sessionUrl: string): Promise<EvanSession> {
  return fetchData<EvanSession>(sessionUrl);
}
