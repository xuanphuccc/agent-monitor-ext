<script setup>
import Chart from "primevue/chart";
import SelectButton from "primevue/selectbutton";
import DatePicker from "primevue/datepicker";
import { ref, computed, onMounted } from "vue";
import { getAiAgentUsageByProject } from "@/services/reports-api";
import { useToast } from "primevue/usetoast";

const toast = useToast();

const emit = defineEmits(["dataChange", "loading"]);
const props = defineProps({
  project: {
    type: Object,
    required: true,
  },
});

const loading = ref(false);

onMounted(() => {
  chartData.value = setChartData();
  chartOptions.value = setChartOptions();
});

const chartData = ref();
const chartOptions = ref();
const options = [
  { label: "Ngày", value: 1 },
  { label: "Tháng", value: 2 },
];
const currentOption = ref(1);

const setChartData = () => {
  return {
    labels: ["txphuc", "lthai", "pdmanh", "nhson", "nhhung", "dgbao", "ptluyen"],
    datasets: [
      {
        type: "bar",
        label: "Cline",
        backgroundColor: "#1e3a8a",
        data: [50, 25, 12, 48, 90, 76, 42],
      },
      {
        type: "bar",
        label: "Cursor",
        backgroundColor: "#1d4ed8",
        data: [21, 84, 24, 75, 37, 65, 34],
      },
      {
        type: "bar",
        label: "OneAI",
        backgroundColor: "#3b82f6",
        data: [41, 52, 24, 74, 23, 21, 32],
      },
      {
        type: "bar",
        label: "AI Agents",
        backgroundColor: "#93c5fd",
        data: [41, 52, 24, 74, 23, 21, 32],
      },
    ],
  };
};
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
 * Hàm khởi tạo dữ liệu ban đầu
 */
const initData = async () => {
  try {
    // // Kiểm tra xem có dữ liệu dự án không
    // if (!props.project) {
    //   return;
    // }
    // loading.value = true;
    // emit("loading", true);
    // const currentDate = new Date();
    // const currentDay = currentDate.getDate();
    // const currentMonth = currentDate.getMonth();
    // const currentYear = currentDate.getFullYear();
    // const startDate = `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}-${String(currentDay).padStart(2, "0")}T00:00:00`;
    // const endDate = `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}-${String(currentDay).padStart(2, "0")}T23:59:59`;
    // const projectDaylyUsageData = await getAiAgentUsageByProject(
    //   props.project.projectName,
    //   startDate,
    //   endDate,
    // );
    // if (projectDaylyUsageData && projectDaylyUsageData.data && projectDaylyUsageData.data.success) {
    //   const usageDataList = projectDaylyUsageData.data.data || [];
    //   const projectUsage =
    //     usageDataList.find((usage) => usage.projectCode === props.project.projectCode) || null;
    //   if (projectUsage) {
    //     daylyUsageData.value = projectUsage;
    //     emit("dataChange", projectUsage);
    //   } else {
    //     toast.add({
    //       severity: "error",
    //       summary: `Nhân viên ${props.project.projectCode} không tồn tại.`,
    //       life: 3000,
    //     });
    //   }
    // } else {
    //   toast.add({
    //     severity: "error",
    //     summary: "Lỗi khi lấy dữ liệu sử dụng hàng ngày.",
    //     life: 3000,
    //   });
    // }
    // loading.value = false;
    // emit("loading", false);
  } catch (error) {
    console.error("Error initializing project data:", error);
    loading.value = false;
    emit("loading", false);
  }
};
initData();

defineExpose({
  initData,
});
</script>

<template>
  <div class="xp-view-project">
    <div class="xp-view-section">
      <div class="xp-view-section-title">Dự án IVAN</div>
      <div class="xp-view-section-content">
        <div class="xp-sections-filter">
          <SelectButton
            v-model="currentOption"
            optionLabel="label"
            optionValue="value"
            :options="options"
            :allowEmpty="false"
            size="small"
          />
          <!-- <DatePicker view="month" dateFormat="mm/yy" size="small" /> -->
          <DatePicker selectionMode="multiple" :manualInput="false" size="small" />
        </div>
        <Chart type="bar" :data="chartData" :options="chartOptions" :height="250" />
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
