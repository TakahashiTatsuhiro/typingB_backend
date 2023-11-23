import dotenv from 'dotenv';
dotenv.config({ path: './.env' }); //相対パスの起点はこのファイルがある階層ではなくアプリを起動する階層なので、この指示が正しい。

import fs from 'fs';
import express from 'express';
import crypto from 'crypto';
import { Request, Response, NextFunction } from 'express';
import session from 'express-session';
import cors from 'cors';
import Knex from 'knex';
import knexfile from '../knexfile';

//express設定-------------------------------------------------------------
const app = express();
const port = process.env.PORT;

declare module 'express-session' {
	interface SessionData {
		user?: {
			id: number;
			username: string;
			password?: string;
		};
	}
}

// JSONリクエストボディの解析
app.use(express.json());

// セッション(一般的？)
app.use(
	session({
		secret: process.env.SESSION_SECRET || 'secret_key_wo_ireyou',
		resave: false,
		saveUninitialized: false, // セッションが変更されない限り、新しいセッションは作成されない
		cookie: {
			secure: process.env.NODE_ENV === 'production', // 本番環境ではtrueにする
			httpOnly: true, // JavaScriptからのアクセスを防ぐ
			maxAge: 24 * 60 * 60 * 1000, // クッキーの有効期限（例: 1日）
		},
	})
);
// セッション(カスタム的？今回は使わない)
app.get('/set-token', (req, res)=>{
	const sessionToken = crypto.randomBytes(16).toString('hex');
	res.cookie('token',sessionToken);
	res.status(200).send('cookie added');
})


// CORS（Cross-Origin Resource Sharing）の設定
app.use(
	cors({
		origin: process.env.FRONTEND_ORIGIN, // 本番環境では本番のフロントエンドのURLに変更
		credentials: true, // クッキーを含むリクエストを許可
	})
);

// ヘルパー & ミドルウェア----------------------------------------------------
function checkAuthenticated(req: Request, res: Response, next: NextFunction) {
	if (req.session && req.session.user) {
		return next();
	}
	res.status(401).json({ success: false, message: '未認証のアクセスです' });
}

//https://zenn.dev/k_kazukiiiiii/articles/cf3256ef6cbd84
const shuffleArray = (array: string[]) => {
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
const knexConfig = knexfile[process.env.NODE_ENV || 'development'];
const knex = Knex(knexConfig);

//ルート-------------------------------------------------------------------
app.get('/', (req, res) => {
	res.json({knexConfig});
});

//ログイン認証---------------------------------------------------------------
app.post('/login', async (req, res) => {
	const { username, password } = req.body;
	try {
		const user = await knex('users').where({ username }).first();
		if (user) {
			const hash = crypto.createHash('sha256');
			const hashedInputPass = hash.update(user.salt + password).digest('hex');

			if (hashedInputPass === user.hashedPass) {
				req.session.user = { id: user.id, username: user.username };
				res.json({
					success: true,
					user: { username: user.username, id: user.id },
					message: 'ログイン成功',
				});
			} else {
				res.status(401).json({ success: false, message: 'ログイン失敗' });
			}
		} else {
			res.status(401).json({ success: false, message: 'ユーザーが見つかりません' });
		}
	} catch (error:any) {
		console.log('error', error);
		res.status(500).json({ success: false, message: error.message });
	}
});

app.post('/logintest1', async (req, res) => {
	const { username, password } = req.body;
	try {
		const user = await knex('users').where({ username }).first();
		if (user) {
			res.json({
				success: true,
				user: { username: user.username, id: user.id },
				message: 'ログイン成功',
			});
		} else {
			res.status(401).json({ success: false, message: 'ユーザーが見つかりません' });
		}
	} catch (error:any) {
		console.log('error', error);
		res.status(500).json({ success: false, message: error.message });
	}
});

app.post('/logintest2', async (req, res) => {
	const { username, password } = req.body;
	res.status(200).json({
		success: true,
		user: { username, password },
		message: 'ログイン成功',
	});
});

//新規メンバー登録------------------------------------------------------------------
app.post('/signup', async (req, res) => {
	const { username, password } = req.body;

	try {
		const existingUser = await knex('users').where({ username }).first();
		if (existingUser) {
			return res.status(409).json({ success: false, message: 'ユーザー名が既に存在します' });
		}

		const salt = crypto.randomBytes(6).toString('hex');
		const hashedPass = crypto
			.createHash('sha256')
			.update(salt + password)
			.digest('hex');

		const newUser = await knex('users').insert({ username, salt, hashedPass }).returning('*');
		res.json({
			success: true,
			user: { id: newUser[0].id, username: newUser[0].username },
			message: '新規登録成功',
		});
	} catch (error) {
		res.status(500).json({ success: false, message: 'サーバーエラー' });
	}
});

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
	const words: string[] = [];
	const data = fs.readFileSync('./src/NGSL_1.2_stats.csv', 'utf-8');
	let indexDatasArr = data.split('\n');
	for (let i = 0; i < indexDatasArr.length; i++) {
		words.push(indexDatasArr[i].split(',')[0]);
	}

	res.status(200).json(shuffleArray(words).slice(0, 200));
});

//タイピング結果登録-----------------------------------------------------------
app.post('/result', checkAuthenticated, async (req, res) => {
	const userId = req.session.user?.id; // ユーザーIDはreq.bodyからではなくセッションから取得すると、フロント側の情報の真偽を疑う必要がなくなる
	const { wpm } = req.body; // タイピングスピード（WPM）

	if (!userId) {
		return res.status(403).json({ success: false, message: 'ユーザーIDが見つかりません' });
	}

	try {
		// results テーブルに新しい結果を挿入
		await knex('results').insert({
			user_id: userId,
			date: new Date(), // 現在の日付と時刻
			score: wpm,
		});
		res.status(200).json({ success: true, message: '結果が保存されました' });
	} catch (error) {
		console.log('error', error);
		res.status(500).json({ success: false, message: 'サーバーエラー' });
	}
});

//タイピング結果出力-----------------------------------------------------------
app.get('/scores', checkAuthenticated, async (req, res) => {
	try {
		const userId = req.session.user?.id;
		const scores = await knex('results')
			.join('users', 'users.id', '=', 'results.user_id')
			// .where('users.id', userId) // 特定のユーザーのスコアのみを取得
			.select('users.id as user_id', 'users.username', 'results.date', 'results.score');
		res.status(200).json({ success: true, scores, message: '正常に完了' });
	} catch (error) {
		console.log('error', error);
		res.status(500).json({ success: false, message: 'サーバーエラー' });
	}
});

//タイピング結果出力-----------------------------------------------------------
app.get('/scorestest', async (req, res) => {
	try {
		const scores = await knex('results')
			.join('users', 'users.id', '=', 'results.user_id')
			.select('users.id as user_id', 'users.username', 'results.date', 'results.score');
		res.status(200).json({ success: true, scores, message: '正常に完了' });
	} catch (error) {
		console.log('error', error);
		res.status(500).json({ success: false, message: 'サーバーエラー' });
	}
});

//リッスン--------------------------------------------------------------------
app.listen(port, () => {
	console.log(`Server running on http://localhost:${port}`);
});
