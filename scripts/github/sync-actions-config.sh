#!/usr/bin/env bash
set -euo pipefail

export PATH="/opt/homebrew/bin:/usr/local/bin:${PATH}"

STACK_NAME="${STACK_NAME:-ggseeds-prod}"
AWS_REGION="${AWS_REGION:-us-east-1}"
GH_REPO="${GH_REPO:-}"
DRY_RUN="${DRY_RUN:-0}"

require_bin() {
  if ! command -v "$1" >/dev/null 2>&1; then
    echo "Falta dependencia requerida: $1" >&2
    exit 1
  fi
}

require_bin git
require_bin aws
require_bin gh

remote_repo() {
  local origin_url

  origin_url="$(git remote get-url origin)"
  origin_url="${origin_url%.git}"
  origin_url="${origin_url#git@}"
  origin_url="${origin_url#https://github.com/}"
  origin_url="${origin_url#ssh://git@github.com/}"
  origin_url="${origin_url#github.com/}"
  origin_url="${origin_url#*:}"

  printf '%s\n' "${origin_url}"
}

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

rule_schedule_expression() {
  aws events describe-rule \
    --region "${AWS_REGION}" \
    --name "${STACK_NAME}-daily-import" \
    --query 'ScheduleExpression' \
    --output text 2>/dev/null || true
}

set_repo_var() {
  local key="$1"
  local value="$2"

  if [[ -z "${value}" || "${value}" == "None" ]]; then
    echo "Omitida variable ${key}: sin valor"
    return
  fi

  if [[ "${DRY_RUN}" == "1" ]]; then
    echo "[dry-run] gh variable set ${key} -R ${GH_REPO}"
    return
  fi

  gh variable set "${key}" --repo "${GH_REPO}" --body "${value}"
  echo "Variable actualizada: ${key}"
}

set_repo_secret() {
  local key="$1"
  local value="$2"

  if [[ -z "${value}" || "${value}" == "None" ]]; then
    echo "Omitido secret ${key}: sin valor"
    return
  fi

  if [[ "${DRY_RUN}" == "1" ]]; then
    echo "[dry-run] gh secret set ${key} -R ${GH_REPO}"
    return
  fi

  printf '%s' "${value}" | gh secret set "${key}" --repo "${GH_REPO}" --body -
  echo "Secret actualizado: ${key}"
}

if [[ -z "${GH_REPO}" ]]; then
  GH_REPO="$(remote_repo)"
fi

if [[ -z "${GH_REPO}" ]]; then
  echo "No se pudo resolver GH_REPO desde git remote" >&2
  exit 1
fi

if [[ "${DRY_RUN}" != "1" ]]; then
  gh auth status >/dev/null
fi

DATABASE_URL_SECRET_ARN="$(stack_output DatabaseUrlSecretArn)"
CRON_SECRET_ARN="$(stack_output CronSecretArn)"
SUBNET_IDS="$(stack_output ScraperSubnetIds)"
MARKUP_PARAMETER_NAME="$(stack_output MarkupPercentParameterName)"
DATABASE_URL="$(secret_value "${DATABASE_URL_SECRET_ARN}")"
IMPORT_CRON_TOKEN="$(secret_value "${CRON_SECRET_ARN}")"
MARKUP_PERCENT_DEFAULT="$(
  aws ssm get-parameter \
    --region "${AWS_REGION}" \
    --name "${MARKUP_PARAMETER_NAME}" \
    --query 'Parameter.Value' \
    --output text
)"
SCHEDULE_EXPRESSION="$(rule_schedule_expression)"

set_repo_var "AWS_REGION" "${AWS_REGION}"
set_repo_var "AWS_STACK_NAME" "${STACK_NAME}"
set_repo_var "AWS_ENVIRONMENT" "${AWS_ENVIRONMENT:-prod}"
set_repo_var "AWS_ECS_SUBNET_IDS" "${SUBNET_IDS}"
set_repo_var "AWS_VPC_ID" "${AWS_VPC_ID:-}"
set_repo_var "SCRAPER_SCHEDULE_EXPRESSION" "${SCHEDULE_EXPRESSION}"
set_repo_var "MARKUP_PERCENT_DEFAULT" "${MARKUP_PERCENT_DEFAULT}"

set_repo_secret "AWS_DATABASE_URL" "${DATABASE_URL}"
set_repo_secret "IMPORT_CRON_TOKEN" "${IMPORT_CRON_TOKEN}"
set_repo_secret "AWS_GITHUB_DEPLOY_ROLE_ARN" "${AWS_GITHUB_DEPLOY_ROLE_ARN:-}"
set_repo_secret "VERCEL_TOKEN" "${VERCEL_TOKEN:-}"
set_repo_secret "VERCEL_ORG_ID" "${VERCEL_ORG_ID:-}"
set_repo_secret "VERCEL_PROJECT_ID_STOREFRONT" "${VERCEL_PROJECT_ID_STOREFRONT:-}"
set_repo_secret "VERCEL_PROJECT_ID_ADMIN" "${VERCEL_PROJECT_ID_ADMIN:-}"

echo "Sincronización GitHub completada para ${GH_REPO}"
