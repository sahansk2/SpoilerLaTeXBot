import { inject, injectable, singleton } from 'tsyringe';
import { IPGWrapper } from './PGWrapper';
import { IDCWrapper } from './DCWrapper';
import { Message } from 'discord.js';
import { findExpressions } from '../lib'

interface IActor {
    handleExit(): void,
    handleEdit(s: Message): void,
    handleDelete(s: Message): Promise<void>,
    handleMessage(s: Message): void
}

@injectable()
@singleton()
class Actor implements IActor {    
    constructor(
        @inject("IPGWrapper") private pgwrapper: IPGWrapper,
        @inject("IDCWrapper") private dcwrapper: IDCWrapper
    ) {}

    handleExit() {
        this.dcwrapper.cleanup()
        this.pgwrapper.cleanup()
    }

    handleEdit(msg: Message) {
        this.dcwrapper.resolveMessage(msg)
            .then((msg) => {
                let latexExpressions = findExpressions(msg.content)
                
                this.pgwrapper.refreshUserMessage(msg.id, msg.channelId, latexExpressions)
                    .then(messagesToDelete => {
                        if (messagesToDelete && messagesToDelete.length > 0) {
                            this.handleDelete(msg)
                                .then(() => this.handleMessage(msg))
                        }
                    })
            })
    }
    
    handleDelete(msg: Message) {
        return this.pgwrapper.getLinkedMessages(msg.id)
            .then(linkedBotMessages => {
                if (linkedBotMessages) {
                    for (let botMsg of linkedBotMessages) {
                        this.dcwrapper.deleteMessage(botMsg.channelId, botMsg.messageId)
                    }
                    this.pgwrapper.deleteLinkedMessages(msg.id)
                }
            })
    }

    handleMessage(msg: Message) {
        let latexExpressions = findExpressions(msg.content)
        this.pgwrapper.refreshUserMessage(msg.id, msg.channelId, latexExpressions)
            .then(() => this.dcwrapper.sendLatex(msg.channelId, msg.id, latexExpressions))
    }
}

export {
    Actor,
    IActor
}