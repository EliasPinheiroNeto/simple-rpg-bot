import fs from 'fs'
import path from 'path'

export default class DatabaseController {
    private static dbPath = path.resolve("./src/database/database.json")

    constructor() {
        this.onCreate();
    }

    private dbconnect() {
        return JSON.parse(fs.readFileSync(DatabaseController.dbPath).toString())
    }

    private onCreate(): void {
        if (fs.existsSync(DatabaseController.dbPath)) {
            return
        }

        fs.writeFileSync(DatabaseController.dbPath, "[]")
    }

    public createHealthBar(healthMax: number, messageId: number) {
        const db = this.dbconnect()

        const healthBar = {
            messageId,
            healthMax,
            healthPoints: healthMax
        }

        db.push(healthBar)

        fs.writeFileSync(DatabaseController.dbPath, JSON.stringify(db))
    }

    public updateHealthBar(messageId: number, healthPoints: number) {
        const db = this.dbconnect()

        const index = db.findIndex((h: any) => {
            return h.messageId == messageId
        })

        db[index].healthPoints = healthPoints

        fs.writeFileSync(DatabaseController.dbPath, JSON.stringify(db))
    }

    public getHealthBar(messageId: number) {
        const db = this.dbconnect()

        return db.find((h: any) => {
            return h.messageId == messageId
        })
    }
}