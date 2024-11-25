import * as dotenv from "dotenv";
import axios, { AxiosRequestConfig } from "axios";
import { writeFile } from "fs-extra";
import { strict as assert } from "node:assert";

import { Logger } from "../helpers/Utils";

dotenv.config({path: ".env"});
const logger = new Logger("Libretorio TTS");

const melottsSpeed = process.env.MELOTTS_SPEED;
assert.ok(melottsSpeed, "MELOTTS_SPEED is not defined.");
const melottsLanguage = process.env.MELOTTS_LANGUAGE;
assert.ok(melottsLanguage, "MELOTTS_LANGUAGE is not defined.");
const melottsSpeakerId = process.env.MELOTTS_SPEAKER_ID;
assert.ok(melottsSpeakerId, "MELOTTS_SPEAKER_ID is not defined.");
const melottsUrl = process.env.MELOTTS_URL;
assert.ok(melottsUrl, "MELOTTS_URL is not defined.");

export async function tts(text: string, outputFilePath: string): Promise<void> {
	logger.info(`file output: "${outputFilePath}"`);

	const data = {
		text,
		speed: melottsSpeed,
		language: melottsLanguage,
		speaker_id: melottsSpeakerId
	};

	const options = {
		url: melottsUrl,
		method: "POST",
		headers: {
			"Accept": "application/json",
			"Content-Type": "application/json"
		},
		responseType: "arraybuffer",
		data
	} as AxiosRequestConfig;

	try {
		const response = await axios(options);
		await writeFile(outputFilePath, response.data);
	} catch (error) {
		logger.error(error.message);
	}
}
