#!/usr/bin/env bash
set -euo pipefail

export PATH="/opt/homebrew/bin:/usr/local/bin:${PATH}"

STACK_NAME="${STACK_NAME:-ggseeds-prod}"
AWS_REGION="${AWS_REGION:-us-east-1}"

require_bin() {
  if ! command -v "$1" >/dev/null 2>&1; then
    echo "Falta dependencia requerida: $1" >&2
    exit 1
  fi
}

require_bin aws
require_bin node

stack_output() {
  local key="$1"
  aws cloudformation describe-stacks \
    --stack-name "${STACK_NAME}" \
    --region "${AWS_REGION}" \
    --query "Stacks[0].Outputs[?OutputKey=='${key}'].OutputValue" \
    --output text
}

secret_value() {
  local secret_arn="$1"
  aws secretsmanager get-secret-value \
    --region "${AWS_REGION}" \
    --secret-id "${secret_arn}" \
    --query 'SecretString' \
    --output text
}

DATABASE_URL_SECRET_ARN="$(stack_output DatabaseUrlSecretArn)"
CRON_SECRET_ARN="$(stack_output CronSecretArn)"
MARKUP_PARAMETER_NAME="$(stack_output MarkupPercentParameterName)"
IMPORT_MODE="$(stack_output ImportExecutionMode)"
ECS_CLUSTER_ARN="$(stack_output ScraperClusterArn)"
TASK_DEFINITION_ARN="$(stack_output ScraperTaskDefinitionArn)"
CONTAINER_NAME="$(stack_output ScraperContainerName)"
SUBNET_IDS="$(stack_output ScraperSubnetIds)"
SECURITY_GROUP_ID="$(stack_output ScraperSecurityGroupId)"
ADMIN_IMPORT_CREDS_SECRET_ARN="$(stack_output AdminImportCredentialsSecretArn)"

DATABASE_URL="$(secret_value "${DATABASE_URL_SECRET_ARN}")"
IMPORT_CRON_TOKEN="$(secret_value "${CRON_SECRET_ARN}")"
MARKUP_PERCENT_DEFAULT="$(
  aws ssm get-parameter \
    --region "${AWS_REGION}" \
    --name "${MARKUP_PARAMETER_NAME}" \
    --query 'Parameter.Value' \
    --output text
)"

AWS_ACCESS_KEY_ID=""
AWS_SECRET_ACCESS_KEY=""

if [[ -n "${ADMIN_IMPORT_CREDS_SECRET_ARN}" && "${ADMIN_IMPORT_CREDS_SECRET_ARN}" != "None" ]]; then
  ADMIN_IMPORT_CREDS_JSON="$(secret_value "${ADMIN_IMPORT_CREDS_SECRET_ARN}")"
  AWS_ACCESS_KEY_ID="$(
    node -e 'const payload = JSON.parse(process.argv[1]); process.stdout.write(payload.AWS_ACCESS_KEY_ID || "");' "${ADMIN_IMPORT_CREDS_JSON}"
  )"
  AWS_SECRET_ACCESS_KEY="$(
    node -e 'const payload = JSON.parse(process.argv[1]); process.stdout.write(payload.AWS_SECRET_ACCESS_KEY || "");' "${ADMIN_IMPORT_CREDS_JSON}"
  )"
fi

cat <<EOF
DATABASE_URL=${DATABASE_URL}
IMPORT_CRON_TOKEN=${IMPORT_CRON_TOKEN}
MARKUP_PERCENT_DEFAULT=${MARKUP_PERCENT_DEFAULT}
IMPORT_EXECUTION_MODE=${IMPORT_MODE}
AWS_REGION=${AWS_REGION}
AWS_ACCESS_KEY_ID=${AWS_ACCESS_KEY_ID}
AWS_SECRET_ACCESS_KEY=${AWS_SECRET_ACCESS_KEY}
AWS_ECS_CLUSTER_ARN=${ECS_CLUSTER_ARN}
AWS_ECS_TASK_DEFINITION_ARN=${TASK_DEFINITION_ARN}
AWS_ECS_CONTAINER_NAME=${CONTAINER_NAME}
AWS_ECS_SUBNET_IDS=${SUBNET_IDS}
AWS_ECS_SECURITY_GROUP_IDS=${SECURITY_GROUP_ID}
EOF
