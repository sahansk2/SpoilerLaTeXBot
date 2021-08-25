import { inject, injectable, singleton } from "tsyringe"
import { IDCWrapper } from './DCWrapper'
import { PoolClient } from 'pg'

interface IPGWrapper {
    cleanup(): void,
    refreshUserMessage(msgId: string, latexExpressions: string[]): string[],
    deleteLinkedMessages(msgId: string): void,
    sendAndStoreLinkedMessages(msgId: string, latexExpressions: string[]): void
}

@injectable()
@singleton()
class PGWrapper implements IPGWrapper {
    constructor(
        @inject("IDCWrapper") private dcwrapper: IDCWrapper, 
        @inject("PoolClient") private pg: PoolClient
    ) {}

    cleanup() {

    }
    
    refreshUserMessage(msgId: string, latexExpressions: string[]): string[] {
        return []
    }

    deleteLinkedMessages(msgId: string): void {

    }

    sendAndStoreLinkedMessages(msgId: string, latexExpressions: string[]): void {

    }
}

export {
    IPGWrapper,
    PGWrapper
}