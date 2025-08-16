import './telemetry/index.js'

import closeWithGrace from 'close-with-grace'
import { config } from './shared/config/env.js'
import { logger } from './shared/utils/logger.js'
import { buildApp } from './server/app.js'
import { initializeTelemetry, shutdownTelemetry } from './telemetry/index.js'

const start = async (): Promise<void> => {
  try {
    await initializeTelemetry()
    
    const app = await buildApp()
    
    await app.listen({
      host: config.HOST,
      port: config.PORT,
    })
    
    logger.info({
      host: config.HOST,
      port: config.PORT,
      environment: config.NODE_ENV,
      swagger: config.SWAGGER_ENABLED ? `http://localhost:${config.PORT}${config.SWAGGER_PATH}` : 'disabled',
    }, 'Server started successfully')
    
    const closeListeners = closeWithGrace(
      {
        delay: config.GRACEFUL_SHUTDOWN_TIMEOUT,
      },
      async ({ signal, err }) => {
        if (err) {
          logger.error({ error: err }, 'Server crashed')
        } else {
          logger.info({ signal }, 'Graceful shutdown initiated')
        }
        
        await app.close()
        await shutdownTelemetry()
        
        logger.info('Server shut down successfully')
      },
    )
    
    app.addHook('onClose', async () => {
      closeListeners.uninstall()
    })
  } catch (error) {
    logger.fatal({ error }, 'Failed to start server')
    process.exit(1)
  }
}

start().catch((error) => {
  logger.fatal({ error }, 'Unhandled error during startup')
  process.exit(1)
})