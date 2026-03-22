
"use client";

import Image from "next/image";
import { cn } from "@/lib/utils";

const logosRow1 = [
  { src: "https://upload.wikimedia.org/wikipedia/commons/b/b1/Solana_logo.svg", alt: "Solana" },
  { src: "https://images.ctfassets.net/clixtyxoaeas/4rnpEzy1ATWRKVBOLxZ1Fm/a74dc1eed36d23d7ea6030383a4d5163/MetaMask-icon-fox.svg", alt: "Metamask" },
  { src: "https://jup.ag/svg/jupiter-logo.svg", alt: "Jupiter" },
  { src: "https://www.bybit.com/app/v2/images/header/logo.svg", alt: "Bybit" },
  { src: "https://www.bitwiseinvestments.com/images/ci/bitwise-logo-light-bg.svg", alt: "Bitwise" },
  { src: "https://upload.wikimedia.org/wikipedia/commons/4/4b/Bloomberg_Logo.svg", alt: "Bloomberg" },
  { src: "https://www.pudgypenguins.com/logo-light.svg", alt: "Pudgy Penguins" },
  { src: "https://raydium.io/logo/logo-text-horizontal-dark.svg", alt: "Raydium" },
];

const logosRow2 = [
  { src: "https://upload.wikimedia.org/wikipedia/commons/3/36/Chainalysis_logo.svg", alt: "Chainalysis" },
  { src: "https://www.coinbase.com/assets/brand/wordmark-blue.svg", alt: "Coinbase" },
  { src: "https://www.dexscreener.com/assets/pro/logo_white.svg", alt: "DexScreener" },
  { src: "https://brave.com/static-assets/images/brave-logo-sans-text.svg", alt: "Brave" },
  { src: "https://upload.wikimedia.org/wikipedia/commons/9/91/Helium_Logo.svg", alt: "Helium" },
  { src: "https://assets-global.website-files.com/6257adef93867e50d84d30e2/636e0a69f118df70ad7828d4_icon_clyde_white_RGB.svg", alt: "Discord" },
  { src: "https://upload.wikimedia.org/wikipedia/commons/0/0e/Shopify_logo_2018.svg", alt: "Shopify" },
  { src: "https://solflare.com/logo-solflare-light.svg", alt: "Solflare" },
];

const Logo = ({ src, alt }: { src: string, alt: string }) => (
  <Image
    src={src}
    alt={alt}
    width={200}
    height={80}
    className="h-12 md:h-16 w-auto object-contain"
    style={{ color: "transparent" }}
  />
);

const LogoRow = ({ logos, reverse = false }: { logos: {src: string, alt: string}[], reverse?: boolean }) => (
  <div className="flex shrink-0 justify-around animate-marquee flex-row space-x-12" style={{ animationDirection: reverse ? "reverse" : "normal" }}>
    {logos.map((logo, i) => <Logo key={`${logo.alt}-${i}`} {...logo} />)}
  </div>
);

export function LogoCloud() {
  return (
    <div className="w-full py-12">
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-background via-transparent to-background z-10"></div>
        <div className="flex flex-col gap-8 overflow-hidden">
          <div className="flex">
            <LogoRow logos={[...logosRow1, ...logosRow1]} />
          </div>
          <div className="flex">
            <LogoRow logos={[...logosRow2, ...logosRow2]} reverse={true} />
          </div>
        </div>
      </div>
    </div>
  );
}
