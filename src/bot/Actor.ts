import { inject, injectable, singleton } from 'tsyringe';
import { IPGWrapper } from './PGWrapper';
import { IDCWrapper } from './DCWrapper';
import { Message } from 'discord.js';
import { findExpressions } from '../lib'

interface IActor {
    handleExit(): void,
    handleEdit(s: Message): void,
    handleDelete(s: Message): void
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
                let messagesToDelete = this.pgwrapper.refreshUserMessage(msg.id, latexExpressions);
                if (messagesToDelete.length > 0) {
                    for (let mId of messagesToDelete) {
                        this.dcwrapper.deleteMessage(mId)
                    }
                    this.pgwrapper.deleteLinkedMessages(msg.id)
                    this.pgwrapper.sendAndStoreLinkedMessages(msg.id, latexExpressions)
                }
            }
        )
    }
    
    handleDelete(msg: Message) {
        this.pgwrapper.deleteLinkedMessages(msg.id)
    }
}

export {
    Actor,
    IActor
}