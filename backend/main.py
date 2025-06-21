from fastapi import FastAPI, Request
from fastapi.responses import Response
from twilio.twiml.voice_response import VoiceResponse, Gather, Play
from twilio.rest import Client
from dotenv import load_dotenv
import os
import uvicorn
from urllib.parse import unquote_plus
import google.generativeai as genai
import requests
import base64
import tempfile
import asyncio
import aiohttp
from typing import Dict, Any
import json

# Load environment variables from .env
load_dotenv()

# Environment variables
TWILIO_ACCOUNT_SID = os.getenv("TWILIO_ACCOUNT_SID")
TWILIO_AUTH_TOKEN = os.getenv("TWILIO_AUTH_TOKEN")
ELEVENLABS_API_KEY = os.getenv("ELEVENLABS_API_KEY")
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
NGROK_URL = os.getenv("NGROK_URL")  # Your ngrok URL for serving audio files

# Initialize APIs
genai.configure(api_key=GEMINI_API_KEY)
twilio_client = Client(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN)

app = FastAPI()

# In-memory storage for call sessions
call_sessions: Dict[str, Dict[str, Any]] = {}

# ElevenLabs configuration
ELEVENLABS_VOICE_ID = "21m00Tcm4TlvDq8ikWAM"  # Rachel voice - change as needed
ELEVENLABS_URL = f"https://api.elevenlabs.io/v1/text-to-speech/{ELEVENLABS_VOICE_ID}"

class ConversationManager:
    def __init__(self):
        # Initialize Gemini model with conversation settings
        self.model = genai.GenerativeModel(
            model_name="gemini-1.5-flash",
            generation_config={
                "temperature": 0.7,
                "top_p": 0.8,
                "top_k": 40,
                "max_output_tokens": 150,  # Keep responses concise for phone calls
            }
        )
        
    def get_system_prompt(self) -> str:
        return """You are a friendly AI assistant taking phone calls for Bella's Bistro restaurant. 
        
        Guidelines:
        - Keep responses conversational and natural, like you're talking on the phone
        - Be helpful and answer questions about the restaurant, menu, hours, etc.
        - Keep responses under 2-3 sentences for phone conversation flow
        - If asked about orders, explain that you can help with information but they should speak to staff for actual orders
        - Be warm and welcoming, representing the restaurant well
        - If you don't know something specific about the restaurant, politely say so and offer to connect them with staff
        
        Restaurant Info:
        - Name: Bella's Bistro
        - Menu highlights: pasta dishes, fresh salads, grilled chicken, fish and chips, chocolate cake
        - This is a friendly neighborhood restaurant
        
        Remember: You're having a phone conversation, so sound natural and conversational."""

    async def get_response(self, user_input: str, conversation_history: list) -> str:
        try:
            # Build conversation context
            messages = [self.get_system_prompt()]
            
            # Add conversation history
            for entry in conversation_history[-6:]:  # Keep last 6 exchanges to manage context
                messages.append(f"Customer: {entry['user']}")
                messages.append(f"Assistant: {entry['assistant']}")
            
            # Add current user input
            messages.append(f"Customer: {user_input}")
            
            # Generate response
            full_prompt = "\n".join(messages)
            response = await asyncio.to_thread(self.model.generate_content, full_prompt)
            
            return response.text.strip()
            
        except Exception as e:
            print(f"Error generating response: {e}")
            return "I'm having trouble understanding right now. Could you please repeat that?"

# Global conversation manager
conversation_manager = ConversationManager()

