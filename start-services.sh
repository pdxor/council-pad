#!/bin/bash

# 🏛 CouncilPAD - Start Services
# Run this script to start both the web app and NFC service

echo "🏛  Starting CouncilPAD Services"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Kill any existing processes
echo "🧹 Cleaning up old processes..."
pkill -f councilpad-service 2>/dev/null
pkill -f "next-server" 2>/dev/null
sleep 2

# Start web app in background
echo "🌐 Starting web app on http://localhost:3000..."
cd /Users/kahlilcalavas/Desktop/council-of-elders
npm run dev > /tmp/councilpad-web.log 2>&1 &
WEB_PID=$!
echo "   PID: $WEB_PID"

# Wait a bit for web app to start
sleep 3

# Start NFC service in background
echo "📡 Starting NFC service..."
cd /Users/kahlilcalavas/Desktop/council-of-elders/nfc-service
node councilpad-service.js > /tmp/councilpad-nfc.log 2>&1 &
NFC_PID=$!
echo "   PID: $NFC_PID"

# Wait a bit for NFC service to connect
sleep 2

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ Services Started!"
echo ""
echo "📊 Status:"
echo "   🌐 Web App:     http://localhost:3000 (PID: $WEB_PID)"
echo "   📡 NFC Service: Running (PID: $NFC_PID)"
echo ""
echo "📝 Logs:"
echo "   Web:  tail -f /tmp/councilpad-web.log"
echo "   NFC:  tail -f /tmp/councilpad-nfc.log"
echo ""
echo "🏷️  Now tap your NFC tag!"
echo ""
echo "🛑 To stop services:"
echo "   kill $WEB_PID $NFC_PID"
echo ""

