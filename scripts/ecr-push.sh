#!/usr/bin/env bash
# Build linux/amd64 image and push to Amazon ECR.
# Usage:
#   AWS_REGION=ap-northeast-1 ECR_REPOSITORY_URI=123.dkr.ecr.ap-northeast-1.amazonaws.com/macching-api \
#   ./scripts/ecr-push.sh [image-tag]
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

: "${AWS_REGION:?AWS_REGION is required}"
: "${ECR_REPOSITORY_URI:?ECR_REPOSITORY_URI is required}"

IMAGE_TAG="${1:-$(git rev-parse --short HEAD)}"
PLATFORM="${DOCKER_PLATFORM:-linux/amd64}"
ACCOUNT_ID="$(aws sts get-caller-identity --query Account --output text)"

aws ecr get-login-password --region "$AWS_REGION" \
  | docker login --username AWS --password-stdin "${ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com"

docker buildx build \
  --platform "$PLATFORM" \
  -t "${ECR_REPOSITORY_URI}:${IMAGE_TAG}" \
  -t "${ECR_REPOSITORY_URI}:latest" \
  --push \
  .

echo "Pushed ${ECR_REPOSITORY_URI}:${IMAGE_TAG}"
