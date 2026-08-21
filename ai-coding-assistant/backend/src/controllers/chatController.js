import geminiService from '../services/geminiService.js';
import fileService from '../services/fileService.js';
import commandService from '../services/commandService.js';

const toolDefinitions = [
  {
    name: 'list_files',
    description: 'List files and directories under the target project root.',
    parameters: {
      type: 'object',
      properties: {
        path: {
          type: 'string',
          description: 'Relative path from the target project root to list.'
        }
      },
      required: ['path']
    }
  },
  {
    name: 'read_file',
    description: 'Read the contents of a file under the target project root.',
    parameters: {
      type: 'object',
      properties: {
        path: {
          type: 'string',
          description: 'Relative path from the target project root to read.'
        }
      },
      required: ['path']
    }
  },
  {
    name: 'write_file',
    description: 'Write text content to a file under the target project root.',
    parameters: {
      type: 'object',
      properties: {
        path: {
          type: 'string',
          description: 'Relative path from the target project root to write.'
        },
        content: {
          type: 'string',
          description: 'Text content to write to the file.'
        }
      },
      required: ['path', 'content']
    }
  },
  {
    name: 'run_command',
    description: 'Run a shell command in the target project root and return the output.',
    parameters: {
      type: 'object',
      properties: {
        command: {
          type: 'string',
          description: 'Shell command to execute in the target project root.'
        }
      },
      required: ['command']
    }
  }
];

const handleMessage = async (payload, emit) => {
  const conversation = payload.conversation || [];
  const userMessage = payload.message;

  if (!userMessage) {
    throw new Error('No message supplied');
  }

  emit('assistant_status', { status: 'thinking', message: 'Sending prompt to Gemini...' });

  const initialMessages = [
    {
      role: 'system',
      content: 'You are a local AI coding assistant. Use tools only when needed to inspect or modify files in the allowed target project root. Preserve project safety and only act on user-approved changes.'
    },
    ...conversation,
    {
      role: 'user',
      content: userMessage
    }
  ];

  const geminiResponse = await geminiService.sendChatRequest(initialMessages, toolDefinitions);

  if (geminiResponse.toolCall) {
    emit('assistant_status', { status: 'tool_call', message: `Executing tool: ${geminiResponse.toolCall.name}` });
    const toolResult = await executeTool(geminiResponse.toolCall);
    emit('tool_result', toolResult);

    const followupMessages = [
      ...initialMessages,
      {
        role: 'assistant',
        content: geminiResponse.toolCall.description || 'Tool call result'
      },
      {
        role: 'tool',
        name: geminiResponse.toolCall.name,
        content: JSON.stringify(toolResult)
      }
    ];

    const followupResponse = await geminiService.sendChatRequest(followupMessages, toolDefinitions);
    return followupResponse.text;
  }

  return geminiResponse.text;
};

const executeTool = async (toolCall) => {
  const { name, arguments: args } = toolCall;

  switch (name) {
    case 'list_files':
      return fileService.listFiles(args.path);
    case 'read_file':
      return fileService.readFile(args.path);
    case 'write_file':
      return fileService.writeFile(args.path, args.content);
    case 'run_command':
      return commandService.runCommand(args.command);
    default:
      throw new Error(`Unknown tool: ${name}`);
  }
};

export default { handleMessage };
