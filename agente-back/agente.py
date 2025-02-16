from flask import Flask, request, jsonify
from flask_cors import CORS
import asyncio
import json
from datetime import datetime
import pytz
from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.jobstores.memory import MemoryJobStore
from langchain_openai import ChatOpenAI
from browser_use import Agent
from system_prompt import MySystemPrompt
from typing import Dict

app = Flask(__name__)
CORS(app)

# Store for job results
job_results: Dict[str, any] = {}

# Configure the scheduler to use timezone-aware dates
scheduler_config = {
    'jobstores': {
        'default': MemoryJobStore()
    },
    'timezone': pytz.UTC
}

# Initialize the scheduler with the config
scheduler = BackgroundScheduler(scheduler_config)
scheduler.start()

async def run_agent(api_key: str, task: str):
    open_ai_llm = ChatOpenAI(
        model="gpt-4o",
        openai_api_key=api_key
    )
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
            parsed_result = json.loads(final_result) if isinstance(final_result, str) else str(final_result)
        except json.JSONDecodeError:
            parsed_result = final_result  # Keep as string if not JSON
        
        return jsonify({"result": parsed_result})
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/schedule', methods=['POST'])
def schedule():
    data = request.get_json()
    api_key = data.get('api_key')
    task = data.get('task')
    scheduled_time = data.get('scheduled_time')
    timezone = data.get('timezone', 'UTC')
    
    try:
        # Parse the scheduled time and keep it timezone-aware
        scheduled_dt = datetime.fromisoformat(scheduled_time.replace('Z', '+00:00'))
        user_tz = pytz.timezone(timezone)
        scheduled_dt = scheduled_dt.astimezone(user_tz)
        
        # Create an async wrapper function for the agent
        async def scheduled_task(job_id: str):
            try:
                result = await run_agent(api_key, task)
                final_result = result.final_result() if hasattr(result, "final_result") else result
                
                if final_result is None:
                    error_msg = "Task failed to produce a result"
                    job_results[job_id] = {
                        'status': 'failed',
                        'error': error_msg
                    }
                    return
                
                # Process the result similar to the /run endpoint
                if isinstance(final_result, dict) or isinstance(final_result, list):
                    processed_result = final_result
                else:
                    try:
                        processed_result = json.loads(final_result) if isinstance(final_result, str) else str(final_result)
                    except json.JSONDecodeError:
                        processed_result = str(final_result)

                # Store the result
                job_results[job_id] = {
                    'status': 'completed',
                    'result': processed_result
                }
                return processed_result
            except Exception as e:
                error_msg = f"Task failed: {str(e)}"
                job_results[job_id] = {
                    'status': 'failed',
                    'error': error_msg
                }
                raise

        def job_function(job_id: str):
            try:
                # Update status to running
                job_results[job_id] = {
                    'status': 'running',
                    'scheduled_time': scheduled_dt.strftime('%Y-%m-%d %H:%M:%S %Z')
                }
                result = asyncio.run(scheduled_task(job_id))
                print(f"Scheduled task completed with result: {result}")
                return result
            except Exception as e:
                error_msg = f"Scheduled task execution failed: {str(e)}"
                print(error_msg)
                if job_id in job_results:
                    job_results[job_id].update({
                        'status': 'failed',
                        'error': error_msg
                    })
                return error_msg

        job_id = f"task_{scheduled_dt.timestamp()}"
        job = scheduler.add_job(
            func=job_function,
            args=[job_id],
            trigger='date',
            run_date=scheduled_dt,
            id=job_id
        )
        
        # Initialize job status
        job_results[job_id] = {
            'status': 'scheduled',
            'scheduled_time': scheduled_dt.strftime('%Y-%m-%d %H:%M:%S %Z')
        }
        
        return jsonify({
            "message": f"Task scheduled for {scheduled_dt.strftime('%Y-%m-%d %H:%M:%S %Z')}",
            "job_id": job_id
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/task-status/<job_id>', methods=['GET'])
def get_task_status(job_id):
    job = scheduler.get_job(job_id)
    result = job_results.get(job_id, {})
    
    if not job and not result:
        return jsonify({"error": "Task not found"}), 404
        
    return jsonify({
        "status": result.get('status', 'scheduled'),
        "result": result.get('result'),
        "error": result.get('error'),
        "scheduled_time": result.get('scheduled_time')
    })

# Cleanup job to remove old results (runs every hour)
def cleanup_old_results():
    current_time = datetime.now(pytz.UTC)
    jobs_to_remove = []
    
    for job_id, result in job_results.items():
        if result.get('status') in ['completed', 'failed']:
            # Remove completed/failed jobs after 1 hour
            jobs_to_remove.append(job_id)
    
    for job_id in jobs_to_remove:
        del job_results[job_id]

scheduler.add_job(
    func=cleanup_old_results,
    trigger='interval',
    hours=1,
    id='cleanup_job'
)

if __name__ == '__main__':
    app.run(debug=True)