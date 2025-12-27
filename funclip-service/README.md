# FunClip Service for RepurposeAI

This service provides video speech recognition and intelligent clip extraction using FunClip.

## Setup

1. Install Modal.com CLI:
```bash
pip install modal
modal token new
```

2. Deploy the service:
```bash
modal deploy app.py
```

## API Endpoints

### POST /recognize
Transcribe video with timestamps.

### POST /clip
Extract clips based on text selection.

### POST /ai-clip
Use LLM to automatically select best clips.
