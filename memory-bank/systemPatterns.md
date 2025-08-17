# System Patterns

The application follows a component-based architecture using Vue.js. State management is centralized with Pinia. API interactions are handled through a dedicated service layer.

The main application layout is handled by `MainLayout.vue`. The root component, `App.vue`, uses a `SelectButton` for tab-based navigation, conditionally rendering `EmployeeTab`, `ProjectTab`, or `DashboardTab`. This indicates a simple, single-page interface without a formal router.

Data management follows two distinct patterns:

- **API-driven Data for Dashboard**: The `DashboardTab` component fetches data from a remote API (`getOverallAiAgentUsage`) to display real-time statistics.
- **Local Storage for CRUD Operations**: The `EmployeeTab` and `ProjectTab` components use the browser's `localStorage` for all CRUD (Create, Read, Update, Delete) operations, indicating that this data is persisted locally on the client-side.
