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

    text_response = ""

    for player in response.data:
        if len(player["agents"]) == 0:
            agents = ""
        elif len(player["agents"]) == 1:
            agents = player["agents"][0]
        elif len(player["agents"]) == 2:
            agents = f"{player["agents"][0]} and {player["agents"][1]}"
        else:
            agents = ", ".join(player["agents"][:-1]) + f", and {player["agents"][-1]}"
        
        text_response += f"""{player["username"]} is a {player["league"]} player{f" for {player["team"]}" if player["team"].strip() else ""}{f" from {player["country"]}" if player["country"] != "N/A" else ""} who plays{" " + agents if agents else ""}:
- {player["rounds"]} rounds played
- {player["rating"]} rating
- {player["acs"]} average combat score
- {player["kd"]} K/D
- {player["kast"]}% KAST
- {player["adr"]} average damage per round
- {player["kpr"]} kills per round
- {player["adr"]} assists per round
- {player["fkpr"]} first kills per round
- {player["fdpr"]} first deaths per round
- {player["hs"]}% headshots
- {player["clutch_rate"]}% clutch success rate\n\n"""

    response_body = {
        'TEXT': {
            'body': text_response
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