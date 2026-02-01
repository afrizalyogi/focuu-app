import { cn } from "@/lib/utils";

interface CustomBackgroundProps {
  imageUrl?: string;
  videoUrl?: string;
  className?: string;
}

const CustomBackground = ({
  imageUrl,
  videoUrl,
  className,
}: CustomBackgroundProps) => {
  if (!imageUrl && !videoUrl) return null;

  const getYoutubeId = (url: string) => {
    const regExp =
      /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url?.match(regExp);
    return match && match[2].length === 11 ? match[2] : null;
  };

  const youtubeId = videoUrl ? getYoutubeId(videoUrl) : null;

  return (
    <div
      className={cn(
        "absolute inset-0 w-full h-full z-0 overflow-hidden",
        className,
      )}
    >
      {/* Overlay for readability - reduced opacity */}
      <div className="absolute inset-0 bg-background/20 backdrop-blur-[1px] z-10" />

      {videoUrl ? (
        youtubeId ? (
          <div className="absolute inset-0 w-full h-full pointer-events-none">
            <iframe
              className="w-full h-full object-cover scale-[1.3]" // Scale up to hide controls/borders
              src={`https://www.youtube.com/embed/${youtubeId}?autoplay=1&mute=1&controls=0&loop=1&playlist=${youtubeId}&showinfo=0&modestbranding=1&iv_load_policy=3&disablekb=1&rel=0`}
              allow="autoplay; encrypted-media"
              referrerPolicy="strict-origin-when-cross-origin"
            />
            {/* Invisible layer to prevent interaction if needed */}
            <div className="absolute inset-0" />
          </div>
        ) : (
          <video
            src={videoUrl}
            autoPlay
            loop
            muted
            playsInline
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 min-w-full min-h-full w-auto h-auto object-cover pointer-events-none"
          />
        )
      ) : imageUrl ? (
        <img
          src={imageUrl}
          alt=""
          className="absolute inset-0 w-full h-full object-cover object-center pointer-events-none"
        />
      ) : null}
    </div>
  );
};

export default CustomBackground;
