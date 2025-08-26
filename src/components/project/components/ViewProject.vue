<script setup>
import Chart from "primevue/chart";
import SelectButton from "primevue/selectbutton";
import DatePicker from "primevue/datepicker";
import Skeleton from "primevue/skeleton";
import Avatar from "primevue/avatar";
import { ref, onMounted, watch } from "vue";
import { getAiAgentUsageByProject } from "@/services/reports-api";
import { useToast } from "primevue/usetoast";
import { FILTER_TYPE } from "@/enums/xp-enum";
import { getAvatarLetter } from "@/utils/common";
import { getWarningEmployees } from "@/services/stats-api";

const toast = useToast();

const emit = defineEmits(["loading"]);
const props = defineProps({
  project: {
    type: Object,
    required: true,
  },
});

const loading = ref(false);
const selectedDates = ref([new Date(), new Date()]);
const seletedDate = ref(new Date());
const underperformingEmployees = ref([]);
const warningEmployees = ref([]);

const chartData = ref();
const chartHeight = ref(250);
const chartOptions = ref();
const options = [
  { label: "Ngày", value: FILTER_TYPE.DATE },
  { label: "Tháng", value: FILTER_TYPE.MONTH },
];
const currentOption = ref(FILTER_TYPE.DATE);

const setChartOptions = () => {
  const documentStyle = getComputedStyle(document.documentElement);
  const textColor = documentStyle.getPropertyValue("--p-text-color");
  const textColorSecondary = documentStyle.getPropertyValue("--p-text-muted-color");
  const surfaceBorder = documentStyle.getPropertyValue("--p-content-border-color");

  return {
    indexAxis: "y",
    maintainAspectRatio: false,
    aspectRatio: 0.8,
    plugins: {
      tooltip: {
        mode: "index",
        intersect: true,
      },
      // Chú thích
      legend: {
        display: true,
        position: "bottom",
        labels: {
          boxWidth: 12,
          boxHeight: 12,
          color: textColor,
          padding: 16,
          useBorderRadius: true,
          borderRadius: 4,
        },
      },
    },
    scales: {
      x: {
        stacked: true,
        ticks: {
          color: textColorSecondary,
        },
        grid: {
          color: surfaceBorder,
        },
      },
      y: {
        stacked: true,
        ticks: {
          color: textColorSecondary,
        },
        grid: {
          color: surfaceBorder,
        },
      },
    },

    elements: {
      bar: {
        borderRadius: 12,
      },
    },
  };
};

/**
 * Lọc ra các nhân viên chưa đạt mục tiêu hôm nay
 * @param {Array} data - Dữ liệu nhân viên từ API
 * @param {string} startDate - Ngày bắt đầu lọc
 * @param {string} endDate - Ngày kết thúc lọc
 */
const filterUnderperformingEmployees = (data, startDate, endDate) => {
  if (!data || !Array.isArray(data)) {
    return;
  }

  const today = new Date();
  const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 0, 0, 0, 0);
  const todayEnd = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate(),
    23,
    59,
    59,
    999,
  );

  const filterStartDate = new Date(startDate);
  const filterEndDate = new Date(endDate);

  // Kiểm tra xem startDate và endDate có phải là ngày hôm nay không
  const isToday =
    filterStartDate.getFullYear() === todayStart.getFullYear() &&
    filterStartDate.getMonth() === todayStart.getMonth() &&
    filterStartDate.getDate() === todayStart.getDate() &&
    filterEndDate.getFullYear() === todayEnd.getFullYear() &&
    filterEndDate.getMonth() === todayEnd.getMonth() &&
    filterEndDate.getDate() === todayEnd.getDate();

  if (currentOption.value === FILTER_TYPE.DATE && isToday) {
    underperformingEmployees.value = data.filter((employee) => employee.relevantToolsTotal < 5);
  }
  // Nếu không phải ngày hôm nay, không xóa dữ liệu đã lọc trước đó
};

/**
 * Lấy dữ liệu cảnh báo tháng hiện tại
 */
