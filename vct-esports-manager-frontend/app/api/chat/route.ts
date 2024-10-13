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
  return new ReadableStream<string | Buffer | Uint8Array>({
    async pull(controller) {
      const { value, done } = await iterator.next();

      if (done) {
        controller.close();
      } else {
        // console.log(value);
        if (value.chunk) {
          controller.enqueue(value.chunk.bytes);
        } else if (value.trace?.trace?.orchestrationTrace) {
          const orchestrationTrace = value.trace?.trace?.orchestrationTrace;

          if (orchestrationTrace.invocationInput) {
            if (
              orchestrationTrace.invocationInput.knowledgeBaseLookupInput?.text
            ) {
              controller.enqueue(
                `<p class="trace-step">Searching knowledge base: ${orchestrationTrace.invocationInput.knowledgeBaseLookupInput.text}</p>`
              );
            }
          } else if (orchestrationTrace.modelInvocationInput) {
            controller.enqueue(`<p class="trace-step">Prompting model</p>`);
          } else if (orchestrationTrace.modelInvocationOutput) {
            controller.enqueue(`<p class="trace-step">Response received</p>`);
          } else if (orchestrationTrace.rationale) {
            // TODO: add message here
          } else if (
            orchestrationTrace.observation?.knowledgeBaseLookupOutput
          ) {
            controller.enqueue(
              `<p class="trace-step">Knowledge base response received</p>`
            );
          } else if (orchestrationTrace.observation?.finalResponse?.text) {
            controller.enqueue(
              orchestrationTrace.observation.finalResponse.text
            );
          }
        }
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
    enableTrace: true,
  });

  const response = await client.send(command);

  if (response.completion === undefined) {
    return new Response("Completion undefined", { status: 400 });
  }

  const asyncIterator = response.completion[Symbol.asyncIterator]();

  return new Response(iteratorToStream(asyncIterator));
}
