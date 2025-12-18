import generateDailyDownloadsGrid from "./daily-downloads-grid-svg"
import generateDownloadChart from "./download-chart-svg"
import updateStats from "./update-stats"

await updateStats()

try {
  await generateDownloadChart()
} catch (error) {
  console.error("Error generating download chart SVG:", error)
}

try {
  await generateDailyDownloadsGrid()
} catch (error) {
  console.error("Error generating daily downloads grid SVG:", error)
}