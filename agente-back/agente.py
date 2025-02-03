from flask import Flask, request, jsonify
from flask_cors import CORS
import asyncio
import json
from langchain_openai import ChatOpenAI
from browser_use import Agent
from system_prompt import MySystemPrompt

app = Flask(__name__)
CORS(app)  

async def run_agent(api_key: str, task: str):
    open_ai_llm = ChatOpenAI(model="gpt-4o-mini", openai_api_key=api_key)
    agent = Agent(
        task=task,
        llm=open_ai_llm,
        system_prompt_class=MySystemPrompt
    )
    result = await agent.run()
    return result

@app.route('/run', methods=['POST'])
def run():
    data = request.get_json()
    api_key = data.get('api_key')
    task = data.get('task')
    
    try:
        result = asyncio.run(run_agent(api_key, task))
        
        final_result = result.final_result() if hasattr(result, "final_result") else result
        
        # If it's already JSON, return as is
        if isinstance(final_result, dict) or isinstance(final_result, list):
            return jsonify({"result": final_result})
        
        # If it's a JSON string, parse it
        try:
            parsed_result = json.loads(final_result)
        except json.JSONDecodeError:
            parsed_result = final_result  # Keep as string if not JSON
        
        return jsonify({"result": parsed_result})
    
    except Exception as e:
        return jsonify({"result": f"An error occurred: {str(e)}"}), 500

if __name__ == '__main__':
    app.run(debug=True)
