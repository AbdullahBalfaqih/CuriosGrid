
"use client";

import Image from "next/image";
import { cn } from "@/lib/utils";

const logosRow1 = [
    { src: "https://logosarchive.com/wp-content/uploads/2021/08/Solana-logo.svg", alt: "Solana" },
    { src: "https://images.ctfassets.net/clixtyxoaeas/4rnpEzy1ATWRKVBOLxZ1Fm/a74dc1eed36d23d7ea6030383a4d5163/MetaMask-icon-fox.svg", alt: "Metamask" },
    { src: "https://jup.ag/svg/jupiter-logo.svg", alt: "Jupiter" },
    { src: "https://upload.wikimedia.org/wikipedia/commons/9/9b/Bybit-logo.png", alt: "Bybit" },
    { src: "https://companieslogo.com/img/orig/bitwiseinvestments_BIG-498f3d8c.svg", alt: "Bitwise" },
    { src: "https://i.logos-download.com/1946/458-3c35ad67951d3158c64c27e2eb1ecbb8.svg/Bloomberg_Logo_2015.svg", alt: "Bloomberg" },
     { src: "https://wp.logos-download.com/wp-content/uploads/2023/02/Raydium_RAY_Logo.svg", alt: "Raydium" },
];

const logosRow2 = [
    { src: "https://logosarchive.com/wp-content/uploads/2022/01/Chainalysis-logo.svg", alt: "Chainalysis" },
    { src: "https://logosarchive.com/wp-content/uploads/2021/12/Coinbase-logo-1.svg", alt: "Coinbase" },
     { src: "https://brave.com/static-assets/images/brave-logo-sans-text.svg", alt: "Brave" },
    { src: "https://static.cdnlogo.com/logos/h/23/helium.svg", alt: "Helium" },
    { src: "https://logosarchive.com/wp-content/uploads/2021/08/Discord-logo.svg", alt: "Discord" },
    { src: "https://upload.wikimedia.org/wikipedia/commons/0/0e/Shopify_logo_2018.svg", alt: "Shopify" },
    { src: "https://logo.svgcdn.com/token-branded/solflare.svg", alt: "Solflare" },
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