import os
import json
from anthropic import Anthropic, APIError

class AIService:
    def __init__(self):
        self.api_key = os.getenv("ANTHROPIC_API_KEY")
        self.model = os.getenv("CLAUDE_AI_MODEL")

        if not self.api_key:
            raise ValueError("ANTHROPIC_API_KEY is not set in the environment variables.")
        
        if not self.model:
            raise ValueError("CLAUDE_AI_MODEL is not set in the environment variables.")

        self.client = Anthropic(api_key=self.api_key)

def parse_incident_description(self, description):
        """
        Takes a raw string description and asks Claude to categorize it.
        """
        if not description or len(description.strip()) < 3:
            raise ValueError("Description is too short to categorize.")

        system_prompt = """
        You are an expert emergency dispatch AI. Your job is to read a raw incident description 
        and extract the priority, department, category, and a short 3-6 word action-oriented title.
        
        You MUST respond ONLY with a valid JSON object matching exactly this schema. Do not include markdown formatting:
        {
            "priority": "LOW" | "MEDIUM" | "HIGH" | "CRITICAL",
            "type": "CAMPUS_SECURITY" | "POLICE" | "MEDICAL" | "MAINTENANCE" | "RESIDENCE",
            "category": "NOISE_COMPLAINT" | "TRESPASSING" | "THEFT" | "PROPERTY_DAMAGE" | "WEAPON" | "HARASSMENT" | "SUSPICIOUS_PERSON" | "INJURY" | "MISCONDUCT" | "FIRE_ALARM" | "PLUMBING_ISSUE" | "OTHER",
            "short_desc": "Action oriented title here"
        }
        """

        # Claude Prefill
        response = self.client.messages.create(
            model=self.model,
            max_tokens=420,
            temperature=0.1,
            system=system_prompt,
            messages=[
                {"role": "user", "content": description},
                {"role": "assistant", "content": "{"}
            ]
        )

        # Claude Prefill
        raw_json_string = "{" + response.content[0].text
        
        try:
            parsed_data = json.loads(raw_json_string)
            return parsed_data
        except json.JSONDecodeError:
            raise RuntimeError("Claude returned malformed JSON data.")

ai_service = AIService()