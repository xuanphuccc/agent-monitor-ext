import { calculateKpiRequests, getFromStorage, getRandomNotification } from "@/utils/common";
import { getMonthlyUsageHistory } from "@/services/stats-api";

const KPI_CHECK_ALARM_PREFIX = "kpiCheckAlarm_";

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
    notificationTimes: [
      { hours: 10, minutes: 30 },
      { hours: 16, minutes: 30 },
    ],
  };
  const savedSettings = data.settings || {};

  const settings = { ...defaults, ...savedSettings };

  settings.notificationTimes = settings.notificationTimes.filter(
    (time) => time !== null && time !== undefined,
  );
  if (settings.notificationTimes.length === 0) {
    settings.notificationTimes = defaults.notificationTimes;
  }

  return settings;
};

/**
 * Xóa tất cả các báo thức KPI hiện có.
 */
const clearAllKpiAlarms = async () => {
  const alarms = await chrome.alarms.getAll();
  for (const alarm of alarms) {
    if (alarm.name.startsWith(KPI_CHECK_ALARM_PREFIX)) {
      await chrome.alarms.clear(alarm.name);
    }
  }
  console.log("⛔ All KPI check alarms cleared.");
};

/**
 * Lên lịch cho báo thức kiểm tra KPI dựa trên cài đặt của người dùng.
 * Báo thức sẽ được đặt vào giờ và phút được chỉ định, lặp lại hàng ngày.
 */
const scheduleKpiCheckAlarm = async () => {
  const settings = await getRawSettings();
  await clearAllKpiAlarms(); // Xóa tất cả báo thức cũ trước khi lên lịch lại

  if (settings.kpiAlert && settings.notificationTimes && settings.notificationTimes.length > 0) {
    // Lọc các khung giờ trùng lặp
    const uniqueNotificationTimes = settings.notificationTimes.filter(
      (time, index, self) =>
        index === self.findIndex((t) => t.hours === time.hours && t.minutes === time.minutes),
    );

    const now = new Date();
    uniqueNotificationTimes.forEach((time) => {
      const { hours, minutes } = time;
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

      const alarmName = `${KPI_CHECK_ALARM_PREFIX}${hours.toString().padStart(2, "0")}_${minutes.toString().padStart(2, "0")}`;

      chrome.alarms.create(alarmName, {
        when: nextAlarmTime.getTime(),
        periodInMinutes: 24 * 60, // Lặp lại mỗi 24 giờ
      });
      console.log(`✅ KPI check alarm scheduled for: ${nextAlarmTime} (Alarm: ${alarmName})`);
    });
  } else {
    console.log("⛔ KPI alerts are disabled or no notification times are set.");
  }

  // Lên lịch báo thức cập nhật badge mỗi 10 phút nếu quickViewRequests được bật
  if (settings.quickViewRequests) {
    chrome.alarms.create("badgeUpdateAlarm", {
      periodInMinutes: 10,
    });
    console.log("✅ Badge update alarm scheduled for every 10 minutes.");
  } else {
    chrome.alarms.clear("badgeUpdateAlarm");
    updateBadge(0); // Xóa badge nếu tính năng bị tắt
    console.log("⛔ Badge update alarm cleared.");
  }
};

/**
 * Thực hiện kiểm tra KPI.
 * Lấy dữ liệu sử dụng AI agent và so sánh với KPI đã đặt.
 * Hiển thị thông báo nếu KPI không đạt.
 */
/**
 * Cập nhật badge của extension với số request và màu sắc.
 * @param {number} requestCount - Số request để hiển thị trên badge.
 */
const updateBadge = (requestCount) => {
  const text = requestCount > 0 ? String(requestCount) : "";
  chrome.action.setBadgeText({ text: text });
  chrome.action.setBadgeBackgroundColor({ color: "#4285F4" }); // Màu xanh lam của Google
};

/**
 * Thực hiện kiểm tra KPI.
 * Lấy dữ liệu sử dụng AI agent và so sánh với KPI đã đặt.
 * Hiển thị thông báo nếu KPI không đạt.
 */
/**
 * Lấy số request trong ngày hiện tại của nhân viên đầu tiên.
 * @returns {Promise<number>} - Promise trả về tổng số request.
 */
const getTodayRequestsForFirstEmployee = async () => {
  try {
    const employeeList = (await getFromStorage("employeeList")) || [];
    if (employeeList.length === 0) {
      console.log("No employees found. Skipping request count.");
      return 0;
    }

    const firstEmployee = employeeList[0];
    const currentDate = new Date();
    const currentDay = currentDate.getDate();
    const currentMonth = currentDate.getMonth() + 1;
    const currentYear = currentDate.getFullYear();

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
          `${currentYear}-${String(currentMonth).padStart(2, "0")}-${String(currentDay).padStart(2, "0")}`,
      );

      if (todayUsage) {
        totalRequests = calculateKpiRequests(todayUsage, firstEmployee.kpiTools);
      }
    }
    return totalRequests;
  } catch (error) {
    console.error("❌ Error getting today's requests for first employee:", error);
    return 0;
  }
};

const performKpiCheck = async () => {
  const settings = await getRawSettings();
  if (!settings.kpiAlert) {
    return;
  }

  try {
    const totalRequests = await getTodayRequestsForFirstEmployee();

    if (totalRequests < settings.minRequestCount) {
      const { title, message } = getRandomNotification(totalRequests, settings.minRequestCount);
      chrome.notifications.create({
        type: "basic",
        iconUrl: "logo-128.png",
        title: title,
        message: message,
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
  updateBadgeWithTodayRequests(); // Cập nhật badge ngay khi cài đặt/cập nhật
});

/**
 * Cập nhật badge của extension với số request trong ngày hiện tại.
 */
const updateBadgeWithTodayRequests = async () => {
  const settings = await getRawSettings();
  if (!settings.quickViewRequests) {
    updateBadge(0); // Xóa badge nếu tính năng bị tắt
    return;
  }
  const totalRequests = await getTodayRequestsForFirstEmployee();
  updateBadge(totalRequests);
};

/**
 * Listener cho các sự kiện báo thức.
 * Khi báo thức kiểm tra KPI được kích hoạt, hãy thực hiện kiểm tra.
 */
chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name.startsWith(KPI_CHECK_ALARM_PREFIX)) {
    console.log(`⏰ KPI check alarm triggered: ${alarm.name}`);
    performKpiCheck();
  } else if (alarm.name === "badgeUpdateAlarm") {
    console.log(`⏰ Badge update alarm triggered: ${alarm.name}`);
    updateBadgeWithTodayRequests();
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

    updateBadgeWithTodayRequests(); // Cập nhật badge ngay khi thay đổi cài đặt
  }
});
