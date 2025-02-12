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
  "what": [
    {
      service: "play-store-app",
      id: "com.mike.what"
    }
  ],
  "obsidian-advanced-canvas": [
    {
      service: "obsidian-plugin",
      id: "advanced-canvas"
    }
  ],
  "obsidian-docxer": [
    {
      service: "obsidian-plugin",
      id: "docxer"
    }
  ],
  "obsidian-calctex": [
    {
      service: "obsidian-plugin",
      id: "calctex"
    }
  ],
  "mc-autototem": [
    {
      service: "modrinth-mod",
      id: "autototem"
    }
  ],
  "mc-clear-enchanting": [
    {
      service: "modrinth-mod",
      id: "clear-enchanting"
    }
  ],
  "mc-torch": [
    {
      service: "modrinth-mod",
      id: "vision"
    }
  ],
  "mc-anticheat": [
    {
      service: "modrinth-mod",
      id: "anticheat"
    }
  ],
}