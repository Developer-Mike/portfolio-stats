import "chartjs-adapter-luxon"

import fs from "fs/promises"
import projects from "./data/projects"
import { ProjectStatsFile } from "./@types/exports"
import { CategoryScale, Chart, LinearScale, LineController, LineElement, PointElement, TimeScale } from 'chart.js'
import { Canvas } from "skia-canvas"

export default async function generateDownloadChart() {
  // Get daily total downloads of each project
  const datasets: {
    label: string
    borderColor: string
    data: { x: Date; y: number }[]
  }[] = []

  let earliestDate: Date = new Date()
  for (const projectId in projects) {
    const PROJECT_STATS_FILEPATH = `stats/projects/${projectId}.json`
    const projectStatsJsonString = await fs.readFile(PROJECT_STATS_FILEPATH, "utf-8").catch(() => "{}")

    const dailyProjectStats = (JSON.parse(projectStatsJsonString) as ProjectStatsFile).daily
    if (!dailyProjectStats) continue

    const earliestProjectDate = new Date(Object.keys(dailyProjectStats)[0])
    if (!earliestDate || earliestProjectDate < new Date(earliestDate))
      earliestDate = earliestProjectDate

    const dailyDownloads: { x: Date; y: number }[] = []
    for (const date in dailyProjectStats) {
      let totalDownloads = Object.values(dailyProjectStats[date] ?? {}).reduce((a, b) => a + b, 0)
      totalDownloads = Math.max(dailyDownloads.length > 0 ? dailyDownloads[dailyDownloads.length - 1].y : 0, totalDownloads)

      dailyDownloads.push({
        x: new Date(date),
        y: totalDownloads
      })
    }

    datasets.push({
      label: projects[projectId].label,
      borderColor: projects[projectId].color,
      data: dailyDownloads,
    })
  }

  // Create a line chart using Chart.js
  Chart.register([CategoryScale, LineController, LineElement, LinearScale, PointElement, TimeScale])
  const canvas = new Canvas(800, 600)
  const chart = new Chart(canvas as any,
    {
      type: 'line',
      options: {
        scales: {
          x: {
            type: "time",
            time: { unit: "month" }
          }
        },
      },
      data: {
        datasets: datasets.map(ds => ({
          ...ds,
          pointRadius: 0,
          cubicInterpolationMode: 'monotone',
          borderColor: ds.borderColor + 'AA',
        }))
      }
    }
  )

  // Export chart as SVG
  const buffer = await canvas.toBuffer('svg')
  await fs.writeFile('stats/download-chart.svg', buffer)

  chart.destroy()

  // Log success message
  console.log("Download chart SVG generated successfully.")
}