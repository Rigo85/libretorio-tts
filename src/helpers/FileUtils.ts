export function cleanFilename(filename: string, lowerCase: boolean = false): string {
	const _filename = filename
		.normalize("NFC")
		.replace(/\.[^/.]+$/, "")
		.replace(/[‘’]/g, "'")
		.replace(/[^a-zA-ZÀ-ÿ0-9' ]+/g, " ")
		.replace(/\s+/g, " ");

	return lowerCase ? _filename.toLowerCase() : _filename;
}

export function cleanTitle(title: string, lowerCase: boolean = false): string {
	const _title = title
		.normalize("NFC")
		.replace(/[‘’]/g, "'")
		.replace(/[^a-zA-ZÀ-ÿ0-9' ]+/g, " ")
		.replace(/\s+/g, " ");

	return lowerCase ? _title.toLowerCase() : _title;
}

























