const fs = require('fs');

function svgToBase64(svgStr) {
  return "data:image/svg+xml;base64," + Buffer.from(svgStr).toString('base64');
}

// Shim Signature Style - Landscape
const extraLandscape = [
  {
    id: "shim-sig-1",
    name: "Shim Signature Gold",
    url: svgToBase64(`<svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
      <rect width="100%" height="100%" fill="#0a192f"/>
      <rect x="2%" y="3%" width="96%" height="94%" fill="none" stroke="#d4af37" stroke-width="2"/>
      <rect x="3%" y="5%" width="94%" height="90%" fill="none" stroke="#d4af37" stroke-width="1" stroke-dasharray="10 5"/>
      <path d="M0 0 L100 0 L0 100 Z" fill="#112240" opacity="0.5"/>
    </svg>`)
  },
  {
    id: "shim-sig-2",
    name: "Shim Corporate Clean",
    url: svgToBase64(`<svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
      <rect width="100%" height="100%" fill="#ffffff"/>
      <rect x="0" y="0" width="100%" height="15%" fill="#1e3a8a"/>
      <rect x="0" y="85%" width="100%" height="15%" fill="#1e3a8a"/>
      <rect x="5%" y="5%" width="90%" height="90%" fill="none" stroke="#e5e7eb" stroke-width="4"/>
    </svg>`)
  },
  {
    id: "shim-sig-3",
    name: "Shim Tech Grid",
    url: svgToBase64(`<svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
      <rect width="100%" height="100%" fill="#0f172a"/>
      <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
        <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#1e293b" stroke-width="1"/>
      </pattern>
      <rect width="100%" height="100%" fill="url(#grid)"/>
      <rect x="4%" y="6%" width="92%" height="88%" fill="none" stroke="#38bdf8" stroke-width="2"/>
    </svg>`)
  },
  {
    id: "shim-sig-4",
    name: "Shim Classic Navy",
    url: svgToBase64(`<svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
      <defs>
        <radialGradient id="grad" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stop-color="#1e3a8a"/>
          <stop offset="100%" stop-color="#0f172a"/>
        </radialGradient>
      </defs>
      <rect width="100%" height="100%" fill="url(#grad)"/>
      <rect x="3%" y="4%" width="94%" height="92%" fill="none" stroke="#fbbf24" stroke-width="3"/>
    </svg>`)
  },
  {
    id: "shim-sig-5",
    name: "Shim Modern White",
    url: svgToBase64(`<svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
      <rect width="100%" height="100%" fill="#f8fafc"/>
      <path d="M0 100 L100 0 L100 100 Z" fill="#f1f5f9"/>
      <rect x="4%" y="5%" width="92%" height="90%" fill="none" stroke="#cbd5e1" stroke-width="1"/>
      <rect x="5%" y="6.5%" width="90%" height="87%" fill="none" stroke="#94a3b8" stroke-width="0.5"/>
    </svg>`)
  },
  {
    id: "shim-sig-6",
    name: "Shim Elegant Dark",
    url: svgToBase64(`<svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
      <rect width="100%" height="100%" fill="#18181b"/>
      <path d="M0 0 L100 0 L100 20 L0 80 Z" fill="#27272a" opacity="0.3"/>
      <path d="M0 100 L100 100 L100 80 L0 20 Z" fill="#27272a" opacity="0.3"/>
      <rect x="3%" y="5%" width="94%" height="90%" fill="none" stroke="#a1a1aa" stroke-width="1"/>
    </svg>`)
  },
  {
    id: "shim-sig-7",
    name: "Shim Royal Certificate",
    url: svgToBase64(`<svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
      <rect width="100%" height="100%" fill="#ffffff"/>
      <rect x="2%" y="3%" width="96%" height="94%" fill="none" stroke="#b45309" stroke-width="6"/>
      <rect x="2.5%" y="4%" width="95%" height="92%" fill="none" stroke="#fef3c7" stroke-width="2"/>
    </svg>`)
  },
  {
    id: "shim-sig-8",
    name: "Shim Web3 Edition",
    url: svgToBase64(`<svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
      <rect width="100%" height="100%" fill="#000000"/>
      <circle cx="0" cy="0" r="40%" fill="#4338ca" opacity="0.4" filter="blur(40px)"/>
      <circle cx="100%" cy="100%" r="40%" fill="#a21caf" opacity="0.4" filter="blur(40px)"/>
      <rect x="2%" y="3%" width="96%" height="94%" fill="none" stroke="#6366f1" stroke-width="1"/>
    </svg>`)
  },
  {
    id: "shim-sig-9",
    name: "Shim Platinum",
    url: svgToBase64(`<svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
      <defs>
        <linearGradient id="plat" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#e2e8f0"/>
          <stop offset="50%" stop-color="#f8fafc"/>
          <stop offset="100%" stop-color="#cbd5e1"/>
        </linearGradient>
      </defs>
      <rect width="100%" height="100%" fill="url(#plat)"/>
      <rect x="3%" y="4%" width="94%" height="92%" fill="none" stroke="#94a3b8" stroke-width="2"/>
    </svg>`)
  },
  {
    id: "shim-sig-10",
    name: "Shim Minimal Frame",
    url: svgToBase64(`<svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
      <rect width="100%" height="100%" fill="#ffffff"/>
      <rect x="0%" y="0%" width="100%" height="10%" fill="#0f172a"/>
      <rect x="0%" y="90%" width="100%" height="10%" fill="#0f172a"/>
      <rect x="0%" y="0%" width="5%" height="100%" fill="#0f172a"/>
      <rect x="95%" y="0%" width="5%" height="100%" fill="#0f172a"/>
      <rect x="1%" y="1%" width="98%" height="98%" fill="none" stroke="#fbbf24" stroke-width="1"/>
    </svg>`)
  }
];

