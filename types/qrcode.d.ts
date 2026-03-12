declare module "qrcode" {
  export type QRCodeToDataURLOptions = {
    errorCorrectionLevel?: "low" | "medium" | "quartile" | "high" | "L" | "M" | "Q" | "H";
    type?: string;
    quality?: number;
    margin?: number;
    color?: {
      dark?: string;
      light?: string;
    };
    width?: number;
    scale?: number;
  };

  export function toDataURL(text: string, options?: QRCodeToDataURLOptions): Promise<string>;

  const QRCode: {
    toDataURL: typeof toDataURL;
  };

  export default QRCode;
}
