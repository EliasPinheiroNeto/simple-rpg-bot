declare global {
    namespace NodeJS {
        interface ProcessEnv {
            DISCORD_TOKEN: string
            APPLICATION_ID: string

            DATABASE_URL: string
        }
    }
}

export { }