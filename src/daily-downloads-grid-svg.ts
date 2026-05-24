import fs from "fs/promises"
import projects from "./data/projects"
import { ProjectStatsFile } from "./@types/exports"

const CELL_SIZE = 12
const CELL_PADDING = 2
const WEEK_ROWS = 7
const WEEK_COLS = 53
const SVG_WIDTH = WEEK_COLS * (CELL_SIZE + CELL_PADDING) + CELL_PADDING
const GRID_HEIGHT = WEEK_ROWS * (CELL_SIZE + CELL_PADDING) + CELL_PADDING
const YEAR_LABEL_HEIGHT = 16

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

function getOpacity(downloads: number, maxDownloads: number): number {
  const ratio = maxDownloads === 0 ? 0 : downloads / maxDownloads
  return 0.05 + ratio * 0.95
}

export default async function generateDailyDownloadGrid() {
  const allDates = new Set<string>()
  const cumulativeByDate: Map<string, number> = new Map()

  for (const projectId in projects) {
    const filepath = `stats/projects/${projectId}.json`
    const raw = await fs.readFile(filepath, "utf-8").catch(() => "{}")
    const dailyProjectStats = (JSON.parse(raw) as ProjectStatsFile).daily
    if (!dailyProjectStats) continue

    for (const date in dailyProjectStats) {
      allDates.add(date)
      const total = Object.values(dailyProjectStats[date] ?? {}).reduce((a, b) => a + b, 0)
      cumulativeByDate.set(date, (cumulativeByDate.get(date) ?? 0) + total)
    }
  }

  const sortedDates = [...allDates].sort()
  const dailyDeltas: { date: string; downloads: number }[] = []

  let prevTotal = 0
  for (const date of sortedDates) {
    const total = cumulativeByDate.get(date) ?? 0
    dailyDeltas.push({ date, downloads: total - prevTotal })
    prevTotal = total
  }

  const years = [...new Set(dailyDeltas.map(d => d.date.split("-")[0]))].sort()
  const totalHeight = years.length * (YEAR_LABEL_HEIGHT + GRID_HEIGHT)

  let svgContent = `<svg width="${SVG_WIDTH}" height="${totalHeight}" xmlns="http://www.w3.org/2000/svg">\n`

  for (let yi = 0; yi < years.length; yi++) {
    const year = years[yi]
    const yearData = dailyDeltas.filter(d => d.date.startsWith(year))
    const yearOffset = yi * (YEAR_LABEL_HEIGHT + GRID_HEIGHT)
    const startOfYear = new Date(`${year}-01-01`).getDay()
    const maxDownloads = Math.max(...yearData.map(d => d.downloads), 1)

    svgContent += `  <text x="${CELL_PADDING}" y="${yearOffset + 12}" font-size="12" fill="#000000" font-family="sans-serif">${year}</text>\n`

    for (const entry of yearData) {
      const dateObj = new Date(entry.date)
      const dayOfYear = Math.floor((dateObj.getTime() - new Date(+year, 0, 0).getTime()) / 86400000)
      const week = Math.floor((dayOfYear + startOfYear) / 7)
      const day = (dayOfYear + startOfYear) % 7

      if (week >= WEEK_COLS) continue

      const x = week * (CELL_SIZE + CELL_PADDING) + CELL_PADDING
      const y = yearOffset + YEAR_LABEL_HEIGHT + day * (CELL_SIZE + CELL_PADDING) + CELL_PADDING
      const opacity = getOpacity(entry.downloads, maxDownloads)

      svgContent += `  <rect x="${x}" y="${y}" width="${CELL_SIZE}" height="${CELL_SIZE}" rx="2" fill="#2B6A30" fill-opacity="${opacity}" />\n`
    }
  }

  svgContent += `</svg>`

  await fs.writeFile("stats/download-grid.svg", svgContent)
  console.log("Download grid SVG generated.")
}