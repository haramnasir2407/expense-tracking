#!/usr/bin/env bash
# Force-run the app's background sync job on Android (app should be in background, Metro running).
# Usage: ./scripts/trigger-android-background-job.sh

set -e
PACKAGE="com.haramnasir.expensetracking"

# Find job ID for our package (format "JOB #userId/NUM: ... package/...")
JOB_LINE=$(adb shell dumpsys jobscheduler 2>/dev/null | grep "$PACKAGE" | grep "JOB #" | head -1)
if [ -z "$JOB_LINE" ]; then
  echo "No background job found for $PACKAGE."
  echo "Open the app, go to Profile (so the task is registered), then try again."
  exit 1
fi

# Extract numeric job ID (after the last / in "JOB #u0a453/275")
JOB_ID=$(echo "$JOB_LINE" | sed -n 's/.*JOB #[^/]*\/\([0-9]*\).*/\1/p')
if [ -z "$JOB_ID" ]; then
  echo "Could not parse job ID from: $JOB_LINE"
  exit 1
fi

echo "Running job $JOB_ID for $PACKAGE (app should be in background)..."
adb shell cmd jobscheduler run -f "$PACKAGE" "$JOB_ID"
echo "Done. Reopen the app and check Profile → Last background sync."
