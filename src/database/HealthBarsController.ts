import fs from 'fs'
import path from 'path'

import IHealthBar from '../types/IHealthBar';
import DatabaseController from './DatabaseController';

export default class HealthBarsController extends DatabaseController<IHealthBar> {
    private static dbPath = path.resolve("./src/database/healthBars.json")

    constructor() {
        super(HealthBarsController.dbPath)
    }
}