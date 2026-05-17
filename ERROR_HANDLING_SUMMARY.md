# Enhanced Error Handling Implementation

## Overview
This implementation adds comprehensive error handling for authentication failures and server errors specifically for APIs that use the `VITE_BE_URL` environment variable. Other APIs (contest, discussion forum, leaderboard) continue to use regular axios without authentication error handling.

## Changes Made

### 1. Enhanced `axiosConfig.js`
- **Created two axios instances**:
  - `axiosInstance`: Regular axios for general use (contests, discussion, leaderboard)
  - `backendApiInstance`: Special instance with error handling for VITE_BE_URL APIs
- **Added comprehensive error handling** for `backendApiInstance` only:
  - `401 Unauthorized`: Authentication token expired or invalid
  - `403 Forbidden`: User doesn't have permission  
  - `500 Internal Server Error`: Server-side errors
- **Clear authentication data** when these errors occur
- **Automatic redirect** to `/login` page
- **Network error handling** for connectivity issues
- **Centralized authentication clearing** via `clearAuthAndRedirect()` function

### 2. Selective Component Updates

#### Files using `backendApiInstance` (VITE_BE_URL APIs):
- `Login.jsx` - Login API
- `Signup.jsx` - Registration API
- `SolveProblem.jsx` - Problem and submission APIs
- `ContestProblems.jsx` - Problem fetching (only VITE_BE_URL calls)
- `SubmissionsList.jsx` - Submission APIs
- `SubmissionResult.jsx` - Submission APIs
- `Profile.jsx` - Submission APIs
- `ProblemsList.jsx` - Problem APIs

#### Files using regular `axios` (Other APIs):
- `Contests.jsx` - Uses VITE_DJ_URL (no error handling)
- `DiscussionForum.jsx` - Uses discussion APIs (no error handling)
- `Leaderboard.jsx` - Uses VITE_LEADERBOARD_URL (no error handling)
- `ContestProblems.jsx` - Uses VITE_DJ_URL for leaderboard (no error handling)

### 3. Authentication Data Cleared
When backend API errors occur, the following localStorage items are cleared:
- `token`
- `userId`
- `username`
- `roles`
- `currentContest`

## How It Works

### For VITE_BE_URL APIs (backendApiInstance):
1. **Request Interceptor**: Automatically adds Bearer token to all requests
2. **Response Interceptor**: Monitors responses for error status codes
3. **Error Detection**: When 401, 403, or 500 status codes are detected:
   - Logs detailed error information
   - Clears all authentication data from localStorage
   - Redirects user to `/login` page
4. **Graceful Handling**: 404 errors don't trigger auth clearing (resource not found vs auth issues)
5. **Network Resilience**: Network errors are logged but don't clear auth (might be temporary)

### For Other APIs (axiosInstance):
1. **Request Interceptor**: Adds Bearer token if available
2. **No Special Error Handling**: Errors are passed through normally
3. **No Authentication Clearing**: Contest/discussion errors don't affect user session

## Benefits

- **Selective Error Handling**: Only backend APIs trigger authentication clearing
- **Contest/Discussion Isolation**: These features continue working even if backend has issues
- **Automatic logout** on backend authentication failures
- **Better user experience** with automatic redirects for backend issues
- **Security enhancement** by clearing stale tokens from backend failures
- **Centralized configuration** for backend API calls
- **Detailed logging** for debugging backend issues

## Usage

### Backend APIs (with error handling):
```javascript
import { backendApiInstance } from '../utils/axiosConfig';
const response = await backendApiInstance.get(`${import.meta.env.VITE_BE_URL}/api/problems`);
```

### Other APIs (without error handling):
```javascript
import axios from 'axios';
const response = await axios.get(`${import.meta.env.VITE_DJ_URL}/message_api/contests`);
```

## Environment Variable Coverage

- **VITE_BE_URL**: Uses `backendApiInstance` with full error handling
- **VITE_DJ_URL**: Uses regular `axios` without error handling
- **VITE_LEADERBOARD_URL**: Uses regular `axios` without error handling
- **VITE_WEB_SOCKET_URL**: Not affected (WebSocket connections)

## Testing

To test the implementation:
1. Backend API call with expired token → Should redirect to login
2. Backend API returns 500 error → Should clear auth and redirect to login
3. Contest API error → Should show error but maintain auth state
4. Discussion forum error → Should show error but maintain auth state
5. Network connectivity issues → Should log error but maintain auth state
