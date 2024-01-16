from openai import OpenAI
import os
from dotenv import load_dotenv
from fastapi import Body, FastAPI, Request, Form, Response, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import HTMLResponse

app = FastAPI()
app.mount("/static", StaticFiles(directory="static"), name="static")

load_dotenv()

client = OpenAI()

assistant = client.beta.assistants.create(
    name="ARO",
    instructions="You are a dungeon master for a dungeons and dragons 5th edition campaign. Create campaigns, generate monsters, npcs, townss and anything else necessary to play the game.",
    model="gpt-3.5-turbo" 
)

thread = client.beta.threads.create()

app.add_middleware(
    CORSMiddleware,
    allow_origins="http://localhost:3000/",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/", response_class=HTMLResponse)
async def root(request: Request):
    with open('static/index.html') as f:
        html = f.read()
    return HTMLResponse(content=html, status_code=200)

@app.get("/queryARO/{user_message}")
async def get_response(user_message):
    message = await add_message_to_thread(user_message)
    messages = await ask_ARO()

    return messages

async def add_message_to_thread(user_message):
    message = client.beta.threads.messages.create(
        thread_id=thread.id,
        role="user",
        content= user_message
    )
    return message

async def ask_ARO():
    run =  client.beta.threads.runs.create(
        thread_id=thread.id,
        assistant_id=os.getenv('ASSISTANT_ID')
    )

    while True:
        runInfo = client.beta.threads.runs.retrieve(thread_id=thread.id, run_id=run.id)
        if runInfo.completed_at:
            break

    messages = client.beta.threads.messages.list(thread.id)
    return messages


# completion = client.chat.completions.create(
#   model="gpt-3.5-turbo",
#   messages=[
#     {"role": "system", "content": "You are a poetic assistant, skilled in explaining complex programming concepts with creative flair."},
#     {"role": "user", "content": "Compose a poem that explains the concept of recursion in programming."}
#   ]
# )

# print(completion)