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
from datetime import datetime, timedelta
import time
import re
from supabase import create_client, Client as SupabaseClient

load_dotenv()
TWILIO_ACCOUNT_SID = os.getenv("TWILIO_ACCOUNT_SID")
TWILIO_AUTH_TOKEN = os.getenv("TWILIO_AUTH_TOKEN")
ELEVENLABS_API_KEY = os.getenv("ELEVENLABS_API_KEY")
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
NGROK_URL = os.getenv("NGROK_URL")
SUPABASE_URL=os.getenv("SUPABASE_URL")
SUPABASE_KEY= os.getenv("SUPABASE_KEY")

genai.configure(api_key=GEMINI_API_KEY)
twilio_client = Client(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN)
supabase: SupabaseClient = create_client(SUPABASE_URL, SUPABASE_KEY)
app = FastAPI()

call_sessions: Dict[str, Dict[str, Any]] = {}

ELEVENLABS_VOICE_ID = "21m00Tcm4TlvDq8ikWAM"
ELEVENLABS_URL = f"https://api.elevenlabs.io/v1/text-to-speech/{ELEVENLABS_VOICE_ID}"

DEFAULT_BUSINESS_NAME = "Medical Center"

async def insert_appointment_into_supabase(appointment_data: Dict[str, Any]) -> Dict[str, Any]:

    try:
        # The .insert() method takes a list of dictionaries, even for a single row.
        # .execute() performs the actual API call.
        # Supabase client is synchronous, so use asyncio.to_thread for async FastAPI
        import asyncio # Import asyncio if not already imported at top
        response = await asyncio.to_thread(
            supabase.table("appointments_table").insert(appointment_data).execute
        )

        # Supabase client's .execute() returns a Response object or raises an exception.
        if response and response.data:
            print(f"Successfully inserted appointment: {response.data}")
            return response.data[0] # Return the first (and only) inserted record
        else:
            # Check for error attribute if insertion didn't return data but no exception was raised
            error_details = getattr(response, 'error', 'No specific error object from Supabase client.')
            print(f"Supabase insert did not return data or failed. Response: {response}. Error: {error_details}")
            return {}
    except Exception as e:
        print(f"Error inserting into Supabase: {e}")
        return {}


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

    def get_system_prompt(self, business_name: str, current_step: str) -> str:
        base_instructions = f"""You are an AI receptionist for {business_name} handling appointment bookings over the phone. 
        IMPORTANT: Respond naturally as yourself speaking directly to the caller. Never prefix your response with "Receptionist:" or any other label.
        Keep responses conversational, warm, and professional. Speak as if you're having a natural phone conversation.
        """
        
        if current_step == "greeting":
            return base_instructions + f"""
            Current step: GREETING
            - Welcome the caller and explain you're here to help them book an appointment
            - Ask for their first name to start the booking process
            - Keep it conversational and warm
            """
        
        elif current_step == "get_first_name":
            return base_instructions + f"""
            Current step: GET FIRST NAME
            - Ask for their first name clearly
            - Be natural and conversational
            """
        
        elif current_step == "confirm_first_name":
            return base_instructions + f"""
            Current step: CONFIRM FIRST NAME
            - Confirm the first name you heard
            - Ask "Is that correct?" or similar
            - Be ready to ask them to spell it if they say no
            """
        
        elif current_step == "spell_first_name":
            return base_instructions + f"""
            Current step: SPELL FIRST NAME
            - Ask them to spell their first name letter by letter
            - Be patient and encouraging
            """
        
        elif current_step == "get_last_name":
            return base_instructions + f"""
            Current step: GET LAST NAME
            - Ask for their last name
            - You can ask them to spell it right away to avoid confusion
            """
        
        elif current_step == "confirm_last_name":
            return base_instructions + f"""
            Current step: CONFIRM LAST NAME
            - Confirm the last name you heard
            - Ask "Is that correct?" or similar
            """
        
        elif current_step == "spell_last_name":
            return base_instructions + f"""
            Current step: SPELL LAST NAME
            - Ask them to spell their last name letter by letter
            - Be patient and encouraging
            """
        
        elif current_step == "verification":
            return base_instructions + f"""
            Current step: VERIFICATION
            - You need to collect their date of birth and address for verification
            - Ask clearly and professionally
            - Explain it's for security purposes
            """

        elif current_step == "verify_processing":
            return base_instructions + f"""
            Current step: VERIFICATION PROCESSING
            - You have the verification info and are "processing" it
            - After a brief pause, confirm they've been verified successfully
            - Then ask what type of appointment they need (reason for visit)
            - Be reassuring about the verification success
            """
        
        elif current_step == "get_reason":
            return base_instructions + f"""
            Current step: GET REASON
            - Ask about or acknowledge the reason for their appointment
            - Once you have the reason, ask for their preferred date and time
            - Be helpful and understanding about their medical needs
            """
        
        elif current_step == "get_datetime":
            return base_instructions + f"""
            Current step: GET DATE/TIME
            - Help them choose a date and time for their appointment
            - For this system, any reasonable date/time they request is available
            - Confirm the date and time they want
            - Be accommodating and helpful
            """
        
        elif current_step == "confirmation":
            return base_instructions + f"""
            Current step: CONFIRMATION
            - Summarize their appointment details: date, time, and reason for visit
            - Ask if everything looks correct
            - If they confirm or say thank you/goodbye, the appointment is complete
            - If they want changes, help them make adjustments
            - Be ready to finalize the booking when they confirm
            """

        return base_instructions + f"""Keep responses short and conversational. Be helpful and professional."""

    def detect_name_correction_intent(self, user_input: str) -> bool:
        """Detect if the user is saying their name was wrong"""
        correction_phrases = [
            "that's not right", "that's wrong", "no that's not my name", 
            "you got it wrong", "that's not correct", "no that's not right",
            "wrong name", "not my name", "incorrect", "that's not me",
            "no", "nope", "not right", "wrong", "spell it", "let me spell"
        ]
        user_input_lower = user_input.lower().strip()
        return any(phrase in user_input_lower for phrase in correction_phrases)

    def detect_confirmation_intent(self, user_input: str) -> bool:
        """Detect if the user is confirming something is correct"""
        confirmation_phrases = [
            "yes", "yeah", "yep", "correct", "right", "that's right",
            "that's correct", "exactly", "perfect", "sounds good",
            "looks good", "that works", "confirmed", "yup", "uh huh",
            "mhmm", "sure", "absolutely"
        ]
        user_input_lower = user_input.lower().strip()
        return any(phrase in user_input_lower for phrase in confirmation_phrases)

    def extract_spelled_name(self, user_input: str) -> str:
        """Extract letters from spelled out name"""
        # Remove common words and extract letters
        cleaned = re.sub(r'\b(letter|the|is|for|as in)\b', '', user_input.lower())
        
        # Extract single letters (A, B, C, etc.)
        letters = re.findall(r'\b[a-z]\b', cleaned)
        
        # If no single letters found, try to extract from phonetic alphabet or common patterns
        if not letters:
            phonetic_map = {
                'alpha': 'a', 'bravo': 'b', 'charlie': 'c', 'delta': 'd', 'echo': 'e',
                'foxtrot': 'f', 'golf': 'g', 'hotel': 'h', 'india': 'i', 'juliet': 'j',
                'kilo': 'k', 'lima': 'l', 'mike': 'm', 'november': 'n', 'oscar': 'o',
                'papa': 'p', 'quebec': 'q', 'romeo': 'r', 'sierra': 's', 'tango': 't',
                'uniform': 'u', 'victor': 'v', 'whiskey': 'w', 'xray': 'x', 'yankee': 'y',
                'zulu': 'z'
            }
            
            words = cleaned.split()
            for word in words:
                if word in phonetic_map:
                    letters.append(phonetic_map[word])
        
        return ''.join(letters).upper()

    async def get_response(self, user_input: str, conversation_history: list, business_name: str, current_step: str, session_data: dict = None) -> str:
        try:
            messages = [self.get_system_prompt(business_name, current_step)]
            for entry in conversation_history[-4:]:
                messages.append(f"Patient: {entry['user']}")
                messages.append(f"You: {entry['assistant']}")
            messages.append(f"Patient: {user_input}")
            full_prompt = "\n".join(messages)
            response = await asyncio.to_thread(self.model.generate_content, full_prompt)
            
            # Clean up any unwanted prefixes
            cleaned_response = response.text.strip()
            # Remove common prefixes that might slip through
            prefixes_to_remove = ["Receptionist:", "AI:", "Assistant:", "You:", "Response:"]
            for prefix in prefixes_to_remove:
                if cleaned_response.startswith(prefix):
                    cleaned_response = cleaned_response[len(prefix):].strip()
            
            return cleaned_response
        except Exception as e:
            print(f"Error generating response: {e}")
            return "I'm having trouble understanding right now. Could you please repeat that?"

    async def generate_appointment_json(self, session_data: dict, conversation_history: list) -> dict:
        """Use Gemini to intelligently extract and format appointment data"""
        try:
            # Get current date context
            current_date = datetime.now().strftime('%Y-%m-%d')
            
            # Ensure we have the proper name data
            first_name = session_data.get('first_name', '').strip()
            last_name = session_data.get('last_name', '').strip()
            
            # Clean up names if they contain unwanted text
            if first_name and not first_name.replace(' ', '').isalpha():
                # Try to extract actual name from conversation
                for entry in conversation_history:
                    if 'my name is' in entry['user'].lower() or 'i\'m' in entry['user'].lower():
                        words = entry['user'].split()
                        for i, word in enumerate(words):
                            if word.lower() in ['name', 'i\'m', 'is'] and i + 1 < len(words):
                                potential_name = words[i + 1].strip('.,!?')
                                if potential_name.isalpha():
                                    first_name = potential_name.title()
                                    break
            
            prompt = f"""
            Based on the following conversation, extract the appointment information and create a JSON object with this exact structure:
            {{
                "name": "First Last",
                "AppointmentDateTime": "YYYY-MM-DD HH:MM",
                "Reason": "brief description of medical reason"
            }}

            Current date: {current_date}
            
            Session data:
            First Name: {first_name}
            Last Name: {last_name}
            Date/Time Input: {session_data.get('appointment_datetime', '')}
            Reason Input: {session_data.get('appointment_reason', '')}

            Recent conversation:
            {json.dumps(conversation_history[-10:], indent=2)}

            Instructions:
            - Use ONLY the actual patient names from the session data
            - Parse date/time correctly (if "next Wednesday" was mentioned, calculate the actual date from {current_date})
            - Summarize the medical reason briefly
            - If only time was given, assume next available business day
            - DO NOT include any system messages or phone numbers in the name field
            
            Return ONLY the JSON object, no other text.
            """
            
            response = await asyncio.to_thread(self.model.generate_content, prompt)
            json_text = response.text.strip()
            
            # Clean up the response to extract JSON
            if '```json' in json_text:
                json_text = json_text.split('```json')[1].split('```')[0].strip()
            elif '```' in json_text:
                json_text = json_text.split('```')[1].strip()
            
            # Try to parse the JSON
            try:
                parsed_json = json.loads(json_text)
                # Ensure the name is properly formatted
                if first_name and last_name:
                    parsed_json["name"] = f"{first_name} {last_name}"
                return parsed_json
            except:
                # Fallback to manual extraction
                return {
                    "name": f"{first_name} {last_name}".strip() if first_name or last_name else "Unknown Patient",
                    "AppointmentDateTime": self.parse_datetime_input(session_data.get('appointment_datetime', '')),
                    "Reason": self.extract_reason(session_data.get('appointment_reason', ''))
                }
        except Exception as e:
            print(f"Error generating appointment JSON: {e}")
            return {
                "name": f"{first_name} {last_name}".strip() if first_name or last_name else "Unknown Patient",
                "AppointmentDateTime": self.parse_datetime_input(session_data.get('appointment_datetime', '')),
                "Reason": self.extract_reason(session_data.get('appointment_reason', ''))
            }

    def get_next_friday(self) -> datetime:
        """Get the date for the next Friday"""
        today = datetime.now()
        days_ahead = 4 - today.weekday()  # Friday is weekday 4
        if days_ahead <= 0:  # Target day already happened this week
            days_ahead += 7
        return today + timedelta(days=days_ahead)

    def get_next_weekday_by_name(self, day_name: str) -> datetime:
        """Get the next occurrence of a specific weekday"""
        day_name = day_name.lower()
        weekdays = {
            'monday': 0, 'tuesday': 1, 'wednesday': 2, 'thursday': 3,
            'friday': 4, 'saturday': 5, 'sunday': 6
        }
        
        if day_name not in weekdays:
            return None
            
        today = datetime.now()
        target_weekday = weekdays[day_name]
        days_ahead = target_weekday - today.weekday()
        
        if days_ahead <= 0:  # Target day already happened this week
            days_ahead += 7
            
        return today + timedelta(days=days_ahead)

    def parse_datetime_input(self, datetime_input: str) -> str:
        """Parse datetime from user input with current date context"""
        datetime_input = datetime_input.lower().strip()
        
        # Handle "next wednesday", "this wednesday", etc.
        if 'wednesday' in datetime_input:
            target_date = self.get_next_weekday_by_name('wednesday')
            # Extract time if provided
            time_match = re.search(r'(\d{1,2}):?(\d{0,2})\s*(am|pm)', datetime_input)
            if time_match:
                hour = int(time_match.group(1))
                minute = int(time_match.group(2)) if time_match.group(2) else 0
                period = time_match.group(3)
                
                if period == 'pm' and hour != 12:
                    hour += 12
                elif period == 'am' and hour == 12:
                    hour = 0
                    
                return f"{target_date.strftime('%Y-%m-%d')} {hour:02d}:{minute:02d}"
            else:
                return target_date.strftime('%Y-%m-%d')
        
        # Handle "this friday", "next friday", etc.
        if 'friday' in datetime_input:
            target_date = self.get_next_friday()
            # Extract time if provided
            time_match = re.search(r'(\d{1,2}):?(\d{0,2})\s*(am|pm)', datetime_input)
            if time_match:
                hour = int(time_match.group(1))
                minute = int(time_match.group(2)) if time_match.group(2) else 0
                period = time_match.group(3)
                
                if period == 'pm' and hour != 12:
                    hour += 12
                elif period == 'am' and hour == 12:
                    hour = 0
                    
                return f"{target_date.strftime('%Y-%m-%d')} {hour:02d}:{minute:02d}"
            else:
                return target_date.strftime('%Y-%m-%d')
        
        # Handle other weekdays
        weekdays = ['monday', 'tuesday', 'thursday', 'saturday', 'sunday']
        for day in weekdays:
            if day in datetime_input:
                target_date = self.get_next_weekday_by_name(day)
                if target_date:
                    # Extract time if provided
                    time_match = re.search(r'(\d{1,2}):?(\d{0,2})\s*(am|pm)', datetime_input)
                    if time_match:
                        hour = int(time_match.group(1))
                        minute = int(time_match.group(2)) if time_match.group(2) else 0
                        period = time_match.group(3)
                        
                        if period == 'pm' and hour != 12:
                            hour += 12
                        elif period == 'am' and hour == 12:
                            hour = 0
                            
                        return f"{target_date.strftime('%Y-%m-%d')} {hour:02d}:{minute:02d}"
                    else:
                        return target_date.strftime('%Y-%m-%d')
        
        # Handle just time (assume next available weekday)
        time_match = re.search(r'(\d{1,2}):?(\d{0,2})\s*(am|pm)', datetime_input)
        if time_match:
            hour = int(time_match.group(1))
            minute = int(time_match.group(2)) if time_match.group(2) else 0
            period = time_match.group(3)
            
            if period == 'pm' and hour != 12:
                hour += 12
            elif period == 'am' and hour == 12:
                hour = 0
            
            # Get next weekday (not weekend)
            today = datetime.now()
            days_ahead = 1
            while (today + timedelta(days=days_ahead)).weekday() > 4:  # Skip weekends
                days_ahead += 1
            next_date = today + timedelta(days=days_ahead)
            
            return f"{next_date.strftime('%Y-%m-%d')} {hour:02d}:{minute:02d}"
        
        return datetime_input

    def extract_reason(self, reason_input: str) -> str:
        """Extract and clean up the reason for appointment"""
        # Remove unnecessary words and clean up
        reason = re.sub(r'(yeah|i|like|having|some|so|i\'m|that\'s|why|kind|of|looking|business|appointment)', '', reason_input.lower())
        reason = re.sub(r'\s+', ' ', reason).strip()
        return reason.title() if reason else "General Consultation"
