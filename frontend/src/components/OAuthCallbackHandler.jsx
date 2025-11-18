import { useEffect } from "react";
import { supabase } from "../lib/supabaseClient";
import { useNavigate, useLocation } from "react-router-dom";
import { hasCompletedPersonalization } from "../lib/personalizationUtils";

export default function OAuthCallbackHandler() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    async function finalizeOAuth() {
      // If no hash, nothing to do
      if (!window.location.hash) return;

      const hash = window.location.hash.substring(1);
      const params = new URLSearchParams(hash);

      const access_token = params.get("access_token");
      const refresh_token = params.get("refresh_token");

      // Only handle if we received OAuth tokens
      if (!access_token) return;

      console.log("🔐 OAuthCallbackHandler: Received OAuth tokens");

      // Apply Supabase session
      const { data, error } = await supabase.auth.setSession({
        access_token,
        refresh_token,
      });

      if (error) {
        console.error("❌ Failed to set session:", error);
        navigate("/sign-in");
        return;
      }

      const user = data.session?.user;
      if (!user) {
        console.error("❌ No user in session after setting session");
        navigate("/sign-in");
        return;
      }

      console.log("✅ Session applied, user:", user.email);

      // Check personalization
      const completed = await hasCompletedPersonalization(user.id);
      if (!completed) {
        navigate("/personalization", { replace: true });
      } else {
        navigate("/books", { replace: true });
      }

      // Clean hash AFTER redirect
      setTimeout(() => {
        const cleanUrl = window.location.pathname + window.location.search;
        window.history.replaceState(null, "", cleanUrl);
        console.log("🧹 Cleaned URL hash");
      }, 300);
    }

    finalizeOAuth();
  }, [navigate, location]);

  return null;
}
