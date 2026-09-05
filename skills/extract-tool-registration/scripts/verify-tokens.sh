#!/usr/bin/env bash
# 批量验证 BibiGPT API Token 有效性（不消耗 API 余额）
# 用法: verify-tokens.sh <accounts.tsv>
# 输入文件格式（两列，tab 或空格分隔）:
#   vidnote.test01@gmail.com TedrO2sLx9Wj
# 判据: HTTP 400 = 有效; HTTP 401 = 无效

set -u
INPUT="${1:?用法: verify-tokens.sh <accounts.tsv>}"
API="${BIBIGPT_API:-https://api.bibigpt.co/api/v1/express}"

pass=0
fail=0
while read -r email token rest; do
  [ -z "$email" ] && continue
  [ -z "$token" ] && continue
  code=$(curl -s --max-time 15 -o /tmp/_bibigpt_verify.json -w "%{http_code}" \
    "$API" -H "Authorization: Bearer $token" 2>/dev/null)
  msg=$(python3 -c "import json;d=json.load(open('/tmp/_bibigpt_verify.json'));print(d.get('message','')[:40])" 2>/dev/null || echo '?')
  if [ "$code" = "400" ]; then
    printf 'OK    %s | %s | HTTP %s\n' "$email" "$token" "$code"
    pass=$((pass+1))
  elif [ "$code" = "401" ]; then
    printf 'FAIL  %s | %s | HTTP %s | %s\n' "$email" "$token" "$code" "$msg"
    fail=$((fail+1))
  else
    printf 'OTHER %s | %s | HTTP %s | %s\n' "$email" "$token" "$code" "$msg"
    fail=$((fail+1))
  fi
done < "$INPUT"

echo "---"
echo "有效: $pass  无效/异常: $fail"
[ "$fail" -eq 0 ]
