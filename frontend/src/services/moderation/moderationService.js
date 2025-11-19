export const moderationService = async (comment) => {
  try {
    const moderationUrl = import.meta.env.VITE_MODERATION_API_URL || "http://localhost:8000";
    const response = await fetch(`${moderationUrl}/api/moderate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: comment }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.detail || "Failed to moderate comment");
    }

    // <-- This returns EXACT fields from backend:
    // is_appropriate, message, reasons
    return await response.json();

  } catch (error) {
    console.error("Moderation service error:", error.message);

    // Keep spelling consistent with backend return structure
    return {
      is_appropriate: true,   // must be snake_case
      message: "Moderation unavailable",
      reasons: [],
    };
  }
};
