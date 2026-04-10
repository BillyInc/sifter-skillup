# Firebase Setup for FCM Push Notifications

## Overview
SkillUp uses Firebase Cloud Messaging (FCM) to notify old devices when a user logs in from a new device (single-device enforcement).

## Setup Steps

### 1. Create Firebase Project
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project or use existing one
3. Enable Firebase Messaging API

### 2. Create Service Account
1. Go to Project Settings → Service Accounts tab
2. Click "Generate New Private Key"
3. Download the JSON file
4. Save to: `backend/firebase-service-account.json` (git-ignored)

### 3. Configure Environment
Add to `backend/.env`:

```
FCM_SERVICE_ACCOUNT_PATH=firebase-service-account.json
FCM_PROJECT_ID=your-project-id
```

### 4. Frontend: Get FCM Token
In the mobile app, request FCM token from Firebase Messaging:

```javascript
import messaging from '@react-native-firebase/messaging';

const fcmToken = await messaging.getToken();
// Send fcmToken with device login request
```

### 5. Verify Push Works
When a new device logs in, old device should receive logout notification.

## Troubleshooting

**"FCM not initialized"**: Check FCM_SERVICE_ACCOUNT_PATH and file permissions
**No notifications**: Verify FCM tokens are being stored in device_sessions table
**Google auth errors**: Regenerate service account private key

## Disabling FCM (Development)
Set `SINGLE_DEVICE_ENFORCEMENT=false` in backend/.env to skip FCM during dev.
