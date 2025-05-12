export async function fetchBanners(locale) {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/banner`, {
      headers: {
        "Accept-Language": locale,
      },
    });
    if (!response.ok) throw new Error("Failed to fetch banners");
    const data = await response.json();
    return data;
  } catch (error) {
    throw new Error(error.message);
  }
}