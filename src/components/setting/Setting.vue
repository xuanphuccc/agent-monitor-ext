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
        title: "Xem nhanh số request",
        description: "Hiển thị số request hôm nay trên biểu tượng tiện ích.",
        type: "toggle",
        field: "quickViewRequests",
        value: true,
      },
      {
        icon: "pi pi-bell",
        title: "Nhắc nhở sử dụng AI",
        description: "Bật thông báo cho trình duyệt để sử dụng tính năng này.",
        type: "toggle",
        field: "kpiAlert",
        value: true,
      },
      {
        icon: null,
        title: "Mục tiêu (request)",
        description: null,
        type: "number",
        field: "minRequestCount",
        value: 5,
      },
      {
        icon: null,
        title: "Giờ nhắc nhở",
        description: null,
        type: "multiple-time",
        field: "notificationTimes",
        value: [],
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
        title: "Nhà cung cấp",
        description: null,
        type: "text",
        field: "author",
        value: "@txphuc",
      },
      {
        icon: null,
        title: "Nguồn dữ liệu",
        description: null,
        type: "link",
        field: "author",
        value: "http://aiagentmonitor.misa.local",
      },
    ],
  },
]);

const settingValues = ref({
  quickViewRequests: true,
  kpiAlert: true,
  minRequestCount: 5,
  notificationTimes: [new Date()], // Khởi tạo với một giờ thông báo mặc định
});

/**
 * Hàm thêm giờ thông báo mới
 * @returns {void}
 */
const addNotificationTime = () => {
  settingValues.value.notificationTimes.push(new Date());
};

/**
 * Hàm xóa giờ thông báo theo chỉ số
 * @param {number} index - Chỉ số của giờ thông báo cần xóa
 * @returns {void}
 */
const removeNotificationTime = (index) => {
  settingValues.value.notificationTimes.splice(index, 1);
};

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
          <div
            v-for="(item, itemIndex) in section.items"
            :key="itemIndex"
            class="xp-setting-item"
            :class="[`xp-setting-item-${item.type}`]"
          >
            <div class="xp-setting-item-main">
              <div class="xp-setting-item-left">
                <div v-if="item.icon" class="xp-setting-item-icon">
                  <i :class="['pi', item.icon]" style="font-size: 20px"></i>
                </div>
                <div class="xp-setting-item-title">{{ item.title }}</div>
                <Button
                  v-if="item.type === 'multiple-time'"
                  @click="addNotificationTime"
                  icon="pi pi-plus"
                  variant="text"
                  size="small"
                  title="Thêm giờ nhắc nhở"
                />
              </div>
              <div class="xp-setting-item-right">
                <template v-if="item.type === 'toggle'">
                  <ToggleSwitch v-model="settingValues[item.field]" />
                </template>
                <template v-else-if="item.type === 'multiple-time'">
                  <div class="xp-setting-multiple-time-wrapper">
                    <div
                      v-for="(time, timeIndex) in settingValues[item.field]"
                      :key="timeIndex"
                      class="xp-setting-multiple-time-item"
                    >
                      <DatePicker
                        v-model="settingValues[item.field][timeIndex]"
                        timeOnly
                        size="small"
                      />
                      <Button
                        v-if="settingValues[item.field].length > 1"
                        @click="removeNotificationTime(timeIndex)"
                        icon="pi pi-trash"
                        severity="danger"
                        variant="text"
                        size="small"
                        title="Xóa giờ nhắc nhở"
                        class="xp-setting-multiple-time-remove"
                        :dt="{
                          sm: {
                            padding: {
                              x: '4px',
                              y: '4px',
                            },
                          },
                        }"
                      />
                    </div>
                  </div>
                </template>
                <template v-else-if="item.type === 'number'">
                  <InputNumber
                    v-model="settingValues[item.field]"
                    :min="0"
                    :max="100"
                    size="small"
                  />
                </template>
                <template v-else-if="item.type === 'link'">
                  <a :href="item.value" target="_blank" class="xp-setting-item-value">
                    {{ item.value }}
                  </a>
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
  width: 100%;
  height: 100%;

  .xp-setting-header {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 12px 8px;

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
    padding: 12px 16px 0;
    flex: 1;
    overflow-y: auto;

    .xp-setting-section {
      margin-bottom: 36px;

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
            gap: 8px;
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
              display: flex;
              align-items: center;
              gap: 8px;
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

          // Style cho setting item kiểu multiple-time
          &.xp-setting-item-multiple-time {
            .xp-setting-item-main {
              flex-direction: column;
              align-items: flex-start;
            }

            .xp-setting-item-left {
              width: 100%;
              justify-content: space-between;
            }
            .xp-setting-item-right {
              width: 100%;
              justify-content: flex-end;

              .xp-setting-multiple-time-wrapper {
                display: flex;
                flex-direction: column;
                gap: 8px;

                .xp-setting-multiple-time-item {
                  display: flex;
                  align-items: center;
                  gap: 8px;
                  position: relative;

                  .xp-setting-multiple-time-remove {
                    position: absolute !important;
                    right: 1px;
                    top: 50%;
                    transform: translateY(-50%);
                    z-index: 1;
                    display: none;
                  }

                  &:hover {
                    .xp-setting-multiple-time-remove {
                      display: inline-flex;
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  }
}
</style>
