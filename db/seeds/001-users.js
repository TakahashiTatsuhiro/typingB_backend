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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.seed = void 0;
const crypto_1 = __importDefault(require("crypto"));
function seed(knex) {
    return __awaiter(this, void 0, void 0, function* () {
        // Deletes ALL existing entries
        yield knex('users').del();
        yield knex('results').del();
        const users = ['admin', 'tatsu', 'taro', 'jiro', 'sabro'];
        for (const name of users) {
            const salt = crypto_1.default.randomBytes(6).toString('hex');
            const saltAndPass = `${salt}${name}`;
            const hashedPass = crypto_1.default.createHash('sha256').update(saltAndPass).digest('hex');
            yield knex('users').insert({ username: name, salt: salt, hashedPass: hashedPass });
        }
    });
}
exports.seed = seed;
