import { useEffect, useRef, useState } from "react";

interface MusicPlayerProps {
  url: string;
  volume?: number;
}

const MusicPlayer = ({ url, volume = 0.5 }: MusicPlayerProps) => {
  const [isYoutube, setIsYoutube] = useState(false);
  const [youtubeId, setYoutubeId] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    if (!url) return;

    // Check for YouTube
    const ytRegExp =
      /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(ytRegExp);

    if (match && match[2].length === 11) {
      setIsYoutube(true);
      setYoutubeId(match[2]);
    } else {
      setIsYoutube(false);
      setYoutubeId(null);
    }
  }, [url]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
      if (url && !isYoutube) {
        audioRef.current
          .play()
          .catch((e) => console.log("Audio play failed:", e));
      }
    }
  }, [url, volume, isYoutube]);

  if (!url) return null;

  return (
    <div className="hidden">
      {isYoutube && youtubeId ? (
        <iframe
          width="560"
          height="315"
          src={`https://www.youtube.com/embed/${youtubeId}?autoplay=1&loop=1&playlist=${youtubeId}&controls=0&showinfo=0`}
          title="YouTube video player"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        ></iframe>
      ) : (
        <audio ref={audioRef} src={url} loop controls={false} autoPlay />
      )}
    </div>
  );
};

export default MusicPlayer;
