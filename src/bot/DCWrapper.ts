import { inject, injectable } from "tsyringe"
import { Client } from 'discord.js'


interface IDCWrapper {

}

@injectable()
class DCWrapper implements IDCWrapper {
    constructor(private client: Client) {}
}

export {
    DCWrapper,
    IDCWrapper
}