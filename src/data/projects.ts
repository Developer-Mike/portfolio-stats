import { Source } from "../@types/source"

const projects: {
  [projectId: string]: {
    label: string
    color: string
    sources: Source[]
  }
} = {
  "starlight-pdf": {
    label: "Starlight PDF",
    color: "#6633EE",
    sources: [
      {
        service: "github-release",
        fetchId: "Developer-Mike/starlight-pdf-public/main.js"
      }
    ]
  },
  "fn-track": {
    label: "FN Track",
    color: "#9D4DBB",
    sources: [
      {
        service: "play-store-app",
        fetchId: "com.mike.standartstats"
      }
    ]
  },
  "what": {
    label: "What?",
    color: "#000000",
    sources: [
      {
        service: "play-store-app",
        fetchId: "com.mike.what"
      }
    ]
  },
  "obsidian-advanced-canvas": {
    label: "Advanced Canvas",
    color: "#2C1F52",
    sources: [
      {
        service: "obsidian-plugin",
        fetchId: "advanced-canvas"
      }
    ]
  },
  "obsidian-docxer": {
    label: "Docxer",
    color: "#2B5796",
    sources: [
      {
        service: "obsidian-plugin",
        fetchId: "docxer"
      }
    ]
  },
  "obsidian-calctex": {
    label: "Calctex",
    color: "#008080",
    sources: [
      {
        service: "obsidian-plugin",
        fetchId: "calctex"
      }
    ]
  },
  "mc-autototem": {
    label: "Autototem",
    color: "#EADB84",
    sources: [
      {
        service: "modrinth-mod",
        fetchId: "autototem"
      },
      {
        service: "curseforge-mod",
        fetchId: "1328339"
      }
    ]
  },
  "mc-clear-enchanting": {
    label: "Clear Enchanting",
    color: "#621919",
    sources: [
      {
        service: "modrinth-mod",
        fetchId: "clear-enchanting"
      }
    ]
  },
  "mc-torch": {
    label: "Torch",
    color: "#4F402B",
    sources: [
      {
        service: "modrinth-mod",
        fetchId: "vision"
      }
    ]
  },
  "mc-anticheat": {
    label: "Anticheat",
    color: "#E30000",
    sources: [
      {
        service: "modrinth-mod",
        fetchId: "anticheat"
      }
    ]
  },
} as const

export default projects