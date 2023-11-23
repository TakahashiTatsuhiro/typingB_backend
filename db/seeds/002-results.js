"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.seed = void 0;
function seed(knex) {
    return __awaiter(this, void 0, void 0, function* () {
        // Deletes ALL existing entries
        yield knex('results').del();
        const now = new Date();
        const oneDay = 24 * 60 * 60 * 1000;
        // Inserts seed entries
        yield knex('results').insert([
            { user_id: 2, score: 25, date: new Date() },
            { user_id: 2, score: 27, date: new Date() },
            { user_id: 2, score: 32, date: new Date() },
            { user_id: 2, score: 29, date: new Date() },
            { user_id: 2, score: 35, date: new Date() },
            { user_id: 2, score: 44, date: new Date() },
            { user_id: 2, score: 40, date: new Date() },
            { user_id: 2, score: 42, date: new Date() },
            { user_id: 2, score: 44, date: new Date() },
            { user_id: 2, score: 47, date: new Date() },
            { user_id: 3, score: 16, date: new Date() },
            { user_id: 3, score: 14, date: new Date() },
            { user_id: 3, score: 19, date: new Date() },
            { user_id: 3, score: 17, date: new Date() },
            { user_id: 3, score: 20, date: new Date() },
            { user_id: 3, score: 22, date: new Date() },
            { user_id: 3, score: 18, date: new Date() },
            { user_id: 3, score: 26, date: new Date() },
            { user_id: 3, score: 28, date: new Date() },
            { user_id: 3, score: 30, date: new Date() },
            { user_id: 4, score: 36, date: new Date() },
            { user_id: 4, score: 32, date: new Date() },
            { user_id: 4, score: 33, date: new Date() },
            { user_id: 4, score: 40, date: new Date() },
            { user_id: 4, score: 44, date: new Date() },
            { user_id: 4, score: 48, date: new Date() },
            { user_id: 4, score: 53, date: new Date() },
            { user_id: 4, score: 62, date: new Date() },
            { user_id: 4, score: 69, date: new Date() },
            { user_id: 4, score: 65, date: new Date() },
            { user_id: 5, score: 26, date: new Date() },
            { user_id: 5, score: 28, date: new Date() },
            { user_id: 5, score: 24, date: new Date() },
            { user_id: 5, score: 30, date: new Date() },
            { user_id: 5, score: 34, date: new Date() },
            { user_id: 5, score: 32, date: new Date() },
            { user_id: 5, score: 34, date: new Date() },
            { user_id: 5, score: 38, date: new Date() },
            { user_id: 5, score: 40, date: new Date() },
            { user_id: 5, score: 37, date: new Date() },
        ]);
    });
}
exports.seed = seed;
