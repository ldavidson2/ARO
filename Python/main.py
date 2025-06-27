from openai import OpenAI
import boto3
from boto3.dynamodb.conditions import Key, Attr
import os
from dotenv import load_dotenv
from fastapi import Body, FastAPI, Request, Form, Response, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import HTMLResponse
import json
import tempfile
from pydantic import BaseModel
from typing import List, Dict, Any

app = FastAPI()
app.mount("/static", StaticFiles(directory="static"), name="static")

load_dotenv()

awsAccessKey = os.getenv('ACCESS_KEY')
awsSecretAccessKey = os.getenv('SECRET_ACCESS_KEY')
region = os.getenv('REGION')

dynamodb = boto3.resource('dynamodb', region_name=region,
         aws_access_key_id=awsAccessKey,
         aws_secret_access_key= awsSecretAccessKey)
table = dynamodb.Table(os.getenv('TABLE'))


client = OpenAI()
ARO_thread = client.beta.threads.create()
terrain_map_thread = client.beta.threads.create()
tokens_thread = client.beta.threads.create()
VECTOR_STORE_ID = "vs_ZlLWms8d7tFBYyGZx5zLDaBh"

class Token(BaseModel):
    id: int
    row: int
    column: int
    image: str
    entity: str

class RequestBody(BaseModel):
    user_message: str
    token_positions: str
    terrain_map: str
    in_combat: bool


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

@app.post("/queryARO")
async def get_response(request_body: RequestBody):
    user_message = request_body.user_message
    token_positions = request_body.token_positions
    terrain_map = request_body.terrain_map
    in_combat = request_body.in_combat
    print(user_message)
    print(token_positions)
    print(terrain_map)
    print(in_combat)
    if "generate an image of" in user_message.lower():
        new_prompt = "In less than 1000 characters, describe " + user_message.lower().strip("generate an image of")
        message = await add_message_to_thread(ARO_thread.id, new_prompt)
        messages = await ask_ARO()
        # print(messages.Response)
        print(messages['Response'])
        url = await generate_image((messages['Response']).lstrip('{"Mode": "normal", "Response": "').rstrip('"}'))
        return url
    elif in_combat:
        message = await add_message_to_thread(ARO_thread.id, user_message + " Current token positions: " + token_positions + ", terrain map: " + terrain_map + ", please take all appropriate non-player turns now.")
        messages = await ask_ARO()
        print(messages)
        return   Response(content=messages, media_type="application/json") 
    else:
        message = await add_message_to_thread(ARO_thread.id, "Review all provided instructions and files before responding. Determine the appropriate response and return only one response, ensuring it follows the provided JSON formatting (all keys and values must use double quotes) but doesn't copy the content, to the following input: " + user_message)
        messages = await ask_ARO()
        print(messages)
        return   Response(content=messages, media_type="application/json") 

async def add_message_to_thread(thread_id, user_message):
    message = client.beta.threads.messages.create(
        thread_id,
        role="user",
        content= user_message
    )
    return message

@app.get("/getCharacters")
async def get_response():
    response = table.scan(
        FilterExpression=Attr('SK').contains("CHAR")
    )      

    characters = []
    for item in response['Items']:
        name = item['Name']
        pk = item['PK']
        characters.append({"name": name, "PK": pk})
    return characters

@app.get("/getCharacter")
async def get_response(character_id):
    response = table.get_item(
        Key={
            'PK': character_id,
            'SK': character_id
        }
    )
    return response["Item"]

@app.post("/uploadFile")
async def upload_file(file: UploadFile = File(...)):
    temp_dir = tempfile.mkdtemp()
    
    try:
        file_path = os.path.join(temp_dir, file.filename)
        with open(file_path, "wb") as f:
            f.write(await file.read())
        
        file_streams = [open(file_path, "rb")]
        
        file_batch = client.beta.vector_stores.file_batches.upload_and_poll(
            vector_store_id=VECTOR_STORE_ID,
            files=file_streams
        )
        
        return {"filename": file.filename}
    finally:
        # Close all file streams
        for file_stream in file_streams:
            file_stream.close()
        
        # Remove all files within the temporary directory
        for root, dirs, files in os.walk(temp_dir, topdown=False):
            for name in files:
                os.remove(os.path.join(root, name))
            for name in dirs:
                os.rmdir(os.path.join(root, name))
        
        # Remove the temporary directory
        os.rmdir(temp_dir)

async def ask_ARO():
    run =  client.beta.threads.runs.create(
        thread_id=ARO_thread.id,
        assistant_id=os.getenv('ARO_ASSISTANT_ID')
    )

    while True:
        runInfo = client.beta.threads.runs.retrieve(thread_id=ARO_thread.id, run_id=run.id)
        if runInfo.completed_at:
            break

    messages = client.beta.threads.messages.list(ARO_thread.id)
    # having an error with the if statement sometimes
    print(messages.data[0].content[0].text.value)
    if "combat initiation" in (json.loads(((messages.data[0].content[0].text.value).replace("”", '"')).replace("“", '"').lstrip('```json').rstrip('```'))['Mode']):
        combat_description = json.loads(((messages.data[0].content[0].text.value).replace("”", '"')).replace("“", '"').lstrip('```json').rstrip('```'))['Response']
        response = await generate_combat(combat_description)
        return json.dumps(response)
    else:
        return ((messages.data[0].content[0].text.value).replace("”", '"')).replace("“", '"')

async def generate_combat(combat_description):
    await add_message_to_thread(terrain_map_thread.id, combat_description)
    terrain_map_run =  client.beta.threads.runs.create(
        thread_id=terrain_map_thread.id,
        assistant_id=os.getenv('TERRAIN_MAP_ASSISTANT_ID')
    )

    while True:
        runInfo = client.beta.threads.runs.retrieve(thread_id=terrain_map_thread.id, run_id=terrain_map_run.id)
        if runInfo.completed_at:
            break

    messages = client.beta.threads.messages.list(terrain_map_thread.id)
    terrain_map = ((messages.data[0].content[0].text.value).replace("”", '"')).replace("“", '"').lstrip('```json').rstrip('```')
    terrain_map_string = terrain_map.replace('{"Terrain": ', '')
    token_message = "Generate token locations based on the following description and terrain map. Description: '" + combat_description + "' Terrain map: " + terrain_map_string.rstrip('}')
    token_positions = await generate_token_positions("Generate a terrain map for the following description: '" + token_message + "'")
    response = {"Mode": "combat initiation", "Response": combat_description, "Terrain": json.loads(terrain_map)['Terrain'], "Tokens": token_positions}
    # had an issue here with json.loads(terrain_map)['Terrain']
    return response 

async def generate_token_positions(terrain_map):
    await add_message_to_thread(tokens_thread.id, terrain_map)
    tokens_run =  client.beta.threads.runs.create(
        thread_id=tokens_thread.id,
        assistant_id=os.getenv('TOKENS_ASSISTANT_ID')
    )

    while True:
        runInfo = client.beta.threads.runs.retrieve(thread_id=tokens_thread.id, run_id=tokens_run.id)
        if runInfo.completed_at:
            break

    messages = client.beta.threads.messages.list(tokens_thread.id)
    response = json.loads((messages.data[0].content[0].text.value).lstrip('```json').rstrip('```'))['Tokens']
    return response

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