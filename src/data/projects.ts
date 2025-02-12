import { Project } from "../@types/projects"

const projects: { 
  [projectId: string]: Project[]
} = {
  "fn-track": [
    {
      service: "play-store-app",
      fetchId: "com.mike.standartstats"
    }
  ],
  "what": [
    {
      service: "play-store-app",
      fetchId: "com.mike.what"
    }
  ],
  "obsidian-advanced-canvas": [
    {
      service: "obsidian-plugin",
      fetchId: "advanced-canvas"
    }
  ],
  "obsidian-docxer": [
    {
      service: "obsidian-plugin",
      fetchId: "docxer"
    }
  ],
  "obsidian-calctex": [
    {
      service: "obsidian-plugin",
      fetchId: "calctex"
    }
  ],
  "mc-autototem": [
    {
      service: "modrinth-mod",
      fetchId: "autototem"
    }
  ],
  "mc-clear-enchanting": [
    {
      service: "modrinth-mod",
      fetchId: "clear-enchanting"
    }
  ],
  "mc-torch": [
    {
      service: "modrinth-mod",
      fetchId: "vision"
    }
  ],
  "mc-anticheat": [
    {
      service: "modrinth-mod",
      fetchId: "anticheat"
    }
  ],
} as const

export default projects