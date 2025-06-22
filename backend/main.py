from fastapi import FastAPI, Request
from fastapi.responses import Response
from twilio.twiml.voice_response import VoiceResponse, Gather
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
import pymupdf

# Function to extract text from PDF using PyMuPDF
def extract_text_from_pdf(fname):
    with pymupdf.open(fname) as doc:
        text = chr(12).join([page.get_text() for page in doc])
    return text

faq_content = extract_text_from_pdf("Osmows_Shawa_Knowledge_Base_Extended.pdf")

load_dotenv()
TWILIO_ACCOUNT_SID = os.getenv("TWILIO_ACCOUNT_SID")
TWILIO_AUTH_TOKEN = os.getenv("TWILIO_AUTH_TOKEN")
ELEVENLABS_API_KEY = os.getenv("ELEVENLABS_API_KEY")
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
NGROK_URL = os.getenv("NGROK_URL")

genai.configure(api_key=GEMINI_API_KEY)
twilio_client = Client(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN)

app = FastAPI()

call_sessions: Dict[str, Dict[str, Any]] = {}

ELEVENLABS_VOICE_ID = "21m00Tcm4TlvDq8ikWAM"
ELEVENLABS_URL = f"https://api.elevenlabs.io/v1/text-to-speech/{ELEVENLABS_VOICE_ID}"

DEFAULT_BUSINESS_NAME = "Osmow's Shawarma"
DEFAULT_FAQ_CONTENT = faq_content


class ConversationManager:
    def __init__(self):
        self.model = genai.GenerativeModel(
            model_name="gemini-1.5-flash",
            generation_config={
                "temperature": 0.7,
                "top_p": 0.8,
                "top_k": 40,
                "max_output_tokens": 150,
            }
        )

    def get_system_prompt(self, business_name: str, faq_content: str) -> str:
        return f"""You are an AI assistant handling phone calls on behalf of {business_name}. 
            Your role is to engage the caller in a helpful, friendly, and professional manner, as if you are a real human receptionist.

            Instructions:
            - Speak in a natural, conversational tone, as if you're on the phone.
            - Keep responses short (1–3 sentences) to allow for a smooth back-and-forth.
            - Greet the caller, answer questions, and provide information clearly.
            - If a question is unclear, politely ask them to repeat or clarify.
            - If you don’t know the answer to something, let them know and offer to connect them to a staff member.
            - Never hang up unless the user says things like “goodbye”, “that’s all”, or “thank you”.
            - Don’t use labels like “Assistant:” or “Customer:” in your responses.
            - Avoid repeating information unless asked to.
            - Always represent {business_name} in a welcoming and professional way.

            Business Knowledge:
            {faq_content}
            """

    async def get_response(self, user_input: str, conversation_history: list, business_name: str, faq_content: str) -> str:
        try:
            messages = [self.get_system_prompt(business_name, faq_content)]
            for entry in conversation_history[-6:]:
                messages.append(f"Customer: {entry['user']}")
                messages.append(f"Assistant: {entry['assistant']}")
            messages.append(f"Customer: {user_input}")
            full_prompt = "\n".join(messages)
            response = await asyncio.to_thread(self.model.generate_content, full_prompt)
            return response.text.strip()
        except Exception as e:
            print(f"Error generating response: {e}")
            return "I'm having trouble understanding right now. Could you please repeat that?"

conversation_manager = ConversationManager()


async def generate_speech(text: str, call_sid: str) -> str:
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
                    audio_filename = f"audio_{call_sid}_{len(call_sessions.get(call_sid, {}).get('conversation_history', []))}.mp3"
                    audio_path = f"temp_audio/{audio_filename}"
                    os.makedirs("temp_audio", exist_ok=True)
                    with open(audio_path, "wb") as f:
                        f.write(audio_content)
                    return f"{NGROK_URL}/audio/{audio_filename}"
                else:
                    print(f"ElevenLabs API error: {response.status}")
                    return None
    except Exception as e:
        print(f"Error generating speech: {e}")
        return None


@app.get("/audio/{filename}")
async def serve_audio(filename: str):
    audio_path = f"temp_audio/{filename}"
    if os.path.exists(audio_path):
        with open(audio_path, "rb") as f:
            return Response(content=f.read(), media_type="audio/mpeg")
    return Response(status_code=404)


@app.post("/twilio/incoming-call")
async def incoming_call(request: Request):
    form = await request.form()
    call_sid = form.get("CallSid")
    to_number = form.get("To")
    from_number = form.get("From")

    print(f"Incoming call from {from_number} to {to_number}")

    business_name = DEFAULT_BUSINESS_NAME
    faq_content = DEFAULT_FAQ_CONTENT

    call_sessions[call_sid] = {
        "phone": from_number,
        "conversation_history": [],
        "current_step": "greeting",
        "business_name": business_name,
        "faq_content": faq_content
    }

    welcome_text = f"Hello! Thank you for calling {business_name}. I'm your AI assistant. How can I help you today?"
    audio_url = await generate_speech(welcome_text, call_sid)

    resp = VoiceResponse()
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
        gather.say(welcome_text, voice="Polly.Joanna")
    resp.append(gather)
    resp.say(f"I didn't catch that. Please let me know how I can help you.", voice="Polly.Joanna")

    return Response(content=str(resp), media_type="application/xml")


