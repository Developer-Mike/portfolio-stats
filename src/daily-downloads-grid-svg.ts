import fs from "fs/promises"
import projects from "./data/projects"
import { ProjectStatsFile } from "./@types/exports"

const CELL_SIZE = 12
const CELL_PADDING = 2
const SVG_WIDTH = 53 * (CELL_SIZE + CELL_PADDING) + CELL_PADDING
const SVG_HEIGHT = 7 * (CELL_SIZE + CELL_PADDING) + CELL_PADDING

const COLORS = new Map<number, string>([
  [0.0, "#2A313C"],
  [0.2, "#1B4721"],
  [0.4, "#2B6A30"],
  [0.6, "#46954A"],
  [1.8, "#6BC46D"],
])

export function interpolateColor(
  stops: Map<number, string>,
  t: number
): string {
  const lerp = (a: number, b: number, t: number) => a + (b - a) * t

  const toRgb = (hex: string) => {
    const n = parseInt(hex.replace("#", ""), 16)
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255]
  }

  const lin = (c: number) => {
    const v = c / 255
    return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4
  }

  const gam = (c: number) =>
    Math.round(255 * (
      c <= 0.0031308
        ? 12.92 * c
        : 1.055 * c ** (1 / 2.4) - 0.055
    ))

  const entries = [...stops.entries()].sort((a, b) => a[0] - b[0])

  if (t <= entries[0][0]) return entries[0][1]
  if (t >= entries.at(-1)![0]) return entries.at(-1)![1]

  for (let i = 0; i < entries.length - 1; i++) {
    const [t0, c0] = entries[i]
    const [t1, c1] = entries[i + 1]
    if (t < t0 || t > t1) continue

    const u = (t - t0) / (t1 - t0)

    const oklab = (hex: string) => {
      const [r, g, b] = toRgb(hex).map(lin)
      const l = 0.4122214708*r + 0.5363325363*g + 0.0514459929*b
      const m = 0.2119034982*r + 0.6806995451*g + 0.1073969566*b
      const s = 0.0883024619*r + 0.2817188376*g + 0.6299787005*b
      const l_ = Math.cbrt(l)
      const m_ = Math.cbrt(m)
      const s_ = Math.cbrt(s)
      return [
        0.2104542553*l_ + 0.7936177850*m_ - 0.0040720468*s_,
        1.9779984951*l_ - 2.4285922050*m_ + 0.4505937099*s_,
        0.0259040371*l_ + 0.7827717662*m_ - 0.8086757660*s_
      ]
    }

    const a = oklab(c0)
    const b = oklab(c1)

    const L = lerp(a[0], b[0], u)
    const A = lerp(a[1], b[1], u)
    const B = lerp(a[2], b[2], u)

    const l_ = L + 0.3963377774*A + 0.2158037573*B
    const m_ = L - 0.1055613458*A - 0.0638541728*B
    const s_ = L - 0.0894841775*A - 1.2914855480*B

    const l = l_ ** 3
    const m = m_ ** 3
    const s = s_ ** 3

    const R = gam(4.0767416621*l - 3.3077115913*m + 0.2309699292*s)
    const G = gam(-1.2684380046*l + 2.6097574011*m - 0.3413193965*s)
    const Bc = gam(-0.0041960863*l - 0.7034186147*m + 1.7076147010*s)

    return `rgb(${R} ${G} ${Bc})`
  }

  return entries[0][1]
}

function getColorForDownloads(downloads: number, maxDownloads: number): string {
  const ratio = maxDownloads === 0 ? 0 : downloads / maxDownloads
  return interpolateColor(COLORS, ratio)
}

export default async function generateDailyDownloadGrid() {
  const dailyTotalDownloads: number[] = Array(366).fill(0) // +1 to measure diff
  const startDate = new Date().setDate(new Date().getDate() - 366) // +1 to measure diff

  // For each project, fetch the download data of the last year
  for (const projectId in projects) {
    const PROJECT_STATS_FILEPATH = `stats/projects/${projectId}.json`
    const projectStatsJsonString = await fs.readFile(PROJECT_STATS_FILEPATH, "utf-8").catch(() => "{}")

    const dailyProjectStats = (JSON.parse(projectStatsJsonString) as ProjectStatsFile).daily
    if (!dailyProjectStats) continue

    for (let i = 0; i < 365; i++) {
      const date = new Date(startDate + i * 24 * 60 * 60 * 1000).toISOString().split("T")[0]
      dailyTotalDownloads[i] += Object.values(dailyProjectStats[date] ?? {}).reduce((a, b) => a + b, 0)
    }
  }

  const dailyDownloads: number[] = []
  for (let i = 1; i < dailyTotalDownloads.length; i++)
    dailyDownloads.push(dailyTotalDownloads[i] - dailyTotalDownloads[i - 1])

  // Generate SVG
  const maxDownloads = Math.max(...dailyDownloads)
  const gridDayOffset = new Date(startDate).getDay()

  let svgContent = `<svg width="${SVG_WIDTH}" height="${SVG_HEIGHT}" xmlns="http://www.w3.org/2000/svg">\n`
  for (let week = 0; week < 53; week++) {
    for (let day = 0; day < 7; day++) {
      const dayIndex = week * 7 + day - gridDayOffset
      if (dayIndex < 0 || dayIndex >= dailyDownloads.length) continue

      const downloads = dailyDownloads[dayIndex]
      const color = getColorForDownloads(downloads, maxDownloads)

      const x = week * (CELL_SIZE + CELL_PADDING) + CELL_PADDING
      const y = day * (CELL_SIZE + CELL_PADDING) + CELL_PADDING

      svgContent += `  <rect x="${x}" y="${y}" width="${CELL_SIZE}" height="${CELL_SIZE}" rx="2" fill="${color}" />\n`
    }
  }

  svgContent += `</svg>`

  // Save SVG to file
  await fs.writeFile("stats/download-grid.svg", svgContent)

  // Log a success message
  console.log("Download grid SVG generated.")
}