// Shim Signature Style - Portrait
const extraPortrait = [
  {
    id: "shim-sig-p1",
    name: "Shim Signature Gold",
    url: svgToBase64(`<svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
      <rect width="100%" height="100%" fill="#0a192f"/>
      <rect x="3%" y="2%" width="94%" height="96%" fill="none" stroke="#d4af37" stroke-width="2"/>
      <rect x="5%" y="3%" width="90%" height="94%" fill="none" stroke="#d4af37" stroke-width="1" stroke-dasharray="10 5"/>
      <path d="M0 0 L100 0 L0 100 Z" fill="#112240" opacity="0.5"/>
    </svg>`)
  },
  {
    id: "shim-sig-p2",
    name: "Shim Corporate Clean",
    url: svgToBase64(`<svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
      <rect width="100%" height="100%" fill="#ffffff"/>
      <rect x="0" y="0" width="100%" height="8%" fill="#1e3a8a"/>
      <rect x="0" y="92%" width="100%" height="8%" fill="#1e3a8a"/>
      <rect x="5%" y="5%" width="90%" height="90%" fill="none" stroke="#e5e7eb" stroke-width="4"/>
    </svg>`)
  },
  {
    id: "shim-sig-p3",
    name: "Shim Tech Grid",
    url: svgToBase64(`<svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
      <rect width="100%" height="100%" fill="#0f172a"/>
      <pattern id="gridp" width="40" height="40" patternUnits="userSpaceOnUse">
        <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#1e293b" stroke-width="1"/>
      </pattern>
      <rect width="100%" height="100%" fill="url(#gridp)"/>
      <rect x="6%" y="4%" width="88%" height="92%" fill="none" stroke="#38bdf8" stroke-width="2"/>
    </svg>`)
  },
  {
    id: "shim-sig-p4",
    name: "Shim Classic Navy",
    url: svgToBase64(`<svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
      <defs>
        <radialGradient id="gradp" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stop-color="#1e3a8a"/>
          <stop offset="100%" stop-color="#0f172a"/>
        </radialGradient>
      </defs>
      <rect width="100%" height="100%" fill="url(#gradp)"/>
      <rect x="4%" y="3%" width="92%" height="94%" fill="none" stroke="#fbbf24" stroke-width="3"/>
    </svg>`)
  },
  {
    id: "shim-sig-p5",
    name: "Shim Modern White",
    url: svgToBase64(`<svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
      <rect width="100%" height="100%" fill="#f8fafc"/>
      <path d="M0 100 L100 0 L100 100 Z" fill="#f1f5f9"/>
      <rect x="5%" y="4%" width="90%" height="92%" fill="none" stroke="#cbd5e1" stroke-width="1"/>
      <rect x="6.5%" y="5%" width="87%" height="90%" fill="none" stroke="#94a3b8" stroke-width="0.5"/>
    </svg>`)
  },
  {
    id: "shim-sig-p6",
    name: "Shim Elegant Dark",
    url: svgToBase64(`<svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
      <rect width="100%" height="100%" fill="#18181b"/>
      <path d="M0 0 L100 0 L100 10 L0 90 Z" fill="#27272a" opacity="0.3"/>
      <path d="M0 100 L100 100 L100 90 L0 10 Z" fill="#27272a" opacity="0.3"/>
      <rect x="5%" y="3%" width="90%" height="94%" fill="none" stroke="#a1a1aa" stroke-width="1"/>
    </svg>`)
  },
  {
    id: "shim-sig-p7",
    name: "Shim Royal Certificate",
    url: svgToBase64(`<svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
      <rect width="100%" height="100%" fill="#ffffff"/>
      <rect x="3%" y="2%" width="94%" height="96%" fill="none" stroke="#b45309" stroke-width="6"/>
      <rect x="4%" y="2.5%" width="92%" height="95%" fill="none" stroke="#fef3c7" stroke-width="2"/>
    </svg>`)
  },
  {
    id: "shim-sig-p8",
    name: "Shim Web3 Edition",
    url: svgToBase64(`<svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
      <rect width="100%" height="100%" fill="#000000"/>
      <circle cx="0" cy="0" r="50%" fill="#4338ca" opacity="0.4" filter="blur(40px)"/>
      <circle cx="100%" cy="100%" r="50%" fill="#a21caf" opacity="0.4" filter="blur(40px)"/>
      <rect x="3%" y="2%" width="94%" height="96%" fill="none" stroke="#6366f1" stroke-width="1"/>
    </svg>`)
  },
  {
    id: "shim-sig-p9",
    name: "Shim Platinum",
    url: svgToBase64(`<svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
      <defs>
        <linearGradient id="platp" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#e2e8f0"/>
          <stop offset="50%" stop-color="#f8fafc"/>
          <stop offset="100%" stop-color="#cbd5e1"/>
        </linearGradient>
      </defs>
      <rect width="100%" height="100%" fill="url(#platp)"/>
      <rect x="4%" y="3%" width="92%" height="94%" fill="none" stroke="#94a3b8" stroke-width="2"/>
    </svg>`)
  },
  {
    id: "shim-sig-p10",
    name: "Shim Minimal Frame",
    url: svgToBase64(`<svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
      <rect width="100%" height="100%" fill="#ffffff"/>
      <rect x="0%" y="0%" width="100%" height="5%" fill="#0f172a"/>
      <rect x="0%" y="95%" width="100%" height="5%" fill="#0f172a"/>
      <rect x="0%" y="0%" width="10%" height="100%" fill="#0f172a"/>
      <rect x="90%" y="0%" width="10%" height="100%" fill="#0f172a"/>
      <rect x="1%" y="1%" width="98%" height="98%" fill="none" stroke="#fbbf24" stroke-width="1"/>
    </svg>`)
  }
];

let code = fs.readFileSync('src/components/TemplateEditor.tsx', 'utf8');

// Insert the new objects into the arrays
const lsExtraString = extraLandscape.map(obj => `  { id: "${obj.id}", url: "${obj.url}", name: "${obj.name}" }`).join(',\n');
const ptExtraString = extraPortrait.map(obj => `  { id: "${obj.id}", url: "${obj.url}", name: "${obj.name}" }`).join(',\n');

// Find end of LANDSCAPE_PRESETS array
code = code.replace(/(const LANDSCAPE_PRESETS = \[[\s\S]*?)(];)/, `$1,\n  // SHIM SIGNATURE EXCLUSIVES\n${lsExtraString}\n$2`);
code = code.replace(/(const PORTRAIT_PRESETS = \[[\s\S]*?)(];)/, `$1,\n  // SHIM SIGNATURE EXCLUSIVES\n${ptExtraString}\n$2`);

fs.writeFileSync('src/components/TemplateEditor.tsx', code);
console.log("Successfully added Shim Signature exclusive background suite.");