async def generate_speech(text: str, call_sid: str) -> str:
    """Generate speech using ElevenLabs and return URL to audio file"""
    try:
        headers = {
            "Accept": "audio/mpeg",
            "Content-Type": "application/json",
            "xi-api-key": ELEVENLABS_API_KEY
        }
        
        data = {
            "text": text,
            "model_id": "eleven_monolingual_v1",
            "voice_settings": {
                "stability": 0.5,
                "similarity_boost": 0.5
            }
        }
        
        async with aiohttp.ClientSession() as session:
            async with session.post(ELEVENLABS_URL, json=data, headers=headers) as response:
                if response.status == 200:
                    audio_content = await response.read()
                    
                    # Save audio file temporarily (in production, use cloud storage)
                    audio_filename = f"audio_{call_sid}_{len(call_sessions.get(call_sid, {}).get('conversation_history', []))}.mp3"
                    audio_path = f"temp_audio/{audio_filename}"
                    
                    # Create temp directory if it doesn't exist
                    os.makedirs("temp_audio", exist_ok=True)
                    
                    with open(audio_path, "wb") as f:
                        f.write(audio_content)
                    
                    # Return URL where Twilio can access the file
                    return f"{NGROK_URL}/audio/{audio_filename}"
                else:
                    print(f"ElevenLabs API error: {response.status}")
                    return None
                    
    except Exception as e:
        print(f"Error generating speech: {e}")
        return None

@app.get("/audio/{filename}")
async def serve_audio(filename: str):
    """Serve audio files to Twilio"""
    try:
        audio_path = f"temp_audio/{filename}"
        if os.path.exists(audio_path):
            with open(audio_path, "rb") as f:
                audio_content = f.read()
            return Response(content=audio_content, media_type="audio/mpeg")
        else:
            return Response(status_code=404)
    except Exception as e:
        print(f"Error serving audio: {e}")
        return Response(status_code=500)

@app.post("/twilio/incoming-call")
async def incoming_call(request: Request):
    form = await request.form()
    call_sid = form.get("CallSid")
    to_number = form.get("To")
    from_number = form.get("From")

    print(f"Incoming call from {from_number} to {to_number}")

    # Initialize session for this call
    call_sessions[call_sid] = {
        "phone": from_number,
        "conversation_history": [],
        "current_step": "greeting"
    }

    resp = VoiceResponse()
    
    # Welcome message
    welcome_text = "Hello! Thank you for calling Bella's Bistro. I'm your AI assistant and I'm here to help answer any questions you might have about our restaurant. How can I help you today?"
    
    # Try to generate speech with ElevenLabs
    audio_url = await generate_speech(welcome_text, call_sid)
    
    if audio_url:
        gather = Gather(
            input='speech',
            timeout=5,
            speech_timeout='auto',
            action='/twilio/process-speech',
            method='POST'
        )
        gather.play(audio_url)
        resp.append(gather)
    else:
        # Fallback to Twilio TTS
        gather = Gather(
            input='speech',
            timeout=5,
            speech_timeout='auto',
            action='/twilio/process-speech',
            method='POST'
        )
        gather.say(welcome_text, voice="Polly.Joanna", language="en-US")
        resp.append(gather)
    
    # Fallback if no input
    resp.say("I didn't catch that. Please let me know how I can help you.", voice="Polly.Joanna")
    
    return Response(content=str(resp), media_type="application/xml")

