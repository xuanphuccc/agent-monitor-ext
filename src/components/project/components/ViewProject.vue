<script setup>
import Chart from "primevue/chart";
import SelectButton from "primevue/selectbutton";
import DatePicker from "primevue/datepicker";
import { ref, onMounted } from "vue";

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
  const documentStyle = getComputedStyle(document.documentElement);

  return {
    labels: ["txphuc", "lthai", "pdmanh", "nhson", "nhhung", "dgbao", "ptluyen"],
    datasets: [
      {
        type: "bar",
        label: "Cline",
        backgroundColor: documentStyle.getPropertyValue("--p-cyan-500"),
        data: [50, 25, 12, 48, 90, 76, 42],
      },
      {
        type: "bar",
        label: "Cursor",
        backgroundColor: documentStyle.getPropertyValue("--p-gray-500"),
        data: [21, 84, 24, 75, 37, 65, 34],
      },
      {
        type: "bar",
        label: "OneAI",
        backgroundColor: documentStyle.getPropertyValue("--p-orange-500"),
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
      tooltips: {
        mode: "index",
        intersect: false,
      },
      legend: {
        labels: {
          color: textColor,
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
  };
};
</script>

<template>
  <div class="xp-view-employee">
    <div class="xp-view-section">
      <div class="xp-view-section-title">Dự án IVAN</div>
      <div class="xp-view-section-content">
        <div class="xp-sections-filter">
          <SelectButton
            v-model="currentOption"
            optionLabel="label"
            optionValue="value"
            :options="options"
            size="small"
          />
          <!-- <DatePicker view="month" dateFormat="mm/yy" size="small" /> -->
          <DatePicker selectionMode="multiple" :manualInput="false" size="small" />
        </div>
        <Chart type="bar" :data="chartData" :options="chartOptions" :height="260" />
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

      .xp-sections-filter {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-bottom: 16px;
      }
    }
  }

  .xp-view-section + .xp-view-section {
    margin-top: 24px;
  }
}
</style>
