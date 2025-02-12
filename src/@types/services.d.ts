export type Service = "play-store-app" | "obsidian-plugin" | "modrinth-mod"

export type ServiceFetchMappings = {
  [service in Service]: (id: string) => Promise<number>
}
