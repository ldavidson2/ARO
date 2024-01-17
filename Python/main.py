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
    if "generate an image of" in user_message.lower():
        new_prompt = "In less than 1000 characters, describe " + user_message.lower().strip("generate an image of")
        message = await add_message_to_thread(new_prompt)
        messages = await ask_ARO()
        print(messages.data[0].content[0].text.value)
        url = await generate_image(messages.data[0].content[0].text.value)
        return url
    else:
        message = await add_message_to_thread(user_message)
        messages = await ask_ARO()
        return messages.data[0].content[0].text.value
    # url = await generate_image(messages.data[0].content[0].text.value)

    # return messages.data[0].content[0].text.value

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

async def generate_image(description):
    response = client.images.generate(
        model="dall-e-3",
        prompt=description,
        size="1024x1024",
        n=1,
    )

    image_url = response.data[0].url
    print(image_url)
    return image_url