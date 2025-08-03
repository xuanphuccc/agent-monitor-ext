<script setup>
import Knob from "primevue/knob";
import DatePicker from "primevue/datepicker";
import { ref } from "vue";

const datePickerConfig = ref({
  date: {
    border: {
      radius: "6px",
    },
  },
});
</script>

<template>
  <div class="xp-view-employee">
    <div class="xp-view-section">
      <div class="xp-view-section-title">Hôm nay</div>
      <div class="xp-view-section-content">
        <div class="xp-employee-overview">
          <div class="xp-overview-chart">
            <Knob
              :modelValue="60"
              valueColor="#358ffa"
              valueTemplate="{value}%"
              :size="50"
              readonly
            />
          </div>
          <div class="xp-overview-info">
            <div class="xp-overview-info-title">Tổng request</div>
            <div class="xp-overview-info-value">234</div>
          </div>
        </div>
        <div class="xp-employee-details">
          <div class="xp-employee-detail-item">
            <span class="xp-employee-detail-label">Cline</span>
            <span class="xp-employee-detail-value">200</span>
          </div>
          <div class="xp-employee-detail-item">
            <span class="xp-employee-detail-label">Cursor</span>
            <span class="xp-employee-detail-value">34</span>
          </div>
          <div class="xp-employee-detail-item">
            <span class="xp-employee-detail-label">OneAI</span>
            <span class="xp-employee-detail-value">0</span>
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
        border: 1px solid #b6ccdd;
        background: linear-gradient(0deg, #ebf7ff 0%, #fcfeff 100%);
        border-radius: 12px;
        display: flex;
        align-items: center;
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
