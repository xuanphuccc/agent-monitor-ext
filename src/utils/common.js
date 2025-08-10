/**
 * Lấy giá trị từ localStorage
 * @param {string} key - Tên khóa để lấy giá trị
 * @returns {*} - Giá trị đã lưu trong localStorage, hoặc null nếu không có
 */
export const getLocalStorage = (key) => {
  const value = localStorage.getItem(key);
  return value ? JSON.parse(value) : null;
};

/**
 * Lưu giá trị vào localStorage
 * @param {string} key - Tên khóa để lưu giá trị
 * @param {*} value - Giá trị cần lưu
 */
export const setLocalStorage = (key, value) => {
  if (value === undefined || value === null) {
    localStorage.removeItem(key);
  } else {
    localStorage.setItem(key, JSON.stringify(value));
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
 * Lưu cài đặt vào localStorage
 * @param {Object} settings - Đối tượng chứa các cài đặt
 */
export const saveSettings = (settings) => {
  setLocalStorage("settings", settings);
};

/**
 * Lấy cài đặt từ localStorage
 * @returns {Object} - Đối tượng chứa các cài đặt đã lưu
 */
export const getSettings = () => {
  return (
    getLocalStorage("settings") || {
      notificationEnabled: true,
      quickViewRequests: true,
      kpiAlert: true,
      minRequestCount: 5,
      notificationTime: new Date(),
    }
  );
};
