import serviceFetchMappings from "./project-types"

export interface Project {
  [projectId: string]: {
    service: keyof typeof serviceFetchMappings
    id: string
  }[]
}

const projects: Project = {
  "fn-track": [
    {
      service: "play-store-app",
      id: "com.mike.standartstats"
    }
  ],
  "advanced-canvas": [
    {
      service: "obsidian-plugin",
      id: "advanced-canvas"
    }
  ],
  "docxer": [
    {
      service: "obsidian-plugin",
      id: "docxer"
    }
  ],
  "calctex": [
    {
      service: "obsidian-plugin",
      id: "calctex"
    }
  ],
}