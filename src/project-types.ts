const serviceFetchMappings = {
  "play-store-app": fetchPlayStoreAppData,
  "obsidian-plugin": fetchObsidianPluginData,
  "modrinth-mod": fetchModrinthModData,
} as const satisfies {
  [service: string]: (id: string) => Promise<number>
}

async function fetchPlayStoreAppData(id: string): Promise<number> {
  const response = await fetch(`https://play.google.com/store/apps/details?id=${id}`)
  const html = await response.text()

  const jsonString = html.match(/AF_initDataCallback\(({key: 'ds:5', .*?})\);<\/script>/)?.[1]
  if (!jsonString) return 0
  const cleanedJsonString = jsonString.replace(/({|, )([a-z0-9A-Z_]+?):/g, '$1"$2":')
    .replaceAll("'", '"')
  const json = JSON.parse(cleanedJsonString)

  return json.data[1][2][13][2] ?? 0
}

async function fetchObsidianPluginData(id: string): Promise<number> {
  const response = await fetch(`https://raw.githubusercontent.com/obsidianmd/obsidian-releases/master/community-plugin-stats.json`)
  const json = await response.json()

  const downloads = json[id].downloads
  return downloads
}

async function fetchModrinthModData(id: string): Promise<number> {
  const response = await fetch(`https://api.modrinth.com/v2/project/${id}`)
  const json = await response.json()

  const downloads = json.downloads
  return downloads
}

export default serviceFetchMappings