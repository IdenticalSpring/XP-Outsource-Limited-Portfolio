// src/lib/api.js
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

const fetchWithLocale = async (url, locale, options = {}) => {
  try {
    const token =
      typeof window !== "undefined"
        ? sessionStorage.getItem("adminToken")
        : null;
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
      throw new Error(`HTTP error: ${response.status} ${response.statusText}`);
    }

    // Handle 204 No Content or empty response
    if (
      response.status === 204 ||
      response.headers.get("content-length") === "0"
    ) {
      return {}; // Return empty object for no-content responses
    }

    // Attempt to parse JSON for other responses
    return await response.json();
  } catch (error) {
    console.error(`API error: ${url}`, error);
    throw error;
  }
};
// const fetchWithLocale = async (url, locale, options = {}) => {
//   try {
//     const response = await fetch(url, {
//       ...options,
//       headers: {
//         "Accept-Language": locale,
//         ...options.headers,
//       },
//       cache: options.cache || "no-store",
//     });
//     if (!response.ok) {
//       throw new Error(`HTTP error: ${response.status} ${response.statusText}`);
//     }
//     return await response.json();
//   } catch (error) {
//     console.error(`API error: ${url}`, error);
//     throw error; // Để hàm gọi xử lý lỗi theo cách riêng
//   }
// };

export const fetchBanners = async (locale) => {
  try {
    const data = await fetchWithLocale(`${API_URL}/banner`, locale);
    return data || [];
  } catch (error) {
    console.warn("Failed to fetch banners, returning empty array");
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
    console.warn(`Failed to fetch blog: ${slug}, returning null`);
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
      data: response.blogs || [],
      total: response.total || 0,
    };
  } catch (error) {
    console.warn(`Failed to fetch blogs, returning empty array`);
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
        data: response.data || [], 
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
    console.warn(`Failed to fetch member: ${slug}, returning null`);
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
// Hàm login admin
export const loginAdmin = async (locale, credentials) => {
  try {
    const data = await fetchWithLocale(`${API_URL}/admin/login`, locale, {
      method: "POST",
      body: JSON.stringify(credentials),
    });
    return data; // Trả về { accessToken }
  } catch (error) {
    throw new Error("Login failed");
  }
};

// Tạo banner
export const createBanner = async (locale, bannerData) => {
  try {
    const res = await fetchWithLocale(`${API_URL}/banner`, locale, {
      method: "POST",
      body: JSON.stringify(bannerData),
    });
    return res.banner;
  } catch (error) {
    console.error("Failed to create banner:", error);
    throw new Error("Failed to create banner");
  }
};

// Cập nhật banner
export const updateBanner = async (locale, id, bannerData) => {
  try {
    const data = await fetchWithLocale(`${API_URL}/banner/${id}`, locale, {
      method: "PUT",
      body: JSON.stringify(bannerData),
    });
    return data; // Trả về banner đã cập nhật
  } catch (error) {
    throw new Error("Failed to update banner");
  }
};

// Xóa banner
export const deleteBanner = async (locale, id) => {
  try {
    await fetchWithLocale(`${API_URL}/banner/${id}`, locale, {
      method: "DELETE",
    });
  } catch (error) {
    throw new Error("Failed to delete banner");
  }
};

// BLOG
export const createBlog = async (locale, blogData) => {
  try {
    const data = await fetchWithLocale(`${API_URL}/blog`, locale, {
      method: "POST",
      body: JSON.stringify(blogData),
    });
    return data.blog || data; // Return data.blog or entire data if structure differs
  } catch (error) {
    console.error("Error creating blog:", error);
    throw new Error("Failed to create blog");
  }
};
// Cập nhật BLOG
export const updateBlog = async (locale, id, blogData) => {
  try {
    const data = await fetchWithLocale(`${API_URL}/blog/${id}`, locale, {
      method: "PUT",
      body: JSON.stringify(blogData),
    });
    return data; // Trả về banner đã cập nhật
  } catch (error) {
    throw new Error("Failed to update banner");
  }
};

// Xóa BLOG
export const deleteBlog = async (locale, id) => {
  try {
    await fetchWithLocale(`${API_URL}/blog/${id}`, locale, {
      method: "DELETE",
    });
  } catch (error) {
    throw new Error("Failed to delete banner");
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
  return await fetchWithLocale(`${API_URL}/banner/${bannerId}`, locale);
};

export const createBannerTranslation = async (
  locale,
  bannerId,
  translationData
) => {
  return await fetchWithLocale(`${API_URL}/banner/${bannerId}`, locale, {
    method: "PUT", // ⚠️ Chúng ta tạm dùng updateBanner
    body: JSON.stringify({
      translations: [translationData],
    }),
  });
};

export const updateBannerTranslation = async (
  locale,
  bannerId,
  language,
  translationData
) => {
  return await fetchWithLocale(`${API_URL}/banner/${bannerId}`, locale, {
    method: "PUT",
    body: JSON.stringify({
      translations: [translationData],
    }),
  });
};

export const deleteBannerTranslation = async (locale, bannerId, language) => {
  return await fetchWithLocale(
    `${API_URL}/banner/translation/${bannerId}/${language}`,
    locale,
    {
      method: "DELETE",
    }
  );
};
