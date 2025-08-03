# System Patterns

The application follows a component-based architecture using Vue.js. State management is centralized with Pinia. API interactions are handled through a dedicated service layer.

The main application layout is handled by `MainLayout.vue`. The root component, `App.vue`, uses a `SelectButton` for tab-based navigation, conditionally rendering `EmployeeTab`, `ProjectTab`, or `DashboardTab`. This indicates a simple, single-page interface without a formal router.
