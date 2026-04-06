const WEBRING_SITE = "tophchen.com";
const WEBRING_BASE = `https://cs.uwatering.com/#${WEBRING_SITE}`;

function Arrow({ flip }: { flip?: boolean }) {
  return (
    <svg
      className="webring-arrow-svg"
      viewBox="0 0 20 10"
      width={16}
      height={8}
      aria-hidden="true"
      style={flip ? { transform: "scaleX(-1)" } : undefined}
    >
      <line
        x1="18"
        y1="5"
        x2="5"
        y2="5"
        stroke="currentColor"
        strokeWidth={1.1}
        strokeLinecap="round"
      />
      <polyline
        points="7,2 2,5 7,8"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.1}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function WebringWidget() {
  return (
    <div className="webring-widget" aria-label="CS Webring navigation">
      <a
        className="webring-nav webring-nav-prev"
        href={`${WEBRING_BASE}?nav=prev`}
        aria-label="Previous site in CS Webring"
        title="Previous site"
      >
        <Arrow />
      </a>
      <a
        className="webring-core"
        href={WEBRING_BASE}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Open CS Webring"
        title="CS Webring"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          className="webring-icon"
          src="https://cs.uwatering.com/icon.white.svg"
          alt="CS Webring"
          width={22}
          height={22}
        />
      </a>
      <a
        className="webring-nav webring-nav-next"
        href={`${WEBRING_BASE}?nav=next`}
        aria-label="Next site in CS Webring"
        title="Next site"
      >
        <Arrow flip />
      </a>
    </div>
  );
}
