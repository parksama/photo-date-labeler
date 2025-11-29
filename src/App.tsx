import { ChangeEventHandler, DragEventHandler, useEffect, useMemo, useRef, useState } from 'react';
import './App.scss';
import { ExifStatic } from 'exif-js';
import type { Moment } from 'moment';
import { Sketch } from '@uiw/react-color';
import DownloadIcon from './img/download.svg';
import { canvas_to_blob, get_option, months_to_text, set_option } from './helpers';
import { useTranslation } from 'react-i18next';

declare var EXIF: ExifStatic;
declare var moment: (date?: any) => Moment;
declare var init_zoom: (el: HTMLDivElement, options: Object) => void;

const IMAGE_QUALITY = 0.9;

var availableFonts = ['sans-serif', 'serif', 'monospace', 'cursive', 'fantasy', 'Digital-7', 'Orbitron', 'Quantico'];

export function App() {
	const [file, setFile] = useState<File | null>(null);
	const [filedata, setFiledata] = useState<Object | null>(null);
	const [photoDate, setPhotoDate] = useState<Moment | null>(null);

	const fileinputref = useRef<HTMLInputElement>(null);
	const [isDragging, setIsDragging] = useState(false);

	const handleFileDrop: DragEventHandler<HTMLDivElement> = (event) => {
		event.preventDefault();
		const droppedFile = event.dataTransfer?.files[0];
		if (droppedFile?.type.startsWith('image/')) {
			setFile(droppedFile);
		}
		setIsDragging(false);
	};

	const handleFileSelect: ChangeEventHandler<HTMLInputElement> = (event) => {
		const selectedFile = (event.target as HTMLInputElement).files?.[0];
		if (selectedFile?.type.startsWith('image/')) {
			setFile(selectedFile);
		}
	};

	const wrapperRef = useRef<HTMLDivElement>(null);
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const initialRef = useRef(false);

	const [fillColor, setFillColor] = useState(get_option('fillColor', '#ffffff'));
	const [strokeColor, setStrokeColor] = useState(get_option('strokeColor', '#000000'));
	const [outline, setOutline] = useState(get_option('outline', 'true') === 'true');
	const [compareDate, setCompareDate] = useState(get_option('compareDate', ''));
	const [font, setFont] = useState(get_option('font', 'Quantico'));
	const { t, i18n } = useTranslation();

	// Initialize language from saved preference
	useEffect(() => {
		const savedLanguage = get_option('language', 'en');
		i18n.changeLanguage(savedLanguage);
	}, [i18n]);

	const [resultURL, setResultURL] = useState('');

	const photoText = useMemo(() => {
		if (!photoDate || !photoDate.isValid()) {
			return '';
		}

		var suffix = '';

		if (compareDate) {
			var dateCompare = moment(compareDate);
			var months = Math.abs(photoDate.diff(dateCompare, 'months'));

			if (months) {
				suffix = months_to_text(months);
			} else {
				var days = Math.abs(photoDate.diff(dateCompare, 'days'));
				suffix = `${days} ${t('day', 'DAY', { count: days })}`;
			}
		}

		var phototext = photoDate.format('DD-MM-YYYY');

		if (suffix) {
			phototext += ' - ' + suffix;
		}

		return phototext;
	}, [photoDate, compareDate, i18n.language]);

	const get_file_info = async (file: File) => {
		var regname = /img-(\d{8})/i.exec(file.name);
		const buffer = await file.arrayBuffer();

		const data = EXIF.readFromBinaryFile(buffer);
		setFiledata(data);

		var photodate = moment(
			data.DateTimeOriginal?.replace(/:/g, '-').replace(/\s.*/, '') || regname?.[1] || file.lastModified || ''
		);
		setPhotoDate(photodate);
	};

	const render = (file: File) => {
		var phototext = photoText;

		const img = new Image();
		img.src = URL.createObjectURL(file);
		img.onload = async () => {
			const canvas = canvasRef.current;
			if (canvas) {
				canvas.width = img.width;
				canvas.height = img.height;
				const ctx = canvas.getContext('2d');
				if (ctx) {
					ctx.imageSmoothingEnabled = true;
					ctx.imageSmoothingQuality = 'high';
					ctx.drawImage(img, 0, 0);

					var basecalc = Math.min(img.naturalWidth, img.naturalHeight);
					var font_size = Math.ceil(basecalc * 0.04);
					var padding = basecalc * 0.025;
					var stroke = Math.ceil(font_size * 0.1);
					var letterSpacing = Math.ceil(font_size * 0.05);

					ctx.textAlign = 'center';
					ctx.font = `${font_size}px ${font}`;
					ctx.letterSpacing = letterSpacing + 'px';

					if (outline) {
						ctx.lineWidth = stroke;
						ctx.strokeStyle = strokeColor;
						ctx.strokeText(phototext, canvas.width / 2, canvas.height - padding);
					}

					ctx.fillStyle = fillColor;
					ctx.fillText(phototext, canvas.width / 2, canvas.height - padding);

					if (resultURL) {
						URL.revokeObjectURL(resultURL);
					}

					var blob = await canvas_to_blob(canvas, IMAGE_QUALITY);
					var url = URL.createObjectURL(blob);
					setResultURL(url);

					if (wrapperRef.current) {
						init_zoom(wrapperRef.current, {
							url,
							magnify: 0.5,
						});
					}
				}
			}
		};
	};

	const download = () => {
		if (file && resultURL) {
			var link = document.createElement('a');
			link.href = resultURL;
			link.download = '[LABELED] ' + file.name;
			link.click();
			link.remove();
		}
	};

	useEffect(() => {
		if (file) {
			(async () => {
				await get_file_info(file);
				initialRef.current = true;
			})();
		}
	}, [file]);

	useEffect(() => {
		if (file && photoDate && initialRef.current) {
			render(file);
			initialRef.current = false;
		}
	}, [file, photoDate]);

	useEffect(() => {
		set_option('fillColor', fillColor);
		set_option('strokeColor', strokeColor);
		set_option('outline', outline.toString());
		set_option('compareDate', compareDate);
		set_option('font', font);
	}, [fillColor, strokeColor, outline, compareDate, font]);

	return (
		<div
			className="App"
			data-is-dragging={isDragging}
			onDrop={handleFileDrop}
			onDragOver={(event) => event.preventDefault()}
			onDragEnter={() => setIsDragging(true)}
			onDragLeave={(event) => {
				event.preventDefault();
				if (!event.currentTarget.contains(event.relatedTarget as Node)) {
					setIsDragging(false);
				}
			}}
		>
			<div className="container py-5">
				<div className="row align-items-end justify-content-between mb-4 gy-4">
					<div className="col">
						<h1 className="mb-0 font-Quantico">{t('appTitle', 'Photo Date Labeler')}</h1>
					</div>
					<div className="col-auto d-flex">
						<iframe
							src="https://ghbtns.com/github-btn.html?user=parksama&repo=photo-date-labeler&type=star&count=false&size=large"
							width="72"
							height="30"
							title="GitHub"
							loading="lazy"
							className="me-2"
						></iframe>
						<LanguageSwitcher />
					</div>
				</div>
				<div className="row gy-4">
					<div className="col-md-6">
						{!file ? (
							<div
								className={
									'App__dropzone d-flex flex-column align-items-center justify-content-center' +
									(isDragging ? ' App__dropzone--dragging' : '')
								}
								onClick={() => fileinputref.current?.click()}
							>
								{isDragging ? (
									<p>{t('dropImageHere', 'Drop the image here')}</p>
								) : (
									<p className="text-center">
										{t('dragAndDropOrClick', 'Drag and drop or click here to select an image.')}
									</p>
								)}
							</div>
						) : (
							<div className={'App__wrapper' + (resultURL ? ' shadow-lg' : '')} ref={wrapperRef}>
								{resultURL && <img src={resultURL} />}
							</div>
						)}
					</div>
					<div className="col-md-6">
						{filedata && (
							<div className="App__fildata mb-3">
								<div className="accordion" id="accordionExample">
									<div className="accordion-item">
										<h2 className="accordion-header">
											<button
												className="accordion-button collapsed"
												type="button"
												data-bs-toggle="collapse"
												data-bs-target="#collapseEXIF"
												aria-expanded="true"
												aria-controls="collapseEXIF"
											>
												{t('exifData', 'EXIF Data')}
											</button>
										</h2>
										<div
											id="collapseEXIF"
											className="accordion-collapse collapse"
											data-bs-parent="#accordionExample"
										>
											<div
												className="accordion-body"
												style={{
													whiteSpace: 'pre-wrap',
													maxHeight: '300px',
													overflowY: 'auto',
												}}
											>
												{JSON.stringify(filedata, null, '\t')}
											</div>
										</div>
									</div>
								</div>
							</div>
						)}

						<div className="row">
							<div className="col">
								<div className="mb-3">
									<label htmlFor="photoDate" className="form-label">
										{t('photoDate', 'Photo Date')}
									</label>
									<input
										type="date"
										value={photoDate?.format('YYYY-MM-DD') || ''}
										onChange={(event) => setPhotoDate(moment(event.target.value))}
										className="form-control"
									/>
								</div>
							</div>
							<div className="col">
								<div className="mb-3">
									<label htmlFor="compareDate" className="form-label">
										{t('compareDate', 'Compare Date')}
									</label>
									<input
										type="date"
										value={compareDate}
										onChange={(event) => setCompareDate(event.target.value)}
										className="form-control"
										id="compareDate"
									/>
								</div>
							</div>
						</div>

						<div className="row">
							<div className="col">
								<div className="mb-3">
									<label className="form-label">{t('textColor', 'Text Color')}</label>
									<div>
										<Sketch
											color={fillColor}
											disableAlpha
											onChange={(color) => {
												setFillColor(color.hex);
											}}
										/>
									</div>
								</div>
							</div>
							<div className="col">
								<div className="mb-3">
									<div className="form-check mb-2">
										<input
											className="form-check-input"
											type="checkbox"
											checked={outline}
											onChange={(event) => setOutline(event.target.checked)}
											id="outline"
										/>
										<label className="form-check-label" htmlFor="outline">
											{t('outline', 'Outline')}
										</label>
									</div>
									{outline && (
										<Sketch
											color={strokeColor}
											disableAlpha
											onChange={(color) => setStrokeColor(color.hex)}
										/>
									)}
								</div>
							</div>
						</div>

						<div className="mb-3">
							<label htmlFor="font" className="form-label">
								{t('font', 'Font')}
							</label>
							<div className="row align-items-center">
								<div className="col">
									<select
										value={font}
										onChange={(event) => setFont(event.target.value)}
										id="font"
										className="form-select"
									>
										{availableFonts.map((font) => (
											<option key={font} value={font}>
												{font}
											</option>
										))}
									</select>
								</div>
								<div className="col">
									<div style={{ fontFamily: font }}>
										{photoText || 'Lorem ipsum dolor - 1234567890'}
									</div>
								</div>
							</div>
						</div>

						{file && (
							<div className="row g-3">
								<div className="col">
									<button
										type="button"
										onClick={() => render(file)}
										className="btn btn-light btn-lg w-100"
									>
										{t('render', 'Render')}
									</button>
								</div>
								{resultURL && (
									<div className="col-auto">
										<button type="button" onClick={download} className="btn btn-success btn-lg">
											{t('download', 'Download')}
											<DownloadIcon />
										</button>
									</div>
								)}
							</div>
						)}
					</div>
				</div>
			</div>

			<input
				ref={fileinputref}
				type="file"
				id="file-input"
				accept="image/*"
				className="d-none"
				onChange={handleFileSelect}
			/>
			<canvas ref={canvasRef} className="d-none" />
		</div>
	);
}

const LanguageSwitcher = () => {
	const { i18n } = useTranslation();

	const changeLanguage = (lng: string) => {
		i18n.changeLanguage(lng);
		set_option('language', lng);
	};

	return (
		<div className="App__langswitch d-flex">
			<button
				onClick={() => changeLanguage('en')}
				className={`btn btn-sm me-2 ${
					i18n.language.startsWith('en') ? 'btn-primary' : 'btn-outline-secondary'
				}`}
			>
				EN
			</button>
			<button
				onClick={() => changeLanguage('id')}
				className={`btn btn-sm ${i18n.language.startsWith('id') ? 'btn-primary' : 'btn-outline-secondary'}`}
			>
				ID
			</button>
		</div>
	);
};
