import { inject, injectable, singleton} from "tsyringe"
import { Client, Message, Intents } from 'discord.js'


interface IDCWrapper {
    cleanup(): void,
    resolveMessage(msg: Message): Promise<Message>,
    deleteMessage(msgId: string): void
}

@injectable()
@singleton()
class DCWrapper implements IDCWrapper {
    private client: Client;

    constructor() {
        this.client = new Client({
            partials: ['MESSAGE'],
            intents: Intents.FLAGS.GUILDS
        });

    }

    cleanup() {

    }

    resolveMessage(msg: Message): Promise<Message> {
        if (msg.partial) {
            return msg.fetch()
        } else {
            return new Promise<Message>((resolve, _) => resolve(msg))
        }
    }
    
    deleteMessage(msgId: string) {
        this.client
    }

    sendLatex(userMsgId: string, latexExpressions: string[]): string[] {

        return []
    }
}

export {
    DCWrapper,
    IDCWrapper
}