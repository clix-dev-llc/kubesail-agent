# kubesail-agent

[![Docker Pulls](https://img.shields.io/docker/pulls/kubesail/agent?style=for-the-badge)](https://hub.docker.com/r/kubesail/agent)

Allows a cluster or namespace to be managed on KubeSail.com

## Installation

https://kubesail.com -> Clusters -> Add Cluster -> "Full" Install

## Configuration

The following environment variables are available to be set:


| ENV Variable              | Description                                                          | Default                               |
| ------------------------- | -------------------------------------------------------------------- | ------------------------------------- |
| LOGGING_LABEL             | A helper tag added to each log-line                                  | `kubesail-agent`                      |
| LOG_LEVEL                 | Controls logger verbosity (silly, debug, info, warn, error)          | `info`                                |
| METRICS_LISTEN_PORT       | Listen port for prometheus metrics                                   | `5000`                                |
| AGENT_HTTP_LISTEN_PORT    | Healthcheck port for agent                                           | `6000`                                |
| AGENT_GATEWAY_TARGET      | Target Gateway for agent registration                                | `https://gateway-portal.kubesail.com` |
| KUBESAIL_AGENT_INITIAL_ID | A helpful hint to show in the KubeSail dashboard before verification | none                                  |

## Development

Install [skaffold](https://skaffold.dev/) and have a Kubernetes context ready, then run:

`skaffold dev --port-forward`

That's it!
