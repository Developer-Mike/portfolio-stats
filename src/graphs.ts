import generateDailyDownloadsChart from "./daily-downloads-chart"
import generateDailyDownloadsGrid from "./daily-downloads-grid-svg"
import generateDownloadChart from "./download-chart-svg"

export default async function generateGraphs() {
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

  try {
    await generateDailyDownloadsChart()
  } catch (error) {
    console.error("Error generating daily downloads chart SVG:", error)
  }

  console.log("Graphs generated successfully!")
}

await generateGraphs()