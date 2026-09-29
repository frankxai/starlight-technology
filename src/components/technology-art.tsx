import type { TechnologyRecord } from "@/lib/technology";

/**
 * Original system schematics. These explain the class of device, not the
 * appearance or dimensions of a particular manufacturer's variant.
 */
export function TechnologyArt({ item, className = "" }: { item: TechnologyRecord; className?: string }) {
  const common = { fill: "none", stroke: "currentColor", strokeWidth: 2, strokeLinejoin: "round" as const, strokeLinecap: "round" as const };
  return <figure className={`technology-art technology-art--${item.category.toLowerCase()} ${className}`}>
    <svg viewBox="0 0 600 340" role="img" aria-label={`Original ${item.category.toLowerCase()} system schematic; not an image of ${item.name}`}>
      <path className="art-axis" d="M28 278H572M44 62V278M556 62V278" />
      <path className="art-tick" d="M44 270v16m64-8v8m64-8v8m64-8v8m64-8v8m64-8v8m64-8v8m64-8v8m64-8v8" />
      {item.slug === "framework-desktop-ryzen-ai-max" && <g {...common}>
        <path className="art-shadow" d="M192 265h244l36 10H158z" />
        <path className="art-body" d="M220 75h176l43 25v149l-43 18H220l-43-18V100z" />
        <path d="M220 75v192M177 100h219l43 0M396 75v192M220 267l-43-18M396 267l43-18" />
        <path className="art-detail" d="M241 110h133v116H241zM256 125h103v86H256z" />
        <path className="art-detail" d="M268 140h79m-79 13h79m-79 13h79m-79 13h79m-79 13h79" />
        <circle className="art-signal" cx="381" cy="238" r="3" />
        <path d="M401 110h21m-21 11h21m-21 11h21" />
      </g>}
      {item.slug === "geforce-rtx-5090" && <g {...common}>
        <path className="art-shadow" d="M116 267h378l35 10H86z" />
        <path className="art-body" d="M117 101h365v143H117zM102 114h15v113h-15zM482 121h23v101h-23z" />
        <circle className="art-detail" cx="236" cy="172" r="52" /><circle className="art-detail" cx="362" cy="172" r="52" />
        <circle cx="236" cy="172" r="14" /><circle cx="362" cy="172" r="14" />
        <path d="M236 120v38m0 28v38m-52-52h38m28 0h38m-89-37 27 27m20 20 27 27m0-74-27 27m-20 20-27 27" />
        <path d="M362 120v38m0 28v38m-52-52h38m28 0h38m-89-37 27 27m20 20 27 27m0-74-27 27m-20 20-27 27" />
        <path className="art-signal" d="M210 244v14h20v-14m8 0v14h20v-14m8 0v14h20v-14m8 0v14h20v-14m8 0v14h20v-14" />
      </g>}
      {item.slug === "google-pixel-10-pro" && <g {...common}>
        <path className="art-shadow" d="M205 266h206l24 10H181z" />
        <rect className="art-body" x="228" y="56" width="161" height="212" rx="21" />
        <rect className="art-detail" x="240" y="70" width="137" height="184" rx="10" />
        <path className="art-detail" d="M260 169c29-65 73-82 107-55M253 199c37-64 67-44 113-108" />
        <circle className="art-signal" cx="308" cy="79" r="3" />
        <path d="M255 219h64m-64 12h100m-64-135h57" />
        <path className="art-callout" d="M395 105h84m-84 101h84M145 166h67" />
      </g>}
      {item.slug === "benq-pd3225u" && <g {...common}>
        <path className="art-shadow" d="M174 268h252l42 10H132z" />
        <rect className="art-body" x="112" y="62" width="376" height="197" rx="7" />
        <rect className="art-detail" x="124" y="74" width="352" height="171" />
        <path className="art-detail" d="M124 176h352M217 74v171M377 74v171" />
        <path className="art-signal" d="M143 208h67v17h-67zM237 103h114v92H237z" />
        <path d="M279 259v19m42-19v19m-96 0h150" />
        <path className="art-callout" d="M134 92h56m-56 12h35M395 211h59" />
      </g>}
      {item.slug === "meta-quest-3s" && <g {...common}>
        <path className="art-shadow" d="M118 267h360l36 10H82z" />
        <path className="art-body" d="M115 126c4-22 33-33 70-33h226c37 0 66 11 70 33l-8 78c-2 18-25 33-46 36l-75 8-29-30h-50l-29 30-75-8c-21-3-44-18-46-36z" />
        <path className="art-detail" d="M134 141c51 7 92 8 153 4h27c61 4 102 3 153-4M151 181c32 5 61 5 87 4m124 0c26 1 55 1 87-4" />
        <path d="M115 128c-25-15-51-3-55 20v36m421-56c25-15 51-3 55 20v36M194 93c15-30 49-45 106-45s91 15 106 45" />
        <circle className="art-signal" cx="191" cy="211" r="5" /><circle className="art-signal" cx="409" cy="211" r="5" />
      </g>}
      {item.slug === "unitree-go2" && <g {...common}>
        <path className="art-shadow" d="M92 268h416l28 10H64z" />
        <path className="art-body" d="M177 120h228l34 26-18 50H165l-18-50z" />
        <path className="art-detail" d="M190 137h199m-199 18h199m-141 19h84" />
        <path d="M192 197l-27 24-20 42h-57m121-66-8 32-7 34h-48m235-66 8 32 7 34h48m-63-66 27 24 20 42h57" />
        <circle className="art-signal" cx="184" cy="202" r="7" /><circle className="art-signal" cx="393" cy="202" r="7" />
        <path d="M439 149h36l21 19-9 17h-63M282 120v-25h57l15 25" />
        <path className="art-callout" d="M93 82h113m279 22h63M475 213h71" />
      </g>}
    </svg>
    <figcaption><span>System study / {item.category}</span><span>Original schematic · not product imagery</span></figcaption>
  </figure>;
}
