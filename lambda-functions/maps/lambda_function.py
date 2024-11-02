import json

must_haves = {
    "Abyss": ["Cypher", "Sova", "Jett"],
    "Ascent": ["Sova", "Killjoy", "Omen", "Jett", "KAY/O"],
    "Bind": ["Raze", "Viper", "Brimstone"],
    "Breeze": ["Cypher", "Sova", "Viper", "Jett"],
    "Fracture": ["Breach", "Raze", "Brimstone"],
    "Haven": ["Breach", "Sova", "Omen"],
    "Icebox": ["Sova", "Killjoy", "Viper", "Jett"],
    "Lotus": ["Omen", "Fade"],
    "Pearl": ["Killjoy", "Viper", "Jett", "Harbor"],
    "Split": ["Raze", "Cypher", "Skye"],
    "Sunset": ["Cypher", "Omen"]
}

replaceables = {
    "Abyss": [["Omen", "Astra"], ["KAY/O", "Gekko", "Harbor"]],
    "Ascent": [],
    "Bind": [["Fade", "Skye"], ["Gekko", "Cypher"]],
    "Breeze": [["KAY/O", "Yoru"]],
    "Fracture": [["Cypher", "Killjoy"], ["Fade", "Viper", "KAY/O"]],
    "Haven": [["Killjoy", "Cypher"], ["Jett", "Neon"]],
    "Icebox": [["Reyna", "Gekko", "KAY/O", "Sage", "Harbor"]],
    "Lotus": [["Viper", "Breach"], ["Killjoy", "Cypher"], ["Raze", "Neon"]],
    "Pearl": [["Skye", "Sova", "Gekko"]],
    "Split": [["Viper", "Jett", "Breach"], ["Omen", "Astra"]],
    "Sunset": [["Neon", "Raze"], ["Sova", "Gekko"], ["Breach", "KAY/O"]]
}

def lambda_handler(event, context):

    # agent = event['agent']
    action_group = event['actionGroup']
    function = event['function']
    parameters = event.get('parameters', [])

    param_dict = {param["name"]: param["value"] for param in parameters}

    agents = json.loads(param_dict["agents"])

    text_response = ""
    for (map, required_agents) in must_haves.items():
        missing_agents = []

        for must_have in required_agents:
            if must_have not in agents:
                missing_agents.append(must_have)

        if len(missing_agents) == 0:
            or_agents = ""
        elif len(missing_agents) == 1:
            or_agents = missing_agents[0]
        elif len(missing_agents) == 2:
            or_agents = f"{missing_agents[0]} or {missing_agents[1]}"
        else:
            or_agents = ", ".join(missing_agents[:-1]) + f", or {missing_agents[-1]}"
        
        if len(required_agents) == 0:
            and_agents = ""
        elif len(required_agents) == 1:
            and_agents = required_agents[0]
        elif len(required_agents) == 2:
            and_agents = f"{required_agents[0]} and {required_agents[1]}"
        else:
            and_agents = ", ".join(required_agents[:-1]) + f", and {required_agents[-1]}"
        
        if missing_agents:
            text_response += f"{map} is not a great map for this team because it doesn't have any players that play {or_agents}, who {'is an' if len(missing_agents) == 1 else 'are'} important agent{'s' if len(missing_agents) > 1 else ''} on {map}.\n\n"
        else:
            text_response += f"{map} is a good map for this team because it has players that play {and_agents}, who {'is' if len(required_agents) == 1 else 'are'} the most important agent{'s' if len(required_agents) > 1 else ''} on {map}.\n\n"

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
#           {
#             "name": "player1_agents",
#             "type": "array",
#             "value": "[\"Phoenix\", \"Reyna\"]"
#           },
#           {
#             "name": "player2_agents",
#             "type": "array",
#             "value": "[\"Sova\", \"Fade\"]"
#           },
#           {
#             "name": "player3_agents",
#             "type": "array",
#             "value": "[\"Killjoy\", \"Cypher\"]"
#           },
#           {
#             "name": "player4_agents",
#             "type": "array",
#             "value": "[\"Omen\", \"Astra\"]"
#           },
#           {
#             "name": "player5_agents",
#             "type": "array",
#             "value": "[\"KAY/O\", \"Raze\"]"
#           },
#         ],
#         "sessionAttributes": {},
#         "promptSessionAttributes": {}
#     }, None)

#     print(res)
#     print(res["response"]["functionResponse"]["responseBody"]["TEXT"]["body"])