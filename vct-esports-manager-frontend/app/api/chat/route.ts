import { ChatRequestBody } from "@/types/api";
import {
  BedrockAgentRuntimeClient,
  InvokeAgentCommand,
  ResponseStream,
} from "@aws-sdk/client-bedrock-agent-runtime";

export const dynamic = "force-dynamic";
export const runtime = "edge";

function iteratorToStream(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  iterator: AsyncIterator<ResponseStream, any, any>
) {
  return new ReadableStream({
    async pull(controller) {
      const { value, done } = await iterator.next();

      if (done) {
        controller.close();
      } else {
        controller.enqueue(value.chunk!.bytes);
      }
    },
  });
}

export async function POST(request: Request) {
  const client = new BedrockAgentRuntimeClient({
    region: process.env.AWS_REGION!,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
    },
  });

  const { sessionId, inputText } = (await request.json()) as ChatRequestBody;

  const command = new InvokeAgentCommand({
    agentId: process.env.AWS_AGENT_ID!,
    agentAliasId: process.env.AWS_AGENT_ALIAS_ID!,
    sessionId,
    inputText: inputText,
  });

  const response = await client.send(command);

  if (response.completion === undefined) {
    return new Response("Completion undefined", { status: 400 });
  }

  const asyncIterator = response.completion[Symbol.asyncIterator]();

  return new Response(iteratorToStream(asyncIterator));
}
