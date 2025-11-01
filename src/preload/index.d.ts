import { RadioStation, Config } from './index'

export { RadioStation, Config }

declare global {
  interface Window {
    electronAPI: {
      config: {
        read: () => Promise<Config>
        write: (data: Config) => Promise<boolean>
      }
      dialog: {
        showError: (title: string, message: string) => Promise<void>
      }
    }
  }
}
