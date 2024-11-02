from supabase import create_client
from dotenv import dotenv_values
import json

config = dotenv_values(".env")

def lambda_handler(event, context):

    # agent = event['agent']
    action_group = event['actionGroup']
    function = event['function']
    parameters = event.get('parameters', [])

    param_dict = {param["name"]: param["value"] for param in parameters}

    supabase = create_client(config["SUPABASE_URL"], config["SUPABASE_KEY"])

    response = supabase.table("players").select("username, league, team, country, region, agents, rounds, rating, acs, kd, kast, adr, kpr, apr, fkpr, fdpr, hs, clutch_rate").limit(10)

    if "agents" in param_dict:
        response = response.contains("agents", json.loads(param_dict["agents"]))
    if "league" in param_dict:
        response = response.like("league", f"%{param_dict['league']}%")
    if "minRating" in param_dict:
        response = response.gte("rating", param_dict["minRating"])
    if "region" in param_dict:
        response = response.like("region", f"%{param_dict['region']}%")
    if "sortBy" in param_dict:
        response = response.order(param_dict["sortBy"], desc=True)
    
    response = response.execute()

    response_body = {
        'TEXT': {
            'body': json.dumps(response.data)
        }
    }
    
    function_response = {
        'actionGroup': action_group,
        'function': function,
        'functionResponse': {
            'responseBody': response_body
        }
    }
    
    session_attributes = event['sessionAttributes']
    prompt_session_attributes = event['promptSessionAttributes']
    
    action_response = {
        'messageVersion': '1.0', 
        'response': function_response,
        'sessionAttributes': session_attributes,
        'promptSessionAttributes': prompt_session_attributes
    }
        
    return action_response

# if __name__ == "__main__":
#     res = lambda_handler({
#         "actionGroup": None,
#         "function": None,
#         "parameters": [
#             {
#                 "name": "league",
#                 "type": "string",
#                 "value": "VCT International"
#             },
#             {
#                 "name": "agents",
#                 "type": "array",
#                 "value": '["Raze"]'
#             }
#         ],
#         "sessionAttributes": {},
#         "promptSessionAttributes": {}
#     }, None)

#     print(res)