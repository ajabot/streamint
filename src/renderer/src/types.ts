export interface RadioStation {
  id: string
  name: string
  url: string
  favorite: boolean
}

export interface Config {
  version: string
  stations: RadioStation[]
  settings: {
    volume: number
    lastStation: string | null
  }
}