@app.post("/twilio/process-speech")
async def process_speech(request: Request):
    form = await request.form()
    call_sid = form.get("CallSid")
    speech_result = form.get("SpeechResult", "")
    user_input = unquote_plus(speech_result) if speech_result else ""
    print(f"User said: {user_input}")

    resp = VoiceResponse()
    session = call_sessions.get(call_sid, {})
    if not session:
        resp.say("I'm sorry, there was an issue with your call. Please try calling again.", voice="Polly.Joanna")
        resp.hangup()
        return Response(content=str(resp), media_type="application/xml")

    business_name = session.get("business_name", DEFAULT_BUSINESS_NAME)
    faq_content = session.get("faq_content", DEFAULT_FAQ_CONTENT)
    conversation_history = session.get("conversation_history", [])

    if not user_input.strip():
        fallback_text = "I didn't catch what you said. Could you please repeat that?"
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
        resp.say(f"Thank you for calling {business_name}. Have a great day!", voice="Polly.Joanna")
        return Response(content=str(resp), media_type="application/xml")
    
    exit_keywords = ["goodbye", "bye", "hang up", "that's all", "that’s all for now", "thank you", "thanks", "no more questions", "i'm done", "i'm finished", "i'm good", "i'm okay", "i'm all set", "i'm satisfied"]
    exit_intent = any(kw in user_input.lower() for kw in exit_keywords)


    if exit_intent:
        goodbye_text = f"Thank you for calling {business_name}! Have a wonderful day!"
        audio_url = await generate_speech(goodbye_text, call_sid)
        if audio_url:
            resp.play(audio_url)
        else:
            resp.say(goodbye_text, voice="Polly.Joanna")
        resp.hangup()
        del call_sessions[call_sid]
        return Response(content=str(resp), media_type="application/xml")

    try:
        ai_response = await conversation_manager.get_response(
            user_input,
            conversation_history,
            business_name=business_name,
            faq_content=faq_content
        )
        conversation_history.append({"user": user_input, "assistant": ai_response})
        session["conversation_history"] = conversation_history
        call_sessions[call_sid] = session

        print(f"AI Response: {ai_response}")
        audio_url = await generate_speech(ai_response, call_sid)
        gather = Gather(
            input='speech',
            timeout=8,
            speech_timeout='auto',
            action='/twilio/process-speech',
            method='POST'
        )
        if audio_url:
            gather.play(audio_url)
        else:
            gather.say(ai_response, voice="Polly.Joanna")
        resp.append(gather)
        resp.say(f"Thank you for calling {business_name}. If you need anything else, please call us back!", voice="Polly.Joanna")
    except Exception as e:
        print(f"Error processing speech: {e}")
        resp.say("I'm having some technical difficulties. Please try calling again later.", voice="Polly.Joanna")
        resp.hangup()

    return Response(content=str(resp), media_type="application/xml")


@app.post("/twilio/call-status")
async def call_status(request: Request):
    form = await request.form()
    call_sid = form.get("CallSid")
    call_status = form.get("CallStatus")

    print(f"Call {call_sid} status: {call_status}")

    if call_status in ["completed", "busy", "no-answer", "failed", "canceled"]:
        if call_sid in call_sessions:
            session = call_sessions[call_sid]
            print("=" * 50)
            print("CALL SUMMARY:")
            print(f"Phone Number: {session.get('phone', 'Unknown')}")
            print(f"Conversation Length: {len(session.get('conversation_history', []))} exchanges")
            for i, exchange in enumerate(session.get('conversation_history', [])[-3:], 1):
                print(f"Exchange {i}:")
                print(f"  Customer: {exchange['user']}")
                print(f"  Assistant: {exchange['assistant']}")
            print("=" * 50)
            del call_sessions[call_sid]
        try:
            import glob
            audio_files = glob.glob(f"temp_audio/audio_{call_sid}_*.mp3")
            for file in audio_files:
                os.remove(file)
                print(f"Deleted audio file: {file}")
        except Exception as e:
            print(f"Audio cleanup error: {e}")

    return Response(content="OK", media_type="text/plain")


@app.get("/health")
async def health_check():
    return {"status": "healthy", "active_calls": len(call_sessions)}


if __name__ == "__main__":
    os.makedirs("temp_audio", exist_ok=True)
    print("Starting AI Phone Agent...")
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
