

interface VideoPlayerProps { videoId: string }

export default function VideoPlayer({ videoId }: VideoPlayerProps) {
  const src = `https://www.youtube.com/embed/${videoId}`;
  return (
    <div className="w-full bg-black rounded-lg overflow-hidden">
      <iframe className="w-full h-[420px] md:h-[540px]" src={src} title="Video player" frameBorder="0" allowFullScreen />
    </div>
  );
}
