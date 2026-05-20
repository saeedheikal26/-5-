# Security Specification & Hardened Test-Driven Design (TDD)

## 1. Data Invariants

1. **User Role Integrity**: Ordinary users should never be able to elevate their own `role` to `'admin'`.
2. **Subscription/Payment Gate**: Users cannot activate their own subscription/status to `'active'` without official admin approval of a payment request.
3. **Incremental Integrity**: Standard users can only increment their own `salawatCount` and cannot modify other system-managed fields during an increment action.
4. **PII and Payment Isolation**: No user can read other users' private details or payment transaction details (except public name/salawat counts).
5. **Activity Logs Legitimacy**: Activity logs can only be created by the authenticated owner of the activity, reflecting their real UID and a fresh server timestamp.

---

## 2. The "Dirty Dozen" Adversarial Payloads

Any of these payloads sent by an unverified or ordinary user must result in a strict `PERMISSION_DENIED`.

### Payload 1: Unauthorized Admin Promotion
- **Target**: `/users/attacker-uid`
- **Operation**: `update` (by `attacker-uid`)
- **Intent**: Escalate own role to admin.
- **Payload**:
  ```json
  { "role": "admin" }
  ```

### Payload 2: Self-Onboarding Bypass of Pending Status
- **Target**: `/users/attacker-uid`
- **Operation**: `update` (by `attacker-uid`)
- **Intent**: Set own status to active without payment.
- **Payload**:
  ```json
  { "status": "active" }
  ```

### Payload 3: Injecting Ghost Fields (The Shadow Update Test)
- **Target**: `/users/attacker-uid`
- **Operation**: `update` (by `attacker-uid`)
- **Intent**: Set unknown backdoor variables during increment.
- **Payload**:
  ```json
  { "salawatCount": 500, "isVerifiedVIP": true }
  ```

### Payload 4: Spoofing Foreign Activity Entry
- **Target**: `/activities/activity-id`
- **Operation**: `create` (by `attacker-uid`)
- **Intent**: Insert activity under a high-ranking player's UID.
- **Payload**:
  ```json
  { "userId": "victim-uid", "userName": "Victim", "amount": 1000, "message": "أضاف 1000 صلاة", "createdAt": "SERVER_TIMESTAMP" }
  ```

### Payload 5: Future Timestamp Poisoning
- **Target**: `/activities/activity-id`
- **Operation**: `create` (by `attacker-uid`)
- **Intent**: Bypass Temporal Integrity with a pre-set future or past timestamp.
- **Payload**:
  ```json
  { "userId": "attacker-uid", "userName": "Attacker", "amount": 10, "message": "أضاف 10 صلوات", "createdAt": "2030-01-01T00:00:00Z" }
  ```

### Payload 6: Auto-Approving Own Payment Request
- **Target**: `/payments/payment-id`
- **Operation**: `create` (by `attacker-uid`)
- **Intent**: Log a pre-approved transaction request bypassing admin verification.
- **Payload**:
  ```json
  { "userId": "attacker-uid", "status": "approved", "amount": 100, "transactionId": "TXN123", "createdAt": "SERVER_TIMESTAMP" }
  ```

### Payload 7: Deleting Admin Action Logs
- **Target**: `/adminLogs/log-id`
- **Operation**: `delete` (by `attacker-uid`)
- **Intent**: Wipe operational track records of malicious activities.
- **Payload**: `N/A`

### Payload 8: Blanket Retrieval of Other User's Payments
- **Target**: `/payments/victim-payment-id`
- **Operation**: `get` (by `attacker-uid`)
- **Intent**: Disclose private financial details of other users.
- **Payload**: `N/A`

### Payload 9: Forging App Notifications representing the Admin
- **Target**: `/notifications/notification-id`
- **Operation**: `create` (by `attacker-uid`)
- **Intent**: Send malicious broadcast alerts to other users.
- **Payload**:
  ```json
  { "userId": "victim-uid", "title": "إشعار رسمي", "message": "تم تحويل جائزة لك", "read": false, "createdAt": "SERVER_TIMESTAMP" }
  ```

### Payload 10: Modifying Relational Fields of Record
- **Target**: `/records/record-id`
- **Operation**: `update` (by `attacker-uid` on a document they don't own)
- **Intent**: Overwrite records of other players.
- **Payload**:
  ```json
  { "userId": "victim-uid", "status": "completed" }
  ```

### Payload 11: Setting Self-Assigned Role during User Sign Up
- **Target**: `/users/attacker-uid`
- **Operation**: `create` (by `attacker-uid`)
- **Intent**: Register as admin directly.
- **Payload**:
  ```json
  { "name": "Attacker", "email": "attacker@gmail.com", "role": "admin", "status": "active" }
  ```

### Payload 12: Updating Admin Notes on Payment Doc
- **Target**: `/payments/payment-doc-id`
- **Operation**: `update` (by `attacker-uid`)
- **Intent**: Alter verification notes to force manual credit.
- **Payload**:
  ```json
  { "adminNotes": "مقبول يدوياً" }
  ```

---

## 3. Test Runner Specification

```typescript
import { assertFails, assertSucceeds, initializeTestEnvironment } from '@firebase/rules-unit-testing';

// Standard unit testing code structure to run and verify the above 'Dirty Dozen' payloads.
// These are mapped inside our Zero-Trust Firestore Security Rule assertions.
```
