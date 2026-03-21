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
MARKUP_PARAMETER_NAME="$(stack_output MarkupPercentParameterName)"

DATABASE_URL="$(secret_value "${DATABASE_URL_SECRET_ARN}")"
MARKUP_PERCENT_DEFAULT="$(
  aws ssm get-parameter \
    --region "${AWS_REGION}" \
    --name "${MARKUP_PARAMETER_NAME}" \
    --query 'Parameter.Value' \
    --output text
)"

cat <<EOF
DATABASE_URL=${DATABASE_URL}
MARKUP_PERCENT_DEFAULT=${MARKUP_PERCENT_DEFAULT}
EOF
