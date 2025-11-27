export const moderationService = async (comment) => {
  try {
    const rawUrl = 
      import.meta.env.VITE_MODERATION_API_URL ||
      "https://nextchapter-backend.vercel.app" ||
      "http://localhost:8000";

    // Remove trailing slash
    const moderationUrl = rawUrl.replace(/\/+$/, "");

    const response = await fetch(`${moderationUrl}/api/moderate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: comment }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.detail || "Failed to moderate comment");
    }

    return await response.json();

  } catch (error) {
    console.error("Moderation service error:", error.message);

    return {
      is_appropriate: true,
      message: "Moderation unavailable",
      reasons: [],
    };
  }
};
