// Parallel projection keeps both races and the ball track on the same axis.
const balls = Array.from({ length: 12 }, (_, index) => {
  const angle = index * Math.PI / 6
  return { x: 104 * Math.cos(angle), y: 104 * Math.sin(angle) }
})

export default function BearingDrawing() {
  return (
    <svg className="bearing-drawing" viewBox="0 0 420 285" aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id="race-edge" x1="0" x2=".9" y1="0" y2="1" gradientUnits="objectBoundingBox">
          <stop stopColor="#4a645a" />
          <stop offset=".45" stopColor="#263c35" />
          <stop offset="1" stopColor="#30483d" />
        </linearGradient>
        <radialGradient id="bearing-ball" cx="35%" cy="28%" r="80%">
          <stop stopColor="#c7e0c0" />
          <stop offset=".3" stopColor="#7c9a86" />
          <stop offset=".75" stopColor="#334c40" />
          <stop offset="1" stopColor="#20372d" />
        </radialGradient>
      </defs>
      <g transform="translate(212 142) rotate(-23)">
        <g className="bearing-guides" fill="none">
          <path d="M-190 0H190 M0-130V135" strokeDasharray="15 4 2 4" />
          <path d="M-150-81v-39m300 39v-39m-150 9H-150m150 0h150m-154-4 8 8m292-8 8 8" />
          <path d="M-157 74h-25m25 30h-25m9-32v35m-4-29 8-8m-8 38 8-8" />
        </g>
        <g stroke="#a5bda6" strokeWidth="1.2" strokeLinejoin="round">
          <path fill="url(#race-edge)" d="M-150 0a150 86 0 0 0 300 0v25a150 86 0 0 1-300 0Z" />
          <path fill="none" stroke="#6d8979" d="M-150 19a150 86 0 0 0 300 0m-300 4a150 86 0 0 0 300 0" />
          <g transform="scale(1 .574)">
            <path fill="#51695c" fillRule="evenodd" d="M150 0a150 150 0 1 0-300 0a150 150 0 1 0 300 0M125 0a125 125 0 1 1-250 0a125 125 0 1 1 250 0" />
            <circle r="145" fill="none" stroke="#829a86" />
            <circle r="129" fill="none" stroke="#acc4ac" />
            <path fill="#20362c" fillRule="evenodd" d="M125 0a125 125 0 1 0-250 0a125 125 0 1 0 250 0M84 0a84 84 0 1 1-168 0a84 84 0 1 1 168 0" />
            <circle r="118" fill="none" stroke="#5b7766" />
            <circle r="91" fill="none" stroke="#5b7766" />
            {balls.map(({ x, y }, index) => (
              <ellipse key={index} cx={x} cy={y} rx="15.5" ry="20" fill="url(#bearing-ball)" />
            ))}
            <path fill="#607766" fillRule="evenodd" d="M84 0a84 84 0 1 0-168 0a84 84 0 1 0 168 0M56 0a56 56 0 1 1-112 0a56 56 0 1 1 112 0" />
            <circle r="79" fill="none" stroke="#b6cbb3" />
            <circle r="59" fill="none" stroke="#a6bda6" />
          </g>
          <path fill="#32493d" d="M-56 0a56 32 0 0 1 112 0a56 32 0 0 1-3.5 11a56 32 0 0 0-105 0A56 32 0 0 1-56 0Z" />
        </g>
        <g className="bearing-guides" fill="none">
          <path d="M-39 0h78M0-22v44" strokeDasharray="10 3 2 3" />
        </g>
      </g>
    </svg>
  )
}