@app.post("/twilio/process-speech")
async def process_speech(request: Request):
    form = await request.form()
    call_sid = form.get("CallSid")
    speech_result = form.get("SpeechResult", "")
    
    user_input = unquote_plus(speech_result) if speech_result else ""
    print(f"User said: {user_input}")
    
    resp = VoiceResponse()
    
    # Get current session
    session = call_sessions.get(call_sid, {})
    if not session:
        resp.say("I'm sorry, there was an issue with your call. Please try calling again.", voice="Polly.Joanna")
        resp.hangup()
        return Response(content=str(resp), media_type="application/xml")
    
    conversation_history = session.get("conversation_history", [])
    
    if not user_input.strip():
        # No input received
        if len(conversation_history) == 0:
            # First interaction, be more welcoming
            fallback_text = "I didn't catch what you said. Could you please tell me how I can help you today? You can ask me about our menu, hours, or anything else about Bella's Bistro."
        else:
            fallback_text = "I didn't hear you clearly. Could you please repeat that?"
        
        audio_url = await generate_speech(fallback_text, call_sid)
        
        gather = Gather(
            input='speech',
            timeout=5,
            speech_timeout='auto',
            action='/twilio/process-speech',
            method='POST'
        )
        
        if audio_url:
            gather.play(audio_url)
        else:
            gather.say(fallback_text, voice="Polly.Joanna")
        
        resp.append(gather)
        resp.say("Thank you for calling Bella's Bistro. Have a great day!", voice="Polly.Joanna")
        return Response(content=str(resp), media_type="application/xml")
    
    # Check for goodbye/hangup intent
    goodbye_keywords = ["goodbye", "bye", "thank you", "thanks", "that's all", "hang up", "end call"]
    if any(keyword in user_input.lower() for keyword in goodbye_keywords) and len(user_input.split()) <= 3:
        goodbye_text = "Thank you for calling Bella's Bistro! Have a wonderful day!"
        
        audio_url = await generate_speech(goodbye_text, call_sid)
        if audio_url:
            resp.play(audio_url)
        else:
            resp.say(goodbye_text, voice="Polly.Joanna")
        
        resp.hangup()
        
        # Clean up session
        if call_sid in call_sessions:
            del call_sessions[call_sid]
        
        return Response(content=str(resp), media_type="application/xml")
    
    # Generate AI response
    try:
        ai_response = await conversation_manager.get_response(user_input, conversation_history)
        
        # Update conversation history
        conversation_history.append({
            "user": user_input,
            "assistant": ai_response
        })
        session["conversation_history"] = conversation_history
        call_sessions[call_sid] = session
        
        print(f"AI Response: {ai_response}")
        
        # Generate speech
        audio_url = await generate_speech(ai_response, call_sid)
        
        # Continue conversation
        gather = Gather(
            input='speech',
            timeout=8,  # Longer timeout for conversation
            speech_timeout='auto',
            action='/twilio/process-speech',
            method='POST'
        )
        
        if audio_url:
            gather.play(audio_url)
        else:
            gather.say(ai_response, voice="Polly.Joanna")
        
        resp.append(gather)
        
        # Fallback after timeout
        resp.say("Thank you for calling Bella's Bistro. If you need anything else, please call us back!", voice="Polly.Joanna")
        
    except Exception as e:
        print(f"Error processing speech: {e}")
        error_text = "I apologize, I'm having some technical difficulties. Please try calling back in a moment."
        resp.say(error_text, voice="Polly.Joanna")
        resp.hangup()
    
    return Response(content=str(resp), media_type="application/xml")

@app.post("/twilio/call-status")
async def call_status(request: Request):
    """Handle call status updates"""
    form = await request.form()
    call_sid = form.get("CallSid")
    call_status = form.get("CallStatus")
    
    print(f"Call {call_sid} status: {call_status}")
    
    # Clean up session and audio files when call ends
    if call_status in ["completed", "busy", "no-answer", "failed", "canceled"]:
        if call_sid in call_sessions:
            session = call_sessions[call_sid]
            print("=" * 50)
            print("CALL SUMMARY:")
            print(f"Phone Number: {session.get('phone', 'Unknown')}")
            print(f"Conversation Length: {len(session.get('conversation_history', []))} exchanges")
            for i, exchange in enumerate(session.get('conversation_history', [])[-3:], 1):  # Show last 3 exchanges
                print(f"Exchange {i}:")
                print(f"  Customer: {exchange['user']}")
                print(f"  Assistant: {exchange['assistant']}")
            print("=" * 50)
            
            del call_sessions[call_sid]
        
        # Clean up audio files for this call (optional - you might want to keep them)
        try:
            import glob
            audio_files = glob.glob(f"temp_audio/audio_{call_sid}_*.mp3")
            for file in audio_files:
                os.remove(file)
                print(f"Cleaned up audio file: {file}")
        except Exception as e:
            print(f"Error cleaning up audio files: {e}")
    
    return Response(content="OK", media_type="text/plain")

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "active_calls": len(call_sessions)}

if __name__ == "__main__":
    # Create temp audio directory
    os.makedirs("temp_audio", exist_ok=True)
    print("Starting AI Phone Agent...")
    print(f"Active sessions will be stored in memory")
    print(f"Audio files will be temporarily stored in temp_audio/")
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)