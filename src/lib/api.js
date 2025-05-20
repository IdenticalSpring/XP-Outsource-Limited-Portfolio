const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

// Hàm kiểm tra token có hợp lệ không (dựa trên thời gian hết hạn)
const isTokenExpired = (token) => {
  if (!token) return true;
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const currentTime = Math.floor(Date.now() / 1000);
    return payload.exp < currentTime;
  } catch (error) {
    console.error("Error parsing token:", error);
    return true;
  }
};

// Hàm làm mới token (giả sử có endpoint refresh token)
const refreshToken = async () => {
  try {
    const refreshToken = sessionStorage.getItem("refreshToken");
    if (!refreshToken) throw new Error("No refresh token available");

    const response = await fetch(`${API_URL}/admin/refresh-token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ refreshToken }),
    });

    if (!response.ok) {
      throw new Error(`Failed to refresh token: ${response.statusText}`);
    }

    const data = await response.json();
    sessionStorage.setItem("adminToken", data.accessToken);
    return data.accessToken;
  } catch (error) {
    console.error("Failed to refresh token:", error);
    sessionStorage.removeItem("adminToken");
    sessionStorage.removeItem("refreshToken");
    throw new Error("Unauthorized: Please log in again");
  }
};

const fetchWithLocale = async (url, locale, options = {}) => {
  try {
    let token = typeof window !== "undefined"
      ? sessionStorage.getItem("adminToken")
      : null;

    // Kiểm tra token hợp lệ
    if (token && isTokenExpired(token)) {
      token = await refreshToken();
    }

    const response = await fetch(url, {
      ...options,
      headers: {
        "Accept-Language": locale,
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options.headers,
      },
      cache: options.cache || "no-store",
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      if (response.status === 401) {
        throw new Error(JSON.stringify({
          message: "Unauthorized access",
          error: "Unauthorized",
          statusCode: 401,
        }));
      }
      throw new Error(JSON.stringify({
        message: errorData.message || `HTTP error: ${response.statusText}`,
        statusCode: response.status,
      }));
    }

    if (
      response.status === 204 ||
      response.headers.get("content-length") === "0"
    ) {
      return {};
    }

    const data = await response.json();
    console.log(`API response from ${url}:`, data);
    return data;
  } catch (error) {
    console.error(`API error: ${url}`, error);
    throw error;
  }
};

export const fetchBanners = async (locale) => {
  try {
    const data = await fetchWithLocale(`${API_URL}/banner`, locale);
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.warn("Failed to fetch banners, returning empty array:", error);
    return [];
  }
};

export const fetchBlog = async (locale, slug) => {
  try {
    const data = await fetchWithLocale(
      `${API_URL}/${locale}/blog/${slug}`,
      locale
    );
    return data;
  } catch (error) {
    console.warn(`Failed to fetch blog: ${slug}, returning null:`, error);
    return null;
  }
};

export const fetchBlogs = async (locale, page = 1, limit = 3) => {
  try {
    const response = await fetchWithLocale(
      `${API_URL}/blog?page=${page}&limit=${limit}`,
      locale
    );
    return {
      data: Array.isArray(response.blogs) ? response.blogs : [],
      total: response.total || 0,
    };
  } catch (error) {
    console.warn(`Failed to fetch blogs, returning empty array:`, error);
    return { data: [], total: 0 };
  }
};

export const fetchMembers = async (locale, page = 1, limit = 6) => {
  const maxRetries = 3;
  let attempt = 0;

  while (attempt < maxRetries) {
    try {
      const response = await fetchWithLocale(
        `${API_URL}/member?page=${page}&limit=${limit}`,
        locale
      );
      return {
        data: Array.isArray(response.data) ? response.data : [],
        total: response.total || 0,
      };
    } catch (error) {
      attempt++;
      console.warn(`Attempt ${attempt} failed to fetch members:`, error);
      if (attempt === maxRetries) {
        console.error("Max retries reached for fetching members");
        return { data: [], total: 0 };
      }
      await new Promise((resolve) => setTimeout(resolve, 1000 * attempt));
    }
  }
};

export const fetchMemberBySlug = async (locale, slug) => {
  try {
    const data = await fetchWithLocale(
      `${API_URL}/member/${locale}/${slug}`,
      locale
    );
    return data || null;
  } catch (error) {
    console.warn(`Failed to fetch member: ${slug}, returning null:`, error);
    throw error;
  }
};

export const sendContactEmail = async (locale, emailData) => {
  try {
    const data = await fetchWithLocale(
      `${API_URL}/email/send-contact`,
      locale,
      {
        method: "POST",
        body: JSON.stringify(emailData),
      }
    );
    return data;
  } catch (error) {
    console.error("Failed to send contact email:", error);
    throw new Error("Failed to send contact email");
  }
};

export const loginAdmin = async (locale, credentials) => {
  try {
    const data = await fetchWithLocale(`${API_URL}/admin/login`, locale, {
      method: "POST",
      body: JSON.stringify(credentials),
    });
    if (data.accessToken) {
      sessionStorage.setItem("adminToken", data.accessToken);
      if (data.refreshToken) {
        sessionStorage.setItem("refreshToken", data.refreshToken);
      }
    }
    return data;
  } catch (error) {
    console.error("Login failed:", error);
    throw new Error("Login failed");
  }
};

export const logoutAdmin = () => {
  sessionStorage.removeItem("adminToken");
  sessionStorage.removeItem("refreshToken");
};

export const createBanner = async (locale, bannerData) => {
  try {
    const res = await fetchWithLocale(`${API_URL}/banner`, locale, {
      method: "POST",
      body: JSON.stringify(bannerData),
    });
    return res.banner || res;
  } catch (error) {
    console.error("Failed to create banner:", error);
    throw error;
  }
};

export const updateBanner = async (locale, id, bannerData) => {
  try {
    const data = await fetchWithLocale(`${API_URL}/banner/${id}`, locale, {
      method: "PUT",
      body: JSON.stringify(bannerData),
    });
    return data;
  } catch (error) {
    console.error("Failed to update banner:", error);
    throw error;
  }
};

export const deleteBanner = async (locale, id) => {
  try {
    await fetchWithLocale(`${API_URL}/banner/${id}`, locale, {
      method: "DELETE",
    });
  } catch (error) {
    console.error("Failed to delete banner:", error);
    throw error;
  }
};

export const createBlog = async (locale, blogData) => {
  try {
    const data = await fetchWithLocale(`${API_URL}/blog`, locale, {
      method: "POST",
      body: JSON.stringify(blogData),
    });
    return data.blog || data;
  } catch (error) {
    console.error("Error creating blog:", error);
    throw new Error("Failed to create blog");
  }
};

export const updateBlog = async (locale, id, blogData) => {
  try {
    const data = await fetchWithLocale(`${API_URL}/blog/${id}`, locale, {
      method: "PUT",
      body: JSON.stringify(blogData),
    });
    return data;
  } catch (error) {
    console.error("Failed to update blog:", error);
    throw new Error("Failed to update blog");
  }
};

export const deleteBlog = async (locale, id) => {
  try {
    await fetchWithLocale(`${API_URL}/blog/${id}`, locale, {
      method: "DELETE",
    });
  } catch (error) {
    console.error("Failed to delete blog:", error);
    throw new Error("Failed to delete blog");
  }
};

export const fetchContact = async (locale, slug) => {
  try {
    const data = await fetchWithLocale(
      `${API_URL}/contact/${locale}/${slug}`,
      locale
    );
    return data || null;
  } catch (error) {
    console.warn(
      `Failed to fetch contact for slug ${slug} and locale ${locale}: ${error.message}`
    );
    return null;
  }
};

export const fetchBannerTranslations = async (locale, bannerId) => {
  try {
    const data = await fetchWithLocale(`${API_URL}/banner/${bannerId}`, locale);
    console.log("Fetched banner translations for banner", bannerId, ":", data);
    return Array.isArray(data.translations) ? data.translations : [];
  } catch (error) {
    console.error("Failed to fetch banner translations:", error);
    return [];
  }
};

export const createBannerTranslation = async (
  locale,
  bannerId,
  translationData
) => {
  try {
    console.log("Sending create translation payload:", translationData);
    const data = await fetchWithLocale(`${API_URL}/banner/${bannerId}/translation`, locale, {
      method: "POST",
      body: JSON.stringify(translationData),
    });
    console.log("Create translation response:", data);
    return data;
  } catch (error) {
    console.error("Failed to create banner translation:", error);
    throw error;
  }
};

export const updateBannerTranslation = async (
  locale,
  bannerId,
  translationData
) => {
  try {
    console.log("Sending update translation payload:", translationData);
    const data = await fetchWithLocale(`${API_URL}/banner/${bannerId}/translation`, locale, {
      method: "POST",
      body: JSON.stringify(translationData),
    });
    console.log("Update translation response:", data);
    return data;
  } catch (error) {
    console.error("Failed to update banner translation:", error);
    throw error;
  }
};

export const deleteBannerTranslation = async (locale, bannerId, language) => {
  try {
    console.log(`Deleting translation for banner ${bannerId}, language ${language}`);
    await fetchWithLocale(
      `${API_URL}/banner/translation/${bannerId}/${language}`,
      locale,
      {
        method: "DELETE",
      }
    );
    console.log("Translation deleted successfully");
  } catch (error) {
    console.error("Failed to delete banner translation:", error);
    throw error;
  }
};

export const fetchThemeConfig = async () => {
  try {
    const themeConfig = JSON.parse(localStorage.getItem("themeConfig")) || {};
    return themeConfig;
  } catch (error) {
    console.warn("Failed to fetch theme config from localStorage:", error);
    return {};
  }
};

export const saveThemeConfig = async (themeData) => {
  try {
    localStorage.setItem("themeConfig", JSON.stringify(themeData));
    return themeData;
  } catch (error) {
    console.error("Failed to save theme config to localStorage:", error);
    throw new Error("Không thể lưu cấu hình giao diện");
  }
};

export const fetchStatistics = async (locale, page = 1, limit = 10) => {
  try {
    const data = await fetchWithLocale(`${API_URL}/statistics?page=${page}&limit=${limit}`, locale);
    return data || { data: [], total: 0, page: 1, limit: 10 };
  } catch (error) {
    console.warn("Failed to fetch statistics, returning empty array:", error);
    throw error;
  }
};

export const fetchStatisticsByRange = async (locale, start, end) => {
  try {
    const data = await fetchWithLocale(`${API_URL}/statistics/range?start=${start}&end=${end}`, locale);
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.warn("Failed to fetch statistics by range, returning empty array:", error);
    return [];
  }
};

export const fetchStatisticsById = async (locale, id) => {
  try {
    const data = await fetchWithLocale(`${API_URL}/statistics/${id}`, locale);
    return data || null;
  } catch (error) {
    console.warn(`Failed to fetch statistics with id ${id}, returning null:`, error);
    throw error;
  }
};

export const createStatistics = async (locale, statisticsData) => {
  try {
    const data = await fetchWithLocale(`${API_URL}/statistics`, locale, {
      method: "POST",
      body: JSON.stringify(statisticsData),
    });
    return data;
  } catch (error) {
    console.error("Failed to create statistics:", error);
    throw new Error("Failed to create statistics");
  }
};

export const incrementStatistics = async (locale) => {
  try {
    const data = await fetchWithLocale(`${API_URL}/statistics/increment`, locale, {
      method: "POST",
    });
    return data;
  } catch (error) {
    console.error("Failed to increment statistics:", error);
    throw new Error("Failed to increment statistics");
  }
};

export const updateStatistics = async (locale, id, statisticsData) => {
  try {
    const data = await fetchWithLocale(`${API_URL}/statistics/${id}`, locale, {
      method: "PUT",
      body: JSON.stringify(statisticsData),
    });
    return data;
  } catch (error) {
    console.error("Failed to update statistics:", error);
    throw new Error("Failed to update statistics");
  }
};

export const deleteStatistics = async (locale, id) => {
  try {
    await fetchWithLocale(`${API_URL}/statistics/${id}`, locale, {
      method: "DELETE",
    });
  } catch (error) {
    console.error("Failed to delete statistics:", error);
    throw new Error("Failed to delete statistics");
  }
};