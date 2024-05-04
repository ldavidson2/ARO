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
thread = client.beta.threads.create()
VECTOR_STORE_ID = "vs_ZlLWms8d7tFBYyGZx5zLDaBh"

# campaign_info_exists = False
# campaign_format_exists = False

# files = client.files.list()

# for file in files.data:
#     print(file)
#     if file.filename == "campaign-info.txt":
#         campaign_info_exists = True
#     if file.filename == "campaign.json":
#         campaign_format_exists = True

# if not campaign_info_exists:
#     campaign_info = client.files.create(
#         file=open("aro-files/campaign-info.txt", "br"),
#         purpose="assistants"
#     )
#     campaign_info_exists = True

# if not campaign_format_exists:
#     campaign_format = client.files.create(
#         file=open("aro-files/campaign.json", "br"),
#         purpose="assistants"
#     )
#     campaign_format_exists = True

# try:
#     my_updated_assistant = client.beta.assistants.update(
#         os.getenv('ASSISTANT_ID'),
#         file_ids=[campaign_info.id, campaign_format.id],
#     )
# except:
#     print("could not find the files.")


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
        url = await generate_image(json.loads(messages.data[0].content[0].text.value)['Response'])
        return url
    else:
        message = await add_message_to_thread("Determin the appropriate response and return only one response to the following input: " + user_message)
        messages = await ask_ARO()
        response = messages.data[0].content[0].text.value
        print(response)
        return   Response(content=response, media_type="application/json") 

async def add_message_to_thread(user_message):
    message = client.beta.threads.messages.create(
        thread_id=thread.id,
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