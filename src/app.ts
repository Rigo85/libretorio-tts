import * as dotenv from "dotenv";

import { strict as assert } from "node:assert";
import path from "path";
import EPub from "epub";

import { Logger } from "./helpers/Utils";
import { tts as meloTTS } from "./services/melotts";
import { processFormat as epubProcessFormat } from "./services/epubService";

dotenv.config({path: ".env"});
const logger = new Logger("App");

const TTS = process.env.TTS;
assert.ok(TTS, "TTS is not defined.");

const ttsMapper: Record<string, (text: string, outputFilePath: string) => Promise<void>> = {
	"MELOTTS": meloTTS
};

const formatMapper: Record<string, (filePath: string) => Promise<void>> = {
	"EPUB": epubProcessFormat
};

const defaultTTS = async (text: string, outputFilePath: string) => {
	logger.error(`TTS '${TTS}' not found.`);
};

const defaultFormat = async (filePath: string) => {
	logger.error(`Format '${filePath}' not found.`);
};

// async function demo() {
// 	const text = `
// Paul Jordans se repitió que durante los últimos doce años había estado franqueando aquella entrada con toda naturalidad que la carencia de culpabilidad confiere a un hombre.
//
// ¿Por qué tenía que sentir temor alguno?
//
// Tragó saliva y anduvo los pasos que le quedaban para llegar hasta la pantalla detectora. Sabía que al otro lado severos ojos le estaban escrutando a pesar de haberle reconocido.
//
// Escuchó el chirrido usual. La luz amarilla se le encendió y anduvo un par de metros, hasta detenerse delante del oficial de servicio embutido en su negra armadura. Tenía el rostro oculto por el casco y la voz le sonó más seca que nunca, cuando escuchó:
// `;
// 	const outputFilePath = "output/output3.wav";
//
// 	try {
// 		const func = ttsMapper[TTS] || defaultTTS;
// 		await func(text, outputFilePath);
// 	} catch (error) {
// 		console.error(error.message);
// 	}
// }
// demo().catch(console.error);

async function demoEpub() {
	const book = "Assassin\'s Creed Origins_ Desert Oath.epub";
	const ext = path.extname(book).trim().slice(1).toUpperCase();
	const formatFunction = formatMapper[ext] || defaultFormat;
	await formatFunction(book);
}

demoEpub().catch(console.error);
