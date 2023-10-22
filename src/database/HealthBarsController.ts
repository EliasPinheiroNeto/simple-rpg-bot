import fs from 'fs'
import path from 'path'

import IHealthBar from '../types/IHealthBar';

export default class HealthBarsController {
    private static dbPath = path.resolve("./src/database/database.json")
    private db: IHealthBar[] = [];

    constructor() {
        this.onCreate();
    }

    private onCreate(): void {
        if (fs.existsSync(HealthBarsController.dbPath)) {
            this.db = JSON.parse(fs.readFileSync(HealthBarsController.dbPath).toString())
            return
        }

        fs.writeFileSync(HealthBarsController.dbPath, "[]")
    }

    private save() {
        fs.writeFileSync(HealthBarsController.dbPath, JSON.stringify(this.db))
    }


    public createHealthBar(healthMax: number, messageId: string) {
        const healthBar: IHealthBar = {
            messageId,
            healthMax,
            healthPoints: healthMax
        }

        this.db.push(healthBar)

        this.save()
    }

    public updateHealthBar(healthBar: IHealthBar) {
        const index = this.db.findIndex((h: IHealthBar) => {
            return h.messageId == healthBar.messageId
        })

        this.db[index].healthPoints = healthBar.healthPoints

        this.save()
    }

    public getHealthBar(messageId: string): IHealthBar | undefined {
        return this.db.find((h: IHealthBar) => {
            return h.messageId == messageId
        })
    }

    public deleteHealthBar(messageId: string) {
        const index = this.db.findIndex((h: IHealthBar) => {
            return h.messageId == messageId
        })

        if (index == -1) {
            return
        }

        this.db.splice(index, 1)
        this.save()
    }
}