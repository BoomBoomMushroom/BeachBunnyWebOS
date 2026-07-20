from flask import Flask, request
from flask_cors import CORS
import json
import requests
import time
import os

guestbookEntriesPath = "./guestbookEntries.json"
webhookUrl = None
try:
    with open("./webhookUrl.txt", "r") as f: webhookUrl = f.read().strip()
except FileNotFoundError as e:
    print("Didn't find a webhook file, guess we wont use a webhook")

app = Flask(__name__)
cors = CORS(app)

@app.route("/getGuestbook", methods=["GET"])
def getGuestbook():
    data = []
    if os.path.exists(guestbookEntriesPath):
        try:
            with open(guestbookEntriesPath, "r") as f: data = json.load(f)
        except: pass # failed to read file for whatever reason

    return data

@app.route("/guestbookSubmit", methods=["POST"])
def guestbookSubmit():
    data = request.form
    name: str = data["name"]
    link: str = data["link"] # our honeypot
    websiteUrl: str = data["websiteUrl"]
    message: str = data["message"]
    botProtection: str = data["botProtection"]
    
    returnData = f"Successfully submitted your guestbook entry! Make sure to reload the site to see your entry.\nYou can now close this tab <3"
    failData = f"Some information you entered is invalid! You can close this tab though!"

    # honey pot triggered, humans cannot see this field, silently say we've failed
    # return a success so bots dont freak out and try to send another message
    if len(link) > 0: return returnData

    if len(name) > 100: return failData # Too large of a name
    if len(message) > 5000: return failData # message too large
    if len(websiteUrl) > 2000: return failData # HAS to be a fake url b/c they cannot be longer than 2000 chars
    if botProtection.lower().strip() != "sabrina": return failData # Failed to enter my name, not a human

    # All the info looks valid and doesn't seem like a bot/spam
    if webhookUrl != None:
        urlAdd = f" @ {websiteUrl}" if len(websiteUrl) != 0 else ""
        webhookMsg = f"{name}{urlAdd}\n{message}"
        requests.post(webhookUrl, {"content": webhookMsg})

    messageData = {
        "name": name,
        "website": websiteUrl,
        "message": message,
        "postEpoch": time.time()
    }
    allEntries: list[dict] = getGuestbook()
    allEntries.insert(0, messageData) # insert to we dont have to reverse the list to get most recent entries
    with open(guestbookEntriesPath, "w") as f: json.dump(allEntries, f, indent=4)

    return returnData

if __name__ == '__main__':
    app.run(host="0.0.0.0", port=5000)

