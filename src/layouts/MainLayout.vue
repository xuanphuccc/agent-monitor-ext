<script setup>
import Button from "primevue/button";
</script>

<template>
  <div class="xp-main-layout">
    <div class="xp-header">
      <div class="xp-logo">
        <div class="xp-logo-img">
          <svg
            width="24"
            height="24"
            viewBox="0 0 50 40"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M43 31L31 40H5L7 35L12 31H29L32 35L40 11L45 7H50L43 31ZM43 5L38 9H21L18 5L10 29L5 33H0L7 9L19 0H45L43 5ZM24 13H35L29 31L26 27H15L21 9L24 13Z"
              fill="#297AFF"
            ></path>
          </svg>
        </div>
        <div class="xp-title">AI Agent Monitor</div>
      </div>
      <div class="xp-header-actions">
        <Button
          @click.stop="$emit('setting')"
          size="small"
          icon="pi pi-cog"
          variant="text"
          title="Cài đặt"
        />
        <Button @click.stop="" size="small" icon="pi pi-times" variant="text" title="Đóng" />
      </div>
    </div>

    <div class="xp-content">
      <slot></slot>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.xp-main-layout {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  // border: 1px solid var(--color-border);

  .xp-header {
    height: 48px;
    width: 100%;
    padding: 0 12px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    border-bottom: 1px solid var(--color-border);
    .xp-logo {
      display: flex;
      align-items: center;
      gap: 8px;
      .xp-logo-img {
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .xp-title {
        font-size: 14px;
        font-weight: 600;
        color: var(--color-text);
      }
    }

    .xp-header-actions {
      display: flex;
      align-items: center;
      gap: 8px;
    }
  }

  .xp-content {
    height: calc(100% - 48px);
    padding: 0;
    overflow-y: hidden;
    background-color: var(--color-background);
  }
}
</style>
