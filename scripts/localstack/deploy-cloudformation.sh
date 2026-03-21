#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
STACK_NAME="${STACK_NAME:-ggseeds-local}"
ENDPOINT_URL="${AWS_ENDPOINT_URL:-http://localhost:4566}"
TEMPLATE_PATH="${ROOT_DIR}/infra/cloudformation/ggseeds-stack.yaml"

export AWS_ACCESS_KEY_ID="${AWS_ACCESS_KEY_ID:-test}"
export AWS_SECRET_ACCESS_KEY="${AWS_SECRET_ACCESS_KEY:-test}"
export AWS_DEFAULT_REGION="${AWS_DEFAULT_REGION:-us-east-1}"
export AWS_PAGER=""

echo "Validando stack ${STACK_NAME} contra LocalStack..."
aws --endpoint-url "${ENDPOINT_URL}" cloudformation validate-template \
  --template-body "file://${TEMPLATE_PATH}" >/dev/null

echo "Desplegando stack ${STACK_NAME}..."
aws --endpoint-url "${ENDPOINT_URL}" cloudformation deploy \
  --stack-name "${STACK_NAME}" \
  --template-file "${TEMPLATE_PATH}" \
  --capabilities CAPABILITY_NAMED_IAM \
  --no-fail-on-empty-changeset \
  --parameter-overrides \
    ProjectName=ggseeds \
    EnvironmentName=local \
    DeploymentMode=local \
    ExistingDatabaseUrl='postgresql://ggseeds:ggseeds@host.docker.internal:5432/ggseeds?schema=public' \
    CronSecretValue='local-cron-secret' \
    MarkupPercentDefault='15'

echo "Outputs:"
aws --endpoint-url "${ENDPOINT_URL}" cloudformation describe-stacks \
  --stack-name "${STACK_NAME}" \
  --query 'Stacks[0].Outputs' \
  --output table

BUCKET_NAME="$(
  aws --endpoint-url "${ENDPOINT_URL}" cloudformation describe-stacks \
    --stack-name "${STACK_NAME}" \
    --query "Stacks[0].Outputs[?OutputKey=='AssetsBucketName'].OutputValue" \
    --output text
)"

if [[ -n "${BUCKET_NAME}" && "${BUCKET_NAME}" != "None" ]]; then
  echo "Bucket ${BUCKET_NAME} creado en LocalStack."
  aws --endpoint-url "${ENDPOINT_URL}" s3 ls "s3://${BUCKET_NAME}"
fi
