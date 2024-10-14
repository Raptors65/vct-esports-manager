# TeamForge

TeamForge is an LLM-powered digital assistant designed to help you build a VALORANT esports team.



## Inspiration

VALORANT has a massive esports scene with players from all around the world. It can be overwhelming for a general manager looking for players to form a new team. That's where TeamForge comes in.

The name for TeamForge is inspired by [VALORANT's Episode 4 cinematic](https://youtu.be/OyLHi34Qzv4?si=QvP0mBD1lXfUWVQ3&t=216) and also reflects its purpose (i.e., helping a general manager *forge* a new *team*).

## What it does

TeamForge simplifies the team building process through an easy-to-use chat interface. Users can ask it to build a team with any criteria, and it will select players from VCT International, VCT Challengers, and/or VCT Game Changers (depending on the prompt) along with justification using stats and roles.

## How I built it

The chatbot is powered by an Amazon Bedrock agent using Claude 3.5 Sonnet as its model. The player data was scraped from [vlr.gg](https://www.vlr.gg/) and stored in text files using Python and Beautiful Soup. It was then stored in an Amazon S3 bucket in 3 separate files, one for each league (VCT International, VCT Challengers, and VCT Game Changers). This was connected to an Amazon Bedrock knowledge base with the Titan Text Embeddings v2 model and Pinecone. The web application was built using Next.js and Tailwind and hosted on Vercel.

## Challenges I ran into

It was challenging to organize the large amount of player data. I tried several formats, including CSV and JSON, before eventually deciding on a text file with the info of each player stated in plain English. From my testing, putting the data into concise sentences significantly improved agent performance versus just having it in a CSV or JSON file.

## Accomplishments that I'm proud of

It was my first time using AWS's services, so I'm proud I was able to successfully use several of them (Bedrock agents and knowledge bases, S3, and Secrets Manager) in this project.

## What I learned

I learned a ton about AWS, generative AI, and web scraping. I also realized it takes a lot of research and effort to form a successful VALORANT team.

## What's next for TeamForge

Connecting TeamForge to more detailed data, like movement data from specific games, would be awesome.