conversation_manager = ConversationManager()

async def generate_speech(text: str, call_sid: str) -> str:
    """Generate speech using ElevenLabs API with improved error handling"""
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
                    print(f"ElevenLabs API error: {response.status} - {await response.text()}")
                    return None
    except Exception as e:
        print(f"Error generating speech with ElevenLabs: {e}")
        return None

@app.get("/audio/{filename}")
async def serve_audio(filename: str):
    audio_path = f"temp_audio/{filename}"
    if os.path.exists(audio_path):
        with open(audio_path, "rb") as f:
            return Response(content=f.read(), media_type="audio/mpeg")
    return Response(status_code=404)

def determine_next_step(current_step: str, user_input: str, session_data: dict) -> str:
    """Determine the next step in the appointment booking flow"""
    
    if current_step == "greeting":
        # Extract first name from user input and store it
        words = user_input.strip().split()
        potential_name = None
        
        # Look for common name indicators
        for i, word in enumerate(words):
            if word.lower() in ["name", "i'm", "im", "is", "my"]:
                if i + 1 < len(words):
                    potential_name = words[i + 1].strip(".,!?")
                    break
        
        # If no indicator found, take the last word as potential name
        if not potential_name and words:
            potential_name = words[-1].strip(".,!?")
        
        if potential_name and potential_name.isalpha():
            session_data["first_name"] = potential_name.title()
            return "confirm_first_name"
        else:
            return "get_first_name"
    
    elif current_step == "get_first_name":
        # Store the first name
        session_data["first_name"] = user_input.strip().title()
        return "confirm_first_name"
    
    elif current_step == "confirm_first_name":
        if conversation_manager.detect_confirmation_intent(user_input):
            return "get_last_name"
        elif conversation_manager.detect_name_correction_intent(user_input):
            return "spell_first_name"
        else:
            return "confirm_first_name"  # Ask again
    
    elif current_step == "spell_first_name":
        # Process spelled name
        spelled_name = conversation_manager.extract_spelled_name(user_input)
        if spelled_name:
            session_data["first_name"] = spelled_name
        return "get_last_name"
    
    elif current_step == "get_last_name":
        # Check if they're spelling it or just saying it
        if len(user_input.replace(" ", "")) > len(user_input.split()) * 2:
            # Likely spelling - remove spaces
            session_data["last_name"] = re.sub(r'\s+', '', user_input).title()
        else:
            session_data["last_name"] = user_input.strip().title()
        return "confirm_last_name"
    
    elif current_step == "confirm_last_name":
        if conversation_manager.detect_confirmation_intent(user_input):
            return "verification"
        elif conversation_manager.detect_name_correction_intent(user_input):
            return "spell_last_name"
        else:
            return "confirm_last_name"  # Ask again
    
    elif current_step == "spell_last_name":
        # Process spelled name
        spelled_name = conversation_manager.extract_spelled_name(user_input)
        if spelled_name:
            session_data["last_name"] = spelled_name
        return "verification"
    
    elif current_step == "verification":
        if "date_of_birth" not in session_data:
            # Extract date of birth from input
            session_data["date_of_birth"] = user_input
            # Check if address is also in the same input
            if "address" in user_input.lower() or "avenue" in user_input.lower() or "street" in user_input.lower():
                # Try to extract address from the same input
                parts = user_input.split("address")
                if len(parts) > 1:
                    session_data["address"] = parts[1].strip()
                    return "verify_processing"
            return "verification"  # Still need address
        elif "address" not in session_data:
            session_data["address"] = user_input
            return "verify_processing"
        else:
            return "verify_processing"
    
    elif current_step == "verify_processing":
        return "get_reason"
    
    elif current_step == "get_reason":
        session_data["appointment_reason"] = user_input
        return "get_datetime"
    
    elif current_step == "get_datetime":
        session_data["appointment_datetime"] = user_input
        return "confirmation"
    
    elif current_step == "confirmation":
        # Improved confirmation logic
        user_input_lower = user_input.lower().strip()
        
        # Strong exit/goodbye indicators should end the call
        goodbye_indicators = [
            "goodbye", "bye", "thank you bye", "thanks bye", "see you", "have a good day"
        ]
        
        # Check for goodbye intent first
        if any(phrase in user_input_lower for phrase in goodbye_indicators):
            return "completed"
        
        # Change/modification indicators
        change_indicators = [
            "no that's wrong", "that's not right", "that's incorrect", "change", 
            "different", "modify", "edit", "let's do", "how about", "instead", 
            "rather", "actually", "can we change", "i want to change"
        ]
        
        # Strong confirmation indicators
        confirmation_indicators = [
            "yes", "yeah", "yep", "yup", "that's right", "that's correct", 
            "correct", "right", "exactly", "perfect", "sounds good", 
            "looks good", "that works", "confirmed", "confirm", "okay", 
            "ok", "good", "fine", "great", "awesome", "sure", "absolutely", 
            "definitely", "all looks correct", "looks correct", "that's it",
            "sounds right", "that's good", "all good", "everything's correct"
        ]
        
        # Neutral/acknowledgment phrases that should be treated as confirmation in context
        neutral_acknowledgments = [
            "thank you", "thanks", "alright", "i'm good", "that's all", 
            "nothing else", "we're good", "all set"
        ]
        
        # Check for explicit changes first
        if any(phrase in user_input_lower for phrase in change_indicators):
            return "get_datetime"
        
        # Check for strong confirmations
        elif any(phrase in user_input_lower for phrase in confirmation_indicators):
            return "completed"
        
        # Check for neutral acknowledgments (treat as confirmation)
        elif any(phrase in user_input_lower for phrase in neutral_acknowledgments):
            return "completed"
        
        # If it's a very short response that could be confirmation
        elif len(user_input.strip()) <= 10 and any(word in user_input_lower for word in ["yes", "ok", "good", "right"]):
            return "completed"
        
        else:
            # Unclear response, ask for confirmation again but be more direct
            return "confirmation"
    
    return current_step


