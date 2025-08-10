<script setup>
import Avatar from "primevue/avatar";
</script>

<template>
  <div class="xp-dashboard-tab">
    <div class="xp-dashboard-panel">
      <div class="xp-view-section">
        <div class="xp-view-section-title">Top nhân viên</div>
        <div class="xp-view-section-content">
          <div class="xp-ranking-item">
            <div class="xp-ranking-left">
              <div class="xp-ranking-order">1</div>
              <Avatar
                label="I"
                class="mr-2"
                style="background-color: #dee9fc; color: #1a2551"
                shape="circle"
              />
              <div class="xp-ranking-info">
                <div class="xp-ranking-name">Trần Xuân Phúc</div>
                <div class="xp-ranking-role">Lập trình viên</div>
              </div>
            </div>
            <div class="xp-ranking-item-score">95 requests</div>
          </div>
        </div>
      </div>
    </div>

    <div class="xp-dashboard-panel">
      <div class="xp-view-section">
        <div class="xp-view-section-title">Top dự án</div>
        <div class="xp-view-section-content">
          <div class="xp-ranking-item">
            <div class="xp-ranking-left">
              <div class="xp-ranking-order">1</div>
              <Avatar
                label="I"
                class="mr-2"
                style="background-color: #dee9fc; color: #1a2551"
                shape="circle"
              />
              <div class="xp-ranking-info">
                <div class="xp-ranking-name">Trần Xuân Phúc</div>
                <div class="xp-ranking-role">Lập trình viên</div>
              </div>
            </div>
            <div class="xp-ranking-item-score">95 requests</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.xp-dashboard-tab {
  width: 100%;
  height: 100%;
  overflow-y: auto;
  padding: 0px 12px;

  .xp-dashboard-panel {
    width: 100%;
    box-shadow:
      rgba(67, 71, 85, 0.27) 0px 0px 0.25em,
      rgba(90, 125, 188, 0.05) 0px 0.25em 1em;
    border-radius: 12px;
    overflow: hidden;
    margin-top: 2px;
    padding: 12px;
    .xp-view-section {
      .xp-view-section-title {
        font-weight: 700;
        font-size: 16px;
        line-height: 20px;
        color: var(--color-text);
      }

      .xp-view-section-content {
        padding-top: 16px;
      }
    }

    .xp-view-section + .xp-view-section {
      margin-top: 24px;
    }
  }

  .xp-dashboard-panel + .xp-dashboard-panel {
    margin-top: 16px;
  }

  .xp-ranking-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 8px 0;

    .xp-ranking-left {
      display: flex;
      align-items: center;
      gap: 16px;

      .xp-ranking-order {
        font-weight: 700;
        font-size: 16px;
        color: var(--color-text);
      }

      .xp-ranking-info {
        .xp-ranking-name {
          font-weight: 600;
          font-size: 14px;
          line-height: 18px;
          color: var(--color-text);
        }

        .xp-ranking-role {
          font-size: 11px;
          line-height: 14px;
          color: var(--color-text-secondary);
        }
      }
    }

    .xp-ranking-item-score {
      font-weight: 600;
      font-size: 14px;
      color: var(--color-text);
    }
  }
}
</style>
