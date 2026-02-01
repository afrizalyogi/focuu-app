import { useEffect, useCallback } from "react";
import { useAnalytics } from "@/hooks/useAnalytics";
import { useLocation } from "react-router-dom";

export const InteractionTracker = () => {
  const { track } = useAnalytics();
  const location = useLocation();

  const handleClick = useCallback(
    (e: MouseEvent) => {
      const x = e.clientX;
      const y = e.clientY;
      let elementId = (e.target as HTMLElement).id || "";
      let interactionType = "general";
      let componentText = "";
      let componentTag = "";
      let distanceFromCenter = 0;
      const targetElement = e.target as HTMLElement;

      // Smart Tracking Logic
      const isInteractive = targetElement.matches(
        "button, a, input, select, textarea, [role='button']",
      );

      if (isInteractive) {
        interactionType = "hit";
        // Get text content (truncate if too long)
        componentText = (
          targetElement.innerText ||
          targetElement.getAttribute("aria-label") ||
          ""
        ).substring(0, 50);
        componentTag = targetElement.tagName;
        elementId = targetElement.id || elementId;
      } else {
        // Check for MISS (near interactive)
        const interactiveElements = document.querySelectorAll(
          "button, a, input, select, textarea, [role='button']",
        );
        let minDistance = 50; // Radius in pixels
        let closestElement: Element | null = null;

        interactiveElements.forEach((el) => {
          const rect = el.getBoundingClientRect();
          const centerX = rect.left + rect.width / 2;
          const centerY = rect.top + rect.height / 2;
          const dist = Math.sqrt(
            Math.pow(x - centerX, 2) + Math.pow(y - centerY, 2),
          );

          if (dist < minDistance) {
            minDistance = dist;
            closestElement = el;
          }
        });

        if (closestElement) {
          interactionType = "miss";
          const el = closestElement as HTMLElement;
          componentText = (
            el.innerText ||
            el.getAttribute("aria-label") ||
            ""
          ).substring(0, 50);
          componentTag = el.tagName;
          elementId = el.id || elementId;
          distanceFromCenter = Math.round(minDistance);
        }
      }

      // Convert to responsive percentages
      const xPercent = (x / window.innerWidth) * 100;
      const yPercent = (y / window.innerHeight) * 100;

      track({
        eventType: "heatmap_click",
        page: location.pathname,
        eventData: {
          x: parseFloat(xPercent.toFixed(2)),
          y: parseFloat(yPercent.toFixed(2)),
          element_id: elementId,
          interaction_type: interactionType,
          component_text: componentText,
          component_tag: componentTag,
          distance: distanceFromCenter,
          window_width: window.innerWidth,
          window_height: window.innerHeight,
        },
      });
    },
    [track, location.pathname],
  );

  useEffect(() => {
    // Use capture phase (true) to detect clicks BEFORE they trigger navigation/state changes.
    // This fixes the issue where a "Back" button click invalidates the current path before tracking.
    window.addEventListener("click", handleClick, true);

    return () => {
      window.removeEventListener("click", handleClick, true);
    };
  }, [handleClick]);

  return null;
};
