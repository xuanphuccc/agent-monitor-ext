/**
 * Lấy giá trị từ chrome.storage.local
 * @param {string} key - Tên khóa để lấy giá trị
 * @returns {Promise<*>} - Promise trả về giá trị đã lưu, hoặc null nếu không có
 */
export const getFromStorage = async (key) => {
  const result = await chrome.storage.local.get(key);
  return result[key] || null;
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
  if (settingsToSave.notificationTime instanceof Date) {
    // Chuyển đổi Date object thành object { hours, minutes }
    const time = settingsToSave.notificationTime;
    settingsToSave.notificationTime = {
      hours: time.getHours(),
      minutes: time.getMinutes(),
    };
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
    notificationTime: { hours: 16, minutes: 30 }, // Mặc định là 16:30
  };

  const savedSettings = data.settings || {};

  // Hợp nhất cài đặt đã lưu với giá trị mặc định
  const settings = {
    quickViewRequests: savedSettings.quickViewRequests ?? defaults.quickViewRequests,
    kpiAlert: savedSettings.kpiAlert ?? defaults.kpiAlert,
    minRequestCount: savedSettings.minRequestCount ?? defaults.minRequestCount,
    notificationTime: savedSettings.notificationTime ?? defaults.notificationTime,
  };

  // Chuyển đổi object { hours, minutes } thành Date object để DatePicker sử dụng
  const time = settings.notificationTime;
  const date = new Date();
  date.setHours(time.hours, time.minutes, 0, 0);
  settings.notificationTime = date;

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
