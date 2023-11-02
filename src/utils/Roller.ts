export interface IDice {
    quantity: number
    sides: number
}

export interface IRoll {
    times: number
    dices: IDice[]
    bonus: number
}

export default class Roller {
    public input: string
    public results: number[] = []
    public expressionResults: string[] = []
    public validinput: boolean = true

    private roll: IRoll

    constructor(expression: string) {
        this.input = Roller.validate(expression.replace(/\s/g, "").toLocaleLowerCase())

        this.roll = this.interplater()
        this.roller()
    }

    public static validate(expression: string): string {
        const times = expression.match(new RegExp(/\d+#/g))?.[0]
        const dices = expression.match(new RegExp(/(\+|\-|)(\d+|)d\d+/g))
        const bonus = expression.match(new RegExp(/(\+|\-)\d+(?!d|\d)/g))

        if (!dices) {
            return ''
        }

        const totalBonus = bonus?.map(x => Number.parseInt(x)).reduce((a, b) => a + b) || 0

        return `${(times?.toString() || '')}${dices.join('')}${totalBonus > 0 ? '+' : ''}${totalBonus || ''}`
    }

    private interplater(): IRoll {
        // Separação da expressão
        const times = this.input.match(new RegExp(/\d+#/g))?.[0]
        const dices = this.input.match(new RegExp(/(\+|\-|)(\d+|)d\d+/g))
        const bonus = this.input.match(new RegExp(/(\+|\-)\d+(?!d|\d)/g))

        if (!dices) {
            this.validinput = false
        }

        // Transforma as strings em um objeto de rolagem
        return {
            times: Number.parseInt(times || '1'),
            dices: dices?.map<IDice>(entry => {
                const dice = entry.split('d')
                return {
                    quantity: Number.parseInt(dice[0]) || Number.parseInt(dice[0] + "1") || 1,
                    sides: Number.parseInt(dice[1])
                }
            }) || [],
            bonus: bonus?.map(x => Number.parseInt(x)).reduce((a, b) => a + b) || 0
        }
    }

    private roller() {
        for (let i = 0; i < this.roll.times; i++) {
            let rollResult = 0
            let expressionResult = ''

            this.roll.dices.forEach((dice) => {
                const result = this.rollDices(dice)
                rollResult += result
                expressionResult += `[ ${result} ] ${dice.quantity > 0 ? '+' : ''}${dice.quantity}d${dice.sides} `
            })

            this.results.push(rollResult + this.roll.bonus)
            this.expressionResults.push(`\` ${rollResult + this.roll.bonus} \` ⟵ ${expressionResult}${this.roll.bonus > 0 ? '+' : ''}${this.roll.bonus || ''}`)
        }
    }

    private rollDices(dice: IDice): number {
        let x = 0
        for (let i = 0; i < Math.abs(dice.quantity); i++) {
            x += Math.floor(Math.random() * dice.sides + 1) * Math.sign(dice.quantity)
        }

        return x
    }

}