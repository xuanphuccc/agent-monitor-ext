/**
 * Lấy giá trị từ chrome.storage.local
 * @param {string} key - Tên khóa để lấy giá trị
 * @returns {Promise<*>} - Promise trả về giá trị đã lưu, hoặc null nếu không có
 */
export const getFromStorage = async (key) => {
  const result = await chrome.storage.local.get(key);
  return result[key] ?? null;
};

/**
 * Lưu giá trị vào chrome.storage.local
 * @param {string} key - Tên khóa để lưu giá trị
 * @param {*} value - Giá trị cần lưu
 */
export const saveToStorage = async (key, value) => {
  if (value === undefined || value === null) {
    await chrome.storage.local.remove(key);
  } else {
    await chrome.storage.local.set({ [key]: value });
  }
};

/**
 * Hiển thị thông báo
 * @param {string} message - Thông điệp cần hiển thị
 * @param {string} type - Loại thông báo (success, error, info, warning)
 */
export const showNotification = (title = "This is title", message = "This is message") => {
  chrome.notifications.create({
    type: "basic",
    iconUrl: "logo.svg",
    title: title,
    message: message,
    // buttons: [{ title: "Keep it Flowing." }],
    priority: 0,
  });
};

/**
 * Lưu cài đặt vào chrome.storage.local
 * @param {Object} settings - Đối tượng chứa các cài đặt
 */
export const saveSettings = (settings) => {
  const settingsToSave = { ...settings };
  if (Array.isArray(settingsToSave.notificationTimes)) {
    settingsToSave.notificationTimes = settingsToSave.notificationTimes
      .filter((time) => time !== null && time !== undefined)
      .map((time) => {
        if (time instanceof Date) {
          return {
            hours: time.getHours(),
            minutes: time.getMinutes(),
          };
        }
        return time;
      });
  }
  chrome.storage.local.set({ settings: settingsToSave });
};

/**
 * Lấy cài đặt từ chrome.storage.local
 * @returns {Promise<Object>} - Promise trả về đối tượng chứa các cài đặt đã lưu
 */
export const getSettings = async () => {
  const data = await chrome.storage.local.get("settings");
  const defaults = {
    quickViewRequests: true,
    kpiAlert: true,
    minRequestCount: 5,
    // Mặc định là 10:30 và 16:30
    notificationTimes: [
      { hours: 10, minutes: 30 },
      { hours: 16, minutes: 30 },
    ],
  };

  const savedSettings = data.settings || {};

  // Hợp nhất cài đặt đã lưu với giá trị mặc định
  const settings = {
    ...defaults,
    ...savedSettings,
  };

  // Chuyển đổi mảng các object { hours, minutes } thành mảng các Date object để DatePicker sử dụng
  if (Array.isArray(settings.notificationTimes)) {
    let savedNotificationTimes = settings.notificationTimes.filter(
      (time) => time !== null && time !== undefined,
    );
    if (savedNotificationTimes.length === 0) {
      savedNotificationTimes = defaults.notificationTimes;
    }

    savedNotificationTimes = savedNotificationTimes.map((time) => {
      const date = new Date();
      date.setHours(time.hours, time.minutes, 0, 0);
      return date;
    });

    settings.notificationTimes = savedNotificationTimes;
  } else {
    // Nếu notificationTimes không phải là mảng, chuyển đổi giá trị cũ sang mảng
    const time = settings.notificationTimes;
    const date = new Date();
    date.setHours(time.hours, time.minutes, 0, 0);
    settings.notificationTimes = [date];
  }

  return settings;
};

/**
 * Hàm lấy ký tự đầu tiên của tên để làm avatar
 * @param {string} fullName - Tên đầy đủ của nhân viên
 */
export const getAvatarLetter = (fullName) => {
  if (!fullName || !fullName.trim()) {
    return "N";
  }
  const nameParts = fullName.trim().split(" ");
  const lastName = nameParts[nameParts.length - 1];
  return lastName.charAt(0).toUpperCase();
};

/**
 * Tính toán tổng số requests dựa trên dữ liệu sử dụng hàng ngày và công cụ KPI đã chọn
 * @param dailyUsageData
 * @param kpiTools Công cụ KPI đã chọn
 */
export const calculateKpiRequests = (dailyUsageData, kpiTools) => {
  if (!dailyUsageData) {
    return 0;
  }

  if (!kpiTools || kpiTools.length === 0) {
    return dailyUsageData.positionBasedRequests || 0;
  }

  let totalRequests = 0;
  kpiTools.forEach((tool) => {
    switch (tool) {
      case "cline":
        totalRequests += dailyUsageData.clineRequests || 0;
        break;
      case "cursor":
        totalRequests += dailyUsageData.cursorRequests || 0;
        break;
      case "oneai":
        totalRequests += dailyUsageData.oneAiRequests || 0;
        break;
      case "aiagent":
        totalRequests += dailyUsageData.aiAgentRequests || 0;
        break;
      default:
        break;
    }
  });
  return totalRequests;
};

/**
 * Loại bỏ dấu tiếng Việt khỏi một chuỗi
 * @param {string} str - Chuỗi cần xử lý
 * @returns {string} - Chuỗi đã loại bỏ dấu tiếng Việt
 */
export const removeVietnameseMarks = (str) => {
  str = str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  str = str.replace(/đ/g, "d").replace(/Đ/g, "D");
  return str;
};
