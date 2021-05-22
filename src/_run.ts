require('dotenv').config()

import botInit from './bot/app'
import demoInit from './demo/app'

botInit()
demoInit()