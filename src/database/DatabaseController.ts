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

    public createHealthBar(healthMax: number, messageId: number) {
        const db = JSON.parse(fs.readFileSync(DatabaseController.dbPath).toString())

        const healthBar = {
            messageId,
            healthMax,
            healthPoints: healthMax
        }

        db.push(healthBar)

        fs.writeFileSync(DatabaseController.dbPath, JSON.stringify(db))
    }
}