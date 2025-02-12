import serviceFetchMappings from "./service-fetch-mappings"
import projects from "./data/projects"
import fs from "fs/promises"
import { ProjectStatsFile, TotalStatsFile } from "./@types/exports"

// Fetch data for each project
const todaysDownloads: {
  [projectId: string]: {
    [service: string]: number
  }
} = {}

const fetchPromises: Promise<number>[] = []
for (const projectId in projects) {
  const project = projects[projectId]

  for (const service of project) {
    const fetchFunction = serviceFetchMappings[service.service]
    if (!fetchFunction) {
      console.error(`No fetch function found for service: ${service.service}`)
      continue
    }

    const fetchPromise = fetchFunction(service.fetchId)
    fetchPromises.push(fetchPromise)

    fetchPromise.then(downloads => {
      if (!todaysDownloads[projectId]) {
        todaysDownloads[projectId] = {}
      }

      todaysDownloads[projectId][service.service] = downloads
    })
  }
}
await Promise.all(fetchPromises)

// Save the data to the stats/total.json file
const totalStatsFilepath = "stats/total.json"
const totalStatsJson: TotalStatsFile = {}
for (const projectId in todaysDownloads) {
  const projectDownloads = todaysDownloads[projectId]

  totalStatsJson[projectId] = {
    total: Object.values(projectDownloads).reduce((a, b) => a + b, 0),
    "per-service-total": projectDownloads
  }
}
await fs.writeFile(totalStatsFilepath, JSON.stringify(totalStatsJson, null, 2))

// Save the data to the stats/projects/{projectId}.json files
const date = new Date().toISOString().split("T")[0]
for (const projectId in todaysDownloads) {
  const projectDownloads = todaysDownloads[projectId]

  const projectStatsFilepath = `stats/projects/${projectId}.json`
  const previousStatsString = await fs.readFile(projectStatsFilepath, "utf-8").catch(() => "{}")
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
  await fs.writeFile(projectStatsFilepath, JSON.stringify(projectStatsJson, null, 2))
}

// Log a success message
console.log("Stats fetched and saved successfully!")
