export default defineEventHandler(async (event) => {
	const formData = await readMultipartFormData(event);

	if (!formData) {
		throw createError({
			statusCode: 400,
			message: 'No file provided'
		});
	}

	const fileEntry = formData.find(entry => entry.name === 'file');

	if (!fileEntry || !fileEntry.data) {
		throw createError({
			statusCode: 400,
			message: 'Invalid file data'
		});
	}

	const isHallOfFame = formData.find(entry => entry.name === 'isHallOfFame')?.data.toString() === 'true';
	const saveData = parseSaveFile(fileEntry.data, isHallOfFame);

	return saveData;
});