def check_exit_intent(user_input: str, current_step: str) -> bool:
    """Check for exit intent, but be more careful during confirmation step"""
    user_input_lower = user_input.lower().strip()
    
    # During confirmation, only exit on very explicit exit phrases
    if current_step == "confirmation":
        # Only trigger exit if they explicitly use these strong exit phrases
        strong_exit_keywords = [
            "cancel the appointment", "cancel this", "never mind", "not today", 
            "i need to go", "call back later", "hang up", "i have to go",
            "cancel everything"
        ]
        return any(keyword in user_input_lower for keyword in strong_exit_keywords)
    else:
        # For other steps, use the broader set of exit keywords
        exit_keywords = ["goodbye", "bye", "hang up", "cancel", "never mind", "not today"]
        return any(keyword in user_input_lower for keyword in exit_keywords)

@app.post("/twilio/incoming-call")
async def incoming_call(request: Request):
    form = await request.form()
    call_sid = form.get("CallSid")
    to_number = form.get("To")
    from_number = form.get("From")

    print(f"Incoming call from {from_number} to {to_number}")

    business_name = DEFAULT_BUSINESS_NAME

    call_sessions[call_sid] = {
        "phone": from_number,
        "conversation_history": [],
        "current_step": "greeting",
        "business_name": business_name,
        "first_name": "",
        "last_name": "",
        "date_of_birth": "",
        "address": "",
        "appointment_reason": "",
        "appointment_datetime": "",
        "verification_completed": False
    }

    welcome_text = f"Hello! Thank you for calling {business_name}. I'm here to help you book an appointment today. May I please have your first name?"
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
    resp.say(f"I didn't catch that. Please let me know your first name so we can get started.", voice="Polly.Joanna")

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
    conversation_history = session.get("conversation_history", [])
    current_step = session.get("current_step", "greeting")

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
    
    # Check for exit intent using the improved function
    exit_intent = check_exit_intent(user_input, current_step)

    if exit_intent:
        goodbye_text = f"No problem! Thank you for calling {business_name}. Feel free to call back when you're ready to book. Have a great day!"
        audio_url = await generate_speech(goodbye_text, call_sid)
        if audio_url:
            resp.play(audio_url)
        else:
            resp.say(goodbye_text, voice="Polly.Joanna")
        resp.hangup()
        del call_sessions[call_sid]
        return Response(content=str(resp), media_type="application/xml")

    try:
        # Special handling for verification processing step (add pause and verification message)
        if current_step == "verify_processing":
            # Add a pause for processing
            await asyncio.sleep(2)  
            verification_text = "Your information has been verified, thank you. Now, what type of appointment do you need today?"
            audio_url = await generate_speech(verification_text, call_sid)
            
            # Update session and move to next step
            conversation_history.append({"user": user_input, "assistant": verification_text})
            session["conversation_history"] = conversation_history
            session["current_step"] = "get_reason"
            call_sessions[call_sid] = session
            
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
                gather.say(verification_text, voice="Polly.Joanna")
            resp.append(gather)
            resp.say(f"Thank you for calling {business_name}. If you need anything else, please call us back!", voice="Polly.Joanna")
            return Response(content=str(resp), media_type="application/xml")
        
        # Determine next step and update session data
        next_step = determine_next_step(current_step, user_input, session)
        
        ai_response = await conversation_manager.get_response(
            user_input,
            conversation_history,
            business_name=business_name,
            current_step=current_step
        )
        
        conversation_history.append({"user": user_input, "assistant": ai_response})
        session["conversation_history"] = conversation_history
        session["current_step"] = next_step
        call_sessions[call_sid] = session

        print(f"AI Response: {ai_response}")
        print(f"Current step: {current_step} -> Next step: {next_step}")
        
        # Check if appointment is completed
        if next_step == "completed":
            # Use Gemini to create appointment JSON
            appointment_data = await conversation_manager.generate_appointment_json(session, conversation_history)
            print("\n" + "="*50)
            print("APPOINTMENT BOOKED SUCCESSFULLY!")
            print("APPOINTMENT DATA:")
            print(json.dumps(appointment_data, indent=2))

            print("="*50 + "\n")
            
            completion_text = "Perfect! Your appointment has been successfully booked. You'll receive a confirmation shortly. Thank you for calling and have a wonderful day!"
            audio_url = await generate_speech(completion_text, call_sid)
            if audio_url:
                resp.play(audio_url)
            else:
                resp.say(completion_text, voice="Polly.Joanna")
            resp.hangup()
            await insert_appointment_into_supabase(appointment_data)
            del call_sessions[call_sid]
            return Response(content=str(resp), media_type="application/xml")
        
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
            print(f"Final Step: {session.get('current_step', 'Unknown')}")
            print(f"Conversation Length: {len(session.get('conversation_history', []))} exchanges")
            
            # Show appointment data if collected
            if session.get('first_name'):
                print("COLLECTED APPOINTMENT DATA:")
                print(f"  Patient Name: {session.get('first_name', '')} {session.get('last_name', '')}")
                print(f"  Reason: {session.get('appointment_reason', 'Not collected')}")
                print(f"  Date/Time: {session.get('appointment_datetime', 'Not collected')}")
                print(f"  Verification: {'Completed' if session.get('verification_completed') else 'Not completed'}")
            
            for i, exchange in enumerate(session.get('conversation_history', [])[-3:], 1):
                print(f"Exchange {i}:")
                print(f"  Patient: {exchange['user']}")
                print(f"  AI: {exchange['assistant']}")
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
    print("Starting Appointment Booking Agent...")
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)