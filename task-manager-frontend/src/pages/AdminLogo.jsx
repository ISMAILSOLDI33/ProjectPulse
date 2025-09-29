import "./AdminLogo.css"
export default function AdminLogo() {
  return (
    <svg
      className="admin-logo"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 700 140"
      role="img"
      aria-labelledby="adminLogoTitle adminLogoDesc"
    >
      <title id="adminLogoTitle">Admin Dashboard</title>
      <desc id="adminLogoDesc">Shield and gear icon with Admin Dashboard text</desc>

      <defs>
        <linearGradient id="wordGrad" x1="0" x2="1">
          <stop offset="0" stopColor="#2c3e50" />
          <stop offset="1" stopColor="#7f8c8d" />
        </linearGradient>
      </defs>

      {/* Shield badge */}
      <g transform="translate(20,22)">
        <path
          d="M44 0 L88 18 V48 C88 86 64 110 44 120 C24 110 0 86 0 48 V18 Z"
          fill="#2c3e50"
        />
        <g transform="translate(44,54)">
          <circle r="12" fill="#fff" />
          <rect x="-2.5" y="-23" width="5" height="10" rx="1" fill="#fff" />
          <rect x="-2.5" y="13" width="5" height="10" rx="1" fill="#fff" transform="rotate(180)" />
          <rect x="-23" y="-2.5" width="10" height="5" rx="1" fill="#fff" transform="rotate(-90)" />
          <rect x="13" y="-2.5" width="10" height="5" rx="1" fill="#fff" transform="rotate(90)" />
        </g>
      </g>

      {/* Wordmark */}
      <g transform="translate(150,46)">
        <text
          x="0"
          y="26"
          fontFamily="Montserrat, Arial, sans-serif"
          fontWeight="800"
          fontSize="34"
          fill="url(#wordGrad)"
          style={{ letterSpacing: "2px" }}
        >
          Admin
        </text>
        <text
          x="0"
          y="62"
          fontFamily="Montserrat, Arial, sans-serif"
          fontWeight="600"
          fontSize="22"
          fill="#2c3e50"
          style={{ letterSpacing: "1.5px" }}
        >
          Dashboard
        </text>
      </g>
    </svg>
  );
}
