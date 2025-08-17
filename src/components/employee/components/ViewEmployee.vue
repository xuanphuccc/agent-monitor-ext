<script setup>
import Knob from "primevue/knob";
import DatePicker from "primevue/datepicker";
import Skeleton from "primevue/skeleton";
import Popover from "primevue/popover";
import { ref, computed, useTemplateRef, nextTick } from "vue";
import { getAiAgentUsageByProject } from "@/services/reports-api";
import { useToast } from "primevue/usetoast";
import { getMonthlyUsageHistory } from "@/services/stats-api";
import { getSettings } from "@/utils/common";

const toast = useToast();

const emit = defineEmits(["employeeInfo", "loading"]);
const props = defineProps({
  employee: {
    type: Object,
    required: true,
  },
});

const datePickerConfig = ref({
  date: {
    border: {
      radius: "6px",
    },
    selected: {
      background: "#cbd5e1",
      color: "#334155",
    },
  },
});

const loading = ref(false);
const dailyUsageData = ref(null);
const monthlyUsageData = ref({});
const selectedDate = ref(new Date());
const userSettings = ref({});
const popoverData = ref(null);
const popoverRef = useTemplateRef("popover-ref");

const kpiCompletionRate = computed(() => {
  if (!dailyUsageData.value || !dailyUsageData.value.positionBasedRequests) {
    return 0;
  }
  const rate = (dailyUsageData.value.positionBasedRequests / 5) * 100;
  return Math.min(rate, 100);
});

const overviewUsageClass = computed(() => {
  if (
    !dailyUsageData.value ||
    dailyUsageData.value.positionBasedRequests === null ||
    dailyUsageData.value.positionBasedRequests === undefined
  ) {
    return "usage-high";
  }
  const usage = dailyUsageData.value.positionBasedRequests;
  if (usage < userSettings.value.minRequestCount) {
    return "usage-low";
  }
  if (usage <= 30) {
    return "usage-medium";
  }
  // if (usage <= 29) {
  //   return "usage-high";
  // }
  return "usage-very-high";
});

const knobColor = computed(() => {
  if (
    !dailyUsageData.value ||
    dailyUsageData.value.positionBasedRequests === null ||
    dailyUsageData.value.positionBasedRequests === undefined
  ) {
    return "#358ffa";
  }
  const usage = dailyUsageData.value.positionBasedRequests;

  // If usage is less than 5, use red color
  if (usage < userSettings.value.minRequestCount) {
    return "#fa3535";
  }
  // If usage is between 5 and 15, use green color
  if (usage <= 30) {
    return "#28b998";
  }
  // // If usage is between 16 and 29, use blue color
  // if (usage <= 29) {
  //   return "#358ffa";
  // }
  // If usage is 30 or more, use purple color
  return "#8b5cf6";
});

/**
 * Lấy dữ liệu sử dụng hàng tháng của nhân viên
 */
const getMonthlyUsageData = async () => {
  try {
    // Kiểm tra xem có dữ liệu nhân viên không
    if (!props.employee) {
      return;
    }

    monthlyUsageData.value = {};

    const selectedMonth = selectedDate.value.getMonth() + 1;
    const selectedYear = selectedDate.value.getFullYear();

    const currentDate = new Date();
    const currentDay = currentDate.getDate();
    const currentMonth = currentDate.getMonth() + 1;
    const currentYear = currentDate.getFullYear();

    const response = await getMonthlyUsageHistory(
      selectedMonth,
      selectedYear,
      props.employee.employeeCode,
    );
    if (response && response.data && response.data.success) {
      const responseData = response.data.data;
      const dailyUsages = responseData?.dailyUsage || [];
      emit("employeeInfo", responseData?.employeeInfo);

      const scopedMonthlyUsageData = {};
      dailyUsages.forEach((usage) => {
        // Lấy dữ liệu của ngày hiện tại
        if (
          usage.date ===
          `${currentYear}-${String(currentMonth).padStart(2, "0")}-${String(currentDay).padStart(2, "0")}`
        ) {
          dailyUsageData.value = usage;
        }

        const dateKey = usage.day;
        let indicatorColor = "#fa3535"; // Default color

        if (usage.positionBasedRequests < userSettings.value.minRequestCount) {
          indicatorColor = "#fa3535"; // Red
        } else if (usage.positionBasedRequests <= 30) {
          indicatorColor = "#28b998"; // Green
        } else if (usage.positionBasedRequests > 30) {
          indicatorColor = "#8b5cf6"; // Purple
        }

        scopedMonthlyUsageData[dateKey] = {
          ...usage,
          indicatorColor,
        };
      });

      monthlyUsageData.value = scopedMonthlyUsageData;
    } else {
      toast.add({
        severity: "error",
        summary: "Lỗi khi lấy dữ liệu sử dụng hàng tháng.",
        life: 3000,
      });
    }
  } catch (error) {
    console.error("Error initializing monthly data:", error);
  }
};

