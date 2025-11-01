# 2025 HACK.COMS Hackathon
Solo project by Kai Sereni, a Freshman

## Blog (during hackathon)

### T = 12:30 PM

I just want to mention that I straight up did not realize there wouldn't be a prompt or something at the start of the hackathon so I came up with this in 30 minutes lol </br>

<strong>Here's my idea:</strong>

* An app that identifies trash and sorts it based on the type
* Designed to be very easy to implement for any trash can
* It can be opened on an iPad or any screen with a camera
* The owner might have, for example, 6 different bins and wants to know what types of trash each bin should take in order for the bins to have the most positive environmental impact for their specific region. The owner will input a certain number of bins, their city and state, and optionally some more information (such as size, the facility's hauling capacity, the kids of trash generated in the location, etc.)
* The owner will put in the information and Google Gemini will be called and will use grounding with Google search to find information about the informatino provided. Then, it will use structured output to generate a plan for each trash can.
* The owner can then put the device out (iPads have a lock mode so that only one page is accessible) with the webpage open. 
* The user should then be able to take a photo of their trash, and it should be sorted using Gemini's multimodal API with a structured output.
* This will be hosted with Google Firebase, the frontend will use NextJS, and the backend will be in Python (because those are the things I'm most experienced with)
* All user data will be stored in cookies, I couldn't be bothered to implement login stuff
* Domain will be [trash.ka1.tech](https://trash.ka1.tech)
okay let's do this