export const formatDate = (dateToFormat: string | number, locale: string) => {
	const date = new Date(dateToFormat);
	const formattedDate = new Intl.DateTimeFormat(locale, {
		month: 'long',
		day: 'numeric',
		year: 'numeric'
	}).format(date);
	return formattedDate;
};

export const validateExpTimestamp = (expTimestamp?: string) => {
	if (!expTimestamp) {
		return false;
	}
	// One day in ms
	const expTime = 24 * 60 * 60 * 1000;
	// Difference between now and expired time
	const dateDiff = Number(expTimestamp) - Date.now();
	// Expired if not in the past or difference in time is less than allowed
	const isValid = dateDiff > 0 && dateDiff < expTime;
	return isValid;
};

export const subStartDate = () => {
	const startDate = new Date();
	if (startDate.getDay() >= 0 && startDate.getDay() <= 4) {
		startDate.setDate(startDate.getDate() + (7 + 1 - startDate.getDay()));
	} else {
		startDate.setDate(startDate.getDate() + (7 + 1 - startDate.getDay() + 7));
	}
	startDate.setHours(0);
	startDate.setMinutes(0);
	return `${startDate}`;
};

export const computeStartDate = (date: string) => {
	const clientStartDate = Math.round(new Date(date).getTime() / 1000); // Convert to seconds for PHP timestamps
	return isNaN(clientStartDate) || !clientStartDate
		? computeStartDate(subStartDate())
		: clientStartDate;
};
