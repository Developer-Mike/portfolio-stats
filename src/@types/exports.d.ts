import { Service } from "./services"

export type TotalStatsFile = {
  [projectId: string]: {
    total: number
  } & {
    [service in Service]: number
  }
}

export type ProjectStatsFile = {
  total: number

  daily: {
    [date: string]: {
      [service in Service]: number
    }
  }
}