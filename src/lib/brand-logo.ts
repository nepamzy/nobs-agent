import sharp from "sharp";

// The NOBS AGENT mark (same drawing as public/logo-mark.svg), kept as a string
// so the PDF generator never depends on reading a file from disk at runtime.
const LOGO_SVG = `<svg width="600" height="600" viewBox="0 0 600 600" xmlns="http://www.w3.org/2000/svg">
<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#f0c464"/><stop offset="100%" stop-color="#e4b343"/></linearGradient></defs>
<polygon points="300,20 520,150 520,450 300,580 80,450 80,150" fill="#12151d" stroke="#e4b343" stroke-width="10" stroke-opacity="0.9"/>
<polygon points="185,165 260,165 260,435 185,435" fill="url(#g)"/>
<polygon points="185,165 200,165 200,435 185,435" fill="#a5822f"/>
<polygon points="340,165 415,165 415,435 340,435" fill="url(#g)"/>
<polygon points="399,165 415,165 415,435 399,435" fill="#a5822f"/>
<polygon points="260,165 320,165 415,330 415,435 340,435 260,270" fill="#e4b343"/>
<polygon points="260,165 282,165 372,330 350,330 260,190" fill="#c99a34"/>
<circle cx="320" cy="165" r="22" fill="#12151d"/><circle cx="320" cy="165" r="13" fill="#3ed6c4"/>
</svg>`;

let cached: Promise<Buffer> | null = null;
export function logoPng(): Promise<Buffer> {
  cached ??= sharp(Buffer.from(LOGO_SVG)).resize(240, 240).png().toBuffer();
  return cached;
}
