import serviceFetchMappings from "./service-fetch-mappings"
import projects from "./data/projects"

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

console.log(todaysDownloads)
