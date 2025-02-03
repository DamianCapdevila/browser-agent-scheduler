# app.py
import asyncio
from flask import Flask, render_template, request
from langchain_openai import ChatOpenAI
from browser_use import Agent
from system_prompt import MySystemPrompt

app = Flask(__name__)

async def run_agent(api_key: str, task: str) -> str:
    """
    Create a new ChatOpenAI instance with the user's API key,
    then create and run the agent.
    """
    # Instantiate the ChatOpenAI LLM with the user-provided API key.
    # (Assuming ChatOpenAI supports an `openai_api_key` parameter.)
    open_ai_llm = ChatOpenAI(model="gpt-4o-mini", openai_api_key=api_key)
    
    # Create the agent with the user task and system prompt.
    agent = Agent(
        task=task,
        llm=open_ai_llm,
        system_prompt_class=MySystemPrompt
    )
    result = await agent.run()
    return result

@app.route('/', methods=['GET', 'POST'])
def index():
    if request.method == 'POST':
        api_key = request.form.get('api_key')
        task = request.form.get('task')
        try:
            # Run the agent asynchronously.
            result = asyncio.run(run_agent(api_key, task))
        except Exception as e:
            result = f"An error occurred: {str(e)}"
        return render_template('result.html', result=result)
    return render_template('index.html')

if __name__ == '__main__':
    app.run(debug=True)
