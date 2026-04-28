#!/bin/bash
# Start Hindsight server
# Required environment variables:
#   OPENAI_API_KEY - Your LLM API key
#   OPENAI_BASE_URL - API base URL (e.g., https://coding.dashscope.aliyuncs.com/v1)

cd "$(dirname "$0")/.."

nohup python3 << 'PYEOF' > hindsight/hindsight.log 2>&1 &
import os, sys, time
from hindsight import HindsightServer

print("Starting Hindsight on port 8888...")

with HindsightServer(
    llm_provider="openai",
    llm_model=os.environ.get("HINDSIGHT_MODEL", "qwen3.6-plus"),
    llm_api_key=os.environ["OPENAI_API_KEY"],
    llm_base_url=os.environ["OPENAI_BASE_URL"],
    port=8888
) as server:
    print(f"Hindsight running at {server.url}")
    with open("hindsight/server.pid", "w") as f:
        f.write(str(os.getpid()))
    while True:
        time.sleep(1)
PYEOF

echo $! > hindsight/server.pid
echo "Started PID $(cat hindsight/server.pid)"
