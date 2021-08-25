import { inject, injectable, singleton } from 'tsyringe';
import { IPGWrapper } from './PGWrapper';
import { IDCWrapper } from './DCWrapper';
import { Message } from 'discord.js';
import { findExpressions } from '../lib'

interface IActor {
    handleExit(): void,
    handleEdit(s: Message): void,
    handleDelete(s: Message): void,
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
                            for (let mId of messagesToDelete) {
                                this.dcwrapper.deleteMessage(mId)
                            }
                            this.pgwrapper.deleteLinkedMessages(msg.id)
                            this.pgwrapper.sendAndStoreLinkedMessages(msg, latexExpressions)
                        }
                    })
            })
    }
    
    handleDelete(msg: Message) {
        let linkedBotMessages = this.pgwrapper.getLinkedMessages(msg.id)
            .then(linkedBotMessages => {
                if (linkedBotMessages) {
                    for (let mId of linkedBotMessages) {
                        this.dcwrapper.deleteMessage(mId)
                    }
                    this.pgwrapper.deleteLinkedMessages(msg.id)
                }
            })
    }

    handleMessage(msg: Message) {

    }
}

export {
    Actor,
    IActor
}