const getWarningEmployeesData = async () => {
  try {
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth() + 1;
    const currentYear = currentDate.getFullYear();

    // Lấy dữ liệu cảnh báo tháng hiện tại
    const response = await getWarningEmployees(
      currentYear,
      currentMonth,
      "all",
      props.project.divisionName,
      props.project.projectName,
    );
    if (response && response.data && response.data.success && response.data.data) {
      const responseData = response.data.data;
      const filteredEmployees = (responseData.warningEmployees ?? []).filter(
        (employee) => employee.warningStats?.totalDaysNotMeetingTarget > 0,
      );
      warningEmployees.value = filteredEmployees;
    } else {
      toast.add({
        severity: "error",
        summary: "Lỗi khi lấy dữ liệu cảnh báo.",
        life: 3000,
      });
    }
  } catch (error) {
    console.error("Error get warning employees", error);
  }
};

/**
 * Xử lý dữ liệu trả về từ API để hiển thị biểu đồ
 * @param {*} data
 */
const processDataForChart = (data) => {
  if (!data || !Array.isArray(data)) {
    return {
      labels: [],
      datasets: [],
    };
  }

  const labels = data.map((item) => item.shortName);
  const datasets = data.map((item) => ({
    cline: item.clineTotalRequests || 0,
    cursor: item.cursorTotalRequests || 0,
    oneai: item.oneAiTotalRequests || 0,
    aiagent: item.aiAgentTotalRequests || 0,
  }));

  return { labels, datasets };
};

const setChartData = (data = {}) => {
  const { labels = [], datasets = [] } = data;

  // Tính toán chiều cao của biểu đồ
  const paddingTop = 12;
  const paddingBottom = 68;
  const itemHeight = 28;
  chartHeight.value = paddingTop + paddingBottom + itemHeight * labels.length;

  return {
    labels,
    datasets: [
      {
        type: "bar",
        label: "Cline",
        backgroundColor: "#1e3a8a",
        data: datasets.map((item) => item.cline),
        barThickness: 12,
      },
      {
        type: "bar",
        label: "Cursor",
        backgroundColor: "#1d4ed8",
        data: datasets.map((item) => item.cursor),
        barThickness: 12,
      },
      {
        type: "bar",
        label: "OneAI",
        backgroundColor: "#3b82f6",
        data: datasets.map((item) => item.oneai),
        barThickness: 12,
      },
      {
        type: "bar",
        label: "AI Agents",
        backgroundColor: "#93c5fd",
        data: datasets.map((item) => item.aiagent),
        barThickness: 12,
      },
    ],
  };
};

/**
 * Hàm lấy dữ liệu sử dụng AI của dự án
 */
const getProjectUsageData = async () => {
  try {
    // Kiểm tra xem có dữ liệu dự án
    if (!props.project) {
      return;
    }

    let startDate, endDate;

    if (currentOption.value === FILTER_TYPE.DATE) {
      // Lọc theo ngày
      const [start, end] = selectedDates.value;
      if (!start || !end) {
        return;
      }
      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);

      // Format to YYYY-MM-DDTHH:mm:ss
      startDate = `${start.getFullYear()}-${String(start.getMonth() + 1).padStart(2, "0")}-${String(start.getDate()).padStart(2, "0")}T00:00:00`;
      endDate = `${end.getFullYear()}-${String(end.getMonth() + 1).padStart(2, "0")}-${String(end.getDate()).padStart(2, "0")}T23:59:59`;
    } else {
      // Lọc theo tháng
      const selectedMonth = seletedDate.value;
      const year = selectedMonth.getFullYear();
      const month = selectedMonth.getMonth();
      const firstDay = new Date(year, month, 1);
      const lastDay = new Date(year, month + 1, 0);

      firstDay.setHours(0, 0, 0, 0);
      lastDay.setHours(23, 59, 59, 999);

      startDate = `${firstDay.getFullYear()}-${String(firstDay.getMonth() + 1).padStart(2, "0")}-${String(firstDay.getDate()).padStart(2, "0")}T00:00:00`;
      endDate = `${lastDay.getFullYear()}-${String(lastDay.getMonth() + 1).padStart(2, "0")}-${String(lastDay.getDate()).padStart(2, "0")}T23:59:59`;
    }

    const res = await getAiAgentUsageByProject(props.project.projectName, startDate, endDate);
    if (res && res.data && res.data.success) {
      const processedData = processDataForChart(res.data.data);
      chartData.value = setChartData(processedData);
      filterUnderperformingEmployees(res.data.data, startDate, endDate);
    } else {
      toast.add({
        severity: "error",
        summary: "Lỗi",
        detail: "Lỗi khi lấy dữ liệu dự án",
        life: 3000,
      });
    }
  } catch (error) {
    console.error("Error fetching project data:", error);
  }
};

