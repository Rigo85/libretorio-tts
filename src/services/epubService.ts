import * as dotenv from "dotenv";
import { strict as assert } from "node:assert";
import { ensureDir } from "fs-extra";
import EPub from "epub";
import path from "path";

import { Logger } from "../helpers/Utils";
import { cleanFilename, cleanTitle } from "../helpers/FileUtils";
import { tts } from "./melotts";

const logger = new Logger("Epub Service");
dotenv.config({path: ".env"});

const epubOutputPath = process.env.EPUB_OUTPUT_PATH;
assert.ok(epubOutputPath, "EPUB_OUTPUT_PATH is not defined.");
const version = process.env.VERSION;
assert.ok(version, "VERSION is not defined.");
const voice = process.env.VOICE;
assert.ok(voice, "VOICE is not defined.");
const ttsGenerator = process.env.TTS;
assert.ok(ttsGenerator, "TTS is not defined.");

async function getEpub(filePath: string): Promise<EPub | undefined> {
	if (!filePath?.trim()) {
		logger.error("getEpub", "No file path provided.");
		return undefined;
	}

	const epub = new EPub(filePath);

	return new Promise((resolve, reject) => {
		epub.on("end", () => {
			resolve(epub);
		});
		epub.on("error", (error) => {
			logger.error("getEpub", error);
			reject(error);
		});
		epub.parse();
	});
}

export async function processFormat(filePath: string): Promise<void> {
	logger.info("processFormat", filePath);

	try {
		// leer el archivo EPUB.
		const epub = await getEpub(filePath);
		if (!epub) {
			logger.error("processFormat", "No EPUB file found.");
			return;
		}

		// crear carpeta.
		const title = cleanTitle(epub.metadata.title || "") || cleanFilename(filePath);
		const outputFolder = `${epubOutputPath}/${title}`;
		await ensureDir(outputFolder);

		// procesar cada capítulo y dejar el resultado dentro de la carpeta.
		let i = 1;
		let prefix = "";
		const padLength = `${epub.toc.length}`.length;
		logger.info(`${padLength}`);
		for (const chapter of epub.flow) {
			prefix = `${i}`.padStart(padLength, "0");
			const chapterText = await getChapter(epub, chapter.id);
			if (chapterText) {
				logger.info("processFormat", ` Start: ${prefix} - Chapter: ${chapter.id} - ${chapter.title}`);
				const cleanChapterTitle = cleanTitle(chapter.title || chapter.id)
					.replace(/-+/g, "-")
					.replace(/[\s_]/g, "-")
				;
				// patrón de nombre: folio-títulocapítulo-versión-generador-voz.wav
				const outputFilename = `${prefix}-${cleanChapterTitle}-${version}-${ttsGenerator}-${voice}.wav`.toLowerCase();
				const outputFilePath = path.join(outputFolder, outputFilename);
				await tts(chapterText, outputFilePath);
				logger.info("processFormat", `Finish: ${prefix} - Chapter: ${chapter.id} - ${chapter.title}`);
				i++;
			} else {
				logger.error("processFormat", `Error reading chapter: ${chapter.id} - ${chapter.title}`);
			}
		}
	} catch (error) {
		logger.error("processFormat", error);
	}
}

async function getChapter(epub: EPub, chapterId: string): Promise<string> {
	try {
		const result: string = await new Promise((resolve, reject) => {
			epub.getChapter(chapterId, (error: Error, text: string) => {
				if (error) {
					logger.error("getChapter", error);
					reject(error);
				} else {
					resolve(cleanText(text));
				}
			});
		});

		return result?.trim();
	} catch (error) {
		logger.error("getChapter", error);

		return undefined;
	}
}

function cleanText(text: string): string {
	// logger.info(`-------------b4: ${text}`);

	const result = text
		.replace(/\r?\n+/g, " ")
		.replace(/['"…]/g, "")
		.replace(/<([a-zA-Z]+)[^>]*>\s*(?:&nbsp;|\s|<img[^>]*>)*<\/\1>/g, "")
		// Modify this replacement
		.replace(/<[^>]+>\s*([^<]+?)\s*<\/[^>]+>/g, (match, p1) => {
			const trimmedText = p1.trim();
			return /[.!?]$/.test(trimmedText) ? trimmedText : `${trimmedText}.`;
		})
		.replace(/<\/?\s*([a-zA-Z]+)([^>]*)\/?>/g, "")
		.replace(/&[a-zA-Z]+;/g, " ")
		.replace(/\.+/g, ".")
		.replace(/([?!])\./g, "$1")
		.replace(/([.]),/g, "$1")
		.replace(/\([^)]*\)/g, "")
		.replace(/\[.*?\]|\{.*?\}/g, "")
		.replace(/\b(Sr|Sra|Srta|Dr|Dra|Av|etc|a\.C|A\.C|a\.E\.C|d\.C|E\.C)\b/g, (match) => {
			const expansions: Record<string, string> = {
				"Sr": "Señor",
				"Sra": "Señora",
				"Srta": "Señorita",
				"Dr": "Doctor",
				"Dra": "Doctora",
				"Av": "Avenida",
				"etc": "etcétera",
				"a.C": "antes de Cristo",
				"A.C": "antes de Cristo",
				"a.E.C": "antes de la era común",
				"d.C": "después de Cristo",
				"E.C": "era común"
			};
			return expansions[match] || match;
		})
		.replace(/%\b/g, " por ciento")
		.replace(/(\d+)\s?°C/g, "$1 grados Celsius")
		.replace(/(\d+)\s?°F/g, "$1 grados Fahrenheit")
		.replace(/\b(\d+)k\b/g, "$1 mil")
		.replace(/\b(\d+)m\b/g, "$1 millón")
		.replace(/\b(\d+)b\b/g, "$1 mil millones")
		.replace(/(\d)\.(\d{3})(?!\d)/g, "$1$2")
		.replace(/(\d)\s(\d{3})(?!\d)/g, "$1$2")
		.replace(/\s+/g, " ")
		.trim()
	;

	// logger.info(`----------------af: "${result}"`);

	return result;
}



