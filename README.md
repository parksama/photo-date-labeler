# Photo Date Labeler

A web-based application that allows you to add customizable date labels to your photos. The application supports drag-and-drop functionality, various font styles, and color customization options.

## Features

- **Easy to Use**: Simply drag and drop an image or click to upload
- **Automatic Date Extraction**: Automatically extracts date from image EXIF data or filename
- **Customizable Text**:
  - Multiple font options (including Digital-7, Orbitron, Quantico, and standard web fonts)
  - Customizable text and outline colors
  - Toggle text outline on/off
- **Date Comparison**: Option to compare the photo date with another date and display the difference
- **Responsive Design**: Works on both desktop and mobile devices
- **High-Quality Output**: Maintains original image quality with configurable export settings
- **Preview**: Real-time preview of the final result

## Getting Started

### Prerequisites

- Node.js (v20 or higher)
- Yarn (v1 or higher)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/parksama/photo-date-labeler.git
   cd photo-date-labeler
   ```

2. Install dependencies:
   ```bash
   yarn install
   ```

### Running Locally

1. Start the development server:
   ```bash
   yarn dev
   ```

2. Open your browser and navigate to `http://localhost:1234`

### Building for Production

To create a production build:

```bash
yarn build
```

The built files will be in the `dist/` directory.

## Usage

1. **Upload an Image**:
   - Drag and drop an image onto the upload area, or click to select a file
   - The app will automatically extract the date from the image's EXIF data if available

2. **Customize the Label**:
   - Adjust the photo date if needed
   - (Optional) Set a comparison date to show the time difference
   - Choose your preferred font from the dropdown
   - Customize the text color and outline color
   - Toggle the outline on/off

3. **Preview and Download**:
   - Click the "Render" button to apply changes
   - Click the "Download" button to save the labeled image

## Available Fonts

- Sans-serif
- Serif
- Monospace
- Cursive
- Fantasy
- Digital-7
- Orbitron
- Quantico

## Dependencies

- React 19
- Parcel (for bundling)
- exif-js (for reading EXIF data)
- moment (for date manipulation)
- @uiw/react-color (color picker component)
- Bootstrap 5 (for styling)

## License

This project is open source and available under the [MIT License](LICENSE).

## Acknowledgements

- Built with [Parcel](https://parceljs.org/)
- Uses [exif-js](https://github.com/exif-js/exif-js) for reading image metadata
- Fonts from Google Fonts and other free font sources
