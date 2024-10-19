import os
from dotenv import load_dotenv
import logging
import requests
from flask import Flask, request, jsonify, render_template

# Setup logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

# Load environment variables from .env file
load_dotenv()

# Ensure Google Gemini API key is available
gemini_api_key = os.getenv("GEMINI_API_KEY")
if not gemini_api_key:
    logger.error("Google Gemini API key is not set in the environment.")
    raise ValueError("Google Gemini API key is not set in the environment.")

app = Flask(__name__)

def ask_model(prompt, task_type="interact"):
    try:
        logger.debug(f"Received prompt: {prompt}")
        if task_type == "summarize":
            refined_prompt = f"Summarize the following text: {prompt}"
        else:  # Direct question or interact
            refined_prompt = prompt

        logger.debug(f"Refined prompt: {refined_prompt}")

        url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key={gemini_api_key}"
        headers = {
            "Content-Type": "application/json"
        }
        data = {
            "contents": [{"parts": [{"text": refined_prompt}]}]
        }

        response = requests.post(url, headers=headers, json=data)
        
        # Log the full response for debugging
        response_json = response.json()
        logger.debug(f"Full API response: {response_json}")

        # Ensure 'candidates' key exists in the response
        if 'candidates' in response_json:
            response_text = response_json['candidates'][0]['content']['parts'][0]['text'].strip()
            logger.debug("Response generated.")
            logger.debug(f"Model response: {response_text}")

            # Check if response is similar to prompt
            if response_text.lower().startswith(refined_prompt.lower()):
                return "The AI didn't generate a new response. Please try asking in a different way."

            return response_text
        else:
            logger.error("Key 'candidates' not found in the response.")
            return "Error processing model. Please try again later."
    except Exception as e:
        logger.error(f"Error processing model: {str(e)}")
        return "Error processing model. Please try again later."

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/ask', methods=['POST'])
def ask():
    data = request.json
    prompt = data.get('prompt')
    task_type = data.get('task_type', 'interact')
    response_text = ask_model(prompt, task_type)
    
    return jsonify({"response": response_text})

@app.route('/feedback', methods=['POST'])
def feedback():
    data = request.json
    feedback_text = data.get('feedback')
    
    with open('feedback.log', 'a') as f:
        f.write(f"{feedback_text}\n")
    
    return jsonify({"status": "success"})

if __name__ == "__main__":
    app.run(debug=True)


