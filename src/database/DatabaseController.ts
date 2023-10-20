import fs from 'fs'
import path from 'path'

import IHealthBar from '../types/IHealthBar';

export default class DatabaseController {
    private static dbPath = path.resolve("./src/database/database.json")
    private db: IHealthBar[] = [];

    constructor() {
        this.onCreate();
    }

    private onCreate(): void {
        if (fs.existsSync(DatabaseController.dbPath)) {
            this.db = JSON.parse(fs.readFileSync(DatabaseController.dbPath).toString())
            return
        }

        fs.writeFileSync(DatabaseController.dbPath, "[]")
    }

    public createHealthBar(healthMax: number, messageId: number) {
        const healthBar: IHealthBar = {
            messageId,
            healthMax,
            healthPoints: healthMax
        }

        this.db.push(healthBar)

        fs.writeFileSync(DatabaseController.dbPath, JSON.stringify(this.db))
    }

    public updateHealthBar(healthBar: IHealthBar) {
        const index = this.db.findIndex((h) => {
            return h.messageId == healthBar.messageId
        })

        this.db[index].healthPoints = healthBar.healthPoints

        fs.writeFileSync(DatabaseController.dbPath, JSON.stringify(this.db))
    }

    public getHealthBar(messageId: number): IHealthBar | undefined {
        return this.db.find((h: any) => {
            return h.messageId == messageId
        })
    }
}