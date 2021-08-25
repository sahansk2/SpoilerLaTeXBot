import { inject, injectable, singleton} from "tsyringe"
import { Client, Message } from 'discord.js'


interface IDCWrapper {
    cleanup(): void,
    resolveMessage(msg: Message): Promise<Message>,
    deleteMessage(msgId: string): void
}

@injectable()
@singleton()
class DCWrapper implements IDCWrapper {
    constructor(private client: Client) {

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
        
    }
}

export {
    DCWrapper,
    IDCWrapper
}