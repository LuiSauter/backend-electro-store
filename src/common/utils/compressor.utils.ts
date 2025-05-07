import * as sharp from 'sharp';

export interface CompressorOptions {
  buffer: Buffer;
  quality: number;
  width?: number;
  height?: number;
}

export const compressImage = async (compressorOptions: CompressorOptions) => {
  const { buffer, width, height, quality } = compressorOptions;
  return sharp(buffer)
    .webp({ quality })
    .toBuffer();
};
