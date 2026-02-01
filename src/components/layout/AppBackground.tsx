import { useUserPreferences } from "@/hooks/useUserPreferences";
import { useAuth } from "@/contexts/AuthContext";
import CustomBackground from "@/components/work/CustomBackground";
import GlassOrbs from "@/components/landing/GlassOrbs";

const AppBackground = () => {
  const { preferences } = useUserPreferences();
  const { profile } = useAuth();
  const isPro = profile?.is_pro ?? false;

  const hasCustomBackground =
    isPro && preferences.backgroundUrl && preferences.backgroundType !== "none";

  return (
    <>
      {/* Custom background - fixed behind everything */}
      {hasCustomBackground && (
        <CustomBackground
          imageUrl={
            preferences.backgroundType === "image"
              ? preferences.backgroundUrl
              : undefined
          }
          videoUrl={
            preferences.backgroundType === "video"
              ? preferences.backgroundUrl
              : undefined
          }
        />
      )}

      {/* Default Ambient Background (Glass Orbs) - Show if no custom background opaque enough? 
          Actually GlassOrbs adds nice ambient effect even with custom background sometimes, 
          but usually we want custom to take over. 
          Let's show GlassOrbs always for now AS UNDERLAY, or hide if custom is present. 
          The Work page shows both: Custom then GlassOrbs. 
          Wait, Work.tsx shows:
          {CustomBackground}
          <GlassOrbs />
          
          If CustomBackground covers everything (it uses min-h-screen object-cover), GlassOrbs might be hidden behind it 
          if GlassOrbs is lower z-index or earlier in DOM?
          In Work.tsx, CustomBackground is first (lower z-index usually if absolute? No, react renders in order).
          CustomBackground uses z-0 or fixed. 
          GlassOrbs uses fixed and -z-10? 
          
          Let's view GlassOrbs to be sure.
          For now, I'll replicate Work.tsx structure. 
      */}
      <GlassOrbs />
    </>
  );
};

export default AppBackground;
