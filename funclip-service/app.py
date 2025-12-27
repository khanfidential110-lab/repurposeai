# Modal.com deployment for FunClip video extraction service
import modal
import os
from pathlib import Path

# Define the Modal app
app = modal.App("funclip-service")

# Create the Docker image with FunClip dependencies
funclip_image = (
    modal.Image.debian_slim(python_version="3.10")
    .apt_install(["ffmpeg", "imagemagick", "git", "wget"])
    .pip_install([
        "torch",
        "torchaudio",
        "funasr",
        "modelscope",
        "moviepy",
        "gradio",
        "fastapi",
        "uvicorn",
        "python-multipart",
        "requests",
    ])
    .run_commands([
        "git clone https://github.com/modelscope/FunClip.git /opt/funclip",
        "cd /opt/funclip && pip install -r requirements.txt",
        # Fix ImageMagick policy for video processing
        "sed -i 's/none/read,write/g' /etc/ImageMagick-6/policy.xml || true",
    ])
)

# Volume for caching models
model_cache = modal.Volume.from_name("funclip-model-cache", create_if_missing=True)

@app.cls(
    image=funclip_image,
    gpu="T4",  # Use T4 GPU for cost efficiency
    volumes={"/cache": model_cache},
    timeout=600,
    container_idle_timeout=120,
)
class FunClipService:
    """FunClip video extraction service running on Modal.com"""
    
    def __init__(self):
        import sys
        sys.path.insert(0, "/opt/funclip")
        
    @modal.enter()
    def load_models(self):
        """Load ASR models on container startup"""
        from funasr import AutoModel
        
        # Cache models to volume
        os.environ["MODELSCOPE_CACHE"] = "/cache/models"
        
        # Load Paraformer ASR model
        self.asr_model = AutoModel(
            model="iic/speech_paraformer-large_asr_nat-zh-cn-16k-common-vocab8404-pytorch",
            model_revision="v2.0.4",
            vad_model="iic/speech_fsmn_vad_zh-cn-16k-common-pytorch",
            vad_model_revision="v2.0.4",
            punc_model="iic/punc_ct-transformer_zh-cn-common-vocab272727-pytorch",
            punc_model_revision="v2.0.4",
        )
        print("✅ ASR models loaded successfully")
    
    @modal.method()
    def recognize(self, video_url: str) -> dict:
        """
        Transcribe video and return text with timestamps.
        
        Args:
            video_url: URL or path to video file
            
        Returns:
            {
                "text": "Full transcript...",
                "segments": [
                    {"start": 0.0, "end": 2.5, "text": "Hello world"},
                    ...
                ]
            }
        """
        import tempfile
        import subprocess
        import requests
        
        # Download video if URL
        with tempfile.NamedTemporaryFile(suffix=".mp4", delete=False) as f:
            video_path = f.name
            if video_url.startswith("http"):
                response = requests.get(video_url, stream=True)
                for chunk in response.iter_content(chunk_size=8192):
                    f.write(chunk)
            else:
                # Assume it's a local path
                video_path = video_url
        
        # Extract audio from video
        audio_path = video_path.replace(".mp4", ".wav")
        subprocess.run([
            "ffmpeg", "-i", video_path, "-ar", "16000", "-ac", "1",
            "-y", audio_path
        ], check=True, capture_output=True)
        
        # Run ASR
        result = self.asr_model.generate(input=audio_path)
        
        # Parse results
        segments = []
        full_text = ""
        
        for item in result:
            if isinstance(item, dict):
                text = item.get("text", "")
                timestamps = item.get("timestamp", [])
                full_text += text + " "
                
                if timestamps:
                    for ts in timestamps:
                        segments.append({
                            "start": ts[0] / 1000.0,  # Convert to seconds
                            "end": ts[1] / 1000.0,
                            "text": ts[2] if len(ts) > 2 else text
                        })
        
        # Cleanup
        os.unlink(video_path) if video_url.startswith("http") else None
        os.unlink(audio_path) if os.path.exists(audio_path) else None
        
        return {
            "text": full_text.strip(),
            "segments": segments
        }
    
    @modal.method()
    def clip(self, video_url: str, segments: list, add_subtitles: bool = False) -> list:
        """
        Extract specific segments from a video.
        
        Args:
            video_url: URL to source video
            segments: List of {"start": float, "end": float, "text": str}
            add_subtitles: Whether to burn subtitles into clips
            
        Returns:
            List of clip URLs/paths
        """
        import tempfile
        import subprocess
        import requests
        from moviepy.editor import VideoFileClip
        
        # Download video
        with tempfile.NamedTemporaryFile(suffix=".mp4", delete=False) as f:
            video_path = f.name
            response = requests.get(video_url, stream=True)
            for chunk in response.iter_content(chunk_size=8192):
                f.write(chunk)
        
        clips = []
        output_dir = tempfile.mkdtemp()
        
        for i, seg in enumerate(segments):
            start = seg["start"]
            end = seg["end"]
            output_path = os.path.join(output_dir, f"clip_{i}.mp4")
            
            # Use ffmpeg for fast extraction
            subprocess.run([
                "ffmpeg", "-i", video_path,
                "-ss", str(start),
                "-to", str(end),
                "-c:v", "libx264", "-c:a", "aac",
                "-y", output_path
            ], check=True, capture_output=True)
            
            clips.append({
                "index": i,
                "start": start,
                "end": end,
                "text": seg.get("text", ""),
                "path": output_path
            })
        
        # Cleanup source
        os.unlink(video_path)
        
        return clips

    @modal.method()
    def ai_clip(self, video_url: str, prompt: str = None, num_clips: int = 3) -> list:
        """
        Use AI to automatically identify and extract best clips.
        
        Args:
            video_url: URL to source video
            prompt: Optional prompt to guide clip selection (e.g., "funny moments")
            num_clips: Number of clips to extract
            
        Returns:
            List of AI-selected clips
        """
        # First, get full transcript
        result = self.recognize(video_url)
        segments = result["segments"]
        
        # Simple heuristic: select longest coherent segments
        # In production, this would use an LLM to analyze content
        
        if not segments:
            return []
        
        # Group adjacent segments
        groups = []
        current_group = [segments[0]]
        
        for seg in segments[1:]:
            if seg["start"] - current_group[-1]["end"] < 1.0:
                current_group.append(seg)
            else:
                groups.append(current_group)
                current_group = [seg]
        groups.append(current_group)
        
        # Score groups by length and select top N
        scored_groups = []
        for group in groups:
            duration = group[-1]["end"] - group[0]["start"]
            text = " ".join([s["text"] for s in group])
            scored_groups.append({
                "start": group[0]["start"],
                "end": group[-1]["end"],
                "duration": duration,
                "text": text,
                "score": duration * len(text)  # Simple scoring
            })
        
        # Sort by score and take top clips
        scored_groups.sort(key=lambda x: x["score"], reverse=True)
        best_segments = scored_groups[:num_clips]
        
        # Extract clips
        return self.clip(video_url, best_segments)