/**
 * Hàm khởi tạo dữ liệu ban đầu
 */
const initData = async () => {
  try {
    // Kiểm tra xem có dữ liệu nhân viên không
    if (!props.employee) {
      return;
    }

    loading.value = true;
    emit("loading", true);

    // Reset data
    dailyUsageData.value = null;
    monthlyUsageData.value = {};
    selectedDate.value = new Date();
    popoverData.value = null;

    // Lấy cài đặt người dùng
    userSettings.value = await getSettings();

    // Lấy dữ liệu sử dụng hàng ngày
    await getMonthlyUsageData();

    loading.value = false;
    emit("loading", false);
  } catch (error) {
    console.error("Error initializing employee data:", error);
    loading.value = false;
    emit("loading", false);
  }
};
initData();

/**
 * Xử lý sự kiện khi chuyển tháng trong DatePicker
 */
const handleMonthChange = async (event) => {
  loading.value = true;
  emit("loading", true);

  selectedDate.value = new Date(event.year, event.month - 1, 1);
  await getMonthlyUsageData();

  loading.value = false;
  emit("loading", false);
};

/**
 * Xử lý sự kiện khi chọn ngày trong DatePicker
 */
const handleDateSelect = (event, usageData) => {
  try {
    if (loading.value || !popoverRef.value) {
      return;
    }

    popoverRef.value.hide();

    if (usageData && usageData.day !== popoverData.value?.day) {
      popoverData.value = usageData;
      nextTick(() => {
        popoverRef.value.show(event);
      });
    } else {
      popoverData.value = null;
    }
  } catch (error) {
    console.error("Error selecting date:", error);
  }
};

defineExpose({
  initData,
});
</script>

