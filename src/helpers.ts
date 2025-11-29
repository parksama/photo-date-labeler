import i18n from "./i18n";
const { t } = i18n;

const OPTIONS_PREFIX = 'photolabel_';

export function get_option(key: string, defaultValue: string) {
	return localStorage.getItem(OPTIONS_PREFIX + key) || defaultValue;
}

export function set_option(key: string, value: string) {
	localStorage.setItem(OPTIONS_PREFIX + key, value);
}

export function months_to_text(months: number) {
	var years = Math.floor(months / 12);
	var remainingMonths = months % 12;
	var text = '';

	var yearText = t('year', 'YEAR', { count: years });
	var monthText = t('month', 'MONTH', { count: remainingMonths });

	if (years) {
		text += `${years} ${yearText} `;
	}

	if (remainingMonths) {
		text += `${remainingMonths} ${monthText}`;
	}

	return text;
}

export function canvas_to_blob(canvas: HTMLCanvasElement, quality: number): Promise<Blob> {
	return new Promise((resolve, reject) => {
		canvas.toBlob(
			(blob) => {
				if (blob) {
					resolve(blob);
				}
			},
			'image/jpeg',
			quality
		);
	});
}
