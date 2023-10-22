import IDiceRoll from "../types/IDiceRoll";
import DatabaseController from "./DatabaseController";

export default class DiceRollsController extends DatabaseController<IDiceRoll> {
    private static dbPath = "./src/database/diceRolls.json"

    constructor() {
        super(DiceRollsController.dbPath)
    }
}