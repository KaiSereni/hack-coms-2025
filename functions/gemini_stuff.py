from google import genai
from typing import Literal, Union
import os, json, base64

UserTrashInfo = dict[Literal["num_trash_bins", "region", "comments"], Union[int, str]]
BinInfo = dict[Literal["title", "description", "count"], Union[str, int]]
TrashIdentification = dict[Literal["title", "more_info"], str]

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
with open('trash-sorter-research.txt', 'r') as f:
    TRASH_SORTER_SYSTEM_PROMPT = f.read()
with open('trash-sorter-structured-prompt.txt', 'r') as f:
    TRASH_SORTER_STRUCTURED_PROMPT = f.read()
with open('identify-trash-prompt.txt', 'r') as f:
    IDENTIFY_TRASH_PROMPT = f.read()

client = genai.Client(api_key=GEMINI_API_KEY)

def generate_bin_plan(user_input: UserTrashInfo, model="gemini-flash-lite-latest") -> list[BinInfo]: # AI ASSISTED
    user_input_string = json.dumps(user_input)
    
    grounding_config = genai.types.GenerateContentConfig(
        system_instruction=TRASH_SORTER_SYSTEM_PROMPT,
        tools=[genai.types.Tool(google_search=genai.types.GoogleSearch())]
    )

    grounded_response = client.models.generate_content(
        model=model,
        contents=[user_input_string],
        config=grounding_config
    )

    chat_history = [
        genai.types.Content(role="user", parts=[genai.types.Part.from_text(text=user_input_string)]),
        grounded_response.candidates[0].content
    ]

    structured_config = genai.types.GenerateContentConfig(
        response_mime_type="application/json",
        response_schema=genai.types.Schema(
            type = genai.types.Type.OBJECT,
            required = ["bins"],
            properties = {
                "bins": genai.types.Schema(
                    type = genai.types.Type.ARRAY,
                    items = genai.types.Schema(
                        type = genai.types.Type.OBJECT,
                        required = ["title", "description", "count"],
                        properties = {
                            "title": genai.types.Schema(
                                type = genai.types.Type.STRING,
                            ),
                            "description": genai.types.Schema(
                                type = genai.types.Type.STRING,
                            ),
                            "count": genai.types.Schema(
                                type = genai.types.Type.INTEGER,
                            ),
                        },
                    ),
                ),
            },
        ),
        system_instruction=[
            genai.types.Part.from_text(text=TRASH_SORTER_SYSTEM_PROMPT),
        ],
    )

    structured_response = client.models.generate_content(
        model=model,
        contents=chat_history + [TRASH_SORTER_STRUCTURED_PROMPT],
        config=structured_config,
    )

    return structured_response.parsed["bins"]


def get_image_bytes(base64_string: str) -> bytes: # AI GENERATED
    """
    Decodes a base64 string and returns the raw image bytes. 
    It handles common data URI prefixes (e.g., 'data:image/jpeg;base64,').
    """
    # Strip the data URI prefix if it exists
    if ',' in base64_string:
        base64_string = base64_string.split(',', 1)[1]
    
    # Pad the string if its length is not a multiple of 4 (necessary for correct decoding)
    padding_needed = len(base64_string) % 4
    if padding_needed != 0:
        base64_string += '=' * (4 - padding_needed)

    return base64.b64decode(base64_string)

def generate_identify_trash(bins_info: list[BinInfo], base64_image: str, mime_type: str = "image/jpeg") -> dict[Literal["title", "more_info"], str]: # AI ASSISTED
    reformatted_bins_info: list = []
    for i in range(len(bins_info)):
        this_bin_info = bins_info[i]
        reformatted_bins_info.append({
            'title': this_bin_info['title'],
            'description': this_bin_info['description'],
            'id': i
        })

    prompt = f"{IDENTIFY_TRASH_PROMPT}\n\nTrash json:\n{json.dumps(bins_info)}"
    image_bytes = get_image_bytes(base64_image)

    image_part = genai.types.Part.from_bytes(
        data=image_bytes,
        mime_type=mime_type
    )

    contents = [prompt, image_part]

    identify_trash_config = genai.types.GenerateContentConfig(
        response_mime_type="application/json",
        response_schema=genai.types.Schema(
            type = genai.types.Type.OBJECT,
            required = ["bin_id"],
            properties = {
                "bin_id": genai.types.Schema(
                    type = genai.types.Type.INTEGER,
                ),
                "more_info": genai.types.Schema(
                    type = genai.types.Type.STRING,
                ),
            },
        ),
    )

    response = client.models.generate_content(
        model='gemini-2.5-flash',
        contents=contents,
        config=identify_trash_config
    ).parsed

    return {
        "title": bins_info[response['bin_id']]['title'],
        "more_info": bins_info[response['bin_id']].get("more_info", '')
    }

if __name__ == "__main__":
    bin_plan = generate_bin_plan({"num_trash_bins": 5, "region": "Rochester, NY", "comments": "The trash bins are all the same size. They will be in a food court."})
    print(bin_plan)
    print("-------")
    with open('example_trash.jpg', 'rb') as f:
        binary_data = f.read()
        base64_bytes = base64.b64encode(binary_data).decode('utf-8')
    print(generate_identify_trash(bin_plan, base64_bytes))