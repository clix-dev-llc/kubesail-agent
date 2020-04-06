// @flow

/* flow-include
export type KsGatewayConfig = {}
*/

const https = require('https')

const {
  GATEWAY_ADDRESS,
  GATEWAY_INTERNAL_ADDRESS,
  ALWAYS_VALID_DOMAINS,
  KUBESAIL_API_TARGET,
  KUBESAIL_API_SECRET
} = require('../shared/config')
const logger = require('../shared/logger')

const [KubeSailApiTarget, KubeSailApiPort] = KUBESAIL_API_TARGET.split(':')
const AGENT_REGISTER_VALID = 200
const AGENT_REGISTER_PENDING = 202

module.exports = async function agentSocketConnectionHandler(
  socket /*: Socket */,
  retries /*: number */ = 0
) /*: false|{ validDomains: Array<string>, clusterAddress: string } */ {
  const agentKey = socket.handshake.query.key
  const agentSecret = socket.handshake.query.secret
  const username = socket.handshake.query.username
  this.socketMapping[socket.id] = socket

  socket.on('disconnect', () => {
    delete this.socketMapping[socket.id]
    this.removeAgentSocket(socket)
  })

  logger.info('New socket connection!', {
    gatewayAddress: GATEWAY_INTERNAL_ADDRESS
  })

  await this.redis.set(socket.id, GATEWAY_INTERNAL_ADDRESS)

  const postData = JSON.stringify({
    username,
    agentKey,
    agentSecret,
    gatewaySecret: KUBESAIL_API_SECRET,
    gatewayAddress: GATEWAY_ADDRESS
  })

  const options = {
    hostname: KubeSailApiTarget,
    headers: { 'Content-Type': 'application/json' },
    port: KubeSailApiPort,
    method: 'POST'
  }

  if (process.env.NODE_ENV === 'development') {
    options.insecure = true
    options.rejectUnauthorized = false
  }

  const req = https.request({ ...options, path: '/agent/register' }, res => {
    if (res.statusCode === AGENT_REGISTER_VALID || res.statusCode === AGENT_REGISTER_PENDING) {
      this.bindAgentSocketEvents(socket, agentKey, agentSecret, options)
    }
    if (res.statusCode === AGENT_REGISTER_VALID) {
      let buff = ''
      res.on('data', chunk => (buff = buff + chunk))
      res.on('end', async () => {
        let { clusterAddress, firewallRules, validDomains } = JSON.parse(buff)
        validDomains = validDomains.concat(ALWAYS_VALID_DOMAINS).filter(Boolean)
        logger.info('Agent registered! Sending configuration', { agentKey })
        socket.__clusterAddress = clusterAddress
        await this.addSocketMapping(socket, [clusterAddress, ...validDomains])
        this.updateFirewall(firewallRules)
        socket.emit('agent-data', { validDomains, clusterAddress, firewallRules })
      })
      res.on('error', err => {
        logger.error('Gateway got error talking to KubeSail Api!', {
          errMsg: err.message,
          code: err.code
        })
        socket.disconnect()
      })
    } else if (res.statusCode === AGENT_REGISTER_PENDING) {
      logger.info('New agent pending', { agentKey })
    } else {
      logger.warn(
        'Disconnected agent due to invalid agentSocketConnectionHandler reply' + res.statusCode
      )
      socket.disconnect()
    }
  })

  req.on('error', e => {
    logger.error('Failed to register agent with KubeSail API', {
      errMsg: e.message,
      code: e.code,
      type: e.type,
      retries
    })
    const retry = () => {
      setTimeout(() => {
        this.agentSocketConnectionHandler(socket, retries)
      }, Math.min(retries, 30) * 1500)
      retries++
    }
    if (e.code === 'ECONNREFUSED') retry()
  })

  req.write(postData)
  req.end()
}