/**
 * Hàm lấy dữ liệu cho biểu đồ
 */
const initData = async () => {
  try {
    loading.value = true;
    emit("loading", true);

    // Reset filter
    selectedDates.value = [new Date(), new Date()];
    seletedDate.value = new Date();
    currentOption.value = FILTER_TYPE.DATE;

    await Promise.all([getProjectUsageData(), getWarningEmployeesData()]);

    loading.value = false;
    emit("loading", false);
  } catch (error) {
    console.error("Error initializing project data:", error);
    loading.value = false;
    emit("loading", false);
  }
};

/**
 * Hàm xử lý sự kiện khi thay đổi lựa chọn
 */
const handleOptionChange = async () => {
  if (currentOption.value === FILTER_TYPE.DATE) {
    selectedDates.value = [new Date(), new Date()];
  } else {
    seletedDate.value = new Date();
  }
  await getProjectUsageData();
};

/**
 * Hàm xử lý sự thay đổi của selectedDates và seletedDate
 */
const handleDateChange = () => {
  getProjectUsageData();
};

onMounted(() => {
  initData();
  chartOptions.value = setChartOptions();
});

defineExpose({
  initData,
});
</script>

<template>
  <div class="xp-view-project">
    <div class="xp-view-section">
      <div class="xp-view-section-title">Tình hình sử dụng</div>
      <div class="xp-view-section-content">
        <div class="xp-sections-filter">
          <SelectButton
            v-model="currentOption"
            @change="handleOptionChange"
            optionLabel="label"
            optionValue="value"
            :options="options"
            :allowEmpty="false"
            size="small"
            :disabled="loading"
          />
          <div style="width: 168px">
            <DatePicker
              v-if="currentOption === FILTER_TYPE.MONTH"
              v-model="seletedDate"
              @value-change="handleDateChange"
              view="month"
              dateFormat="mm/yy"
              size="small"
              fluid
              :manualInput="false"
              :disabled="loading"
            />
            <DatePicker
              v-else
              v-model="selectedDates"
              @value-change="handleDateChange"
              selectionMode="range"
              size="small"
              fluid
              :manualInput="false"
              :disabled="loading"
            />
          </div>
        </div>
        <Chart
          v-if="chartData"
          type="bar"
          :data="chartData"
          :options="chartOptions"
          :height="chartHeight"
          style="border: 1px solid var(--border-color); border-radius: 8px"
        />
      </div>
    </div>

    <div class="xp-view-section">
      <div class="xp-view-section-title">Nhân viên chưa đạt hôm nay</div>
      <div class="xp-view-section-content">
        <div
          v-if="!loading && underperformingEmployees.length > 0"
          v-for="(user, index) in underperformingEmployees"
          :key="index"
          class="xp-ranking-item"
        >
          <div class="xp-ranking-left">
            <Avatar
              :label="getAvatarLetter(user.employeeName)"
              class="mr-2 flex-shrink-0"
              style="background-color: #dee9fc; color: #1a2551"
              shape="circle"
            />
            <div class="xp-ranking-info" style="max-width: 198px">
              <div class="xp-ranking-name" :title="user.employeeName">
                {{ user.employeeName }}
              </div>
              <div class="xp-ranking-role" :title="`${user.employeeCode} - ${user.positionName}`">
                {{ user.employeeCode }} - {{ user.positionName }}
              </div>
            </div>
          </div>
          <div
            class="xp-ranking-item-score"
            :class="[
              { error: user.relevantToolsTotal === 0 },
              { warning: user.relevantToolsTotal > 0 },
            ]"
          >
            {{ user.relevantToolsTotal }} request
          </div>
        </div>
        <div v-else-if="!loading && underperformingEmployees.length === 0" class="xp-empty">
          Không có nhân viên nào.
        </div>
        <div v-else class="xp-ranking-item">
          <div class="xp-ranking-left">
            <Skeleton shape="circle" size="28px" class="mr-2" />
            <div class="xp-ranking-info" style="max-width: 198px">
              <div class="xp-ranking-name">
                <Skeleton width="150px" height="14px" />
              </div>
              <div class="xp-ranking-role">
                <Skeleton width="120px" height="12px" style="margin-top: 6px" />
              </div>
            </div>
          </div>
          <!-- <div class="xp-ranking-item-score"></div> -->
        </div>
      </div>
    </div>

    <div class="xp-view-section">
      <div class="xp-view-section-title">Nhân viên cảnh báo tháng này</div>
      <div class="xp-view-section-content">
        <div
          v-if="!loading && warningEmployees.length > 0"
          v-for="(user, index) in warningEmployees"
          :key="index"
          class="xp-ranking-item"
        >
          <div class="xp-ranking-left">
            <Avatar
              :label="getAvatarLetter(user.employeeInfo?.EmployeeName)"
              class="mr-2 flex-shrink-0"
              style="background-color: #dee9fc; color: #1a2551"
              shape="circle"
            />
            <div class="xp-ranking-info" style="max-width: 198px">
              <div class="xp-ranking-name" :title="user.employeeInfo?.EmployeeName">
                {{ user.employeeInfo?.EmployeeName }}
              </div>
              <div
                class="xp-ranking-role"
                :title="`${user.employeeInfo?.EmployeeCode} - ${user.employeeInfo?.PositionName}`"
              >
                {{ user.employeeInfo?.EmployeeCode }} - {{ user.employeeInfo?.PositionName }}
              </div>
            </div>
          </div>
          <div
            class="xp-ranking-item-score"
            :class="[
              { error: user.warningStats?.totalDaysNotMeetingTarget >= 3 },
              { warning: user.warningStats?.totalDaysNotMeetingTarget < 3 },
            ]"
          >
            {{ user.warningStats?.totalDaysNotMeetingTarget || 0 }} ngày
          </div>
        </div>
        <div v-else-if="!loading && warningEmployees.length === 0" class="xp-empty">
          Không có nhân viên nào.
        </div>
        <div v-else class="xp-ranking-item">
          <div class="xp-ranking-left">
            <Skeleton shape="circle" size="28px" class="mr-2" />
            <div class="xp-ranking-info" style="max-width: 198px">
              <div class="xp-ranking-name">
                <Skeleton width="150px" height="14px" />
              </div>
              <div class="xp-ranking-role">
                <Skeleton width="120px" height="12px" style="margin-top: 6px" />
              </div>
            </div>
          </div>
          <!-- <div class="xp-ranking-item-score"></div> -->
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.xp-view-project {
  .xp-view-section {
    .xp-view-section-title {
      font-weight: 600;
      font-size: 14px;
      line-height: 18px;
      color: var(--color-text);
    }

    .xp-view-section-content {
      padding-top: 16px;

      .xp-sections-filter {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 16px;
      }

      .xp-empty {
        background-color: #f8fafc;
        color: var(--text-secondary-color);
        font-size: 12px;
        font-weight: 400;
        text-align: center;
        padding: 12px;
        border-radius: 8px;
      }
    }
  }

  .xp-view-section + .xp-view-section {
    margin-top: 24px;
  }

  .xp-ranking-item {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 8px 0;
    column-gap: 8px;

    .xp-ranking-left {
      flex: 1;
      display: flex;
      align-items: center;
      gap: 16px;

      .xp-ranking-info {
        .xp-ranking-name {
          font-weight: 600;
          font-size: 14px;
          line-height: 18px;
          color: var(--color-text);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          max-width: 100%;
        }

        .xp-ranking-role {
          font-size: 11px;
          line-height: 14px;
          color: var(--text-secondary-color);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          max-width: 100%;
        }
      }
    }

    .xp-ranking-item-score {
      font-weight: 400;
      font-size: 11px;
      line-height: 14px;
      color: var(--p-message-info-color);
      background: var(--p-message-info-background);
      border: 1px solid var(--p-message-info-border-color);
      padding: 4px 8px;
      border-radius: 8px;
      white-space: nowrap;
      font-weight: 500;

      &.warning {
        background-color: var(--p-message-warn-background);
        color: var(--p-message-warn-color);
        border: 1px solid var(--p-message-warn-border-color);
      }
      &.error {
        background-color: var(--p-message-error-background);
        color: var(--p-message-error-color);
        border: 1px solid var(--p-message-error-border-color);
      }
    }
  }
}
</style>
