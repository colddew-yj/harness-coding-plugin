#!/bin/bash
# Start Hindsight server with DashScope config

export OPENAI_API_KEY="sk-sp-3e0719b158cb442f9426c6b2f173c109"
export OPENAI_BASE_URL="https://coding.dashscope.aliyuncs.com/v1"

echo "Starting Hindsight server..."
echo "API: http://localhost:8888"
echo "UI:  http://localhost:9999"
echo ""

python3 -c "
import os
from hindsight import HindsightServer, HindsightClient

print('Initializing Hindsight server with DashScope...')

with HindsightServer(
    llm_provider='openai',
    llm_model='qwen-plus',
    llm_api_key=os.environ['OPENAI_API_KEY'],
    llm_base_url=os.environ['OPENAI_BASE_URL']
) as server:
    print(f'Hindsight running at {server.url}')
    print('Press Ctrl+C to stop')
    import time
    try:
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        print('\\nStopping Hindsight...')
"
