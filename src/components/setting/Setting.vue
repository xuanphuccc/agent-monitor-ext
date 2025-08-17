<script setup>
import Button from "primevue/button";
import ToggleSwitch from "primevue/toggleswitch";
import InputNumber from "primevue/inputnumber";
import DatePicker from "primevue/datepicker";
import { onMounted, ref, watch } from "vue";
import { saveSettings, getSettings } from "@/utils/common";

const settingConfigs = ref([
  {
    title: "Thông báo",
    items: [
      {
        icon: "pi pi-eye",
        title: "Xem nhanh số requests",
        description:
          "Hiển thị số requests trong ngày của nhân viên đầu tiên trong danh sách trên biểu tượng tiện ích.",
        type: "toggle",
        field: "quickViewRequests",
        value: true,
      },
      {
        icon: "pi pi-bell",
        title: "Cảnh báo KPI",
        description: "Hiển thị thông báo khi chưa đạt KPI trong ngày.",
        type: "toggle",
        field: "kpiAlert",
        value: true,
      },
      {
        icon: null,
        title: "Giờ thông báo",
        description: null,
        type: "time",
        field: "notificationTime",
        value: "08:00",
      },
      {
        icon: null,
        title: "Số request tối thiểu",
        description: null,
        type: "number",
        field: "minRequestCount",
        value: 5,
      },
    ],
  },
  {
    title: "Thông tin",
    items: [
      {
        icon: null,
        title: "Phiên bản",
        description: null,
        type: "text",
        field: "version",
        value: "1.0.0",
      },
      {
        icon: null,
        title: "Tác giả",
        description: null,
        type: "text",
        field: "author",
        value: "@txphuc",
      },
    ],
  },
]);

const settingValues = ref({
  quickViewRequests: true,
  kpiAlert: true,
  minRequestCount: 5,
  notificationTime: new Date(),
});

/**
 * Hàm khởi tạo dữ liệu cài đặt
 * Lấy dữ liệu từ chrome.storage.local
 * @returns {void}
 */
const initData = async () => {
  const savedSettings = await getSettings();
  settingValues.value = savedSettings;
};

onMounted(() => {
  initData();
});

// Theo dõi sự thay đổi của settingValues và lưu lại khi có thay đổi
watch(
  settingValues,
  (newSettings) => {
    saveSettings(newSettings);
  },
  { deep: true }, // Sử dụng deep watch để theo dõi các thuộc tính lồng nhau của object
);
</script>
<template>
  <div class="xp-setting">
    <div class="xp-setting-header">
      <div class="xp-setting-back">
        <Button
          @click="$emit('back')"
          icon="pi pi-arrow-left"
          size="small"
          variant="text"
          title="Quay lại"
        />
      </div>
      <div class="xp-setting-header-title">Cài đặt</div>
    </div>
    <div class="xp-setting-content">
      <div v-for="(section, index) in settingConfigs" :key="index" class="xp-setting-section">
        <div class="xp-setting-section-title">{{ section.title }}</div>
        <div class="xp-setting-section-content">
          <div v-for="(item, itemIndex) in section.items" :key="itemIndex" class="xp-setting-item">
            <div class="xp-setting-item-main">
              <div class="xp-setting-item-left">
                <div v-if="item.icon" class="xp-setting-item-icon">
                  <i :class="['pi', item.icon]" style="font-size: 20px"></i>
                </div>
                <div class="xp-setting-item-title">{{ item.title }}</div>
              </div>
              <div class="xp-setting-item-right">
                <template v-if="item.type === 'toggle'">
                  <ToggleSwitch v-model="settingValues[item.field]" />
                </template>
                <template v-else-if="item.type === 'time'">
                  <DatePicker v-model="settingValues[item.field]" timeOnly size="small" />
                </template>
                <template v-else-if="item.type === 'number'">
                  <InputNumber
                    v-model="settingValues[item.field]"
                    :min="0"
                    :max="100"
                    size="small"
                  />
                </template>
                <template v-else>
                  <div class="xp-setting-item-value">{{ item.value }}</div>
                </template>
              </div>
            </div>
            <div v-if="item.description" class="xp-setting-item-description">
              {{ item.description }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<style lang="scss" scoped>
.xp-setting {
  display: flex;
  flex-direction: column;
  height: 100%;
  padding-top: 12px;

  .xp-setting-header {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 0 8px;
    margin-bottom: 24px;

    .xp-setting-back {
      cursor: pointer;
    }

    .xp-setting-header-title {
      font-size: 14px;
      line-height: 18px;
      font-weight: 600;
      color: var(--color-text);
    }
  }

  .xp-setting-content {
    padding: 0 16px;
    flex: 1;
    overflow-y: auto;

    .xp-setting-section {
      margin-bottom: 32px;

      .xp-setting-section-title {
        font-size: 14px;
        line-height: 18px;
        font-weight: 600;
        color: var(--color-text);
        margin-bottom: 16px;
      }

      .xp-setting-section-content {
        .xp-setting-item {
          margin-bottom: 16px;

          .xp-setting-item-main {
            display: flex;
            justify-content: space-between;
            align-items: center;
          }

          .xp-setting-item-left {
            display: flex;
            align-items: center;
            gap: 12px;

            .xp-setting-item-icon {
              display: flex;
              align-items: center;
              justify-content: center;
            }

            .xp-setting-item-title {
              font-size: 13px;
              line-height: 18px;
              font-weight: 500;
              color: var(--color-text);
            }
          }

          .xp-setting-item-right {
            display: flex;
            align-items: center;

            .xp-setting-item-value {
              font-size: 13px;
              line-height: 18px;
              color: var(--color-text-secondary);
            }
          }

          .xp-setting-item-description {
            font-size: 11px;
            line-height: 1.5;
            color: var(--color-text-secondary);
            margin-top: 4px;
          }
        }
      }
    }
  }
}
</style>
