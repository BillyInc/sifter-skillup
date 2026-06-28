# Structured Logging Design

**Date:** 2026-03-29
**Status:** Approved
**Scope:** Add structured logging to both frontend and backend

## Overview

Add comprehensive structured logging to Sifter LevelUp for better debugging, monitoring, and observability. Frontend uses `react-native-logs`, backend uses `loguru`.

## Architecture

### Frontend Logging

**Library:** `react-native-logs`

**Logger Configuration:**
- Log levels: error, warn, info, debug
- Output: Console (with optional remote logging later)
- Format: JSON with timestamp, level, message, metadata
- Environment-based: debug level in dev, info level in prod

**Logger Location:** `src/lib/logger.ts`

### Backend Logging

**Library:** `loguru`

**Logger Configuration:**
- Log levels: ERROR, WARNING, INFO, DEBUG
- Output: Console + rotating log files
- Format: JSON with timestamp, level, message, extra fields
- Environment-based: DEBUG in dev, INFO in prod

**Logger Location:** `backend/logger.py`

## File Structure

```
src/lib/logger.ts          # Frontend logger utility
backend/logger.py           # Backend logger utility
backend/logs/               # Log files directory
  ├── app.log              # Main application log
  ├── app.log.1           # Rotated log
  └── error.log           # Error-only log
```

## Log Format

### Frontend Log Format

```json
{
  "timestamp": "2026-03-29T21:00:00.000Z",
  "level": "info",
  "message": "API request completed",
  "context": {
    "endpoint": "/api/user/profile",
    "method": "GET",
    "duration": 234,
    "status": 200
  }
}
```

### Backend Log Format

```json
{
  "timestamp": "2026-03-29T21:00:00.000Z",
  "level": "INFO",
  "message": "API request completed",
  "extra": {
    "endpoint": "/api/user/profile",
    "method": "GET",
    "duration": 234,
    "status": 200,
    "user_id": "123"
  }
}
```

## Logging Categories

### 1. Errors

**Frontend:**
- All caught errors with stack traces
- API errors with response details
- Component errors via ErrorBoundary

**Backend:**
- All exceptions with traceback
- API errors with request details
- Database errors
- Background job errors

### 2. API Calls

**Frontend:**
- Request start: endpoint, method, params
- Request end: duration, status, response size
- Request errors: error details

**Backend:**
- Request received: endpoint, method, client IP
- Request processed: duration, status
- Request errors: error details

### 3. User Actions

**Frontend:**
- Navigation: from route, to route
- Button clicks: button name, context
- Form submissions: form name, validation result
- Feature usage: feature name, action

**Backend:**
- User actions that require server processing
- State changes: user_id, action, result

### 4. Performance

**Frontend:**
- Component render times
- API latency
- Screen load times

**Backend:**
- API endpoint latency
- Database query times
- Background job duration

## Component Changes

### Frontend

**New File: `src/lib/logger.ts`**
- Create logger instance with configuration
- Export logger with typed methods
- Include context helpers

**Modified: `src/lib/api.ts`**
- Add logging to all API calls
- Log request start/end with timing
- Log errors with details

**Modified: `src/components/ErrorBoundary.tsx`**
- Log errors caught by boundary
- Include component name and error details

**Modified: Navigation screens**
- Add logging for navigation events
- Log user actions (button clicks, form submissions)

### Backend

**New File: `backend/logger.py`**
- Create logger instance with configuration
- Export logger with typed methods
- Include context helpers

**Modified: `backend/main.py`**
- Add logging middleware
- Log all requests with timing

**Modified: `backend/api.py`**
- Add logging to all route handlers
- Log request details and errors

**Modified: `backend/celery_worker.py`**
- Add logging to background jobs
- Log job start/end with timing

## Data Flow

### Frontend Logging Flow

```
User Action → Component → Logger → Console
                ↓
            API Call → Logger → Console
                ↓
            Error → ErrorBoundary → Logger → Console
```

### Backend Logging Flow

```
Request → Middleware → Logger → Console + File
                ↓
            Route Handler → Logger → Console + File
                ↓
            Background Job → Logger → Console + File
```

## Error Handling & Edge Cases

### Frontend

**Logger initialization failure:**
- Fallback to console.log
- Log warning about logger failure

**Missing context:**
- Use default context object
- Log warning about missing context

**Performance impact:**
- Disable debug logs in production
- Use async logging if needed

### Backend

**Logger initialization failure:**
- Fallback to standard logging
- Log warning about logger failure

**Log file rotation:**
- Rotate logs daily
- Keep last 7 days
- Max file size: 10MB

**Disk space:**
- Monitor log directory size
- Clean up old logs automatically

## Testing Strategy

### Unit Tests

**Frontend:**
- Test logger configuration
- Test log format
- Test context helpers

**Backend:**
- Test logger configuration
- Test log format
- Test file rotation

### Integration Tests

**Frontend:**
- Test API logging
- Test error logging
- Test performance logging

**Backend:**
- Test request logging
- Test error logging
- Test background job logging

### Manual Testing

**Frontend:**
- Verify logs appear in console
- Verify log format is correct
- Verify performance metrics are accurate

**Backend:**
- Verify logs appear in console
- Verify logs are written to files
- Verify log rotation works

## Implementation Steps

### Phase 1: Setup
1. Install `react-native-logs` on frontend
2. Install `loguru` on backend
3. Create logger utilities

### Phase 2: Frontend Integration
4. Add logging to API client
5. Add logging to ErrorBoundary
6. Add logging to navigation

### Phase 3: Backend Integration
7. Add logging middleware
8. Add logging to API routes
9. Add logging to background jobs

### Phase 4: Performance
10. Add performance tracking
11. Test all logging
12. Verify log rotation

## Dependencies

### Frontend Add
- `react-native-logs` ~5.0.0

### Backend Add
- `loguru` ~0.7.0

### Keep
- All other dependencies unchanged
- Existing error handling unchanged
