import { Project } from "../@types/projects"

const projects: {
  [projectId: string]: Project[]
} = {
  "starlight-pdf": [
    {
      service: "github-release",
      fetchId: "Developer-Mike/starlight-pdf-public/main.js"
    }
  ],
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
    },
    {
      service: "curseforge-mod",
      fetchId: "1328339"
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