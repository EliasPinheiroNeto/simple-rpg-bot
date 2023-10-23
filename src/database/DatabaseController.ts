import fs from 'fs'

export default class DatabaseController<T extends { messageId: string }> {
    private dbPath: string
    protected db: Array<T> = []
    constructor(dbPath: string) {
        this.dbPath = dbPath
        this.onCreate();
    }

    private onCreate(): void {
        if (fs.existsSync(this.dbPath)) {

            this.db = JSON.parse(fs.readFileSync(this.dbPath).toString())
            return
        }

        fs.writeFileSync(this.dbPath, "[]")
    }

    protected save() {
        fs.writeFileSync(this.dbPath, JSON.stringify(this.db))
    }

    public insert(object: T) {
        this.db.push(object)
        this.save()
    }

    public get(messageId: string): T | undefined {
        return this.db.find(entry => {
            return entry.messageId == messageId
        })
    }
}