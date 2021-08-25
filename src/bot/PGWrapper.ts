import { inject, injectable, singleton } from "tsyringe"
import { IDCWrapper } from './DCWrapper'
import { Message } from 'discord.js'
import { Pool, PoolClient } from 'pg'

interface ChannelMessage {
    channelId: string,
    messageId: string
}

interface IPGWrapper {
    cleanup(): void,
    refreshUserMessage(msgId: string, channelId: string, latexExpressions: string[]): Promise<void | string[]>,
    deleteLinkedMessages(msgId: string): void,
    sendAndStoreLinkedMessages(msg: Message, latexExpressions: string[]): void,
    getLinkedMessages(msgId: string): Promise<void | ChannelMessage[]> 
}

@injectable()
@singleton()
class PGWrapper implements IPGWrapper {
    //TODO: setup depenedency injection with this
    private pool: Pool;

    constructor(
        @inject("IDCWrapper") private dcwrapper: IDCWrapper
    ) {
        // Environment variables
        // PGHOST (localhost), PGUSER, PGDATABSAE, PGPASSWORD, PGPORT (5432)
        this.pool = new Pool();
    }

    cleanup() {
        this.pool.end();
    }
    
    // Get a message ID of the source message, and the latex expressions it contains,
    // Return all linked messages if 
    refreshUserMessage(msgId: string, channelId: string, latexExpressions: string[]): Promise<void | string[]> {
        return this.pool.query('SELECT * FROM refreshusermessage($1, $2, $3)', [msgId, channelId, latexExpressions])
            .then(res => {
                return res.rows
            })
            .catch(e => {
                console.error(e.stack)
            }) as Promise<void | string[]>
    }

    // TODO: Rewrite to return the channel ID as well
    getLinkedMessages(msgId: string): Promise<void | ChannelMessage[]> {
        return this.pool.query('SELECT botmessageid FROM UserToBotMessage WHERE usermessageid=$1', [msgId])
            .then(res => {
                return res.rows
            })
            .catch(e => {
                console.error(e.stack)
            }) as Promise<void | string[]>
    }

    deleteLinkedMessages(msgId: string): void {
        this.pool.query('DELETE FROM MessageContent as m WHERE m.userMessageId = $1', [msgId])
            .catch(e => {
                console.error("Error deleting messages from database")
                console.error(e.stack)
            })
    }

    sendAndStoreLinkedMessages(msg: Message, latexExpressions: string[]): void {
        this.refreshUserMessage(msg.id, msg.channelId, latexExpressions)
            .then(() => {

            })
    }
}

export {
    IPGWrapper,
    PGWrapper
}