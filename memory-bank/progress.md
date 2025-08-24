## Progress

- Implemented `calculateKpiRequests` function in `ViewEmployee.vue` to calculate total requests based on selected KPI tools.
- Modified `kpiCompletionRate` computed property to use `calculateKpiRequests`.
- Modified `xp-overview-info-value` div to display the result of `calculateKpiRequests`.
- Modified `getMonthlyUsageData` to calculate KPI requests and add it to `scopedMonthlyUsageData`.
- Updated template to display the new `kpiRequests` field in `xp-datepicker-total-requests`.
- Replaced `dailyUsageData.positionBasedRequests` with `calculateKpiRequests` in `overviewUsageClass` and `knobColor`.
- Added `underperformingEmployees` ref to `ViewProject.vue`.
- Implemented `filterUnderperformingEmployees` function in `ViewProject.vue` to filter employees who have `relevantToolsTotal < 5` for the current day.
- Integrated `filterUnderperformingEmployees` into `initData` in `ViewProject.vue`.
- Updated `ViewProject.vue` template to display the list of `underperformingEmployees`.

## What works

- The `ViewEmployee.vue` component now correctly calculates and displays the total requests based on the selected KPI tools in `EditEmployee.vue`.
- If no KPI tools are selected, the component defaults to using `positionBasedRequests`.
- The `xp-datepicker-total-requests` now displays the `kpiRequests` value calculated in `getMonthlyUsageData`.
- The `overviewUsageClass` and `knobColor` computed properties now use `calculateKpiRequests` to determine the usage level and knob color.
- The `ViewProject.vue` now correctly filters and displays employees who have not met their daily target (`relevantToolsTotal < 5`) when the filter is set to `FILTER_TYPE.DATE` and the selected dates are today.

## What's left to build

- Nothing. The task is complete.

## Current status

- The task is complete.

## Known issues

- None.

## Evolution of project decisions

- Initially, the `kpiCompletionRate` and `xp-overview-info-value` were directly using `positionBasedRequests`.
- The task required to modify the component to use the selected KPI tools in `EditEmployee.vue` to calculate the total requests.
- The `calculateKpiRequests` function was implemented to handle this logic.
- To improve performance, the calculation of KPI requests was moved to the `getMonthlyUsageData` function.
- The current task involved adding a feature to `ViewProject.vue` to identify and display employees who have not met their daily target based on `relevantToolsTotal < 5`. This was achieved by adding a new `ref` for `underperformingEmployees`, implementing a `filterUnderperformingEmployees` function, and integrating it into the `initData` lifecycle hook, along with updating the template for display.
