import { sessionTokenKey } from './users';
import { apiBase } from './config';

const API_BASE = apiBase('/api/rooms');

async function errorMessage(response, fallback) {
  const body = await response.text();
  if (!body) return fallback;
  try {
    const parsed = JSON.parse(body);
    return parsed.detail || parsed.message || parsed.error || fallback;
  } catch {
    return body;
  }
}

async function request(path = '', options = {}) {
  const token = localStorage.getItem(sessionTokenKey);
  let response;
  try {
    response = await fetch(`${API_BASE}${path}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(options.headers || {}),
      },
    });
  } catch {
    throw new Error('Cannot reach the room server. Check that the backend is online and try again.');
  }
  if (!response.ok) {
    throw new Error(await errorMessage(response, 'Room request failed.'));
  }
  return response.json();
}

export function fetchRooms() {
  return request();
}

export function findRoomByCode(code) {
  return request(`/${encodeURIComponent(code.trim())}`);
}

export function createRoomOnServer(room) {
  return request('', {
    method: 'POST',
    body: JSON.stringify(room),
  });
}

export function joinRoomOnServer(code) {
  return request(`/${encodeURIComponent(code.trim())}/join`, { method: 'POST' });
}

export function leaveRoomOnServer(code) {
  return request(`/${encodeURIComponent(code.trim())}/leave`, { method: 'POST' });
}
