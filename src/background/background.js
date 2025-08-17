import { getFromStorage } from "@/utils/common";
import { getMonthlyUsageHistory } from "@/services/stats-api";

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
    // Lấy danh sách nhân viên từ storage
    const employeeList = (await getFromStorage("employeeList")) || [];
    if (employeeList.length === 0) {
      console.log("No employees found. Skipping KPI check.");
      return;
    }

    // Lấy nhân viên đầu tiên
    const firstEmployee = employeeList[0];

    // Lấy ngày tháng hiện tại
    const currentDate = new Date();
    const currentDay = currentDate.getDate();
    const currentMonth = currentDate.getMonth() + 1;
    const currentYear = currentDate.getFullYear();

    // Gọi API để lấy lịch sử sử dụng
    const response = await getMonthlyUsageHistory(
      currentMonth,
      currentYear,
      firstEmployee.employeeCode,
    );

    let totalRequests = 0;
    if (response && response.data && response.data.success) {
      const dailyUsages = response.data.data?.dailyUsage || [];
      const todayUsage = dailyUsages.find(
        (usage) =>
          usage.date ===
          `${currentYear}-${String(currentMonth).padStart(2, "0")}-${String(currentDay).padStart(
            2,
            "0",
          )}`,
      );

      if (todayUsage) {
        totalRequests = todayUsage.positionBasedRequests;
      }
    }

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
