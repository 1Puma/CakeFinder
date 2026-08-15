"use client";

import Image from "next/image";

export function CakePhoto(props: { src: string; alt: string; className?: string }) {
  if (props.src.startsWith("data:") || props.src.startsWith("blob:")) {
    return (
      // Uploaded data URLs are not valid next/image sources.
      // eslint-disable-next-line @next/next/no-img-element
      <img src={props.src} alt={props.alt} className={props.className} />
    );
  }
  return (
    <Image
      src={props.src}
      alt={props.alt}
      width={1200}
      height={1200}
      className={props.className}
      unoptimized={props.src.endsWith(".svg")}
    />
  );
}
