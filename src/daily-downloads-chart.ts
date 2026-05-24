import "chartjs-adapter-luxon"

import fs from "fs/promises"
import projects from "./data/projects"
import { ProjectStatsFile } from "./@types/exports"
import { CategoryScale, Chart, LinearScale, LineController, LineElement, PointElement, TimeScale, Legend } from 'chart.js'
import { Canvas } from "skia-canvas"

function smooth(data: { x: Date; y: number }[], halfWindow: number): { x: Date; y: number }[] {
  return data.map((_, i) => {
    let sum = 0
    let count = 0
    for (let j = i - halfWindow; j <= i + halfWindow; j++) {
      if (j >= 0 && j < data.length) {
        sum += data[j].y
        count++
      }
    }
    return { x: data[i].x, y: sum / count }
  })
}

export default async function generateDailyDownloadsChart() {
  const datasets: {
    label: string
    borderColor: string
    data: { x: Date; y: number }[]
  }[] = []

  const combinedByDate: Map<string, number> = new Map()

  for (const projectId in projects) {
    const filepath = `stats/projects/${projectId}.json`
    const raw = await fs.readFile(filepath, "utf-8").catch(() => "{}")
    const dailyProjectStats = (JSON.parse(raw) as ProjectStatsFile).daily
    if (!dailyProjectStats) continue

    const sortedDates = Object.keys(dailyProjectStats).sort()
    const dailyDownloads: { x: Date; y: number }[] = []

    let prevTotal = 0
    for (const date of sortedDates) {
      const total = Object.values(dailyProjectStats[date] ?? {}).reduce((a, b) => a + b, 0)
      const delta = total - prevTotal
      prevTotal = total

      dailyDownloads.push({ x: new Date(date), y: delta })
    }

    const projectData = dailyDownloads

    for (const point of projectData) {
      const key = point.x.toISOString().split("T")[0]
      combinedByDate.set(key, (combinedByDate.get(key) ?? 0) + point.y)
    }

    datasets.push({
      label: projects[projectId].label,
      borderColor: projects[projectId].color,
      data: projectData,
    })
  }

  const combinedData = smooth(
    [...combinedByDate.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, y]) => ({ x: new Date(date), y })),
    30
  )

  datasets.push({
    label: "Total",
    borderColor: "#000000",
    data: combinedData,
  })

  Chart.register([CategoryScale, LineController, LineElement, LinearScale, PointElement, TimeScale, Legend])
  const canvas = new Canvas(800, 600)
  const chart = new Chart(canvas as any, {
    type: 'line',
    options: {
      scales: {
        x: {
          type: "time",
          time: { unit: "month" }
        }
      },
      plugins: {
        legend: {
          display: true,
          position: "top",
          align: "start"
        }
      }
    },
    data: {
      datasets: datasets.map(ds => ({
        ...ds,
        pointRadius: 0,
        cubicInterpolationMode: 'monotone',
        borderColor: ds.borderColor + (ds.label === "Total" ? "" : "AA"),
        borderWidth: ds.label === "Total" ? 3 : 2,
      }))
    }
  })

  const buffer = await canvas.toBuffer('svg')
  await fs.writeFile('stats/daily-downloads-chart.svg', buffer)

  chart.destroy()
  console.log("Daily downloads chart SVG generated successfully.")
}