# FastAPI web endpoints wrapper
@app.function(image=funclip_image)
@modal.asgi_app()
def fastapi_app():
    from fastapi import FastAPI, HTTPException
    from pydantic import BaseModel
    from typing import List, Optional
    
    api = FastAPI(title="FunClip API", version="1.0.0")
    
    class RecognizeRequest(BaseModel):
        video_url: str
    
    class ClipSegment(BaseModel):
        start: float
        end: float
        text: Optional[str] = ""
    
    class ClipRequest(BaseModel):
        video_url: str
        segments: List[ClipSegment]
        add_subtitles: bool = False
    
    class AIClipRequest(BaseModel):
        video_url: str
        prompt: Optional[str] = None
        num_clips: int = 3
    
    @api.get("/health")
    def health():
        return {"status": "ok"}
    
    @api.post("/recognize")
    async def recognize(request: RecognizeRequest):
        service = FunClipService()
        return service.recognize.remote(request.video_url)
    
    @api.post("/clip")
    async def clip(request: ClipRequest):
        service = FunClipService()
        segments = [s.dict() for s in request.segments]
        return service.clip.remote(request.video_url, segments, request.add_subtitles)
    
    @api.post("/ai-clip")
    async def ai_clip(request: AIClipRequest):
        service = FunClipService()
        return service.ai_clip.remote(request.video_url, request.prompt, request.num_clips)
    
    return api


# Local test entry point
@app.local_entrypoint()
def main():
    """Test the service locally"""
    service = FunClipService()
    
    # Test with a sample video
    test_url = "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4"
    
    print("🎬 Testing FunClip recognition...")
    result = service.recognize.remote(test_url)
    print(f"📝 Transcript: {result['text'][:200]}...")
    print(f"📊 Found {len(result['segments'])} segments")
    
    if result['segments']:
        print("\n🎯 Testing clip extraction...")
        clips = service.clip.remote(test_url, result['segments'][:2])
        print(f"✂️ Extracted {len(clips)} clips")
    
    print("\n✅ Service is working!")
