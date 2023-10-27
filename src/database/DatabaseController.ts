import fs from 'fs'

export default class DatabaseController<T extends { messageId: string }> {
    private dbPath: string
    protected db: T[] = []
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

    public getData(): T[] {
        return this.db
    }

    public setData(data: T[]): void {
        this.db = data
        this.save()
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

    public update(object: T) {
        const index = this.db.findIndex(entry => {
            return entry.messageId == object.messageId
        })

        console.log(index)
        if (index == -1) {
            return
        }

        Object.assign(this.db[index], object)
        this.save()
    }

    public delete(messageId: string): boolean {
        const index = this.db.findIndex(entry => {
            return entry.messageId == messageId
        })

        if (index == -1) {
            return false
        }

        this.db.splice(index, 1)
        this.save()
        return true
    }
}