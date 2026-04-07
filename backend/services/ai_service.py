import os
import json
from anthropic import Anthropic, APIError
from dotenv import load_dotenv

load_dotenv()

class AIService:
    def __init__(self):
        self.api_key = os.getenv("CLAUDE_API_KEY")
        self.autofill_model = os.getenv("CLAUDE_AUTOFILL_AI_MODEL")
        self.drafter_model = os.getenv("CLAUDE_DRAFTER_AI_MODEL")
        self.briefing_model = os.getenv("CLAUDE_BRIEFING_AI_MODEL")

        if not self.api_key:
            raise ValueError("CLAUDE_API_KEY is not set in the environment variables.")
        
        if not self.autofill_model:
            raise ValueError("CLAUDE_AUTOFILL_AI_MODEL is not set in the environment variables.")
        
        if not self.drafter_model:
            raise ValueError("CLAUDE_DRAFTER_AI_MODEL is not set in the environment variables.")
        
        if not self.briefing_model:
            raise ValueError("CLAUDE_BRIEFING_AI_MODEL is not set in the environment variables.")

        self.client = Anthropic(api_key=self.api_key)

    def parse_incident_description(self, description):
        if not description or len(description.strip()) < 3:
            raise ValueError("Description is too short to categorize.")

        system_prompt = """
        You are an expert emergency dispatch AI. Your job is to read a raw incident description 
        and extract the priority, department, category, and a short 3-5 word (<32 chars) action-oriented title.
        
        You MUST respond ONLY with a valid JSON object matching exactly this schema. Do not include markdown formatting:
        {
            "priority": "LOW" | "MEDIUM" | "HIGH" | "CRITICAL",
            "type": "CAMPUS_SECURITY" | "POLICE" | "MEDICAL" | "MAINTENANCE" | "RESIDENCE",
            "category": "NOISE_COMPLAINT" | "TRESPASSING" | "THEFT" | "PROPERTY_DAMAGE" | "WEAPON" | "HARASSMENT" | "SUSPICIOUS_PERSON" | "INJURY" | "MISCONDUCT" | "FIRE_ALARM" | "PLUMBING_ISSUE" | "OTHER",
            "short_desc": "Action oriented title here"
        }
        """

        response = self.client.messages.create(
            model=self.autofill_model,
            max_tokens=420,
            temperature=0.1,
            system=system_prompt,
            messages=[
                {"role": "user", "content": description},
            ]
        )

        raw_response = response.content[0].text

        start_idx = raw_response.find('{')
        end_idx = raw_response.rfind('}')

        if start_idx == -1 or end_idx == -1:
             raise RuntimeError("Claude did not return a valid JSON object.")
        
        raw_json_string = raw_response[start_idx:end_idx+1]
        
        try:
            parsed_data = json.loads(raw_json_string)
            return parsed_data
        except json.JSONDecodeError:
            raise RuntimeError("Claude returned malformed JSON data.")

    def generate_shift_handoff(self, incidents_data, hours):
        if not incidents_data:
            return "No incidents occurred during this shift timeframe."

        raw_data_string = json.dumps(incidents_data)

        system_prompt = f"""
        You are a senior Campus Safety Dispatcher. Your shift is ending. 
        Read the following JSON array of incidents from the last {hours} hours and write a concise, 
        professional 3-paragraph shift handover report for the incoming dispatcher.
        
        Formatting rules:
        - Use Markdown formatting.
        - Start with a bold "Critical Unresolved Issues" section if anything is still PENDING or DISPATCHED.
        - Summarize the resolved issues briefly.
        - Do not include pleasantries. Be highly professional and operational. No emojis.
        - It's import that within paragraphs, line breaks are used for readability so it's not a chunk of text.
        - Prefer bullets over dense text where appropriate.
        - **Important** Do not use em dashes '—', replace them with single dashes '-' instead.
        """

        response = self.client.messages.create(
            model=self.briefing_model,
            max_tokens=600, 
            temperature=0.2, 
            system=system_prompt,
            messages=[
                {"role": "user", "content": raw_data_string}
            ]
        )

        return response.content[0].text

    def draft_campus_alert(self, incident_details):
        system_prompt = """
        You are a University Public Information Officer. A high priority or critical emergency is occurring.
        You must draft a campus-wide alert based on the incident details provided.
        Do not use em dashes '—', replace them with single dashes '-' instead.
        
        You MUST respond ONLY with a valid JSON object matching exactly this schema. Do not include markdown formatting:
        {
            "sms_draft": "160 characters maximum. Clear, calm, and actionable.",
            "email_draft": "3 paragraphs maximum. Professional, concise, with safety instructions.
            Do not overcomplicate with details, so people can easily read it."
        }
        """

        response = self.client.messages.create(
            model=self.drafter_model,
            max_tokens=600,
            temperature=0.1,
            system=system_prompt,
            messages=[
                {"role": "user", "content": json.dumps(incident_details)},
            ]
        )

        raw_response = response.content[0].text

        start_idx = raw_response.find('{')
        end_idx = raw_response.rfind('}')
        
        if start_idx == -1 or end_idx == -1:
             raise RuntimeError("Claude did not return a valid JSON object for the alert.")

        raw_json_string = raw_response[start_idx:end_idx+1]
        
        try:
            return json.loads(raw_json_string)
        except json.JSONDecodeError:
            raise RuntimeError("Claude returned malformed JSON data for the alert.")
        
ai_service = AIService()