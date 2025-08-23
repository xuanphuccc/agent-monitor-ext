<script setup>
import { getOverallAiAgentUsage } from "@/services/reports-api";
import { getAvatarLetter } from "@/utils/common";
import Avatar from "primevue/avatar";
import Skeleton from "primevue/skeleton";
import { ref } from "vue";

const loading = ref(false);
const topProjects = ref([]);
const topUsers = ref([]);

/**
 * Hàm khởi tạo dữ liệu ban đầu
 */
const initData = async () => {
  try {
    loading.value = true;

    const currentDate = new Date();
    const startDate = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, "0")}-01`;
    const endDate = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, "0")}-${String(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate()).padStart(2, "0")}`;

    const response = await getOverallAiAgentUsage(startDate, endDate);
    if (response && response.data && response.data.success) {
      // Xử lý dữ liệu nhận được từ API
      const responseData = response.data.data;
      topProjects.value = responseData?.topProjects || [];
      topUsers.value = responseData?.topUsers || [];
    } else {
      toast.add({
        severity: "error",
        summary: "Lỗi khi lấy dữ liệu tổng quan.",
        life: 3000,
      });
    }

    loading.value = false;
  } catch (error) {
    console.error("Error initializing data:", error);
    loading.value = false;
  }
};
initData();
</script>

<template>
  <div class="xp-dashboard-tab">
    <div class="xp-dashboard-panel">
      <div class="xp-view-section">
        <div class="xp-view-section-title">Top nhân viên</div>
        <div class="xp-view-section-content">
          <div
            v-if="!loading"
            v-for="(user, index) in topUsers"
            :key="index"
            class="xp-ranking-item"
          >
            <div class="xp-ranking-left">
              <div class="xp-ranking-order">
                <img
                  v-if="index === 0"
                  class="ranking-image"
                  src="@/assets/images/ranking-1.png"
                  alt=""
                />
                <img
                  v-else-if="index === 1"
                  class="ranking-image"
                  src="@/assets/images/ranking-2.png"
                  alt=""
                />
                <img
                  v-else-if="index === 2"
                  class="ranking-image"
                  src="@/assets/images/ranking-3.png"
                  alt=""
                />

                <template v-else>{{ index + 1 }}</template>
              </div>
              <Avatar
                :label="getAvatarLetter(user.employeeName)"
                class="mr-2 flex-shrink-0"
                style="background-color: #dee9fc; color: #1a2551"
                shape="circle"
              />
              <div class="xp-ranking-info">
                <div class="xp-ranking-name">{{ user.employeeName }}</div>
                <div class="xp-ranking-role">{{ user.position }}</div>
              </div>
            </div>
            <div class="xp-ranking-item-score">{{ user.totalRequests }} requests</div>
          </div>
          <div v-else class="xp-ranking-item">
            <div class="xp-ranking-left">
              <div class="xp-ranking-order">
                <Skeleton width="20px" height="20px" />
              </div>
              <Skeleton shape="circle" size="28px" class="mr-2" />
              <div class="xp-ranking-info">
                <div class="xp-ranking-name">
                  <Skeleton width="150px" height="14px" />
                </div>
                <div class="xp-ranking-role">
                  <Skeleton width="120px" height="12px" style="margin-top: 6px" />
                </div>
              </div>
            </div>
            <div class="xp-ranking-item-score"></div>
          </div>
        </div>
      </div>
    </div>

    <div class="xp-dashboard-panel">
      <div class="xp-view-section">
        <div class="xp-view-section-title">Top dự án</div>
        <div class="xp-view-section-content">
          <div
            v-if="!loading"
            v-for="(project, index) in topProjects"
            :key="index"
            class="xp-ranking-item"
          >
            <div class="xp-ranking-left">
              <div class="xp-ranking-order">
                <img
                  v-if="index === 0"
                  class="ranking-image"
                  src="@/assets/images/ranking-1.png"
                  alt=""
                />
                <img
                  v-else-if="index === 1"
                  class="ranking-image"
                  src="@/assets/images/ranking-2.png"
                  alt=""
                />
                <img
                  v-else-if="index === 2"
                  class="ranking-image"
                  src="@/assets/images/ranking-3.png"
                  alt=""
                />

                <template v-else>{{ index + 1 }}</template>
              </div>
              <Avatar
                :label="getAvatarLetter(project.projectName)"
                class="mr-2 flex-shrink-0"
                style="background-color: #dee9fc; color: #1a2551"
                shape="circle"
              />
              <div class="xp-ranking-info">
                <div class="xp-ranking-name">{{ project.projectName }}</div>
                <div class="xp-ranking-role">{{ project.divisionName }}</div>
              </div>
            </div>
            <div class="xp-ranking-item-score">{{ project.usagePercentage }}%</div>
          </div>
          <div v-else class="xp-ranking-item">
            <div class="xp-ranking-left">
              <div class="xp-ranking-order">
                <Skeleton width="20px" height="20px" />
              </div>
              <Skeleton shape="circle" size="28px" class="mr-2" />
              <div class="xp-ranking-info">
                <div class="xp-ranking-name">
                  <Skeleton width="150px" height="14px" />
                </div>
                <div class="xp-ranking-role">
                  <Skeleton width="120px" height="12px" style="margin-top: 6px" />
                </div>
              </div>
            </div>
            <div class="xp-ranking-item-score"></div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.xp-dashboard-tab {
  width: 100%;
  padding: 0px 12px 12px;

  .xp-dashboard-panel {
    width: 100%;
    box-shadow:
      rgba(0, 0, 0, 0.1) 0px 1px 3px 0px,
      rgba(0, 0, 0, 0.06) 0px 1px 2px 0px;
    border-radius: 12px;
    overflow: hidden;
    margin-top: 2px;
    padding: 12px;
    .xp-view-section {
      width: 100%;
      .xp-view-section-title {
        font-weight: 600;
        font-size: 14px;
        line-height: 18px;
        color: var(--text-color);
      }

      .xp-view-section-content {
        padding-top: 16px;
        width: 100%;
      }
    }

    .xp-view-section + .xp-view-section {
      margin-top: 24px;
    }
  }

  .xp-dashboard-panel + .xp-dashboard-panel {
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

      .xp-ranking-order {
        flex-shrink: 0;
        display: flex;
        justify-content: center;
        width: 20px;
        font-weight: 600;
        font-size: 14px;
        line-height: 20px;
        height: 20px;
        color: var(--text-color);
      }

      .xp-ranking-info {
        .xp-ranking-name {
          font-weight: 600;
          font-size: 14px;
          line-height: 18px;
          color: var(--text-color);
        }

        .xp-ranking-role {
          font-size: 11px;
          line-height: 14px;
          color: var(--text-color-secondary);
          // white-space: nowrap;
          // overflow: hidden;
          // text-overflow: ellipsis;
          // max-width: 100%;
        }
      }
    }

    .xp-ranking-item-score {
      font-weight: 400;
      font-size: 11px;
      line-height: 14px;
      color: #4241d9;
      background: #f8fafc;
      padding: 4px 8px;
      border-radius: 8px;
      white-space: nowrap;
    }
  }
}

.flex-shrink-0 {
  flex-shrink: 0;
}
</style>
