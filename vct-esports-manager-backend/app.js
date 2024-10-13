import express from 'express';
import { BedrockAgentRuntimeClient, InvokeAgentCommand } from "@aws-sdk/client-bedrock-agent-runtime";
import cors from 'cors';
import bodyParser from 'body-parser';

const app = express();
const port = 8080;

app.use(cors());
app.use(bodyParser.json());

app.post('/', async (req, res) => {
  const client = new BedrockAgentRuntimeClient({
    region: process.env.AWS_REGION,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
  });

  console.log(req.body);

  const { sessionId, inputText } = req.body;

  const command = new InvokeAgentCommand({
    agentId: process.env.AWS_AGENT_ID,
    agentAliasId: process.env.AWS_AGENT_ALIAS_ID,
    sessionId,
    inputText: inputText,
  });

  const response = await client.send(command);

  if (response.completion === undefined) {
    return new Response("Completion undefined", { status: 400 });
  }

  for await (const chunkEvent of response.completion) {
    res.write(chunkEvent.chunk.bytes)
  }

  res.end();
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
});