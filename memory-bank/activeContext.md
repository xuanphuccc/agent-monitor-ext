# Active Context

The KPI notification feature has been updated for better accuracy.

- **Data Structure Change**: The `notificationTime` setting is no longer stored as an ISO string. It is now stored as an object `{ hours: number, minutes: number }` for more precise time handling and to avoid timezone-related issues.
- **Utility Functions (`common.js`)**: The `saveSettings` and `getSettings` functions have been updated to handle the conversion between the `Date` object used by the UI's DatePicker and the new `{ hours, minutes }` storage format.
- **Background Script (`background.js`)**: The alarm scheduling logic has been simplified. It now directly uses the `hours` and `minutes` from the settings to create the alarm, making the implementation more robust.

The core functionality is complete and improved. The next step is to verify the feature and wait for further instructions.
