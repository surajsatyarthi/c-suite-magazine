import * as dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

import { defineCliConfig } from 'sanity/cli'
import { config } from './sanity/config'

/**
 * This configuration file lets you run `$ sanity [command]` in this folder
 * It uses the SHARED configuration from ./sanity/config.ts
 */

export default defineCliConfig({
  api: {
    projectId: config.projectId,
    dataset: config.dataset
  },
  studioHost: config.studioHost,
  deployment: {
    appId: 'lfpme7k2t1zufpxoa87wz77k',
  },
})
