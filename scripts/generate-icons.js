import sharp from "sharp"
import fs from "fs"
import path from "path"

const SOURCE = "./public/assets/logo.jpg"
const OUT = "./public/icons"

if (!fs.existsSync(OUT)) fs.mkdirSync(OUT, { recursive: true })

const SIZES = [
  { size: 72,   name: "icon-72x72.png" },
  { size: 96,   name: "icon-96x96.png" },
  { size: 128,  name: "icon-128x128.png" },
  { size: 144,  name: "icon-144x144.png" },
  { size: 152,  name: "icon-152x152.png" },
  { size: 192,  name: "icon-192x192.png" },
  { size: 384,  name: "icon-384x384.png" },
  { size: 512,  name: "icon-512x512.png" },
  { size: 180,  name: "apple-touch-icon.png" },
  { size: 32,   name: "favicon-32x32.png" },
  { size: 16,   name: "favicon-16x16.png" },
]

async function generate() {
  console.log("🎨 Generating PWA icons...")
  for (const { size, name } of SIZES) {
    try {
      await sharp(SOURCE)
        .resize(size, size, { fit: "contain", 
          background: { r:17, g:17, b:17, alpha:1 } })
        .png()
        .toFile(path.join(OUT, name))
      console.log(`✅ ${name}`)
    } catch (err) {
      console.error(`❌ Error generating ${name}:`, err)
    }
  }

  // Also copy as favicon.ico replacement
  try {
    await sharp(SOURCE)
      .resize(32, 32)
      .png()
      .toFile("./public/favicon.png")
    console.log("✅ favicon.png")
    console.log("🎉 All icons generated!")
  } catch (err) {
    console.error("❌ Error generating favicon.png:", err)
  }
}

generate().catch(console.error)
