import fs from 'fs'
import path from 'path'
import crypto from 'crypto'

export default class DatabaseController {
    private static dbPath = path.resolve("./src/database/database.json")

    constructor() {
        this.onCreate();
    }

    private onCreate(): void {
        if (fs.existsSync(DatabaseController.dbPath)) {
            return
        }

        fs.writeFileSync(DatabaseController.dbPath, "[]")
    }

    public createHealthBar(healthMax: number, guildId: number, channelId: number) {
        const healthBarId = crypto.randomBytes(16).toString("hex")
        console.log(healthBarId)

        const db = JSON.parse(fs.readFileSync(DatabaseController.dbPath).toString())
        console.log(db)

        const healthBar = {
            healthBarId,
            guildId,
            channelId,
            healthMax,
            healthPoints: healthMax
        }

        db.push(healthBar)

        fs.writeFileSync(DatabaseController.dbPath, JSON.stringify(db))
    }
}