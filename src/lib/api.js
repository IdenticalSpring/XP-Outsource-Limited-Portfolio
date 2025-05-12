// src/lib/api.js
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

const fetchWithLocale = async (url, locale, options = {}) => {
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        "Accept-Language": locale,
        ...options.headers,
      },
      cache: options.cache || "no-store",
    });
    if (!response.ok) {
      throw new Error(`HTTP error: ${response.status} ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error(`API error: ${url}`, error);
    throw error; // Để hàm gọi xử lý lỗi theo cách riêng
  }
};

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

export const fetchBlogs = async (locale, page = 1, limit = 6) => {
  try {
    const data = await fetchWithLocale(
      `${API_URL}/blog?page=${page}&limit=${limit}`,
      locale
    );
    return data.blogs || [];
  } catch (error) {
    console.warn(`Failed to fetch blogs, returning empty array`);
    return [];
  }
};
