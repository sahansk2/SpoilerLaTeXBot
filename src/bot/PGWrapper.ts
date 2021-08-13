import { inject, injectable } from "tsyringe"
import { IDCWrapper } from './DCWrapper'
import { PoolClient } from 'pg'

interface IPGWrapper {

}

@injectable()
class PGWrapper implements IPGWrapper {
    constructor(
        @inject("IDCWrapper") private dcwrapper: IDCWrapper, 
        @inject("PoolClient") private pg: PoolClient
    ) {}
}

export {
    IPGWrapper,
    PGWrapper
}