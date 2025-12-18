import fs from "fs/promises"
import JSONSS from "json-stable-stringify"
import serviceFetchMappings from "./service-fetch-mappings"
import projects from "./data/projects"
import { ProjectStatsFile, TotalStatsFile } from "./@types/exports"

async function getDownloadsToday(): Promise<{ [projectId: string]: { [service: string]: number } }> {
  const downloadsToday: {
    [projectId: string]: {
      [service: string]: number
    }
  } = {}

  const fetchPromises: Promise<number>[] = []
  for (const projectId in projects) {
    const project = projects[projectId]

    for (const source of project.sources) {
      const fetchFunction = serviceFetchMappings[source.service]
      if (!fetchFunction) {
        console.error(`No fetch function found for service: ${source.service}`)
        continue
      }

      const fetchPromise = fetchFunction(source.fetchId)
      fetchPromises.push(fetchPromise)

      fetchPromise.then(downloads => {
        if (!downloadsToday[projectId]) {
          downloadsToday[projectId] = {}
        }

        downloadsToday[projectId][source.service] = downloads
      })
    }
  }
  await Promise.all(fetchPromises)

  return downloadsToday
}

export default async function updateStats() {
  const downloadsToday = await getDownloadsToday()

  const TOTAL_STATS_FILEPATH = "stats/total.json"
  const totalStatsJson: TotalStatsFile = {}

  for (const projectId in downloadsToday) {
    const projectDownloads = downloadsToday[projectId]

    totalStatsJson[projectId] = {
      total: Object.values(projectDownloads).reduce((a, b) => a + b, 0),
      "per-service-total": projectDownloads
    }
  }
  await fs.writeFile(TOTAL_STATS_FILEPATH, JSONSS(totalStatsJson, { space: 2 }) ?? "{}")


  // Save the data to the stats/projects/{projectId}.json files
  const date = new Date().toISOString().split("T")[0]
  for (const projectId in downloadsToday) {
    const projectDownloads = downloadsToday[projectId]

    const PROJECT_STATS_FILEPATH = `stats/projects/${projectId}.json`
    const previousStatsString = await fs.readFile(PROJECT_STATS_FILEPATH, "utf-8").catch(() => "{}")
    const projectStatsJson = JSON.parse(previousStatsString) as ProjectStatsFile

    // Initialize the keys if they don't exist
    projectStatsJson.total ??= 0
    projectStatsJson["per-service-total"] ??= {}
    projectStatsJson.daily ??= {}

    // Add the new data to the stats
    projectStatsJson.total = totalStatsJson[projectId].total
    projectStatsJson["per-service-total"] = totalStatsJson[projectId]["per-service-total"]
    projectStatsJson.daily[date] = projectDownloads

    // Save the updated stats
    await fs.writeFile(PROJECT_STATS_FILEPATH, JSONSS(projectStatsJson, { space: 2 }) ?? "{}")
  }

  // Log a success message
  console.log("Stats fetched and saved successfully!")
}
