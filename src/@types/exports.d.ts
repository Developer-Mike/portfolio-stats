import { Service } from "./services"

export type TotalStatsFile = {
  [projectId: string]: {
    total: number

    "per-service-total": {
      [service in Service]?: number
    }
  }
}

export type ProjectStatsFile = {
  total: number

  "per-service-total": {
    [service in Service]?: number
  }

  daily: {
    [date: string]: {
      [service in Service]?: number
    }
  }
}