import { ChatRequestBody } from "@/types/api";
import {
  BedrockAgentRuntimeClient,
  InvokeAgentCommand,
  ResponseStream,
} from "@aws-sdk/client-bedrock-agent-runtime";

export const dynamic = "force-dynamic";
export const runtime = "edge";

// function iteratorToStream(
//   // eslint-disable-next-line @typescript-eslint/no-explicit-any
//   iterator: AsyncIterator<ResponseStream, any, any>
// ) {
//   const encoder = new TextEncoder();

//   return new ReadableStream<Uint8Array>({
//     async pull(controller) {
//       const { value, done } = await iterator.next();

//       console.log(value, done);

//       if (done) {
//         controller.close();
//       } else {
//         if (value.chunk) {
//           controller.enqueue(value.chunk.bytes);
//           controller.close();
//         } else if (value.trace?.trace?.orchestrationTrace) {
//           const orchestrationTrace = value.trace?.trace?.orchestrationTrace;

//           if (orchestrationTrace.invocationInput) {
//             if (
//               orchestrationTrace.invocationInput.knowledgeBaseLookupInput?.text
//             ) {
//               controller.enqueue(
//                 encoder.encode(
//                   `<p class="trace-step">Searching knowledge base: ${orchestrationTrace.invocationInput.knowledgeBaseLookupInput.text}...</p>`
//                 )
//               );
//             }
//           } else if (orchestrationTrace.modelInvocationInput) {
//             controller.enqueue(
//               encoder.encode(`<p class="trace-step">Prompting model...</p>`)
//             );
//           } else if (orchestrationTrace.modelInvocationOutput) {
//             controller.enqueue(
//               encoder.encode(`<p class="trace-step">Response received.</p>`)
//             );
//           } else if (orchestrationTrace.rationale) {
//             // TODO: add message here
//           } else if (
//             orchestrationTrace.observation?.knowledgeBaseLookupOutput
//           ) {
//             controller.enqueue(
//               encoder.encode(
//                 `<p class="trace-step">Knowledge base response received.</p>`
//               )
//             );
//           } else if (orchestrationTrace.observation?.finalResponse?.text) {
//             controller.enqueue(
//               encoder.encode(orchestrationTrace.observation.finalResponse.text)
//             );
//             controller.close();
//           }
//         }
//       }
//     },
//   });
// }

async function* asyncIterableToUint8Array(
  asyncIterable: AsyncIterable<ResponseStream>
): AsyncIterable<Uint8Array> {
  const encoder = new TextEncoder();

  for await (const value of asyncIterable) {
    if (value.chunk) {
      yield value.chunk.bytes!;
      return;
    } else if (value.trace?.trace?.orchestrationTrace) {
      const orchestrationTrace = value.trace?.trace?.orchestrationTrace;

      if (orchestrationTrace.invocationInput) {
        if (orchestrationTrace.invocationInput.knowledgeBaseLookupInput?.text) {
          yield encoder.encode(
            `<p class="trace-step">Searching knowledge base: ${orchestrationTrace.invocationInput.knowledgeBaseLookupInput.text}...</p>`
          );
        }
      } else if (orchestrationTrace.modelInvocationInput) {
        yield encoder.encode(`<p class="trace-step">Prompting model...</p>`);
      } else if (orchestrationTrace.modelInvocationOutput) {
        yield encoder.encode(`<p class="trace-step">Response received.</p>`);
      } else if (orchestrationTrace.rationale) {
        // TODO: add message here
      } else if (orchestrationTrace.observation?.knowledgeBaseLookupOutput) {
        yield encoder.encode(
          `<p class="trace-step">Knowledge base response received.</p>`
        );
      } else if (orchestrationTrace.observation?.finalResponse?.text) {
        yield encoder.encode(orchestrationTrace.observation.finalResponse.text);
        return;
      }
    }
  }
}

function convertToReadableStream(
  asyncIterable: AsyncIterable<ResponseStream>
): ReadableStream<Uint8Array> {
  return new ReadableStream<Uint8Array>({
    async start(controller) {
      try {
        for await (const chunk of asyncIterableToUint8Array(asyncIterable)) {
          controller.enqueue(chunk);
        }
        controller.close();
      } catch (error) {
        controller.error(error);
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

  // const asyncIterator = response.completion[Symbol.asyncIterator]();

  return new Response(convertToReadableStream(response.completion));
}
