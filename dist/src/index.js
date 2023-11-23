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
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config({ path: './.env' }); //相対パスの起点はこのファイルがある階層ではなくアプリを起動する階層なので、この指示が正しい。
const fs_1 = __importDefault(require("fs"));
const express_1 = __importDefault(require("express"));
const crypto_1 = __importDefault(require("crypto"));
const express_session_1 = __importDefault(require("express-session"));
const cors_1 = __importDefault(require("cors"));
const knex_1 = __importDefault(require("knex"));
const knexfile_1 = __importDefault(require("../knexfile"));
//express設定-------------------------------------------------------------
const app = (0, express_1.default)();
const port = 3001; //vite側を3000にするため
// JSONリクエストボディの解析
app.use(express_1.default.json());
// セッション(一般的？)
app.use((0, express_session_1.default)({
    secret: process.env.SESSION_SECRET || 'secret_key_wo_ireyou',
    resave: false,
    saveUninitialized: false, // セッションが変更されない限り、新しいセッションは作成されない
    cookie: {
        secure: process.env.NODE_ENV === 'production', // 本番環境ではtrueにする
        httpOnly: true, // JavaScriptからのアクセスを防ぐ
        maxAge: 24 * 60 * 60 * 1000, // クッキーの有効期限（例: 1日）
    },
}));
// セッション(カスタム的？今回は使わない)
app.get('/set-token', (req, res) => {
    const sessionToken = crypto_1.default.randomBytes(16).toString('hex');
    res.cookie('token', sessionToken);
    res.status(200).send('cookie added');
});
// CORS（Cross-Origin Resource Sharing）の設定
app.use((0, cors_1.default)({
    origin: 'http://localhost:3000', // 本番環境では本番のフロントエンドのURLに変更
    credentials: true, // クッキーを含むリクエストを許可
}));
// ヘルパー & ミドルウェア----------------------------------------------------
function checkAuthenticated(req, res, next) {
    if (req.session && req.session.user) {
        return next();
    }
    res.status(401).json({ success: false, message: '未認証のアクセスです' });
}
//https://zenn.dev/k_kazukiiiiii/articles/cf3256ef6cbd84
const shuffleArray = (array) => {
    const cloneArray = [...array];
    for (let i = cloneArray.length - 1; i >= 0; i--) {
        let rand = Math.floor(Math.random() * (i + 1));
        // 配列の要素の順番を入れ替える
        let tmpStorage = cloneArray[i];
        cloneArray[i] = cloneArray[rand];
        cloneArray[rand] = tmpStorage;
    }
    return cloneArray;
};
// Knexインスタンスの初期化--------------------------------------------------
// 環境に応じたKnex設定の選択
const knexConfig = knexfile_1.default[process.env.NODE_ENV || 'development'];
const knex = (0, knex_1.default)(knexConfig);
//ルート-------------------------------------------------------------------
app.get('/', (req, res) => {
    res.send('こちらはbackend側だよ');
});
//ログイン認証---------------------------------------------------------------
app.post('/login', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { username, password } = req.body;
    try {
        const user = yield knex('users').where({ username }).first();
        if (user) {
            const hash = crypto_1.default.createHash('sha256');
            const hashedInputPass = hash.update(user.salt + password).digest('hex');
            if (hashedInputPass === user.hashedPass) {
                req.session.user = { id: user.id, username: user.username };
                res.json({
                    success: true,
                    user: { username: user.username, id: user.id },
                    message: 'ログイン成功',
                });
            }
            else {
                res.status(401).json({ success: false, message: 'ログイン失敗' });
            }
        }
        else {
            res.status(401).json({ success: false, message: 'ユーザーが見つかりません' });
        }
    }
    catch (error) {
        console.log('error', error);
        res.status(500).json({ success: false, message: 'サーバーエラー' });
    }
}));
//新規メンバー登録------------------------------------------------------------------
app.post('/signup', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { username, password } = req.body;
    try {
        const existingUser = yield knex('users').where({ username }).first();
        if (existingUser) {
            return res.status(409).json({ success: false, message: 'ユーザー名が既に存在します' });
        }
        const salt = crypto_1.default.randomBytes(6).toString('hex');
        const hashedPass = crypto_1.default
            .createHash('sha256')
            .update(salt + password)
            .digest('hex');
        const newUser = yield knex('users').insert({ username, salt, hashedPass }).returning('*');
        res.json({
            success: true,
            user: { id: newUser[0].id, username: newUser[0].username },
            message: '新規登録成功',
        });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'サーバーエラー' });
    }
}));
//ログアウト-----------------------------------------------------------------
app.post('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).json({ success: false, message: 'ログアウトに失敗しました' });
        }
        res.json({ success: true, message: 'ログアウト成功' });
    });
});
//単語データ取得-------------------------------------------------------------
app.get('/words', (req, res) => {
    const words = [];
    const data = fs_1.default.readFileSync('./src/NGSL_1.2_stats.csv', 'utf-8');
    let indexDatasArr = data.split('\n');
    for (let i = 0; i < indexDatasArr.length; i++) {
        words.push(indexDatasArr[i].split(',')[0]);
    }
    res.status(200).json(shuffleArray(words).slice(0, 200));
});
//タイピング結果登録-----------------------------------------------------------
app.post('/result', checkAuthenticated, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const userId = (_a = req.session.user) === null || _a === void 0 ? void 0 : _a.id; // ユーザーIDはreq.bodyからではなくセッションから取得すると、フロント側の情報の真偽を疑う必要がなくなる
    const { wpm } = req.body; // タイピングスピード（WPM）
    if (!userId) {
        return res.status(403).json({ success: false, message: 'ユーザーIDが見つかりません' });
    }
    try {
        // results テーブルに新しい結果を挿入
        yield knex('results').insert({
            user_id: userId,
            date: new Date(), // 現在の日付と時刻
            score: wpm,
        });
        res.status(200).json({ success: true, message: '結果が保存されました' });
    }
    catch (error) {
        console.log('error', error);
        res.status(500).json({ success: false, message: 'サーバーエラー' });
    }
}));
//タイピング結果出力-----------------------------------------------------------
app.get('/scores', checkAuthenticated, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _b;
    try {
        const userId = (_b = req.session.user) === null || _b === void 0 ? void 0 : _b.id;
        const scores = yield knex('results')
            .join('users', 'users.id', '=', 'results.user_id')
            // .where('users.id', userId) // 特定のユーザーのスコアのみを取得
            .select('users.id as user_id', 'users.username', 'results.date', 'results.score');
        res.status(200).json({ success: true, scores, message: '正常に完了' });
    }
    catch (error) {
        console.log('error', error);
        res.status(500).json({ success: false, message: 'サーバーエラー' });
    }
}));
//リッスン--------------------------------------------------------------------
app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
