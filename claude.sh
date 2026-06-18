export ANTHROPIC_BASE_URL="https://api.deepseek.com/anthropic"
export ANTHROPIC_AUTH_TOKEN="sk-8d0b08a8d4344e99ba6172bcd52df0f9"
export ANTHROPIC_MODEL="deepseek-v4-pro[1m]"
exec claude --model deepseek-v4-pro[1m] "$@"