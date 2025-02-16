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
import random

app = Flask(__name__)
CORS(app)

# Store for job results and metadata
job_results: Dict[str, any] = {}
job_metadata: Dict[str, any] = {}  # Store task descriptions and API keys

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

def job_function(job_id: str):
    try:
        # Update status to running
        job_results[job_id].update({'status': 'running'})
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

async def scheduled_task(job_id: str):
    try:
        api_key = job_metadata[job_id]['api_key']
        task = job_metadata[job_id]['task']
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
        job_results[job_id].update({
            'status': 'completed',
            'result': processed_result
        })
        return processed_result
    except Exception as e:
        error_msg = f"Task failed: {str(e)}"
        job_results[job_id].update({
            'status': 'failed',
            'error': error_msg
        })
        raise

async def run_agent(api_key: str, task: str):
    try:
        llm = ChatOpenAI(
            model="gpt-4o",
            openai_api_key=api_key
        )
        agent = Agent(
            task=task,
            llm=llm,
            system_prompt_class=MySystemPrompt
        )
        result = await agent.run()
        return result
    except Exception as e:
        print(f"Error in run_agent: {str(e)}")
        raise

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
    
    if not all([api_key, task, scheduled_time]):
        return jsonify({"error": "Missing required fields: api_key, task, or scheduled_time"}), 400
    
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
                job_results[job_id].update({
                    'status': 'completed',
                    'result': processed_result
                })
                return processed_result
            except Exception as e:
                error_msg = f"Task failed: {str(e)}"
                job_results[job_id].update({
                    'status': 'failed',
                    'error': error_msg
                })
                raise

        # Generate a unique job ID using timestamp and a random suffix
        timestamp = scheduled_dt.timestamp()
        random_suffix = ''.join([str(x) for x in random.sample(range(10), 4)])
        job_id = f"task_{timestamp}_{random_suffix}"
        
        # Store task metadata
        job_metadata[job_id] = {
            'task': task,
            'api_key': api_key,
            'timezone': timezone
        }
        
        # Initialize job status
        job_results[job_id] = {
            'status': 'scheduled',
            'scheduled_time': scheduled_dt.strftime('%Y-%m-%d %H:%M:%S %Z')
        }
        
        job = scheduler.add_job(
            func=job_function,
            args=[job_id],
            trigger='date',
            run_date=scheduled_dt,
            id=job_id
        )
        
        return jsonify({
            "message": f"Task scheduled for {scheduled_dt.strftime('%Y-%m-%d %H:%M:%S %Z')}",
            "job_id": job_id
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/tasks', methods=['GET'])
def get_tasks():
    tasks = []
    for job_id, result in job_results.items():
        job = scheduler.get_job(job_id)
        if job or result:
            # Convert the scheduled_time to ISO format
            scheduled_time = result.get('scheduled_time')
            try:
                # Parse the existing format and convert to ISO
                dt = datetime.strptime(scheduled_time, '%Y-%m-%d %H:%M:%S %Z')
                iso_time = dt.isoformat()
            except:
                iso_time = scheduled_time

            tasks.append({
                'id': job_id,
                'task': job_metadata.get(job_id, {}).get('task', 'Unknown task'),
                'apiKey': job_metadata.get(job_id, {}).get('api_key', ''),
                'scheduledTime': iso_time,
                'timezone': job_metadata.get(job_id, {}).get('timezone', 'UTC'),
                'status': result.get('status', 'scheduled'),
                'result': result.get('result'),
                'error': result.get('error')
            })
    
    return jsonify(tasks)

@app.route('/tasks/<task_id>', methods=['DELETE'])
def delete_task(task_id):
    try:
        # Remove from scheduler if still scheduled
        job = scheduler.get_job(task_id)
        if job:
            scheduler.remove_job(task_id)
        
        # Remove from our storage
        if task_id in job_results:
            del job_results[task_id]
        if task_id in job_metadata:
            del job_metadata[task_id]
            
        return '', 204
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/tasks/<task_id>', methods=['PUT'])
def update_task(task_id):
    data = request.get_json()
    
    try:
        # Remove old job
        job = scheduler.get_job(task_id)
        if job:
            scheduler.remove_job(task_id)
        
        # Schedule new job with updated parameters
        api_key = data.get('api_key')
        task = data.get('task')
        scheduled_time = data.get('scheduled_time')
        timezone = data.get('timezone', 'UTC')
        
        # Parse the scheduled time and keep it timezone-aware
        scheduled_dt = datetime.fromisoformat(scheduled_time.replace('Z', '+00:00'))
        user_tz = pytz.timezone(timezone)
        scheduled_dt = scheduled_dt.astimezone(user_tz)
        
        # Update metadata
        job_metadata[task_id] = {
            'task': task,
            'api_key': api_key,
            'timezone': timezone
        }
        
        # Update job status
        job_results[task_id] = {
            'status': 'scheduled',
            'scheduled_time': scheduled_dt.strftime('%Y-%m-%d %H:%M:%S %Z')
        }
        
        # Reschedule the job
        scheduler.add_job(
            func=job_function,
            args=[task_id],
            trigger='date',
            run_date=scheduled_dt,
            id=task_id
        )
        
        return jsonify({
            "message": f"Task updated and scheduled for {scheduled_dt.strftime('%Y-%m-%d %H:%M:%S %Z')}",
            "job_id": task_id
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Cleanup job to remove old results (runs every hour)
def cleanup_old_results():
    current_time = datetime.now(pytz.UTC)
    jobs_to_remove = []
    
    for job_id, result in job_results.items():
        if result.get('status') in ['completed', 'failed']:
            # Keep completed/failed jobs for 24 hours
            scheduled_time = datetime.strptime(
                result.get('scheduled_time', ''), 
                '%Y-%m-%d %H:%M:%S %Z'
            ).replace(tzinfo=pytz.UTC)
            
            if (current_time - scheduled_time).total_seconds() > 86400:  # 24 hours
                jobs_to_remove.append(job_id)
    
    for job_id in jobs_to_remove:
        del job_results[job_id]
        if job_id in job_metadata:
            del job_metadata[job_id]

scheduler.add_job(
    func=cleanup_old_results,
    trigger='interval',
    hours=1,
    id='cleanup_job'
)

if __name__ == '__main__':
    app.run(debug=True)