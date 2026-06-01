import { readdir, stat } from "node:fs/promises"
import path from "node:path"
import sharp from "sharp"

const PUBLIC_DIR = path.join(process.cwd(), "public")
const QUALITY = 85

/** @type {Record<string, { maxWidth: number; glob?: RegExp }>} */
const GROUPS = {
  tryOns: {
    dir: "try-ons",
    maxWidth: 270,
    extensions: [".png", ".jpg", ".jpeg"],
  },
  component: {
    dir: "component",
    maxWidth: 768,
    extensions: [".png", ".jpg", ".jpeg"],
  },
  userModels: {
    dir: "user_models",
    maxWidth: 680,
    extensions: [".png", ".jpg", ".jpeg"],
  },
  rootUserPhotos: {
    files: [
      "tattooed_white_man.png",
      "white_guy.png",
      "white_female.png",
      "obese_white_male.png",
      "tattooed white_female.png",
    ],
    maxWidth: 680,
  },
  logos: {
    files: ["DressApp logo without sub.png", "DressApp Logo Transparent.png"],
    maxWidth: 320,
  },
}

async function listFiles(dir, extensions) {
  const entries = await readdir(dir, { withFileTypes: true })
  return entries
    .filter((entry) => entry.isFile())
    .map((entry) => entry.name)
    .filter((name) => extensions.some((ext) => name.toLowerCase().endsWith(ext)))
}

async function optimizeFile(inputPath, maxWidth) {
  const outputPath = inputPath.replace(/\.(png|jpe?g)$/i, ".webp")
  const inputStats = await stat(inputPath)

  await sharp(inputPath)
    .rotate()
    .resize({ width: maxWidth, withoutEnlargement: true })
    .webp({ quality: QUALITY })
    .toFile(outputPath)

  const outputStats = await stat(outputPath)
  const savedPct = ((1 - outputStats.size / inputStats.size) * 100).toFixed(1)

  console.log(
    `${path.relative(PUBLIC_DIR, inputPath)} -> ${path.relative(PUBLIC_DIR, outputPath)} (${formatBytes(inputStats.size)} -> ${formatBytes(outputStats.size)}, -${savedPct}%)`,
  )
}

function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
}

async function main() {
  let totalIn = 0
  let totalOut = 0

  const processOne = async (relativePath, maxWidth) => {
    const inputPath = path.join(PUBLIC_DIR, relativePath)
    const inputStats = await stat(inputPath)
    totalIn += inputStats.size
    await optimizeFile(inputPath, maxWidth)
    const outputStats = await stat(inputPath.replace(/\.(png|jpe?g)$/i, ".webp"))
    totalOut += outputStats.size
  }

  for (const file of await listFiles(path.join(PUBLIC_DIR, GROUPS.tryOns.dir), GROUPS.tryOns.extensions)) {
    await processOne(path.join(GROUPS.tryOns.dir, file), GROUPS.tryOns.maxWidth)
  }

  for (const file of await listFiles(path.join(PUBLIC_DIR, GROUPS.component.dir), GROUPS.component.extensions)) {
    await processOne(path.join(GROUPS.component.dir, file), GROUPS.component.maxWidth)
  }

  for (const file of await listFiles(path.join(PUBLIC_DIR, GROUPS.userModels.dir), GROUPS.userModels.extensions)) {
    await processOne(path.join(GROUPS.userModels.dir, file), GROUPS.userModels.maxWidth)
  }

  for (const file of GROUPS.rootUserPhotos.files) {
    await processOne(file, GROUPS.rootUserPhotos.maxWidth)
  }

  for (const file of GROUPS.logos.files) {
    await processOne(file, GROUPS.logos.maxWidth)
  }

  console.log(
    `\nDone. Total: ${formatBytes(totalIn)} -> ${formatBytes(totalOut)} (-${((1 - totalOut / totalIn) * 100).toFixed(1)}%)`,
  )
}

main().catch((error) => {
  console.error("[optimize-landing-images]", error)
  process.exit(1)
})
