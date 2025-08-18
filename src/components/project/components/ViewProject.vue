<script setup>
import Chart from "primevue/chart";
import SelectButton from "primevue/selectbutton";
import DatePicker from "primevue/datepicker";
import Skeleton from "primevue/skeleton";
import { ref, onMounted, watch } from "vue";
import { getAiAgentUsageByProject } from "@/services/reports-api";
import { useToast } from "primevue/usetoast";
import { FILTER_TYPE } from "@/enums/xp-enum";

const toast = useToast();

const emit = defineEmits(["projectInfo", "loading"]);
const props = defineProps({
  project: {
    type: Object,
    required: true,
  },
});

const loading = ref(false);
const projectInfo = ref(null);
const selectedDates = ref([new Date(), new Date()]);
const seletecDate = ref(new Date());

const chartData = ref();
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
        borderRadius: 4,
      },
    },
  };
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

  // Lấy dữ liệu đầu tiên để lấy thông tin về project
  const firstItem = data[0];
  if (firstItem) {
    const projectData = {
      divisionName: firstItem.divisionName || "N/A",
      projectName: props.project.projectName || "N/A",
    };
    projectInfo.value = projectData;
    emit("projectInfo", projectData);
  } else {
    projectInfo.value = null;
    emit("projectInfo", null);
  }

  return { labels, datasets };
};

const setChartData = (data = {}) => {
  const { labels = [], datasets = [] } = data;
  return {
    labels,
    datasets: [
      {
        type: "bar",
        label: "Cline",
        backgroundColor: "#1e3a8a",
        data: datasets.map((item) => item.cline),
      },
      {
        type: "bar",
        label: "Cursor",
        backgroundColor: "#1d4ed8",
        data: datasets.map((item) => item.cursor),
      },
      {
        type: "bar",
        label: "OneAI",
        backgroundColor: "#3b82f6",
        data: datasets.map((item) => item.oneai),
      },
      {
        type: "bar",
        label: "AI Agents",
        backgroundColor: "#93c5fd",
        data: datasets.map((item) => item.aiagent),
      },
    ],
  };
};

/**
 * Hàm lấy dữ liệu cho biểu đồ
 */
const initData = async (resetFilter = true) => {
  try {
    loading.value = true;
    emit("loading", true);

    if (resetFilter) {
      selectedDates.value = [new Date(), new Date()];
      seletecDate.value = new Date();
      currentOption.value = FILTER_TYPE.DATE;
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
      const selectedMonth = seletecDate.value;
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
    }
  } catch (error) {
    console.error("Error fetching project data:", error);
    toast.add({
      severity: "error",
      summary: "Lỗi",
      detail: "Không thể lấy dữ liệu dự án",
      life: 3000,
    });
  } finally {
    loading.value = false;
    emit("loading", false);
  }
};

/**
 * Hàm xử lý sự kiện khi thay đổi lựa chọn
 */
const handleOptionChange = () => {
  if (currentOption.value === FILTER_TYPE.DATE) {
    selectedDates.value = [new Date(), new Date()];
  } else {
    seletecDate.value = new Date();
  }
  initData(false);
};

/**
 * Hàm xử lý sự thay đổi của selectedDates và seletecDate
 */
const handleDateChange = () => {
  initData(false);
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
      <div v-if="!loading" class="xp-view-section-title">
        {{ projectInfo && projectInfo.projectName ? projectInfo.projectName : "N/A" }}
      </div>
      <Skeleton v-else width="150px" height="18px" />
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
          <DatePicker
            v-if="currentOption === FILTER_TYPE.MONTH"
            v-model="seletecDate"
            @value-change="handleDateChange"
            view="month"
            dateFormat="mm/yy"
            size="small"
            :manualInput="false"
            :disabled="loading"
          />
          <DatePicker
            v-else
            v-model="selectedDates"
            @value-change="handleDateChange"
            selectionMode="range"
            :manualInput="false"
            size="small"
            :disabled="loading"
          />
        </div>
        <Chart
          v-if="chartData"
          type="bar"
          :data="chartData"
          :options="chartOptions"
          :height="250"
        />
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
    }
  }

  .xp-view-section + .xp-view-section {
    margin-top: 24px;
  }
}
</style>
