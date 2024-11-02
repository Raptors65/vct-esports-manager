import requests
from bs4 import BeautifulSoup, Tag
import csv

from pycountry import countries
import pycountry_convert as pc

headings = [
    "username",
    "league",
    "team",
    "country",
    "region",
    "agents",
    "rounds",
    "rating",
    "acs",
    "kd",
    "kast",
    "adr",
    "kpr",
    "apr",
    "fkpr",
    "fdpr",
    "hs",
    "clutch_rate",
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

continents_to_regions = {
    "North America": "Americas",
    "South America": "Americas",
    "Europe": "EMEA",
    "Africa": "EMEA",
    "Asia": "Pacific",
    "Australia": "Pacific",
    "Oceania": "Pacific"
}

overrides = {
    "China": "China",
    "Armenia": "EMEA",
    "Azerbaijan": "EMEA",
    "Bahrain": "EMEA",
    "Cyprus": "EMEA",
    "Egypt": "EMEA",
    "Georgia": "EMEA",
    "Iraq": "EMEA",
    "Israel": "EMEA",
    "Jordan": "EMEA",
    "Kazakhstan": "EMEA",
    "Kuwait": "EMEA",
    "Kyrgyzstan": "EMEA",
    "Lebanon": "EMEA",
    "Mongolia": "EMEA",
    "Oman": "EMEA",
    "Palestine": "EMEA",
    "Qatar": "EMEA",
    "Russia": "EMEA",
    "Saudi Arabia": "EMEA",
    "Tajikistan": "EMEA",
    "Turkey": "EMEA",
    "Turkmenistan": "EMEA",
    "United Arab Emirates": "EMEA",
    "Uzbekistan": "EMEA"
}


def extract_overall_data(stats: list[str], filename: str, league: str):
    """Extract data from VLR's stats page."""

    soup = BeautifulSoup(stats)

    table_body = soup.find("tbody")

    with open(filename, "a", newline="", encoding="UTF-8") as file:
        csv_writer = csv.writer(file)
        csv_writer.writerow(headings)
        for table_row in table_body.children:
            if isinstance(table_row, Tag):
                color_sqs = table_row.find_all(class_="mod-color-sq")

                country_code = table_row.find("i").get("class")[-1][-2:].upper()
            
                country = countries.get(alpha_2=country_code)
                if country is None:
                    if country_code == "EN":
                        country_name = "England"
                        region = "EMEA"
                    else:
                        country_name = "N/A"
                        region = "N/A"
                else:
                    country_name = country.name
                    try:
                        continent_code = pc.country_alpha2_to_continent_code(country_code)
                        region = overrides[country_name] if country_name in overrides else continents_to_regions[pc.convert_continent_code_to_continent_name(continent_code)]
                    except:
                        if country_code == "SX":
                            region = "Americas"
                        else:
                            print(f"Unknown country code: {country_code}")
                            region = "N/A"


                agents_list = [
                    f"\"{agentConv[img.get("src").split("/")[-1].split(".")[0]]}\""
                    for img in table_row.find(class_="mod-agents").find_all("img")[:-1]
                ]

                # if len(agents_list) == 0:
                #     agents = ""
                # elif len(agents_list) == 1:
                #     agents = agents_list[0]
                # elif len(agents_list) == 2:
                #     agents = f"{agents_list[0]} and {agents_list[1]}"
                # else:
                #     agents = ", ".join(agents_list[:-1]) + f", and {agents_list[-1]}"

                agents = "[" + ", ".join(agents_list) + "]"

                username = table_row.find(class_="text-of").get_text()  # Username
                team = table_row.find(class_="stats-player-country").get_text()
                num_rounds = table_row.find(
                    class_="mod-rnd"
                ).get_text()  # Number of Rounds
                rating = color_sqs[0].get_text()  # Rating
                acs = color_sqs[1].get_text()  # ACS
                kd = color_sqs[2].get_text()  # K/D
                kast = color_sqs[3].get_text()[:-1]  # KAST
                adr = color_sqs[4].get_text()  # ADR
                kpr = color_sqs[5].get_text()  # KPR
                apr = color_sqs[6].get_text()  # APR
                fkpr = color_sqs[7].get_text()  # FKPR
                fdpr = color_sqs[8].get_text()  # FDPR
                hs = color_sqs[9].get_text()[:-1]  # HS%
                cl = color_sqs[10].get_text()[:-1]  # CL%

                csv_writer.writerow([username, league, team, country_name, region, agents, num_rounds, rating, acs, kd, kast, adr, kpr, apr, fkpr, fdpr, hs, cl])


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
    vct_international_vlr.text, "vct-international.csv", "VCT International"
)
extract_overall_data(vct_challengers_vlr.text, "vct-challengers.csv", "VCT Challengers")
extract_overall_data(
    vct_game_changers_vlr.text, "vct-game-changers.csv", "VCT Game Changers"
)
