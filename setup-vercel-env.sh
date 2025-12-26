#!/bin/bash

# Check if logged in
if ! vercel whoami &> /dev/null; then
    echo "⚠️  You are not logged in to Vercel."
    echo "👉 Please run 'vercel login' first, then re-run this script."
    exit 1
fi

# Link project if not linked
if [ ! -d .vercel ]; then
    echo "🔗 Linking functionality..."
    vercel link --yes
fi

echo "🚀 Uploading Environment Variables from .env.local..."

# Read .env.local line by line
while IFS='=' read -r key value || [ -n "$key" ]; do
    # Skip comments and empty lines
    [[ $key =~ ^#.*$ ]] && continue
    [[ -z $key ]] && continue
    
    # Trim whitespace
    key=$(echo $key | xargs)
    value=$(echo $value | xargs)
    
    # Skip if value is empty
    if [ -z "$value" ]; then
        continue
    fi
    
    echo "   ➕ Adding $key..."
    # Add to all environments (Production, Preview, Development)
    echo "$value" | vercel env add "$key" production >> /dev/null 2>&1 &
    echo "$value" | vercel env add "$key" preview >> /dev/null 2>&1 &
    echo "$value" | vercel env add "$key" development >> /dev/null 2>&1 &
    
done < .env.local

wait
echo "✅ All variables uploaded successfully!"
echo "👉 Now run 'vercel deploy --prod' to go live!"