<template>
  <div class="xp-view-employee">
    <div class="xp-view-section">
      <div class="xp-view-section-title">Hôm nay</div>
      <div class="xp-view-section-content">
        <div class="xp-employee-overview" :class="overviewUsageClass">
          <div class="xp-overview-chart">
            <Knob
              :modelValue="kpiCompletionRate"
              :valueColor="knobColor"
              valueTemplate="{value}%"
              :size="50"
              readonly
            />
          </div>
          <div class="xp-overview-info">
            <div class="xp-overview-info-title">Số requests</div>
            <div class="xp-overview-info-value">
              {{
                dailyUsageData && dailyUsageData.positionBasedRequests
                  ? dailyUsageData.positionBasedRequests
                  : 0
              }}
            </div>
          </div>
        </div>
        <div class="xp-employee-details">
          <div class="xp-employee-detail-item">
            <span class="xp-employee-detail-label">Cline</span>
            <span class="xp-employee-detail-value">{{
              dailyUsageData && dailyUsageData.clineRequests ? dailyUsageData.clineRequests : 0
            }}</span>
          </div>
          <div class="xp-employee-detail-item">
            <span class="xp-employee-detail-label">Cursor</span>
            <span class="xp-employee-detail-value">{{
              dailyUsageData && dailyUsageData.cursorRequests ? dailyUsageData.cursorRequests : 0
            }}</span>
          </div>
          <div class="xp-employee-detail-item">
            <span class="xp-employee-detail-label">OneAI</span>
            <span class="xp-employee-detail-value">{{
              dailyUsageData && dailyUsageData.oneAiRequests ? dailyUsageData.oneAiRequests : 0
            }}</span>
          </div>
          <div class="xp-employee-detail-item">
            <span class="xp-employee-detail-label">AI Agents</span>
            <span class="xp-employee-detail-value">{{
              dailyUsageData && dailyUsageData.aiAgentRequests ? dailyUsageData.aiAgentRequests : 0
            }}</span>
          </div>
        </div>
      </div>
    </div>

    <div class="xp-view-section">
      <div class="xp-view-section-title">Tháng này</div>
      <div class="xp-view-section-content">
        <DatePicker
          v-model="selectedDate"
          @month-change="handleMonthChange"
          inline
          class="xp-date-picker"
          :dt="datePickerConfig"
        >
          <template #date="slotProps">
            <Skeleton v-if="loading" size="28px" />
            <div
              v-else
              @click="handleDateSelect($event, monthlyUsageData[slotProps.date.day])"
              class="xp-datepicker-day-content"
            >
              <div class="xp-datepicker-day">
                <div
                  v-if="slotProps.date.selectable"
                  class="xp-datepicker-indicator"
                  :style="{
                    background: monthlyUsageData[slotProps.date.day]
                      ? monthlyUsageData[slotProps.date.day].indicatorColor
                      : 'transparent',
                  }"
                ></div>
                <div class="xp-datepicker-day-number">{{ slotProps.date.day }}</div>
              </div>
              <div class="xp-datepicker-total-requests">
                <template v-if="slotProps.date.selectable">
                  {{
                    monthlyUsageData[slotProps.date.day]
                      ? monthlyUsageData[slotProps.date.day].positionBasedRequests
                      : 0
                  }}
                </template>
              </div>
            </div>
          </template>
        </DatePicker>

        <!-- Popover xem chi tiết ngày trên DatePicker -->
        <Popover ref="popover-ref">
          <div class="xp-daily-details">
            <div class="xp-daily-detail-item">
              <span class="xp-daily-detail-label">Cline</span>
              <span class="xp-daily-detail-value">{{ popoverData.clineRequests }}</span>
            </div>
            <div class="xp-daily-detail-item">
              <span class="xp-daily-detail-label">Cursor</span>
              <span class="xp-daily-detail-value">{{ popoverData.cursorRequests }}</span>
            </div>
            <div class="xp-daily-detail-item">
              <span class="xp-daily-detail-label">OneAI</span>
              <span class="xp-daily-detail-value">{{ popoverData.oneAiRequests }}</span>
            </div>
            <div class="xp-daily-detail-item">
              <span class="xp-daily-detail-label">AI Agents</span>
              <span class="xp-daily-detail-value">{{ popoverData.aiAgentRequests }}</span>
            </div>
          </div>
        </Popover>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.xp-view-employee {
  .xp-view-section {
    .xp-view-section-title {
      font-weight: 600;
      font-size: 14px;
      line-height: 18px;
      color: var(--color-text);
    }

    .xp-view-section-content {
      padding-top: 16px;
      .xp-employee-overview {
        padding: 12px 16px;
        border-radius: 12px;
        display: flex;
        align-items: center;
        transition:
          background 0.3s ease,
          border-color 0.3s ease;

        &.usage-low {
          border: 1px solid #ddb6b6;
          background: linear-gradient(0deg, #ffebeb 0%, #fffcfc 100%);
        }

        &.usage-medium {
          border: 1px solid #c0e6dc;
          background: linear-gradient(0deg, #e8fefa 0%, #fcfffe 100%);
        }

        &.usage-high {
          border: 1px solid #b6ccdd;
          background: linear-gradient(0deg, #ebf7ff 0%, #fcfeff 100%);
        }

        &.usage-very-high {
          border: 1px solid #d1b6dd;
          background: linear-gradient(0deg, #f5ebff 0%, #fefcff 100%);
        }
        gap: 16px;
        .xp-overview-chart {
          flex-shrink: 0;
          display: flex;
          width: 50px;
          height: 50px;
        }

        .xp-overview-info {
          .xp-overview-info-title {
            font-size: 14px;
            line-height: 18px;
            font-weight: 500;
          }

          .xp-overview-info-value {
            font-size: 20px;
            line-height: 24px;
            font-weight: 700;
          }
        }
      }

      .xp-employee-details {
        padding-top: 16px;
        .xp-employee-detail-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          .xp-employee-detail-label {
            font-size: 14px;
            line-height: 18px;
          }

          .xp-employee-detail-value {
            font-weight: 700;
            font-size: 14px;
            line-height: 18px;
            color: var(--color-text);
          }
        }

        .xp-employee-detail-item + .xp-employee-detail-item {
          margin-top: 8px;
        }
      }

      .xp-date-picker {
        width: 100%;
      }

      .xp-datepicker-day-content {
        width: 100%;
        height: 100%;
        padding: 2px;
        display: flex;
        flex-direction: column;
        user-select: none;
        .xp-datepicker-day {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: auto;
          .xp-datepicker-indicator {
            width: 5px;
            height: 5px;
            border-radius: 50%;
          }

          .xp-datepicker-day-number {
            font-size: 10px;
            line-height: 10px;
            color: var(--color-text-secondary);
            margin-left: auto;
          }
        }

        .xp-datepicker-total-requests {
          font-size: 12px;
          line-height: 12px;
          font-weight: 600;
          text-align: start;
        }
      }
    }
  }

  .xp-view-section + .xp-view-section {
    margin-top: 24px;
  }
}
.xp-daily-details {
  width: 120px;
  .xp-daily-detail-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    .xp-daily-detail-label {
      font-size: 14px;
      line-height: 18px;
    }

    .xp-daily-detail-value {
      font-weight: 700;
      font-size: 14px;
      line-height: 18px;
      color: var(--color-text);
    }
  }

  .xp-daily-detail-item + .xp-daily-detail-item {
    margin-top: 8px;
  }
}
</style>
