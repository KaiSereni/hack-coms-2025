# 2025 HACK.COMS Hackathon
Solo project by Kai Sereni, a Freshman

## Developer Docs
You'll need:
* Node
* Python 3.13
* `npm i -g firebase-tools`
* A Gemini API key in your functions/.env file labeled GEMINI_API_KEY

Install everything then run: `firebase emulators:start` to start the emulator

## Blog (during hackathon)

### T = 12:30 PM

I just want to mention that I straight up did not realize there wouldn't be a prompt or something at the start of the hackathon so I came up with this in 30 minutes lol </br>

<strong>Here's my idea:</strong>

* An app that identifies trash and sorts it based on the type
* Designed to be software-only, and very easy to implement on any device for any number of trash cans
* Researches the plastic separation laws by region, as well as the trash sorting needs of the region
* It can be opened on an iPad or any screen with a camera
* The owner might have, for example, 6 different bins and wants to know what types of trash each bin should take in order for the bins to have the most positive environmental impact for their specific region. The owner will input a certain number of bins, their city and state, and optionally some more information (such as size, the facility's hauling capacity, the kids of trash generated in the location, etc.)
* The owner will put in the information and Google Gemini will be called and will use grounding with Google search to find information about the informatino provided. Then, it will use structured output to generate a plan for each trash can.
* The owner can then put the device out (iPads have a lock mode so that only one page is accessible) with the webpage open. 
* The user should then be able to take a photo of their trash, and it should be sorted using Gemini's multimodal API with a structured output.
* This will be hosted with Google Firebase, the frontend will use NextJS, and the backend will be in Python (because those are the things I'm most experienced with)
* All user data will be stored in cookies, I couldn't be bothered to implement login stuff
* Domain will be [trash.ka1.tech](https://trash.ka1.tech)
okay let's do this

### T = 5:50 PM

That went way faster than I thought! The Python was really fun to write, and the UI was entirely AI-generated and is extremely bare-bones. This is a minimum viable product.

## AI Disclosure

The frontend was 90% AI-generated. Some of the functions in the backend were AI-assisted, but are less than 5% AI and AI was only used to work out basic syntax for the google-genai API. I came up with the structure of the project, and the AI pipline, completely by myself. I don't use AI if I can help it, I was just pressed for time and couldn't spend time reading documentation or developing a frontend from scratch.

## Attempted Awards

* Best Hack for Communities
* Best Solo Hack
* First Flight
* Best Use of Gemini API
* Best .Tech Domain Name

## Next steps

* The security is very bad. There's no app check, the cors isn't configured in the backend, it's vulnerable to prompt injection, users can call the functions unauthenticated, and it's difficult to set up an iPad for public use such that users can't access the other menu (it is possible, just not easy).
* Sometimes, the multimodal API reads what's on the can and might, for example, classify a plastic bottle that says "banana" on it as compost. This will need to be fixed.
* I'd love to use a more advanced model if I had more Gemini credits.
* The UI could be much, much cleaner.
* I could add a login so one person can access the same config on multiple devices.