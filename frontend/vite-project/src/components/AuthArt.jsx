import { useEffect, useRef } from "react";

// Colours of the illustration. Swap these for Tidy's browns if you prefer.
const C = {
  purple: "#5b21f5",
  brown: "#3b1b0d",
  yellow: "#ddd015",
  orange: "#f07b3a",
  ink: "#1a1a1a",
  white: "#ffffff",
};

// One eye: a fixed "anchor" circle (the white, or an invisible spot for dot eyes)
// and a pupil that moves around inside it.
function Eye({ cx, cy, r = 4.5, pupil = 1.8, white = true, max }) {
  return (
    <g data-eye data-max={max ?? r - pupil - 0.8}>
      <circle data-anchor cx={cx} cy={cy} r={r} fill={white ? C.white : "none"} />
      <circle data-pupil cx={cx} cy={cy} r={pupil} fill={C.ink} />
    </g>
  );
}

export default function AuthArt() {
  const svgRef = useRef(null);

  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;

    // Respect people who turned animations off in their system settings
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const eyes = [...svg.querySelectorAll("[data-eye]")];

    function look(e) {
      eyes.forEach((eye) => {
        const anchor = eye.querySelector("[data-anchor]");
        const pupil = eye.querySelector("[data-pupil]");

        // Where this eye is on the screen
        const box = anchor.getBoundingClientRect();
        const x = box.left + box.width / 2;
        const y = box.top + box.height / 2;

        // Direction and distance from the eye to the pointer
        const dx = e.clientX - x;
        const dy = e.clientY - y;
        const angle = Math.atan2(dy, dx);
        const distance = Math.hypot(dx, dy);

        // Move toward the pointer, never further than the eye allows
        const max = Number(eye.dataset.max);
        const amount = max * Math.min(1, distance / 200);

        pupil.style.transform = `translate(${Math.cos(angle) * amount}px, ${
          Math.sin(angle) * amount
        }px)`;
      });
    }

    function reset(e) {
      if (e.relatedTarget) return; // still inside the page
      eyes.forEach((eye) => {
        eye.querySelector("[data-pupil]").style.transform = "";
      });
    }

    window.addEventListener("pointermove", look);
    document.addEventListener("mouseout", reset);
    return () => {
      window.removeEventListener("pointermove", look);
      document.removeEventListener("mouseout", reset);
    };
  }, []);

  return (
    <svg ref={svgRef} viewBox="0 0 240 200" aria-hidden="true">
      {/* tall block */}
      <rect x="58" y="15" width="62" height="165" fill={C.purple} />
      <Eye cx={80} cy={38} r={5} pupil={2} />
      <Eye cx={99} cy={36} r={4} pupil={1.6} />
      <line x1="90" y1="44" x2="90" y2="56" stroke={C.ink} strokeWidth="2.5" strokeLinecap="round" />

      {/* dark block */}
      <rect x="112" y="75" width="42" height="105" fill={C.brown} />
      <Eye cx={127} cy={93} />
      <Eye cx={142} cy={93} />

      {/* yellow arch */}
      <path d="M146 180 V127 A22 22 0 0 1 190 127 V180 Z" fill={C.yellow} />
      <Eye cx={160} cy={128} r={2.5} pupil={2.5} white={false} max={2} />
      <line x1="178" y1="130" x2="206" y2="130" stroke={C.ink} strokeWidth="3" strokeLinecap="round" />

      {/* orange half-circle, in front */}
      <path d="M10 180 A60 60 0 0 1 130 180 Z" fill={C.orange} />
      <Eye cx={55} cy={152} r={3.5} pupil={3.5} white={false} max={2.2} />
      <Eye cx={78} cy={152} r={3.5} pupil={3.5} white={false} max={2.2} />
      <path d="M58 163 Q66.5 172 75 163" fill="none" stroke={C.ink} strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
}