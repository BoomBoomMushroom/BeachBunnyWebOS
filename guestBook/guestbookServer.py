from flask import Flask, request
from flask_cors import CORS
import json
import requests
import time
import os
import re
import unicodedata

guestbookEntriesPath = "./guestbookEntries.json"
successWebhookUrl = None
honeypotWebhookUrl = None
filteredWebhookUrl = None

try:
    with open("./webhookUrl.json", "r") as f:
        webhookUrls: dict = json.load(f)
        successWebhookUrl = webhookUrls.get("success", None)
        honeypotWebhookUrl = webhookUrls.get("honeypot", None)
        filteredWebhookUrl = webhookUrls.get("filtered", None)
        print(f"Loaded webhook urls:\n\t{successWebhookUrl=}\n\t{honeypotWebhookUrl=}\n\t{filteredWebhookUrl=}")
except FileNotFoundError as e:
    print("Didn't find a webhook file, guess we wont use webhooks")

def sendWebhookMessage(webhookUrl, message):
    if webhookUrl == None: return
    requests.post(webhookUrl, {"content": message})

def sendCaughtInHoneypotMessage(webhookMessage, reason):
    message = f"Message caught in honeypot for reason \"{reason}\"\n\n```{webhookMessage}```"
    sendWebhookMessage(honeypotWebhookUrl, message)

def checkAndFilterMessage(webhookMessage: str="") -> bool:
    # use webhook message b/c the username or website could have blacklisted words in them
    # also we're going to use a simple `BLACKLISTED_WORD in text` search, since im quite positive my black listed words aren't really gonna be accidently included
    #   and if I get false positives I'll add them in manually
    flattenedMessage: str = webhookMessage
    flattenedMessage = unicodedata.normalize("NFKD", flattenedMessage) # turn special cursive characters and ligitures and stuff into "normal" characters
    flattenedMessage = flattenedMessage.lower()
    flattenedMessage = re.sub(r"[^a-zA-Z]", "", flattenedMessage)

    foundKeyWord: str = None

    with open("./blacklisted_words.txt", "r") as f:
        blacklistedWords = [word.strip() for word in f.readlines()] # removes `\n` at the end of lines
        for word in blacklistedWords:
            if word in flattenedMessage:
                foundKeyWord = word
                break

    if foundKeyWord != None:
        # We found a black listed word D:
        message = f"Filtered out a message from keyword `{foundKeyWord}`\nIf this is a false positive you can add the message into `guestbookEntries.json` w/ timestamp `{time.time()}`\n\n```\n{webhookMessage}\n```"
        sendWebhookMessage(filteredWebhookUrl, message)
        return True
    
    return False


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

    # make the webhook message, it'll be used in all webhooks, succeeded, failed, or honeypotted
    urlAdd = f" @ {websiteUrl}" if len(websiteUrl) != 0 else ""
    webhookMsg = f"{name}{urlAdd}\n{message}"
    
    returnData = f"Successfully submitted your guestbook entry! Make sure to reload the site to see your entry.\nYou can now close this tab <3"
    failData = f"Some information you entered is invalid! You can close this tab though!"

    # honey pot triggered, humans cannot see this field, silently say we've failed
    # return a success so bots dont freak out and try to send another message
    if len(link) > 0:
        sendCaughtInHoneypotMessage(webhookMsg, f"Honeypot field ('link') filled out w/ value `{link}`")
        return returnData
    if botProtection.lower().strip() != "sabrina":
        # Failed to enter my name, not a human
        sendCaughtInHoneypotMessage(webhookMsg, f"Name field doesn't equal 'sabrina' instead equals `{botProtection}`")
        return failData

    # Just invalid data passed it, nothing to call home abt (haha get it, cause im doing webhooks)
    if len(name) > 100: return failData # Too large of a name
    if len(message) > 5000: return failData # message too large
    if len(websiteUrl) > 2000: return failData # HAS to be a fake url b/c they cannot be longer than 2000 chars

    # Check for offensive stuff and slurs and bad things
    wasBlockedByFilter: bool = checkAndFilterMessage(webhookMsg)
    if wasBlockedByFilter == True: return returnData # We'll say success while silently not saving it

    # All the info looks valid and doesn't seem like a bot/spam
    sendWebhookMessage(successWebhookUrl, webhookMsg)

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

