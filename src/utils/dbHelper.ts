import { usePermissionError } from "@/components/ui/PermissionErrorModal";

/**
 * Retries a promise-returning function up to `maxRetries` times.
 * If it fails with a permission error (401/403), it triggers the Permission Error Modal.
 */
export async function withRetry<T>(
  fn: () => Promise<{ data: T | null; error: any }>,
  maxRetries = 3,
  delayMs = 1000,
): Promise<{ data: T | null; error: any }> {
  let attempt = 0;

  while (attempt < maxRetries) {
    try {
      const result = await fn();

      if (!result.error) {
        return result;
      }

      // Check for permission errors
      const errorMsg = result.error.message || "";
      const isPermissionError =
        result.error.code === "42501" || // PG permission denied
        result.error.code === "PGRST301" || // JWT expired
        errorMsg.toLowerCase().includes("permission") ||
        errorMsg.toLowerCase().includes("policy");

      if (isPermissionError) {
        // Trigger modal immediately and stop retrying for permission issues (retrying won't help)
        // We use the store outside of React component, which Zustand allows.
        usePermissionError
          .getState()
          .showError(`Database permission denied: ${errorMsg}`);
        return result;
      }

      // For other errors, retry
      attempt++;
      if (attempt < maxRetries) {
        await new Promise((r) => setTimeout(r, delayMs * attempt)); // Exponential backoff-ish
      } else {
        return result;
      }
    } catch (e) {
      // Unexpected exceptions
      attempt++;
      if (attempt >= maxRetries) throw e;
      await new Promise((r) => setTimeout(r, delayMs * attempt));
    }
  }

  return { data: null, error: { message: "Max retries exceeded" } };
}
