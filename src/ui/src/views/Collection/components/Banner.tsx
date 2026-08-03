import { useEffect, useState } from "react";
import Carousel from "react-bootstrap/Carousel";
import Container from "react-bootstrap/Container";

import styles from "./Banner.module.css";

type BannerProps = {
  title: string;
  bannerOverlay?: string;
  imageUrls?: string[];
  interval?: number;
};

export function Banner({
  title,
  bannerOverlay,
  imageUrls = [],
  interval = 5000,
}: BannerProps) {
  const slides = imageUrls.length > 0 ? imageUrls : [undefined];
  const preloadKey = imageUrls.filter(Boolean).join("\0");
  const [ready, setReady] = useState(!preloadKey);

  useEffect(() => {
    if (!preloadKey) {
      setReady(true);
      return;
    }

    setReady(false);
    let cancelled = false;

    async function preload() {
      await Promise.all(
        preloadKey.split("\0").map(
          (url) =>
            new Promise<void>((resolve) => {
              const image = new Image();
              image.onload = () => resolve();
              image.onerror = () => resolve();
              image.src = url;
            }),
        ),
      );
      if (!cancelled) setReady(true);
    }

    preload();

    return () => {
      cancelled = true;
    };
  }, [preloadKey]);

  console.log(bannerOverlay);

  return (
    <section className={styles.banner} aria-label={title}>
      <Carousel
        fade
        controls={false}
        indicators={false}
        interval={ready && slides.length > 1 ? interval : null}
        pause={false}
        className={`${styles.carousel}${ready ? ` ${styles.carouselReady}` : ""}`}
      >
        {slides.map((imageUrl, index) => (
          <Carousel.Item key={imageUrl ?? index}>
            <div
              className={styles.slide}
              style={
                imageUrl ? { backgroundImage: `url(${imageUrl})` } : undefined
              }
            />
          </Carousel.Item>
        ))}
      </Carousel>

      <div className={styles.overlay}>
        <Container className={styles.content}>
          <h1
            className={styles.title}
            // biome-ignore lint/security/noDangerouslySetInnerHtml: Legacy HTML styling
            dangerouslySetInnerHTML={{
              __html: (bannerOverlay || title).replace("font-weight:bold;", ""),
            }}
          />
        </Container>
      </div>
    </section>
  );
}
