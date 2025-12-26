#!/bin/bash

# Check if logged in
if ! vercel whoami &> /dev/null; then
    echo "⚠️  You are not logged in to Vercel."
    echo "👉 Please run 'vercel login' first, then re-run this script."
    exit 1
fi

echo "🚀 Uploading Firebase Environment Variables to Vercel..."

# Function to add env var to all environments
add_env() {
    local name=$1
    local value=$2
    echo "   ➕ Adding $name..."
    echo "$value" | vercel env add "$name" production 2>/dev/null || true
    echo "$value" | vercel env add "$name" preview 2>/dev/null || true
    echo "$value" | vercel env add "$name" development 2>/dev/null || true
}

# Firebase Config
add_env "NEXT_PUBLIC_FIREBASE_API_KEY" "AIzaSyBamkHoUIZAZ53MZcHVevDT06ISnoQYGlI"
add_env "NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN" "repurpose-ai-project.firebaseapp.com"
add_env "NEXT_PUBLIC_FIREBASE_PROJECT_ID" "repurpose-ai-project"
add_env "NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET" "repurpose-ai-project.firebasestorage.app"
add_env "NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID" "196155230578"
add_env "NEXT_PUBLIC_FIREBASE_APP_ID" "1:196155230578:web:66604420dbba6d399d75eb"

echo "✅ All Firebase variables uploaded successfully!"
echo "👉 Now run 'vercel deploy --prod' to redeploy with new env vars!"
