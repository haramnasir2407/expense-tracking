### Background Sync

* Offline-first expense creation.
* Unsynced expenses stored locally.
* Use **Expo Background Tasks**:
  * Automatically sync when device comes back online.
  * User should not need to open the app.


### Phase 3: Automation, OCR & Reliability

#### Tasks

* Integrate OCR SDK for receipt scanning and form prefilling.
* Implement offline-first syncing with background tasks.

#### Expectations

* Robust handling of OCR inaccuracies.
* Reliable background sync with no data loss.


- expo background task api is unavailable on ios simulators, available on physical devices.

- expo background task not available in expo go 

- on ios, use task manager api (expo background tasks)

- for android, use work manager api (https://developer.android.com/develop/background-work/background-tasks/persistent)
