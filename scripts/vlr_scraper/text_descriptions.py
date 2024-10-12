import requests
from bs4 import BeautifulSoup, Tag

from pycountry import countries

headings = [
    "Username",
    "League",
    "Team",
    "Country",
    "Agents",
    "Number of Rounds",
    "Rating",
    "ACS",
    "K/D",
    "KAST",
    "ADR",
    "KPR",
    "APR",
    "FKPR",
    "FDPR",
    "Headshot %",
    "Clutch %",
]

agentConv = {
    "brimstone": "Brimstone",
    "viper": "Viper",
    "omen": "Omen",
    "killjoy": "Killjoy",
    "cypher": "Cypher",
    "sova": "Sova",
    "sage": "Sage",
    "phoenix": "Phoenix",
    "jett": "Jett",
    "reyna": "Reyna",
    "raze": "Raze",
    "breach": "Breach",
    "skye": "Skye",
    "yoru": "Yoru",
    "astra": "Astra",
    "kayo": "KAY/O",
    "chamber": "Chamber",
    "neon": "Neon",
    "fade": "Fade",
    "harbor": "Harbor",
    "gekko": "Gekko",
    "deadlock": "Deadlock",
    "iso": "Iso",
    "clove": "Clove",
    "vyse": "Vyse",
}


def extract_overall_data(stats: list[str], filename: str, league: str):
    """Extract data from VLR's stats page."""

    soup = BeautifulSoup(stats)

    table_body = soup.find("tbody")

    with open(filename, "a", newline="", encoding="UTF-8") as file:
        for table_row in table_body.children:
            if isinstance(table_row, Tag):
                color_sqs = table_row.find_all(class_="mod-color-sq")

                country_code = table_row.find("i").get("class")[-1][-2:].upper()
                country = countries.get(alpha_2=country_code)

                agents_list = [
                    agentConv[img.get("src").split("/")[-1].split(".")[0]]
                    for img in table_row.find(class_="mod-agents").find_all("img")[:-1]
                ]

                if len(agents_list) == 0:
                    agents = ""
                elif len(agents_list) == 1:
                    agents = agents_list[0]
                elif len(agents_list) == 2:
                    agents = f"{agents_list[0]} and {agents_list[1]}"
                else:
                    agents = ", ".join(agents_list[:-1]) + f", and {agents_list[-1]}"

                if country is None:
                    if country_code == "EN":
                        country_name = "England"
                    else:
                        country_name = "N/A"
                else:
                    country_name = country.name

                username = table_row.find(class_="text-of").get_text()  # Username
                team = table_row.find(class_="stats-player-country").get_text()
                num_rounds = table_row.find(
                    class_="mod-rnd"
                ).get_text()  # Number of Rounds
                rating = color_sqs[0].get_text()  # Rating
                acs = color_sqs[1].get_text()  # ACS
                kd = color_sqs[2].get_text()  # K/D
                kast = color_sqs[3].get_text()  # KAST
                adr = color_sqs[4].get_text()  # ADR
                kpr = color_sqs[5].get_text()  # KPR
                apr = color_sqs[6].get_text()  # APR
                fkpr = color_sqs[7].get_text()  # FKPR
                fdpr = color_sqs[8].get_text()  # FDPR
                hs = color_sqs[9].get_text()  # HS%
                cl = color_sqs[10].get_text()  # CL%

                file.write(
                    f"""{username} is a {league} player{f" for {team}" if team.strip() else ""}{f" from {country_name}" if country_name != "N/A" else ""} who plays{" " + agents if agents else ""}:
- {num_rounds} rounds played
- {rating} rating
- {acs} average combat score
- {kd} K/D
- {kast} KAST
- {adr} average damage per round
- {kpr} kills per round
- {apr} assists per round
- {fkpr} first kills per round
- {fdpr} first deaths per round
- {hs} headshots
- {cl} clutch success rate\n\n"""
                )


vct_international_vlr = requests.get(
    "https://www.vlr.gg/stats/?event_group_id=61&event_id=all&region=all&min_rounds=200&min_rating=1550&agent=all&map_id=all&timespan=all",
    timeout=10,
)
vct_challengers_vlr = requests.get(
    "https://www.vlr.gg/stats/?event_group_id=59&event_id=all&region=all&min_rounds=200&min_rating=1550&agent=all&map_id=all&timespan=all",
    timeout=10,
)
vct_game_changers_vlr = requests.get(
    "https://www.vlr.gg/stats/?event_group_id=62&event_id=all&region=all&min_rounds=200&min_rating=1550&agent=all&map_id=all&timespan=all",
    timeout=10,
)

extract_overall_data(
    vct_international_vlr.text, "vct-international.txt", "VCT International"
)
extract_overall_data(vct_challengers_vlr.text, "vct-challengers.txt", "VCT Challengers")
extract_overall_data(
    vct_game_changers_vlr.text, "vct-game-changers.txt", "VCT Game Changers"
)
