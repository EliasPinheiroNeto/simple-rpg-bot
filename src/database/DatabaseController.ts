import { PrismaClient } from '@prisma/client'

export default class DatabaseController {
    protected prisma: PrismaClient
    constructor() {
        this.prisma = new PrismaClient()
    }
}