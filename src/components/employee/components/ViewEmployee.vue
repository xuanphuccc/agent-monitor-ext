<script setup>
import Knob from "primevue/knob";
import DatePicker from "primevue/datepicker";
import { ref, computed } from "vue";
import { getAiAgentUsageByProject } from "@/services/reports-api";
import { useToast } from "primevue/usetoast";

const toast = useToast();

const emit = defineEmits(["dataChange"]);
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
  },
});

const daylyUsageData = ref(null);
const monthlyUsageData = ref(null);

const kpiCompletionRate = computed(() => {
  if (!daylyUsageData.value || !daylyUsageData.value.relevantToolsTotal) {
    return 0;
  }
  const rate = (daylyUsageData.value.relevantToolsTotal / 5) * 100;
  return Math.min(rate, 100);
});

const overviewUsageClass = computed(() => {
  if (!daylyUsageData.value || !daylyUsageData.value.relevantToolsTotal) {
    return "usage-high";
  }
  const usage = daylyUsageData.value.relevantToolsTotal;
  if (usage < 5) {
    return "usage-low";
  }
  if (usage <= 15) {
    return "usage-medium";
  }
  if (usage <= 29) {
    return "usage-high";
  }
  return "usage-very-high";
});

const knobColor = computed(() => {
  if (!daylyUsageData.value || !daylyUsageData.value.relevantToolsTotal) {
    return "#358ffa";
  }
  const usage = daylyUsageData.value.relevantToolsTotal;
  // If usage is less than 5, use red color
  if (usage < 5) {
    return "#fa3535";
  }
  // If usage is between 5 and 15, use green color
  if (usage <= 15) {
    return "#28b998";
  }
  // If usage is between 16 and 29, use blue color
  if (usage <= 29) {
    return "#358ffa";
  }
  // If usage is 30 or more, use purple color
  return "#8b5cf6";
});

/**
 * Hàm khởi tạo dữ liệu ban đầu
 */
const initData = async () => {
  try {
    // Kiểm tra xem có dữ liệu nhân viên không
    if (!props.employee) {
      return;
    }

    const currentDate = new Date();
    const currentDay = currentDate.getDate();
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();

    const startDate = `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}-${String(currentDay).padStart(2, "0")}T00:00:00`;
    const endDate = `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}-${String(currentDay).padStart(2, "0")}T23:59:59`;

    const projectDaylyUsageData = await getAiAgentUsageByProject(
      props.employee.projectName,
      startDate,
      endDate,
    );
    if (projectDaylyUsageData && projectDaylyUsageData.data && projectDaylyUsageData.data.success) {
      const usageDataList = projectDaylyUsageData.data.data || [];
      const employeeUsage =
        usageDataList.find((usage) => usage.employeeCode === props.employee.employeeCode) || null;
      if (employeeUsage) {
        daylyUsageData.value = employeeUsage;
        emit("dataChange", employeeUsage);
      } else {
        toast.add({
          severity: "error",
          summary: `Nhân viên ${props.employee.employeeCode} không tồn tại.`,
          life: 3000,
        });
      }
    } else {
      toast.add({
        severity: "error",
        summary: "Lỗi khi lấy dữ liệu sử dụng hàng ngày.",
        life: 3000,
      });
    }
  } catch (error) {
    console.error("Error initializing employee data:", error);
  }
};
initData();
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
            <div class="xp-overview-info-title">Tổng request</div>
            <div class="xp-overview-info-value">
              {{
                daylyUsageData && daylyUsageData.relevantToolsTotal
                  ? daylyUsageData.relevantToolsTotal
                  : 0
              }}
            </div>
          </div>
        </div>
        <div class="xp-employee-details">
          <div class="xp-employee-detail-item">
            <span class="xp-employee-detail-label">Cline</span>
            <span class="xp-employee-detail-value">{{
              daylyUsageData && daylyUsageData.clineTotalRequests
                ? daylyUsageData.clineTotalRequests
                : 0
            }}</span>
          </div>
          <div class="xp-employee-detail-item">
            <span class="xp-employee-detail-label">Cursor</span>
            <span class="xp-employee-detail-value">{{
              daylyUsageData && daylyUsageData.cursorTotalRequests
                ? daylyUsageData.cursorTotalRequests
                : 0
            }}</span>
          </div>
          <div class="xp-employee-detail-item">
            <span class="xp-employee-detail-label">OneAI</span>
            <span class="xp-employee-detail-value">{{
              daylyUsageData && daylyUsageData.oneAiTotalRequests
                ? daylyUsageData.oneAiTotalRequests
                : 0
            }}</span>
          </div>
          <div class="xp-employee-detail-item">
            <span class="xp-employee-detail-label">AI Agents</span>
            <span class="xp-employee-detail-value">{{
              daylyUsageData && daylyUsageData.aiAgentTotalRequests
                ? daylyUsageData.aiAgentTotalRequests
                : 0
            }}</span>
          </div>
        </div>
      </div>
    </div>

    <div class="xp-view-section">
      <div class="xp-view-section-title">Tháng này</div>
      <div class="xp-view-section-content">
        <DatePicker inline class="xp-date-picker" :dt="datePickerConfig">
          <!-- <template #date="slotProps"> HIHI </template> -->
        </DatePicker>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.xp-view-employee {
  .xp-view-section {
    .xp-view-section-title {
      font-weight: 700;
      font-size: 16px;
      line-height: 20px;
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
            color: var(--color-text-secondary);
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
    }
  }

  .xp-view-section + .xp-view-section {
    margin-top: 24px;
  }
}
</style>
