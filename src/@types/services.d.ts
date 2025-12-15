export type Service = "github-release" | "play-store-app" | "obsidian-plugin" | "modrinth-mod" | "curseforge-mod"

export type ServiceFetchMappings = {
  [service in Service]: (id: string) => Promise<number>
}
