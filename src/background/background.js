import { getOverallAiAgentUsage } from "@/services/reports-api";

const KPI_CHECK_ALARM_NAME = "kpiCheckAlarm";

/**
 * Lấy cài đặt thô từ chrome.storage.local mà không cần chuyển đổi.
 * @returns {Promise<Object>} - Promise trả về đối tượng chứa các cài đặt đã lưu.
 */
const getRawSettings = async () => {
  const data = await chrome.storage.local.get("settings");
  const defaults = {
    quickViewRequests: true,
    kpiAlert: true,
    minRequestCount: 5,
    notificationTime: { hours: 16, minutes: 30 },
  };
  return { ...defaults, ...(data.settings || {}) };
};

/**
 * Lên lịch cho báo thức kiểm tra KPI dựa trên cài đặt của người dùng.
 * Báo thức sẽ được đặt vào giờ và phút được chỉ định, lặp lại hàng ngày.
 */
const scheduleKpiCheckAlarm = async () => {
  const settings = await getRawSettings();
  if (settings.kpiAlert) {
    const now = new Date();
    const { hours, minutes } = settings.notificationTime;

    let nextAlarmTime = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
      hours,
      minutes,
      0,
      0,
    );

    // Nếu thời gian báo thức đã qua trong ngày hôm nay, đặt cho ngày mai
    if (nextAlarmTime.getTime() < now.getTime()) {
      nextAlarmTime.setDate(nextAlarmTime.getDate() + 1);
    }

    chrome.alarms.create(KPI_CHECK_ALARM_NAME, {
      when: nextAlarmTime.getTime(),
      periodInMinutes: 24 * 60, // Lặp lại mỗi 24 giờ
    });
    console.log(`✅ KPI check alarm scheduled for: ${nextAlarmTime}`);
  } else {
    // Nếu người dùng tắt cảnh báo, hãy xóa báo thức
    chrome.alarms.clear(KPI_CHECK_ALARM_NAME);
    console.log("⛔ KPI check alarm cleared.");
  }
};

/**
 * Thực hiện kiểm tra KPI.
 * Lấy dữ liệu sử dụng AI agent và so sánh với KPI đã đặt.
 * Hiển thị thông báo nếu KPI không đạt.
 */
const performKpiCheck = async () => {
  const settings = await getRawSettings();
  if (!settings.kpiAlert) {
    return;
  }

  try {
    // const data = await getOverallAiAgentUsage();
    const totalRequests = 2;

    if (totalRequests < settings.minRequestCount) {
      chrome.notifications.create({
        type: "basic",
        iconUrl: "logo-128.png",
        title: "Cảnh báo KPI",
        message: `Bạn chưa đạt KPI! Số requests hiện tại là ${totalRequests}/${settings.minRequestCount}.`,
        priority: 2,
      });
    }
  } catch (error) {
    console.error("❌ Error performing KPI check:", error);
  }
};

// --- Listeners ---

/**
 * Listener được kích hoạt khi extension được cài đặt hoặc cập nhật.
 * Lên lịch báo thức kiểm tra KPI ban đầu.
 */
chrome.runtime.onInstalled.addListener(() => {
  console.log("✅ Extension installed or updated.");
  scheduleKpiCheckAlarm();
});

/**
 * Listener cho các sự kiện báo thức.
 * Khi báo thức kiểm tra KPI được kích hoạt, hãy thực hiện kiểm tra.
 */
chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === KPI_CHECK_ALARM_NAME) {
    console.log("⏰ KPI check alarm triggered.");
    performKpiCheck();
  }
});

/**
 * Listener cho các thay đổi trong chrome.storage.
 * Nếu cài đặt thay đổi, hãy lên lịch lại báo thức.
 */
chrome.storage.onChanged.addListener((changes, namespace) => {
  if (namespace === "local" && changes.settings) {
    console.log("⚙️ Settings changed, re-scheduling KPI alarm.");
    scheduleKpiCheckAlarm();
  }
});
