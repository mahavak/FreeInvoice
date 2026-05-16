#!/bin/bash
# FreeInvoice LLM Server Startup Script
# Starts the Qwen 3.5 27B model server for AI assistant features

set -e  # Exit on any error

echo "🚀 Starting FreeInvoice LLM Server (Qwen 3.5 27B)"
echo "================================================"

# Configuration
MODEL_PATH="${HOME}/models/Qwen_Qwen3.5-27B-Q4_K_M.gguf"
PORT=8000
HOST="0.0.0.0"
LOG_FILE="${HOME}/freeinvoice/logs/llm-server.log"

# Ensure logs directory exists
mkdir -p "$(dirname "$LOG_FILE")"

# Check if model exists
if [ ! -f "$MODEL_PATH" ]; then
    echo "❌ Model not found at: $MODEL_PATH"
    echo "   Please download the Qwen 3.5 27B GGUF model first"
    exit 1
fi

echo "📂 Model: $MODEL_PATH"
echo "🌐 Server: http://$HOST:$PORT"
echo "📝 Logs: $LOG_FILE"
echo ""

# Start the server using llama.cpp
echo "🔥 Loading model and starting server..."
echo "   (This may take a moment to load the 27B model)"

# Using llama.cpp server - adjust path if needed
LLAMA_CPP_SERVER="${HOME}/llama.cpp/server"

if [ -f "$LLAMA_CPP_SERVER" ]; then
    "$LLAMA_CPP_SERVER" \
        -m "$MODEL_PATH" \
        --host "$HOST" \
        --port "$PORT" \
        --ctx-size 4096 \
        --batch-size 512 \
        --threads 8 \
        --log-disable \
  2>&1 | tee -a "$LOG_FILE" &
else
    # Fallback to direct python execution if llama.cpp not found
    echo "⚠️  llama.cpp server not found at $LLAMA_CPP_SERVER"
    echo "   Trying alternative installation methods..."
    
    # Check if we can use mlx_lm or other alternatives
    if command -v python3 &> /dev/null; then
        echo "🐍 Starting Python-based LLM server..."
        cd "$HOME/freeinvoice" && python3 -m vllm.server \
            --model "$MODEL_PATH" \
            --host "$HOST" \
            --port "$PORT" \
            --tensor-parallel-size 1 \
            --dtype auto \
            2>&1 | tee -a "$LOG_FILE" &
    else
        echo "❌ Cannot find suitable LLM server implementation"
        echo "   Please install llama.cpp or vllm"
        exit 1
    fi
fi

SERVER_PID=$!
echo ""
echo "✅ Server started with PID: $SERVER_PID"
echo "📡 Listening on http://$HOST:$PORT"
echo "💡 Health check: curl http://$HOST:$PORT/v1/models"
echo "📋 View logs: tail -f $LOG_FILE"
echo ""
echo "Press Ctrl+C to stop the server"

# Wait for the server process
wait $SERVER_PID