import { inject, injectable, singleton} from "tsyringe"
import { Client, Message, Intents, TextChannel, BufferResolvable } from 'discord.js'
import { get_image } from '../lib'
import { PGWrapper } from "./PGWrapper";

interface IDCWrapper {
    cleanup(): void,
    resolveMessage(msg: Message): Promise<Message>,
    deleteMessage(channelId: string, msgId: string): void,
    sendLatex( userMsgChannelId: string, userMsgId: string, latexExpressions: string[]): Promise<string[]>
}

@injectable()
@singleton()
class DCWrapper implements IDCWrapper {
    private client: Client;

    constructor(@inject('PGWrapper') private pgwrapper: PGWrapper) {
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
    
    deleteMessage(channelId: string, msgId: string) {
        let channel = this.client.channels.cache.get(channelId) as TextChannel
        channel?.messages.fetch(msgId)
            .then(msg => msg.delete())
    }

    sendLatex(userMsgChannelId: string, userMsgId: string, latexExpressions: string[]): Promise<string[]> {
        let channel = this.client.channels.cache.get(userMsgChannelId) as TextChannel 
        return Promise.all([channel.messages.fetch(userMsgId), Promise.all(latexExpressions.map((expr) => get_image(expr)))])
            .then(([userMsg, images]: [Message, any[]]) => {
                let sentMessages: string[] = [];
                for (const img of images) {
                    userMsg.reply({ files: img })
                        .then(msg => {
                            sentMessages.push(msg.id)
                        })
                }
                return sentMessages
            })
    }
}

export {
    DCWrapper,
    IDCWrapper
}