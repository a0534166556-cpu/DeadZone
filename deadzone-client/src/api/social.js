import { apiBase } from './config';
import { sessionTokenKey } from './users';

const API_BASE = apiBase('/api/social');

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
    throw new Error('Cannot reach the social server. Check that the backend is online and try again.');
  }
  if (!response.ok) {
    throw new Error(await errorMessage(response, 'Social request failed.'));
  }
  if (response.status === 204) return null;
  return response.json();
}

export function fetchSocialOverview() {
  return request();
}

export function searchPlayers(username) {
  return request(`/users?username=${encodeURIComponent(username.trim())}`);
}

export function sendFriendRequest(username) {
  return request('/friend-requests', {
    method: 'POST',
    body: JSON.stringify({ username }),
  });
}

export function acceptFriendRequest(requestId) {
  return request(`/friend-requests/${requestId}/accept`, { method: 'POST' });
}

export function declineFriendRequest(requestId) {
  return request(`/friend-requests/${requestId}`, { method: 'DELETE' });
}

export function inviteFriendToRoom(friendId, roomCode) {
  return request('/room-invites', {
    method: 'POST',
    body: JSON.stringify({ friendId, roomCode }),
  });
}

export function acceptRoomInvite(invitationId) {
  return request(`/room-invites/${invitationId}/accept`, { method: 'POST' });
}

export function declineRoomInvite(invitationId) {
  return request(`/room-invites/${invitationId}`, { method: 'DELETE' });
}
