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
            viewBox="0 0 40 40"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fill-rule="evenodd"
              clip-rule="evenodd"
              d="M20 0C27.4768 0 31.2154 -0.000204921 34 1.60742C35.8242 2.66064 37.3394 4.17577 38.3926 6C40.0002 8.7846 40 12.5232 40 20C40 27.4768 40.0002 31.2154 38.3926 34C37.3394 35.8242 35.8242 37.3394 34 38.3926C31.2154 40.0002 27.4768 40 20 40C12.5232 40 8.7846 40.0002 6 38.3926C4.17577 37.3394 2.66064 35.8242 1.60742 34C-0.000204921 31.2154 0 27.4768 0 20C0 12.5232 -0.000204921 8.7846 1.60742 6C2.66064 4.17577 4.17577 2.66064 6 1.60742C8.7846 -0.000204921 12.5232 0 20 0ZM22 4C13.1634 4 6 11.1634 6 20C6 28.8366 13.1634 36 22 36C30.8366 36 38 28.8366 38 20C38 11.1634 30.8366 4 22 4Z"
              fill="#1f4de7"
            ></path>
            <path
              d="M36 20C36 25.5228 31.5228 30 26 30C20.4772 30 16 25.5228 16 20C16 14.4772 20.4772 10 26 10C31.5228 10 36 14.4772 36 20Z"
              fill="#1f4de7"
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
