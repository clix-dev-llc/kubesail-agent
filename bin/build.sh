#!/bin/bash

TAG="kubesail/agent:v$(cat VERSION.txt)"

# Enable docker experimental mode:
#  - echo '{ "experimental": true }' > /etc/docker/daemon.json
#  - echo '{ "experimental": "enabled" }' > ~/.docker/config.json
# install buildx (https://github.com/docker/buildx/releases)

# docker buildx create --name mybuilder
# docker buildx use mybuilder
# docker buildx inspect --bootstrap
# docker run --name binfmt --privileged docker/binfmt:66f9012c56a8316f9244ffd7622d7c21c1f6f28d

# Troubleshooting:
# buildx stop... buildx inspect --bootstrap

./bin/generate_self_signed_cert.sh

BUILDX_COMMAND="docker buildx"
command -v buildx > /dev/null && BUILDX_COMMAND="buildx"

${BUILDX_COMMAND} build \
  --platform linux/amd64,linux/arm64,linux/arm/v7 \
  -t ${TAG} \
  --target production \
  --push \
  .
