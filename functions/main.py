from firebase_functions import https_fn, options
from firebase_functions.options import set_global_options
from firebase_admin import initialize_app
from gemini_stuff import generate_bin_plan, generate_identify_trash
import json

set_global_options(max_instances=10)
initialize_app()

@https_fn.on_request(cors=options.CorsOptions(cors_origins="*", cors_methods=["POST"]))
def bin_plan(req: https_fn.Request) -> https_fn.Response:
    r = generate_bin_plan(user_input=req.json)
    return {'data': r}

@https_fn.on_request(cors=options.CorsOptions(cors_origins="*", cors_methods=["POST"]))
def identify_trash(req: https_fn.Request) -> https_fn.Response:
    r = generate_identify_trash(bins_info=req.json['data']['bins_info'], base64_image=req.json['data']['base64_image'])
    return {"data": r}