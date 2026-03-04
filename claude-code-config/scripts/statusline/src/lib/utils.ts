/**
 * Returns YYYY-MM-DD in local timezone (not UTC).
 * Fixes daily spend reset happening at midnight UTC instead of midnight local.
 */
export function getLocalDateString(date: Date = new Date()): string {
	const year = date.getFullYear();
	const month = String(date.getMonth() + 1).padStart(2, "0");
	const day = String(date.getDate()).padStart(2, "0");
	return `${year}-${month}-${day}`;
}

export function normalizeResetsAt(resetsAt: string): string {
	try {
		const date = new Date(resetsAt);
		const minutes = date.getMinutes();
		const roundedMinutes = Math.round(minutes / 5) * 5;

		date.setMinutes(roundedMinutes);
		date.setSeconds(0);
		date.setMilliseconds(0);

		return date.toISOString();
	} catch {
		return resetsAt;
	}
}
