import { inject, injectable } from 'tsyringe';
import { IPGWrapper } from './PGWrapper';
import { IDCWrapper } from './DCWrapper';

interface IActor {
    
}

@injectable()
class Actor implements IActor {
    constructor(
        @inject("IPGWrapper") private pgwrapper: IPGWrapper,
        @inject("IDCWrapper") private dcwrapper: IDCWrapper
    ) {}
}

export {
    Actor,
    IActor
}